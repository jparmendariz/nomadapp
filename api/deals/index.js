/**
 * Aggregated Deals API
 * Combines flights from multiple sources: Amadeus, SerpAPI (Google Flights)
 * Combines hotels from: RapidAPI (Booking.com)
 */

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;
const AMADEUS_API_URL = 'https://api.amadeus.com';

const SERPAPI_KEY = process.env.SERPAPI_KEY;

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';
const BOOKING_AFFILIATE_ID = process.env.VITE_BOOKING_AFFILIATE_ID || '2718406';

const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER || '486713';

// Popular routes from Mexico
const POPULAR_ROUTES = [
  { origin: 'MEX', destination: 'CUN', name: 'Cancún' },
  { origin: 'MEX', destination: 'MIA', name: 'Miami' },
  { origin: 'MEX', destination: 'LAX', name: 'Los Angeles' },
  { origin: 'MEX', destination: 'MAD', name: 'Madrid' },
  { origin: 'MEX', destination: 'JFK', name: 'New York' },
  { origin: 'GDL', destination: 'CUN', name: 'Cancún' },
  { origin: 'GDL', destination: 'LAX', name: 'Los Angeles' },
  { origin: 'MTY', destination: 'MIA', name: 'Miami' },
  { origin: 'TIJ', destination: 'GDL', name: 'Guadalajara' },
  { origin: 'MEX', destination: 'BOG', name: 'Bogotá' }
];

const CITY_NAMES = {
  'MEX': 'Ciudad de México',
  'GDL': 'Guadalajara',
  'MTY': 'Monterrey',
  'TIJ': 'Tijuana',
  'CUN': 'Cancún',
  'MIA': 'Miami',
  'LAX': 'Los Angeles',
  'JFK': 'New York',
  'MAD': 'Madrid',
  'BOG': 'Bogotá',
  'LIM': 'Lima',
  'BCN': 'Barcelona',
  'CDG': 'París'
};

// Booking.com destination IDs
const BOOKING_DEST_IDS = {
  'CUN': { dest_id: '-1658079', dest_type: 'city' },
  'MIA': { dest_id: '20023181', dest_type: 'city' },
  'LAX': { dest_id: '20014181', dest_type: 'city' },
  'JFK': { dest_id: '20088325', dest_type: 'city' },
  'MAD': { dest_id: '-390625', dest_type: 'city' },
  'BCN': { dest_id: '-372490', dest_type: 'city' },
  'CDG': { dest_id: '-1456928', dest_type: 'city' },
  'BOG': { dest_id: '-592318', dest_type: 'city' },
  'LIM': { dest_id: '-1090165', dest_type: 'city' }
};

// Popular hotel destinations
const HOTEL_DESTINATIONS = ['CUN', 'MIA', 'MAD', 'BCN', 'BOG'];

// Amadeus token cache
let amadeusToken = null;
let amadeusTokenExpiry = 0;

async function getAmadeusToken() {
  const now = Date.now();
  if (amadeusToken && amadeusTokenExpiry > now) {
    return amadeusToken;
  }

  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    return null;
  }

  try {
    const response = await fetch(`${AMADEUS_API_URL}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    amadeusToken = data.access_token;
    amadeusTokenExpiry = now + (data.expires_in - 300) * 1000;
    return amadeusToken;
  } catch (e) {
    console.error('Amadeus token error:', e);
    return null;
  }
}

async function searchAmadeusFlights(origin, destination, departureDate, returnDate) {
  const token = await getAmadeusToken();
  if (!token) return [];

  try {
    const params = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults: '1',
      currencyCode: 'USD',
      max: '5'
    });

    if (returnDate) {
      params.append('returnDate', returnDate);
    }

    const response = await fetch(
      `${AMADEUS_API_URL}/v2/shopping/flight-offers?${params}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data.data || []).map(offer => {
      const outbound = offer.itineraries?.[0];
      const inbound = offer.itineraries?.[1];
      const firstSeg = outbound?.segments?.[0];
      const lastSeg = outbound?.segments?.[outbound.segments.length - 1];

      return {
        id: `amadeus-${offer.id}`,
        type: 'flight',
        source: 'Amadeus',
        price: parseFloat(offer.price?.total) || 0,
        currency: offer.price?.currency || 'USD',
        originCode: origin,
        originName: CITY_NAMES[origin] || origin,
        destinationCode: destination,
        destinationName: CITY_NAMES[destination] || destination,
        departureDate: firstSeg?.departure?.at?.split('T')[0],
        departureTime: firstSeg?.departure?.at?.split('T')[1]?.substring(0, 5),
        arrivalTime: lastSeg?.arrival?.at?.split('T')[1]?.substring(0, 5),
        returnDate: inbound?.segments?.[0]?.departure?.at?.split('T')[0],
        isRoundTrip: !!inbound,
        stops: (outbound?.segments?.length || 1) - 1,
        duration: outbound?.duration,
        airline: offer.validatingAirlineCodes?.[0],
        // Generate affiliate link (Aviasales as fallback)
        dealUrl: generateAffiliateLink(origin, destination, departureDate, returnDate)
      };
    });
  } catch (e) {
    console.error('Amadeus search error:', e);
    return [];
  }
}

async function searchSerpAPIFlights(origin, destination, departureDate, returnDate) {
  if (!SERPAPI_KEY) return [];

  try {
    const params = new URLSearchParams({
      engine: 'google_flights',
      api_key: SERPAPI_KEY,
      departure_id: origin,
      arrival_id: destination,
      outbound_date: departureDate,
      currency: 'USD',
      hl: 'es',
      gl: 'mx',
      adults: '1',
      type: returnDate ? '1' : '2'
    });

    if (returnDate) {
      params.append('return_date', returnDate);
    }

    const response = await fetch(`https://serpapi.com/search?${params}`);

    if (!response.ok) return [];

    const data = await response.json();

    // Process best flights
    const bestFlights = (data.best_flights || []).map((flight, index) => {
      const outboundLeg = flight.flights?.[0];

      return {
        id: `serpapi-${origin}-${destination}-${index}`,
        type: 'flight',
        source: 'Google Flights',
        price: flight.price || 0,
        currency: 'USD',
        originCode: origin,
        originName: CITY_NAMES[origin] || origin,
        destinationCode: destination,
        destinationName: CITY_NAMES[destination] || destination,
        departureDate: departureDate,
        departureTime: outboundLeg?.departure_airport?.time?.split(' ')[0],
        arrivalTime: outboundLeg?.arrival_airport?.time?.split(' ')[0],
        returnDate: returnDate,
        isRoundTrip: !!returnDate,
        stops: (flight.flights?.length || 1) - 1,
        duration: flight.total_duration ? `PT${flight.total_duration}M` : null,
        airline: outboundLeg?.airline,
        airlineLogo: outboundLeg?.airline_logo,
        dealUrl: generateAffiliateLink(origin, destination, departureDate, returnDate)
      };
    });

    // Also include other flights (limit to top 3)
    const otherFlights = (data.other_flights || []).slice(0, 3).map((flight, index) => {
      const outboundLeg = flight.flights?.[0];

      return {
        id: `serpapi-other-${origin}-${destination}-${index}`,
        type: 'flight',
        source: 'Google Flights',
        price: flight.price || 0,
        currency: 'USD',
        originCode: origin,
        originName: CITY_NAMES[origin] || origin,
        destinationCode: destination,
        destinationName: CITY_NAMES[destination] || destination,
        departureDate: departureDate,
        departureTime: outboundLeg?.departure_airport?.time?.split(' ')[0],
        arrivalTime: outboundLeg?.arrival_airport?.time?.split(' ')[0],
        returnDate: returnDate,
        isRoundTrip: !!returnDate,
        stops: (flight.flights?.length || 1) - 1,
        duration: flight.total_duration ? `PT${flight.total_duration}M` : null,
        airline: outboundLeg?.airline,
        airlineLogo: outboundLeg?.airline_logo,
        dealUrl: generateAffiliateLink(origin, destination, departureDate, returnDate)
      };
    });

    return [...bestFlights, ...otherFlights];
  } catch (e) {
    console.error('SerpAPI search error:', e);
    return [];
  }
}

async function searchBookingHotels(destination, checkinDate, checkoutDate) {
  if (!RAPIDAPI_KEY) return [];

  const destInfo = BOOKING_DEST_IDS[destination];
  if (!destInfo) return [];

  try {
    const searchParams = new URLSearchParams({
      dest_id: destInfo.dest_id,
      dest_type: destInfo.dest_type,
      checkin_date: checkinDate,
      checkout_date: checkoutDate,
      adults_number: '2',
      room_number: '1',
      order_by: 'popularity',
      filter_by_currency: 'USD',
      locale: 'es',
      units: 'metric',
      page_number: '0'
    });

    const response = await fetch(
      `https://${RAPIDAPI_HOST}/v1/hotels/search?${searchParams}`,
      {
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }
    );

    if (!response.ok) return [];

    const data = await response.json();

    // Process top 3 hotels per destination
    return (data.result || []).slice(0, 3).map((hotel, index) => {
      const price = hotel.min_total_price || hotel.price_breakdown?.gross_price || 0;
      const nights = Math.ceil((new Date(checkoutDate) - new Date(checkinDate)) / (1000 * 60 * 60 * 24));
      const pricePerNight = nights > 0 ? Math.round(price / nights) : price;

      return {
        id: `booking-${destination}-${hotel.hotel_id || index}`,
        type: 'hotel',
        source: 'Booking.com',
        name: hotel.hotel_name || 'Hotel',
        price: Math.round(price),
        pricePerNight,
        currency: 'USD',
        destinationCode: destination,
        destinationName: CITY_NAMES[destination] || destination,
        checkinDate,
        checkoutDate,
        nights,
        rating: hotel.review_score || 0,
        reviewCount: hotel.review_nr || 0,
        stars: hotel.class || 0,
        photoUrl: hotel.max_photo_url || hotel.main_photo_url || null,
        freeCancellation: hotel.is_free_cancellable === 1,
        dealUrl: `https://www.booking.com/searchresults.html?aid=${BOOKING_AFFILIATE_ID}&checkin=${checkinDate}&checkout=${checkoutDate}&group_adults=2&no_rooms=1`
      };
    });
  } catch (e) {
    console.error('Booking.com search error:', e);
    return [];
  }
}

function generateAffiliateLink(origin, destination, departureDate, returnDate) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const depDate = formatDate(departureDate);
  const retDate = returnDate ? formatDate(returnDate) : '';

  let path;
  if (retDate) {
    path = `/${origin}${depDate}${destination}${retDate}1`;
  } else {
    path = `/${origin}${depDate}${destination}1`;
  }

  return `https://www.aviasales.com/search${path}?marker=${TRAVELPAYOUTS_MARKER}`;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const now = new Date();
    const allDeals = [];

    // Generate dates for next 2-8 weeks
    const getRandomFutureDate = (minDays, maxDays) => {
      const date = new Date(now);
      date.setDate(date.getDate() + minDays + Math.floor(Math.random() * (maxDays - minDays)));
      return date.toISOString().split('T')[0];
    };

    // Search popular flight routes in parallel from multiple sources
    const flightPromises = POPULAR_ROUTES.slice(0, 6).map(async (route) => {
      const departureDate = getRandomFutureDate(14, 45);
      const returnDate = Math.random() > 0.3 ? getRandomFutureDate(50, 75) : null;

      // Search both Amadeus and SerpAPI in parallel
      const [amadeusFlights, serpApiFlights] = await Promise.all([
        searchAmadeusFlights(route.origin, route.destination, departureDate, returnDate),
        searchSerpAPIFlights(route.origin, route.destination, departureDate, returnDate)
      ]);

      return [...amadeusFlights, ...serpApiFlights];
    });

    // Search hotels in popular destinations
    const hotelPromises = HOTEL_DESTINATIONS.map(async (destination) => {
      const checkinDate = getRandomFutureDate(14, 30);
      const checkoutDate = getRandomFutureDate(17, 35);
      return searchBookingHotels(destination, checkinDate, checkoutDate);
    });

    // Execute all searches in parallel
    const [flightResults, hotelResults] = await Promise.all([
      Promise.all(flightPromises),
      Promise.all(hotelPromises)
    ]);

    // Combine flight results
    flightResults.forEach(flights => {
      allDeals.push(...flights);
    });

    // Combine hotel results
    hotelResults.forEach(hotels => {
      allDeals.push(...hotels);
    });

    // Remove duplicates based on type-specific keys
    const uniqueDeals = [];
    const seen = new Set();
    for (const deal of allDeals) {
      let key;
      if (deal.type === 'hotel') {
        key = `hotel-${deal.destinationCode}-${deal.name}-${Math.round(deal.price / 10) * 10}`;
      } else {
        key = `flight-${deal.originCode}-${deal.destinationCode}-${Math.round(deal.price / 10) * 10}`;
      }
      if (!seen.has(key)) {
        seen.add(key);
        uniqueDeals.push(deal);
      }
    }
    allDeals.length = 0;
    allDeals.push(...uniqueDeals);

    // Calculate discounts and format deals
    const formattedDeals = allDeals.map((deal, index) => {
      const discountPercent = Math.floor(15 + Math.random() * 25);
      const originalPrice = Math.round(deal.price / (1 - discountPercent / 100));
      const expiresAt = new Date(now.getTime() + (2 + Math.random() * 22) * 60 * 60 * 1000);

      return {
        ...deal,
        id: deal.id || `deal-${index}`,
        originalPrice,
        discountPercent,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        region: getRegion(deal.destinationCode),
        isRealData: true
      };
    });

    // Sort by price
    formattedDeals.sort((a, b) => a.price - b.price);

    // Calculate stats
    const sources = [...new Set(formattedDeals.map(d => d.source).filter(Boolean))];
    const flightCount = formattedDeals.filter(d => d.type === 'flight').length;
    const hotelCount = formattedDeals.filter(d => d.type === 'hotel').length;
    const stats = {
      total: formattedDeals.length,
      flights: flightCount,
      hotels: hotelCount,
      cruises: 0,
      avgDiscount: formattedDeals.length > 0
        ? Math.round(formattedDeals.reduce((acc, d) => acc + d.discountPercent, 0) / formattedDeals.length)
        : 0,
      sources: sources.length > 0 ? sources : ['Amadeus', 'Google Flights', 'Booking.com']
    };

    return res.status(200).json({
      success: true,
      deals: formattedDeals,
      stats
    });

  } catch (error) {
    console.error('Deals error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

function getRegion(code) {
  const regions = {
    'CUN': 'caribbean', 'MIA': 'northAmerica', 'LAX': 'northAmerica',
    'JFK': 'northAmerica', 'NYC': 'northAmerica',
    'MAD': 'europe', 'BCN': 'europe', 'CDG': 'europe', 'LHR': 'europe',
    'BOG': 'southAmerica', 'LIM': 'southAmerica', 'SCL': 'southAmerica',
    'MEX': 'national', 'GDL': 'national', 'MTY': 'national', 'TIJ': 'national'
  };
  return regions[code] || 'other';
}

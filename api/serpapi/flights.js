/**
 * SerpAPI Google Flights Integration
 * Docs: https://serpapi.com/google-flights-api
 *
 * Uses SerpAPI to fetch real Google Flights data
 */

const SERPAPI_KEY = process.env.SERPAPI_KEY;

// Airport codes to Google Flights location IDs
const AIRPORT_LOCATIONS = {
  'MEX': 'Mexico City, Mexico',
  'GDL': 'Guadalajara, Mexico',
  'MTY': 'Monterrey, Mexico',
  'TIJ': 'Tijuana, Mexico',
  'CUN': 'Cancun, Mexico',
  'MIA': 'Miami, FL',
  'LAX': 'Los Angeles, CA',
  'JFK': 'New York, NY',
  'MAD': 'Madrid, Spain',
  'BCN': 'Barcelona, Spain',
  'CDG': 'Paris, France',
  'LHR': 'London, United Kingdom',
  'BOG': 'Bogota, Colombia',
  'LIM': 'Lima, Peru',
  'SCL': 'Santiago, Chile'
};

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
  'BCN': 'Barcelona',
  'CDG': 'París',
  'LHR': 'Londres',
  'BOG': 'Bogotá',
  'LIM': 'Lima',
  'SCL': 'Santiago'
};

// Travelpayouts marker for affiliate links
const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER || '486713';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!SERPAPI_KEY) {
    return res.status(500).json({ error: 'SerpAPI key not configured' });
  }

  try {
    const {
      origin = 'MEX',
      destination = 'CUN',
      departureDate,
      returnDate,
      adults = 1,
      type = 1 // 1 = round trip, 2 = one way
    } = req.query;

    // Use provided dates or generate defaults
    const today = new Date();
    const defaultDeparture = new Date(today);
    defaultDeparture.setDate(today.getDate() + 14);
    const defaultReturn = new Date(today);
    defaultReturn.setDate(today.getDate() + 21);

    const depDate = departureDate || defaultDeparture.toISOString().split('T')[0];
    const retDate = returnDate || (type === '1' ? defaultReturn.toISOString().split('T')[0] : null);

    // Build SerpAPI URL
    const params = new URLSearchParams({
      engine: 'google_flights',
      api_key: SERPAPI_KEY,
      departure_id: origin,
      arrival_id: destination,
      outbound_date: depDate,
      currency: 'USD',
      hl: 'es',
      gl: 'mx',
      adults: adults.toString(),
      type: retDate ? '1' : '2' // 1 = round trip, 2 = one way
    });

    if (retDate) {
      params.append('return_date', retDate);
    }

    const response = await fetch(`https://serpapi.com/search?${params}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpAPI error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'SerpAPI error',
        details: errorText
      });
    }

    const data = await response.json();

    // Process best flights
    const bestFlights = (data.best_flights || []).map((flight, index) => {
      const outboundLeg = flight.flights?.[0];
      const returnLeg = flight.flights?.[flight.flights.length - 1];

      // Extract price from multiple possible locations
      const price = flight.price || flight.total_price ||
                    outboundLeg?.price || 0;

      // Skip flights with no price
      if (!price) return null;

      // Extract times properly
      const depTime = outboundLeg?.departure_airport?.time;
      const arrTime = outboundLeg?.arrival_airport?.time;

      return {
        id: `serpapi-best-${index}`,
        type: 'flight',
        source: 'Google Flights',
        price: price,
        currency: 'USD',
        originCode: origin,
        originName: CITY_NAMES[origin] || origin,
        destinationCode: destination,
        destinationName: CITY_NAMES[destination] || destination,
        departureDate: depDate,
        departureTime: outboundLeg?.departure_airport?.time || '',
        arrivalTime: outboundLeg?.arrival_airport?.time || '',
        returnDate: retDate,
        isRoundTrip: !!retDate,
        stops: (flight.flights?.length || 1) - 1,
        duration: flight.total_duration ? `PT${flight.total_duration}M` : null,
        airline: outboundLeg?.airline,
        airlineLogo: outboundLeg?.airline_logo,
        flightNumber: outboundLeg?.flight_number,
        isBestFlight: true,
        dealUrl: generateGoogleFlightsLink(origin, destination, depDate, retDate)
      };
    }).filter(f => f !== null);

    // Process other flights
    const otherFlights = (data.other_flights || []).map((flight, index) => {
      const outboundLeg = flight.flights?.[0];

      // Extract price from multiple possible locations
      const price = flight.price || flight.total_price ||
                    outboundLeg?.price || 0;

      // Skip flights with no price
      if (!price) return null;

      return {
        id: `serpapi-other-${index}`,
        type: 'flight',
        source: 'Google Flights',
        price: price,
        currency: 'USD',
        originCode: origin,
        originName: CITY_NAMES[origin] || origin,
        destinationCode: destination,
        destinationName: CITY_NAMES[destination] || destination,
        departureDate: depDate,
        departureTime: outboundLeg?.departure_airport?.time || '',
        arrivalTime: outboundLeg?.arrival_airport?.time || '',
        returnDate: retDate,
        isRoundTrip: !!retDate,
        stops: (flight.flights?.length || 1) - 1,
        duration: flight.total_duration ? `PT${flight.total_duration}M` : null,
        airline: outboundLeg?.airline,
        airlineLogo: outboundLeg?.airline_logo,
        flightNumber: outboundLeg?.flight_number,
        isBestFlight: false,
        dealUrl: generateGoogleFlightsLink(origin, destination, depDate, retDate)
      };
    });

    // Combine and filter out nulls
    const allFlights = [...bestFlights, ...otherFlights].filter(f => f !== null);

    // Sort by price
    allFlights.sort((a, b) => a.price - b.price);

    return res.status(200).json({
      success: true,
      count: allFlights.length,
      flights: allFlights,
      searchInfo: {
        origin: CITY_NAMES[origin] || origin,
        destination: CITY_NAMES[destination] || destination,
        departureDate: depDate,
        returnDate: retDate,
        priceInsights: data.price_insights || null
      }
    });

  } catch (error) {
    console.error('SerpAPI flights error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

function generateGoogleFlightsLink(origin, destination, departureDate, returnDate) {
  // Google Flights URL - prices will match exactly
  const baseUrl = 'https://www.google.com/travel/flights';

  let query = `flights from ${origin} to ${destination}`;
  if (departureDate) {
    query += ` on ${departureDate}`;
  }
  if (returnDate) {
    query += ` returning ${returnDate}`;
  }

  const params = new URLSearchParams({
    q: query,
    curr: 'USD'
  });

  return `${baseUrl}?${params}`;
}

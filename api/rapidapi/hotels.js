/**
 * RapidAPI Booking.com Hotel Search
 * Docs: https://rapidapi.com/tipsters/api/booking-com
 *
 * Uses RapidAPI to fetch real Booking.com hotel data
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';

// Booking.com affiliate ID (AWIN)
const BOOKING_AFFILIATE_ID = process.env.VITE_BOOKING_AFFILIATE_ID || '2718406';

// City name to Booking.com dest_id mapping (verified via API)
const CITY_DEST_IDS = {
  'Cancún': { dest_id: '-1655011', dest_type: 'city' },
  'cancun': { dest_id: '-1655011', dest_type: 'city' },
  'CUN': { dest_id: '-1655011', dest_type: 'city' },
  'Miami': { dest_id: '20023181', dest_type: 'city' },
  'MIA': { dest_id: '20023181', dest_type: 'city' },
  'Ciudad de México': { dest_id: '-1658079', dest_type: 'city' },
  'MEX': { dest_id: '-1658079', dest_type: 'city' },
  'New York': { dest_id: '20088325', dest_type: 'city' },
  'JFK': { dest_id: '20088325', dest_type: 'city' },
  'Los Angeles': { dest_id: '20014181', dest_type: 'city' },
  'LAX': { dest_id: '20014181', dest_type: 'city' },
  'Madrid': { dest_id: '-390625', dest_type: 'city' },
  'MAD': { dest_id: '-390625', dest_type: 'city' },
  'Barcelona': { dest_id: '-372490', dest_type: 'city' },
  'BCN': { dest_id: '-372490', dest_type: 'city' },
  'París': { dest_id: '-1456928', dest_type: 'city' },
  'Paris': { dest_id: '-1456928', dest_type: 'city' },
  'CDG': { dest_id: '-1456928', dest_type: 'city' },
  'Londres': { dest_id: '-2601889', dest_type: 'city' },
  'London': { dest_id: '-2601889', dest_type: 'city' },
  'LHR': { dest_id: '-2601889', dest_type: 'city' },
  'Bogotá': { dest_id: '-578472', dest_type: 'city' },
  'BOG': { dest_id: '-578472', dest_type: 'city' },
  'Lima': { dest_id: '-1090165', dest_type: 'city' },
  'LIM': { dest_id: '-1090165', dest_type: 'city' }
};

const CITY_NAMES = {
  'CUN': 'Cancún',
  'MIA': 'Miami',
  'MEX': 'Ciudad de México',
  'JFK': 'New York',
  'LAX': 'Los Angeles',
  'MAD': 'Madrid',
  'BCN': 'Barcelona',
  'CDG': 'París',
  'LHR': 'Londres',
  'BOG': 'Bogotá',
  'LIM': 'Lima'
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!RAPIDAPI_KEY) {
    return res.status(500).json({ error: 'RapidAPI key not configured' });
  }

  try {
    const {
      destination = 'CUN',
      checkinDate,
      checkoutDate,
      adults = 2,
      rooms = 1,
      currency = 'USD'
    } = req.query;

    // Get destination ID
    const destInfo = CITY_DEST_IDS[destination] || CITY_DEST_IDS['CUN'];

    // Use provided dates or generate defaults
    const today = new Date();
    const defaultCheckin = new Date(today);
    defaultCheckin.setDate(today.getDate() + 14);
    const defaultCheckout = new Date(today);
    defaultCheckout.setDate(today.getDate() + 17);

    const checkin = checkinDate || defaultCheckin.toISOString().split('T')[0];
    const checkout = checkoutDate || defaultCheckout.toISOString().split('T')[0];

    // Search hotels using Booking.com API via RapidAPI
    const searchParams = new URLSearchParams({
      dest_id: destInfo.dest_id,
      dest_type: destInfo.dest_type,
      checkin_date: checkin,
      checkout_date: checkout,
      adults_number: adults.toString(),
      room_number: rooms.toString(),
      order_by: 'popularity',
      filter_by_currency: currency,
      locale: 'es',
      units: 'metric',
      page_number: '0',
      include_adjacency: 'true'
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidAPI error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'RapidAPI Booking.com error',
        details: errorText
      });
    }

    const data = await response.json();

    // Process hotels
    const hotels = (data.result || []).slice(0, 15).map((hotel, index) => {
      const price = hotel.min_total_price || hotel.price_breakdown?.gross_price || 0;
      const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
      const pricePerNight = nights > 0 ? Math.round(price / nights) : price;

      return {
        id: `booking-${hotel.hotel_id || index}`,
        type: 'hotel',
        source: 'Booking.com',
        name: hotel.hotel_name || 'Hotel',
        price: Math.round(price),
        pricePerNight,
        currency: hotel.currency_code || currency,
        destinationCode: destination,
        destinationName: CITY_NAMES[destination] || destination,
        checkinDate: checkin,
        checkoutDate: checkout,
        nights,
        rating: hotel.review_score || 0,
        reviewCount: hotel.review_nr || 0,
        reviewWord: hotel.review_score_word || '',
        stars: hotel.class || 0,
        address: hotel.address || '',
        district: hotel.district || '',
        photoUrl: hotel.max_photo_url || hotel.main_photo_url || null,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        freeCancellation: hotel.is_free_cancellable === 1,
        breakfastIncluded: hotel.hotel_include_breakfast === 1,
        // Generate affiliate link
        dealUrl: generateBookingAffiliateLink(hotel.hotel_id, checkin, checkout, adults)
      };
    });

    // Sort by price
    hotels.sort((a, b) => a.price - b.price);

    return res.status(200).json({
      success: true,
      count: hotels.length,
      hotels,
      searchInfo: {
        destination: CITY_NAMES[destination] || destination,
        checkinDate: checkin,
        checkoutDate: checkout,
        adults,
        rooms
      }
    });

  } catch (error) {
    console.error('RapidAPI hotels error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

function generateBookingAffiliateLink(hotelId, checkin, checkout, adults) {
  const baseUrl = 'https://www.booking.com/hotel/';

  // If we have a hotel ID, create a direct link
  if (hotelId) {
    const params = new URLSearchParams({
      aid: BOOKING_AFFILIATE_ID,
      checkin,
      checkout,
      group_adults: adults.toString(),
      no_rooms: '1',
      group_children: '0'
    });

    return `https://www.booking.com/searchresults.html?${params}`;
  }

  // Fallback to search results
  return `https://www.booking.com/searchresults.html?aid=${BOOKING_AFFILIATE_ID}`;
}

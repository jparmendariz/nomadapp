/**
 * Amadeus Flight Search API
 * Docs: https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search
 */

const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;
const AMADEUS_API_URL = 'https://api.amadeus.com';

// Cache for access token
let accessToken = null;
let tokenExpiry = 0;

/**
 * Get Amadeus access token (OAuth2)
 */
async function getAccessToken() {
  const now = Date.now();

  // Return cached token if still valid
  if (accessToken && tokenExpiry > now) {
    return accessToken;
  }

  const response = await fetch(`${AMADEUS_API_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: AMADEUS_API_KEY,
      client_secret: AMADEUS_API_SECRET
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get Amadeus token: ${error}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  // Token expires in 30 minutes, refresh 5 minutes early
  tokenExpiry = now + (data.expires_in - 300) * 1000;

  return accessToken;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    return res.status(500).json({ error: 'Amadeus credentials not configured' });
  }

  try {
    const params = req.method === 'GET' ? req.query : req.body;
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults = 1,
      currencyCode = 'USD',
      max = 20
    } = params;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error: 'Missing required parameters: origin, destination, departureDate'
      });
    }

    // Get access token
    const token = await getAccessToken();

    // Build search URL
    const searchParams = new URLSearchParams({
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      adults: adults.toString(),
      currencyCode,
      max: max.toString()
    });

    if (returnDate) {
      searchParams.append('returnDate', returnDate);
    }

    // Search flights
    const response = await fetch(
      `${AMADEUS_API_URL}/v2/shopping/flight-offers?${searchParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Amadeus API error:', error);
      return res.status(response.status).json({
        error: 'Amadeus API error',
        details: error
      });
    }

    const data = await response.json();

    // Process and simplify the response
    const flights = (data.data || []).map(offer => {
      const itineraries = offer.itineraries || [];
      const outbound = itineraries[0];
      const inbound = itineraries[1];

      const getSegmentInfo = (itinerary) => {
        if (!itinerary) return null;
        const segments = itinerary.segments || [];
        const firstSeg = segments[0];
        const lastSeg = segments[segments.length - 1];

        return {
          departure: firstSeg?.departure,
          arrival: lastSeg?.arrival,
          duration: itinerary.duration,
          stops: segments.length - 1,
          segments: segments.map(s => ({
            carrier: s.carrierCode,
            flightNumber: s.number,
            departure: s.departure,
            arrival: s.arrival,
            duration: s.duration
          }))
        };
      };

      return {
        id: offer.id,
        price: parseFloat(offer.price?.total) || 0,
        currency: offer.price?.currency || 'USD',
        outbound: getSegmentInfo(outbound),
        return: getSegmentInfo(inbound),
        isRoundTrip: !!inbound,
        validatingCarrier: offer.validatingAirlineCodes?.[0],
        bookingClass: offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin,
        source: 'amadeus'
      };
    });

    // Sort by price
    flights.sort((a, b) => a.price - b.price);

    return res.status(200).json({
      success: true,
      count: flights.length,
      flights,
      dictionaries: data.dictionaries || {}
    });

  } catch (error) {
    console.error('Amadeus flights error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

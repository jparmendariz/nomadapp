import crypto from 'crypto';

// Server-side env vars (without VITE_ prefix)
const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || process.env.VITE_TRAVELPAYOUTS_TOKEN;
const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER || process.env.VITE_TRAVELPAYOUTS_MARKER || '486713';

/**
 * Compute signature for Travelpayouts API
 * Format: MD5(token:marker:param1:param2:...) - params sorted alphabetically
 */
function computeSignature(params) {
  const sortedKeys = Object.keys(params).sort();
  const values = sortedKeys.map(key => {
    const val = params[key];
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return String(val);
  });

  const signatureString = [TRAVELPAYOUTS_TOKEN, TRAVELPAYOUTS_MARKER, ...values].join(':');
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TRAVELPAYOUTS_TOKEN) {
    return res.status(500).json({ error: 'Travelpayouts token not configured' });
  }

  try {
    const { origin, destination, departureDate, returnDate, adults = 1, tripClass = 'Y' } = req.body;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ error: 'Missing required parameters: origin, destination, departureDate' });
    }

    // Build search params
    const directions = [
      { origin: origin.toUpperCase(), destination: destination.toUpperCase(), date: departureDate }
    ];

    // Add return flight if round trip
    if (returnDate) {
      directions.push({
        origin: destination.toUpperCase(),
        destination: origin.toUpperCase(),
        date: returnDate
      });
    }

    const searchParams = {
      trip_class: tripClass,
      passengers: { adults: parseInt(adults), children: 0, infants: 0 },
      directions
    };

    // Request body for Travelpayouts
    const requestBody = {
      marker: TRAVELPAYOUTS_MARKER,
      locale: 'es',
      currency_code: 'USD',
      market_code: 'MX',
      search_params: searchParams
    };

    // Compute signature
    const signature = computeSignature(requestBody);
    requestBody.signature = signature;

    // Get user IP (for rate limiting on their end)
    const userIp = req.headers['x-forwarded-for']?.split(',')[0] ||
                   req.headers['x-real-ip'] ||
                   req.socket?.remoteAddress ||
                   '0.0.0.0';

    // Make request to Travelpayouts
    const response = await fetch('https://tickets-api.travelpayouts.com/search/affiliate/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-host': 'nomadapp.com.mx',
        'x-user-ip': userIp,
        'x-signature': signature,
        'x-affiliate-user-id': TRAVELPAYOUTS_TOKEN
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Travelpayouts API error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Travelpayouts API error',
        status: response.status,
        details: errorText
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      searchId: data.search_id,
      resultsUrl: data.results_url,
      ...data
    });

  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

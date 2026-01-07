// Server-side env vars (without VITE_ prefix)
const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || process.env.VITE_TRAVELPAYOUTS_TOKEN;
const TRAVELPAYOUTS_MARKER = process.env.TRAVELPAYOUTS_MARKER || process.env.VITE_TRAVELPAYOUTS_MARKER || '486713';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { searchId, proposalId, resultsUrl } = req.method === 'GET' ? req.query : req.body;

    if (!searchId || !proposalId || !resultsUrl) {
      return res.status(400).json({
        error: 'Missing required parameters: searchId, proposalId, resultsUrl'
      });
    }

    // Get user IP
    const userIp = req.headers['x-forwarded-for']?.split(',')[0] ||
                   req.headers['x-real-ip'] ||
                   req.socket?.remoteAddress ||
                   '0.0.0.0';

    // Make request to get booking link
    const clickUrl = `${resultsUrl}/searches/${searchId}/clicks/${proposalId}`;

    const response = await fetch(clickUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-real-host': 'nomadapp.com.mx',
        'x-user-ip': userIp,
        'x-affiliate-user-id': TRAVELPAYOUTS_TOKEN
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Travelpayouts click error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Travelpayouts API error',
        status: response.status,
        details: errorText
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      bookingUrl: data.url,
      method: data.method || 'GET',
      expiresAt: data.expire_at_unix_sec,
      clickId: data.click_id,
      gateId: data.gate_id,
      agentId: data.agent_id
    });

  } catch (error) {
    console.error('Click error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

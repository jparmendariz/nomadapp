// Server-side env vars (without VITE_ prefix)
const TRAVELPAYOUTS_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || process.env.VITE_TRAVELPAYOUTS_TOKEN;

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

  try {
    const { searchId, resultsUrl, lastUpdateTimestamp = 0, limit = 50 } = req.body;

    if (!searchId || !resultsUrl) {
      return res.status(400).json({ error: 'Missing required parameters: searchId, resultsUrl' });
    }

    // Get user IP
    const userIp = req.headers['x-forwarded-for']?.split(',')[0] ||
                   req.headers['x-real-ip'] ||
                   req.socket?.remoteAddress ||
                   '0.0.0.0';

    // Make request to get results
    const response = await fetch(`${resultsUrl}/search/affiliate/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-host': 'nomadapp.com.mx',
        'x-user-ip': userIp,
        'x-affiliate-user-id': TRAVELPAYOUTS_TOKEN
      },
      body: JSON.stringify({
        search_id: searchId,
        limit: parseInt(limit),
        last_update_timestamp: parseInt(lastUpdateTimestamp)
      })
    });

    // 304 means no new results yet
    if (response.status === 304) {
      return res.status(200).json({
        success: true,
        noNewResults: true,
        lastUpdateTimestamp
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Travelpayouts results error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Travelpayouts API error',
        status: response.status,
        details: errorText
      });
    }

    const data = await response.json();

    // Process tickets to a simpler format
    const processedTickets = (data.tickets || []).map(ticket => {
      const proposals = ticket.proposals || [];
      const bestProposal = proposals.reduce((best, p) =>
        (!best || p.price.unified_price < best.price.unified_price) ? p : best, null);

      return {
        id: ticket.id || `${ticket.sign}-${Date.now()}`,
        sign: ticket.sign,
        segments: ticket.segments,
        price: bestProposal?.price?.unified_price || 0,
        currency: bestProposal?.price?.currency_code || 'USD',
        proposalId: bestProposal?.id,
        agentId: bestProposal?.agent_id,
        proposals: proposals.slice(0, 5).map(p => ({
          id: p.id,
          price: p.price?.unified_price,
          currency: p.price?.currency_code,
          agentId: p.agent_id
        }))
      };
    });

    return res.status(200).json({
      success: true,
      tickets: processedTickets,
      airlines: data.airlines || {},
      agents: data.agents || {},
      flightLegs: data.flight_legs || {},
      isOver: data.is_over || false,
      lastUpdateTimestamp: data.last_update_timestamp || 0,
      boundaries: data.boundaries || {}
    });

  } catch (error) {
    console.error('Results error:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}

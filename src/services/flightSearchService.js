/**
 * Real-time Flight Search Service
 * Uses Vercel serverless functions to access Travelpayouts API
 */

const API_BASE = '/api/flights';

/**
 * Start a flight search
 */
export async function startSearch({
  origin,
  destination,
  departureDate,
  returnDate = null,
  adults = 1,
  tripClass = 'Y'
}) {
  const response = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      tripClass
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to start search');
  }

  return response.json();
}

/**
 * Get search results (poll this until isOver is true)
 */
export async function getResults({
  searchId,
  resultsUrl,
  lastUpdateTimestamp = 0,
  limit = 50
}) {
  const response = await fetch(`${API_BASE}/results`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchId,
      resultsUrl,
      lastUpdateTimestamp,
      limit
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get results');
  }

  return response.json();
}

/**
 * Get booking link for a proposal
 */
export async function getBookingLink({
  searchId,
  proposalId,
  resultsUrl
}) {
  const response = await fetch(`${API_BASE}/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchId,
      proposalId,
      resultsUrl
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get booking link');
  }

  return response.json();
}

/**
 * Full search flow - starts search and polls for results
 * @param {Object} params - Search parameters
 * @param {Function} onProgress - Callback for progress updates
 * @returns {Promise<Object>} - Search results
 */
export async function searchFlights(params, onProgress = () => {}) {
  // Start the search
  onProgress({ status: 'starting', message: 'Iniciando búsqueda...' });
  const searchResult = await startSearch(params);

  if (!searchResult.success) {
    throw new Error('Failed to start search');
  }

  const { searchId, resultsUrl } = searchResult;
  let lastTimestamp = 0;
  let allTickets = [];
  let airlines = {};
  let agents = {};
  let flightLegs = {};
  let isOver = false;
  let attempts = 0;
  const maxAttempts = 30; // Max 30 attempts (about 60 seconds)

  onProgress({ status: 'searching', message: 'Buscando vuelos...', progress: 10 });

  // Poll for results
  while (!isOver && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls

    const results = await getResults({
      searchId,
      resultsUrl,
      lastUpdateTimestamp: lastTimestamp
    });

    if (!results.noNewResults) {
      // Merge new results
      if (results.tickets) {
        allTickets = [...allTickets, ...results.tickets];
      }
      if (results.airlines) {
        airlines = { ...airlines, ...results.airlines };
      }
      if (results.agents) {
        agents = { ...agents, ...results.agents };
      }
      if (results.flightLegs) {
        flightLegs = { ...flightLegs, ...results.flightLegs };
      }

      lastTimestamp = results.lastUpdateTimestamp;
      isOver = results.isOver;
    }

    attempts++;
    const progress = Math.min(10 + (attempts / maxAttempts) * 80, 90);
    onProgress({
      status: 'searching',
      message: `Encontrados ${allTickets.length} vuelos...`,
      progress,
      ticketCount: allTickets.length
    });
  }

  onProgress({ status: 'complete', message: 'Búsqueda completada', progress: 100 });

  // Sort by price
  allTickets.sort((a, b) => (a.price || 0) - (b.price || 0));

  return {
    searchId,
    resultsUrl,
    tickets: allTickets,
    airlines,
    agents,
    flightLegs,
    isComplete: isOver
  };
}

/**
 * Format ticket for display
 */
export function formatTicket(ticket, airlines, agents, flightLegs) {
  const segments = ticket.segments || [];
  const outboundSegment = segments[0];
  const returnSegment = segments[1];

  const getSegmentInfo = (segment) => {
    if (!segment) return null;

    const legs = (segment.flight_leg_ids || []).map(id => flightLegs[id]).filter(Boolean);
    if (legs.length === 0) return null;

    const firstLeg = legs[0];
    const lastLeg = legs[legs.length - 1];
    const airline = airlines[firstLeg?.marketing_airline];

    return {
      origin: firstLeg?.origin,
      destination: lastLeg?.destination,
      departureTime: firstLeg?.departure_timestamp,
      arrivalTime: lastLeg?.arrival_timestamp,
      duration: segment.duration,
      stops: legs.length - 1,
      airline: airline?.name || firstLeg?.marketing_airline,
      airlineCode: firstLeg?.marketing_airline,
      flightNumber: firstLeg?.flight_number
    };
  };

  return {
    id: ticket.id,
    price: ticket.price,
    currency: ticket.currency,
    proposalId: ticket.proposalId,
    outbound: getSegmentInfo(outboundSegment),
    return: getSegmentInfo(returnSegment),
    isRoundTrip: segments.length > 1
  };
}

export default {
  startSearch,
  getResults,
  getBookingLink,
  searchFlights,
  formatTicket
};

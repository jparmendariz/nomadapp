/**
 * Travelpayouts Flight & Hotel Service
 *
 * Marker ID: 486713
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/203956163
 */

const TRAVELPAYOUTS_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '486713';
const TRAVELPAYOUTS_TOKEN = import.meta.env.VITE_TRAVELPAYOUTS_TOKEN;

// Aviasales API base URL
const AVIASALES_API = 'https://api.travelpayouts.com/aviasales/v3';

/**
 * Genera link de afiliado para vuelos (Aviasales)
 */
export function generateFlightLink({
  origin,
  destination,
  departureDate,
  returnDate = null,
  adults = 1
}) {
  const baseUrl = 'https://www.aviasales.com/search';

  // Formato de fecha: DDMM (día y mes)
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}${month}`;
  };

  const depDate = formatDate(departureDate);
  const retDate = returnDate ? formatDate(returnDate) : '';

  // Formato: /ORIGDEST0101-0801 (origen destino fecha-ida fecha-vuelta)
  let searchPath = `/${origin}${destination}${depDate}`;
  if (retDate) {
    searchPath += retDate;
  }
  searchPath += `${adults}`;

  return `${baseUrl}${searchPath}?marker=${TRAVELPAYOUTS_MARKER}`;
}

/**
 * Genera link de afiliado para hoteles (Hotellook)
 */
export function generateHotelLink({
  destination,
  checkIn,
  checkOut,
  adults = 2
}) {
  const baseUrl = 'https://search.hotellook.com/hotels';

  const params = new URLSearchParams({
    destination: destination,
    checkIn: checkIn,
    checkOut: checkOut,
    adults: adults.toString(),
    marker: TRAVELPAYOUTS_MARKER
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Busca los precios más baratos por destino
 * Requiere API token
 */
export async function searchCheapestFlights({
  origin,
  destination = null, // null = todos los destinos
  departureDate = null,
  returnDate = null,
  currency = 'MXN'
}) {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.warn('Travelpayouts API token no configurado');
    return null;
  }

  try {
    const params = new URLSearchParams({
      origin,
      token: TRAVELPAYOUTS_TOKEN,
      currency
    });

    if (destination) params.append('destination', destination);
    if (departureDate) params.append('depart_date', departureDate);
    if (returnDate) params.append('return_date', returnDate);

    const response = await fetch(`${AVIASALES_API}/prices_for_dates?${params}`);

    if (!response.ok) {
      throw new Error(`Travelpayouts API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error buscando vuelos en Travelpayouts:', error);
    return null;
  }
}

/**
 * Obtiene precios populares desde un origen
 */
export async function getPopularDestinations(origin, currency = 'MXN') {
  if (!TRAVELPAYOUTS_TOKEN) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      origin,
      token: TRAVELPAYOUTS_TOKEN,
      currency
    });

    const response = await fetch(`${AVIASALES_API}/get_special_offers?${params}`);

    if (!response.ok) {
      throw new Error(`Travelpayouts API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo destinos populares:', error);
    return null;
  }
}

/**
 * Verifica si el API está configurado
 */
export function isConfigured() {
  return !!TRAVELPAYOUTS_TOKEN;
}

/**
 * Parsea resultados de Travelpayouts a nuestro formato
 */
export function parseFlightResults(response, origin) {
  if (!response || !response.data) {
    return [];
  }

  return response.data.map(flight => ({
    id: `tp-${flight.destination}-${flight.departure_at}`,
    origin: origin,
    destination: flight.destination,
    price: flight.price,
    currency: 'MXN',
    airline: flight.airline,
    flightNumber: flight.flight_number,
    departureDate: flight.departure_at?.split('T')[0],
    returnDate: flight.return_at?.split('T')[0],
    transfers: flight.transfers,
    affiliateLink: generateFlightLink({
      origin,
      destination: flight.destination,
      departureDate: flight.departure_at?.split('T')[0],
      returnDate: flight.return_at?.split('T')[0]
    })
  }));
}

export default {
  generateFlightLink,
  generateHotelLink,
  searchCheapestFlights,
  getPopularDestinations,
  isConfigured,
  parseFlightResults,
  MARKER: TRAVELPAYOUTS_MARKER
};

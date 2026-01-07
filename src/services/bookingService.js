/**
 * Booking.com Hotel Search Service
 *
 * Para usar esta API necesitas:
 * 1. Registrarte en https://www.booking.com/affiliate-program/v2/index.html
 * 2. Obtener acceso a la Booking.com Affiliate API
 * 3. Agregar VITE_BOOKING_AFFILIATE_ID a tu .env
 *
 * Nota: Booking.com tiene dos tipos de integración:
 * - Affiliate Links (fácil, solo necesitas affiliate ID)
 * - Demand API (requiere aprobación especial)
 *
 * Esta implementación usa Affiliate Links + RapidAPI como alternativa
 */

const BOOKING_AFFILIATE_ID = import.meta.env.VITE_BOOKING_AFFILIATE_ID || '2718406';
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY; // Alternativa para búsqueda
const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';

// Mapeo de ciudades a IDs de Booking.com (dest_id)
// Estos se obtienen de la API de autocomplete de Booking
const CITY_IDS = {
  // México
  'CUN': { destId: '-1658079', destType: 'city', name: 'Cancún' },
  'MEX': { destId: '-1658079', destType: 'city', name: 'Ciudad de México' },
  'GDL': { destId: '-1660711', destType: 'city', name: 'Guadalajara' },
  'PVR': { destId: '-1673778', destType: 'city', name: 'Puerto Vallarta' },
  'SJD': { destId: '-1670829', destType: 'city', name: 'Los Cabos' },
  'MID': { destId: '-1669796', destType: 'city', name: 'Mérida' },
  'OAX': { destId: '-1672042', destType: 'city', name: 'Oaxaca' },
  // USA
  'MIA': { destId: '20023488', destType: 'city', name: 'Miami' },
  'NYC': { destId: '20088325', destType: 'city', name: 'New York' },
  'LAX': { destId: '20014181', destType: 'city', name: 'Los Angeles' },
  // Europa
  'MAD': { destId: '-390625', destType: 'city', name: 'Madrid' },
  'BCN': { destId: '-372490', destType: 'city', name: 'Barcelona' },
  'PAR': { destId: '-1456928', destType: 'city', name: 'París' },
  'ROM': { destId: '-126693', destType: 'city', name: 'Roma' },
  'LON': { destId: '-2601889', destType: 'city', name: 'Londres' },
  // Caribe
  'PUJ': { destId: '-1784876', destType: 'city', name: 'Punta Cana' },
  'HAV': { destId: '-1784876', destType: 'city', name: 'La Habana' },
  // Sudamérica
  'BOG': { destId: '-592318', destType: 'city', name: 'Bogotá' },
  'LIM': { destId: '-1630858', destType: 'city', name: 'Lima' },
  'EZE': { destId: '-979186', destType: 'city', name: 'Buenos Aires' }
};

/**
 * Verifica si la API está configurada
 */
export function isBookingConfigured() {
  return !!BOOKING_AFFILIATE_ID;
}

/**
 * Verifica si RapidAPI está configurado (para búsqueda)
 */
export function isRapidApiConfigured() {
  return !!RAPIDAPI_KEY;
}

/**
 * Genera un link de afiliado de Booking.com
 * Este es el método principal de monetización
 */
export function generateAffiliateLink({
  destination,
  checkIn,
  checkOut,
  adults = 2,
  rooms = 1,
  children = 0
}) {
  const cityInfo = CITY_IDS[destination];
  const baseUrl = 'https://www.booking.com/searchresults.html';

  const params = new URLSearchParams({
    aid: BOOKING_AFFILIATE_ID || '304142', // ID de demo si no hay configurado
    dest_id: cityInfo?.destId || destination,
    dest_type: cityInfo?.destType || 'city',
    checkin: checkIn,
    checkout: checkOut,
    group_adults: adults.toString(),
    no_rooms: rooms.toString(),
    group_children: children.toString(),
    selected_currency: 'MXN',
    lang: 'es'
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Busca hoteles usando RapidAPI (alternativa a API oficial)
 * Requiere suscripción a RapidAPI
 */
export async function searchHotels({
  destination,
  checkIn,
  checkOut,
  adults = 2,
  rooms = 1,
  currency = 'MXN',
  minStars = 3
}) {
  if (!isRapidApiConfigured()) {
    console.warn('RapidAPI no configurada, usando datos mock');
    return null;
  }

  const cityInfo = CITY_IDS[destination];
  if (!cityInfo) {
    console.warn(`Ciudad no encontrada en mapping: ${destination}`);
    return null;
  }

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/v1/hotels/search?` + new URLSearchParams({
        dest_id: cityInfo.destId,
        dest_type: cityInfo.destType,
        checkin_date: checkIn,
        checkout_date: checkOut,
        adults_number: adults.toString(),
        room_number: rooms.toString(),
        order_by: 'price',
        filter_by_currency: currency,
        locale: 'es',
        units: 'metric',
        include_adjacency: 'true',
        categories_filter_ids: `class::${minStars},class::${minStars + 1},class::5` // Filtrar por estrellas
      }),
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }
    );

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error buscando hoteles:', error);
    return null;
  }
}

/**
 * Obtiene detalles de un hotel específico
 */
export async function getHotelDetails(hotelId) {
  if (!isRapidApiConfigured()) {
    return null;
  }

  try {
    const response = await fetch(
      `https://${RAPIDAPI_HOST}/v1/hotels/data?` + new URLSearchParams({
        hotel_id: hotelId,
        locale: 'es'
      }),
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST
        }
      }
    );

    if (!response.ok) {
      throw new Error(`RapidAPI error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo detalles del hotel:', error);
    return null;
  }
}

/**
 * Parsea la respuesta de RapidAPI a nuestro formato interno
 */
export function parseBookingResults(response, searchParams) {
  if (!response || !response.result) {
    return [];
  }

  return response.result.slice(0, 15).map(hotel => {
    const pricePerNight = hotel.min_total_price || hotel.composite_price_breakdown?.gross_amount?.value;
    const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);

    return {
      id: hotel.hotel_id,
      name: hotel.hotel_name || hotel.hotel_name_trans,
      stars: hotel.class || Math.round(hotel.review_score / 2),
      rating: hotel.review_score,
      reviewCount: hotel.review_nr,
      reviewWord: hotel.review_score_word,
      address: hotel.address || hotel.address_trans,
      city: hotel.city || hotel.city_trans,
      country: hotel.country_trans,
      image: hotel.main_photo_url?.replace('square60', 'square300'),
      images: hotel.photos?.map(p => p.url_max) || [],
      pricePerNight: Math.round(pricePerNight || 0),
      totalPrice: Math.round((pricePerNight || 0) * nights),
      currency: hotel.currency_code || 'MXN',
      amenities: hotel.unit_configuration_label ? [hotel.unit_configuration_label] : [],
      distance: hotel.distance_to_cc,
      distanceUnit: hotel.distance_to_cc_formatted,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      affiliateLink: generateAffiliateLink({
        destination: searchParams.destination,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        adults: searchParams.adults,
        rooms: searchParams.rooms
      }),
      deepLink: hotel.url
    };
  });
}

/**
 * Calcula noches entre dos fechas
 */
function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

/**
 * Genera datos mock de hoteles para cuando no hay API configurada
 */
export function generateMockHotels(destination, checkIn, checkOut, minStars = 3) {
  const cityInfo = CITY_IDS[destination] || { name: destination };
  const nights = calculateNights(checkIn, checkOut);

  const mockHotels = [
    { name: `Hotel Fiesta ${cityInfo.name}`, stars: 4, basePrice: 1200 },
    { name: `Gran Hotel ${cityInfo.name}`, stars: 5, basePrice: 2500 },
    { name: `${cityInfo.name} Suites`, stars: 3, basePrice: 800 },
    { name: `Resort Paradise ${cityInfo.name}`, stars: 4, basePrice: 1800 },
    { name: `City Hotel ${cityInfo.name}`, stars: 3, basePrice: 650 },
    { name: `Boutique ${cityInfo.name}`, stars: 4, basePrice: 1500 },
    { name: `${cityInfo.name} Inn`, stars: 2, basePrice: 450 },
    { name: `Luxury ${cityInfo.name}`, stars: 5, basePrice: 3500 }
  ];

  return mockHotels
    .filter(h => h.stars >= minStars)
    .map((hotel, index) => {
      const priceVariation = 0.8 + Math.random() * 0.4;
      const pricePerNight = Math.round(hotel.basePrice * priceVariation);

      return {
        id: `mock-hotel-${index}`,
        name: hotel.name,
        stars: hotel.stars,
        rating: 7 + Math.random() * 2.5,
        reviewCount: 50 + Math.floor(Math.random() * 500),
        reviewWord: hotel.stars >= 4 ? 'Muy bueno' : 'Bueno',
        city: cityInfo.name,
        country: 'México',
        image: `https://images.unsplash.com/photo-${1566073771259 + index}-6a6bd1d725?w=300`,
        pricePerNight,
        totalPrice: pricePerNight * nights,
        currency: 'MXN',
        amenities: ['WiFi', 'Piscina', 'Restaurante'].slice(0, 1 + Math.floor(Math.random() * 3)),
        affiliateLink: generateAffiliateLink({
          destination,
          checkIn,
          checkOut,
          adults: 2
        })
      };
    })
    .sort((a, b) => a.pricePerNight - b.pricePerNight);
}

export default {
  isBookingConfigured,
  isRapidApiConfigured,
  generateAffiliateLink,
  searchHotels,
  getHotelDetails,
  parseBookingResults,
  generateMockHotels
};

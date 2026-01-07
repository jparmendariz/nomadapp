/**
 * Travelpayouts Flight & Hotel Service
 *
 * Marker ID: 486713
 * Docs: https://support.travelpayouts.com/hc/en-us/articles/203956163
 * API Docs: https://support.travelpayouts.com/hc/en-us/articles/360031566691
 */

const TRAVELPAYOUTS_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '486713';
const TRAVELPAYOUTS_TOKEN = import.meta.env.VITE_TRAVELPAYOUTS_TOKEN;

// API base URLs
const DATA_API = 'https://api.travelpayouts.com';

// Códigos de aeropuertos principales de México
const MEXICO_AIRPORTS = {
  'Ciudad de Mexico': 'MEX',
  'CDMX': 'MEX',
  'Mexico City': 'MEX',
  'Guadalajara': 'GDL',
  'Monterrey': 'MTY',
  'Cancun': 'CUN',
  'Cancún': 'CUN',
  'Tijuana': 'TIJ',
  'Los Cabos': 'SJD',
  'Puerto Vallarta': 'PVR'
};

// Nombres de ciudades por código IATA
const CITY_NAMES = {
  'MEX': 'Ciudad de México',
  'GDL': 'Guadalajara',
  'MTY': 'Monterrey',
  'CUN': 'Cancún',
  'TIJ': 'Tijuana',
  'SJD': 'Los Cabos',
  'PVR': 'Puerto Vallarta',
  'MIA': 'Miami',
  'LAX': 'Los Angeles',
  'JFK': 'New York',
  'NYC': 'New York',
  'MAD': 'Madrid',
  'BCN': 'Barcelona',
  'CDG': 'París',
  'PAR': 'París',
  'FCO': 'Roma',
  'ROM': 'Roma',
  'LHR': 'Londres',
  'LON': 'Londres',
  'AMS': 'Amsterdam',
  'BOG': 'Bogotá',
  'LIM': 'Lima',
  'SCL': 'Santiago',
  'EZE': 'Buenos Aires',
  'GRU': 'São Paulo',
  'HAV': 'La Habana',
  'PUJ': 'Punta Cana',
  'SJO': 'San José',
  'PTY': 'Panamá',
  'NRT': 'Tokyo',
  'TYO': 'Tokyo',
  'HND': 'Tokyo',
  'ICN': 'Seúl',
  'BKK': 'Bangkok',
  'SIN': 'Singapur',
  'DXB': 'Dubai',
  'SYD': 'Sydney'
};

// Regiones por código IATA
const REGIONS = {
  'MEX': 'national', 'GDL': 'national', 'MTY': 'national', 'CUN': 'caribbean',
  'TIJ': 'national', 'SJD': 'national', 'PVR': 'national',
  'MIA': 'northAmerica', 'LAX': 'northAmerica', 'JFK': 'northAmerica', 'NYC': 'northAmerica',
  'MAD': 'europe', 'BCN': 'europe', 'CDG': 'europe', 'PAR': 'europe',
  'FCO': 'europe', 'ROM': 'europe', 'LHR': 'europe', 'LON': 'europe', 'AMS': 'europe',
  'BOG': 'southAmerica', 'LIM': 'southAmerica', 'SCL': 'southAmerica',
  'EZE': 'southAmerica', 'GRU': 'southAmerica',
  'HAV': 'caribbean', 'PUJ': 'caribbean', 'SJO': 'centralAmerica', 'PTY': 'centralAmerica',
  'NRT': 'asia', 'TYO': 'asia', 'HND': 'asia', 'ICN': 'asia',
  'BKK': 'asia', 'SIN': 'asia', 'DXB': 'middleEast',
  'SYD': 'oceania'
};

/**
 * Genera link de afiliado para vuelos (Aviasales)
 * Formato correcto: /ORIGEN{DDMM}DESTINO{DDMM}{adultos}
 * Ejemplo: /TIJ1501MIA22011 (TIJ->MIA, sale 15 ene, regresa 22 ene, 1 adulto)
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
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}${month}`;
  };

  const depDate = formatDate(departureDate);
  const retDate = returnDate ? formatDate(returnDate) : '';

  // Formato correcto de Aviasales: /ORIGEN{DDMM}DESTINO{DDMM}{adultos}
  let searchPath;
  if (retDate) {
    // Ida y vuelta: /TIJ1501MIA22011
    searchPath = `/${origin}${depDate}${destination}${retDate}${adults}`;
  } else {
    // Solo ida: /TIJ1501MIA1
    searchPath = `/${origin}${depDate}${destination}${adults}`;
  }

  return `${baseUrl}${searchPath}?marker=${TRAVELPAYOUTS_MARKER}`;
}

/**
 * Obtiene el nombre de ciudad por código IATA
 */
export function getCityName(code) {
  return CITY_NAMES[code] || code;
}

/**
 * Obtiene la región por código IATA
 */
export function getRegion(code) {
  return REGIONS[code] || 'other';
}

/**
 * Genera link de afiliado para hoteles (Hotellook)
 */
export function generateHotelLink({
  locationId,
  hotelId = null,
  checkIn,
  checkOut,
  adults = 2,
  cityName = null
}) {
  // Si tenemos hotelId, link directo al hotel
  if (hotelId) {
    return `https://search.hotellook.com/hotels?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&marker=${TRAVELPAYOUTS_MARKER}`;
  }

  // Si tenemos locationId, link a búsqueda en esa ciudad
  if (locationId) {
    return `https://search.hotellook.com/hotels?locationId=${locationId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&marker=${TRAVELPAYOUTS_MARKER}`;
  }

  // Fallback: búsqueda por nombre de ciudad
  const destination = cityName || 'Mexico';
  return `https://search.hotellook.com/hotels?destination=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&marker=${TRAVELPAYOUTS_MARKER}`;
}

// Hotellook API base URL
const HOTELLOOK_API = 'https://engine.hotellook.com/api/v2';

// IDs de ubicaciones populares en México
const POPULAR_LOCATIONS = {
  'Cancun': 12385,
  'Ciudad de Mexico': 12439,
  'Los Cabos': 22007,
  'Puerto Vallarta': 12566,
  'Playa del Carmen': 12552,
  'Riviera Maya': 70308,
  'Tulum': 67531,
  'Guadalajara': 12423,
  'Monterrey': 12505,
  'Oaxaca': 12534
};

// Nombres de ubicaciones por ID
const LOCATION_NAMES = {
  12385: 'Cancún',
  12439: 'Ciudad de México',
  22007: 'Los Cabos',
  12566: 'Puerto Vallarta',
  12552: 'Playa del Carmen',
  70308: 'Riviera Maya',
  67531: 'Tulum',
  12423: 'Guadalajara',
  12505: 'Monterrey',
  12534: 'Oaxaca'
};

/**
 * Obtiene precios de hoteles en caché para una ubicación
 * API: /cache.json
 */
export async function getHotelPrices({
  locationId,
  checkIn,
  checkOut,
  currency = 'USD',
  limit = 10
}) {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.warn('Travelpayouts API token no configurado');
    return null;
  }

  try {
    const params = new URLSearchParams({
      locationId: locationId.toString(),
      checkIn,
      checkOut,
      currency,
      limit: limit.toString(),
      token: TRAVELPAYOUTS_TOKEN
    });

    const response = await fetch(`${HOTELLOOK_API}/cache.json?${params}`);

    if (!response.ok) {
      throw new Error(`Hotellook API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo precios de hoteles:', error);
    return null;
  }
}

/**
 * Busca ubicación por nombre
 * API: /lookup.json
 */
export async function lookupLocation(query, lang = 'es') {
  try {
    const params = new URLSearchParams({
      query,
      lang,
      limit: '5',
      token: TRAVELPAYOUTS_TOKEN
    });

    const response = await fetch(`${HOTELLOOK_API}/lookup.json?${params}`);

    if (!response.ok) {
      throw new Error(`Hotellook lookup error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error buscando ubicación:', error);
    return null;
  }
}

/**
 * Obtiene ofertas de hoteles reales desde múltiples destinos mexicanos
 */
export async function getHotelDeals(currency = 'USD') {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.warn('Travelpayouts API token no configurado');
    return [];
  }

  const allDeals = [];
  const now = new Date();

  // Fechas: próximas 2-8 semanas
  const checkIn = new Date(now);
  checkIn.setDate(checkIn.getDate() + 14 + Math.floor(Math.random() * 30));
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + 3 + Math.floor(Math.random() * 4)); // 3-7 noches

  const checkInStr = checkIn.toISOString().split('T')[0];
  const checkOutStr = checkOut.toISOString().split('T')[0];

  try {
    // Obtener hoteles de varias ubicaciones en paralelo
    const locationIds = Object.values(POPULAR_LOCATIONS);
    const promises = locationIds.map(locationId =>
      getHotelPrices({
        locationId,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        currency,
        limit: 5
      }).catch(() => null)
    );

    const results = await Promise.all(promises);

    results.forEach((hotels, index) => {
      if (hotels && Array.isArray(hotels)) {
        const locationId = locationIds[index];
        hotels.forEach(hotel => {
          allDeals.push({
            ...hotel,
            locationId,
            locationName: LOCATION_NAMES[locationId],
            checkIn: checkInStr,
            checkOut: checkOutStr
          });
        });
      }
    });

    return allDeals;
  } catch (error) {
    console.error('Error obteniendo ofertas de hoteles:', error);
    return [];
  }
}

/**
 * Convierte datos de hoteles de la API a formato de deal
 */
export function parseHotelToDeals(hotels, currency = 'USD') {
  if (!hotels || !Array.isArray(hotels)) {
    return [];
  }

  const now = new Date();

  return hotels.map((hotel, index) => {
    const checkIn = new Date(hotel.checkIn);
    const checkOut = new Date(hotel.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    // Precio por noche desde la API
    const pricePerNight = hotel.priceFrom || hotel.price || 50;
    const totalPrice = pricePerNight * nights;

    // Simular descuento
    const discountPercent = Math.floor(10 + Math.random() * 30);
    const originalPrice = Math.round(totalPrice / (1 - discountPercent / 100));

    // Generar link de afiliado
    const dealUrl = generateHotelLink({
      locationId: hotel.locationId,
      hotelId: hotel.hotelId,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      adults: 2,
      cityName: hotel.locationName
    });

    // Tiempo de expiración
    const expiresAt = new Date(now.getTime() + (4 + Math.random() * 20) * 60 * 60 * 1000);

    return {
      id: `hl-${hotel.hotelId || hotel.locationId}-${index}`,
      type: 'hotel',
      name: hotel.hotelName || hotel.name || `Hotel en ${hotel.locationName}`,
      destinationName: hotel.locationName,
      location: hotel.locationName,
      country: 'México',
      region: 'national',
      price: totalPrice,
      pricePerNight,
      originalPrice,
      discountPercent,
      nights,
      stars: hotel.stars || 3,
      travelDatesStart: hotel.checkIn,
      travelDatesEnd: hotel.checkOut,
      checkIn: hotel.checkIn,
      checkOut: hotel.checkOut,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      dealUrl,
      isRealData: true
    };
  });
}

/**
 * Obtiene los precios más recientes (últimas 48h) desde varios orígenes
 * API: /v2/prices/latest
 */
export async function getLatestPrices({
  origin = 'MEX',
  destination = null,
  currency = 'USD',
  limit = 30,
  oneWay = false,
  period = 'month'
}) {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.warn('Travelpayouts API token no configurado');
    return null;
  }

  try {
    const params = new URLSearchParams({
      currency,
      origin,
      token: TRAVELPAYOUTS_TOKEN,
      limit: limit.toString(),
      one_way: oneWay.toString(),
      period_type: period
    });

    if (destination) params.append('destination', destination);

    const response = await fetch(`${DATA_API}/v2/prices/latest?${params}`);

    if (!response.ok) {
      throw new Error(`Travelpayouts API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error obteniendo precios recientes:', error);
    return null;
  }
}

/**
 * Obtiene ofertas especiales y precios baratos
 * API: /v2/prices/cheap
 */
export async function getCheapPrices({
  origin = 'MEX',
  destination = null,
  departureDate = null,
  returnDate = null,
  currency = 'USD'
}) {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.warn('Travelpayouts API token no configurado');
    return null;
  }

  try {
    const params = new URLSearchParams({
      currency,
      origin,
      token: TRAVELPAYOUTS_TOKEN
    });

    if (destination) params.append('destination', destination);
    if (departureDate) params.append('depart_date', departureDate);
    if (returnDate) params.append('return_date', returnDate);

    const response = await fetch(`${DATA_API}/v2/prices/cheap?${params}`);

    if (!response.ok) {
      throw new Error(`Travelpayouts API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo precios baratos:', error);
    return null;
  }
}

/**
 * Obtiene precios populares desde un origen (para el buscador)
 */
export async function getPopularDestinations(origin = 'MEX', currency = 'USD') {
  if (!TRAVELPAYOUTS_TOKEN) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      origin,
      token: TRAVELPAYOUTS_TOKEN,
      currency
    });

    const response = await fetch(`${DATA_API}/v2/prices/latest?${params}`);

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
 * Obtiene ofertas flash reales desde múltiples orígenes mexicanos
 */
export async function getFlashDeals(currency = 'USD') {
  if (!TRAVELPAYOUTS_TOKEN) {
    console.warn('Travelpayouts API token no configurado');
    return [];
  }

  const mexicanOrigins = ['MEX', 'GDL', 'MTY', 'TIJ', 'CUN'];
  const allDeals = [];

  try {
    // Hacer peticiones en paralelo desde varios orígenes
    const promises = mexicanOrigins.map(origin =>
      getLatestPrices({
        origin,
        currency,
        limit: 15,
        oneWay: false
      }).catch(() => null)
    );

    // También obtener vuelos solo ida
    const oneWayPromises = mexicanOrigins.slice(0, 3).map(origin =>
      getLatestPrices({
        origin,
        currency,
        limit: 10,
        oneWay: true
      }).catch(() => null)
    );

    const results = await Promise.all([...promises, ...oneWayPromises]);

    results.forEach((result, index) => {
      if (result && result.data) {
        const isOneWay = index >= mexicanOrigins.length;
        const origin = isOneWay
          ? mexicanOrigins[index - mexicanOrigins.length]
          : mexicanOrigins[index];

        result.data.forEach(flight => {
          allDeals.push({
            ...flight,
            origin,
            isOneWay
          });
        });
      }
    });

    return allDeals;
  } catch (error) {
    console.error('Error obteniendo flash deals:', error);
    return [];
  }
}

/**
 * Verifica si el API está configurado
 */
export function isConfigured() {
  return !!TRAVELPAYOUTS_TOKEN;
}

/**
 * Convierte datos de la API a formato de deal para la UI
 */
export function parseFlightToDeals(flights) {
  if (!flights || !Array.isArray(flights)) {
    return [];
  }

  const now = new Date();

  return flights.map((flight, index) => {
    const departureDate = flight.depart_date || flight.departure_at?.split('T')[0];
    const returnDate = flight.return_date || flight.return_at?.split('T')[0];
    const isOneWay = flight.isOneWay || !returnDate;

    // Calcular noches si es ida y vuelta
    let nights = null;
    if (!isOneWay && departureDate && returnDate) {
      const dep = new Date(departureDate);
      const ret = new Date(returnDate);
      nights = Math.ceil((ret - dep) / (1000 * 60 * 60 * 24));
    }

    // Generar link de afiliado con los datos exactos del vuelo
    const dealUrl = generateFlightLink({
      origin: flight.origin,
      destination: flight.destination,
      departureDate,
      returnDate: isOneWay ? null : returnDate,
      adults: 1
    });

    // Calcular tiempo de expiración (ofertas expiran en 2-24h)
    const expiresAt = new Date(now.getTime() + (2 + Math.random() * 22) * 60 * 60 * 1000);

    // El precio de la API ya es el precio real
    const price = flight.value || flight.price;
    // Simular precio original (10-30% más alto para mostrar descuento)
    const discountPercent = Math.floor(15 + Math.random() * 25);
    const originalPrice = Math.round(price / (1 - discountPercent / 100));

    return {
      id: `tp-${flight.origin}-${flight.destination}-${departureDate}-${index}`,
      type: 'flight',
      destinationName: getCityName(flight.destination),
      destinationCode: flight.destination,
      location: getCityName(flight.destination),
      country: '', // La API no provee país
      region: getRegion(flight.destination),
      originName: getCityName(flight.origin),
      originCode: flight.origin,
      price,
      originalPrice,
      discountPercent,
      nights,
      travelDatesStart: departureDate,
      travelDatesEnd: isOneWay ? null : returnDate,
      isOneWay,
      createdAt: flight.found_at || now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      airline: flight.airline,
      transfers: flight.number_of_changes ?? flight.transfers ?? 0,
      dealUrl,
      // Marcar como dato real de API
      isRealData: true
    };
  });
}

/**
 * Obtiene deals formateados listos para la UI (vuelos + hoteles)
 */
export async function getFormattedDeals(currency = 'USD') {
  // Obtener vuelos y hoteles en paralelo
  const [rawFlights, rawHotels] = await Promise.all([
    getFlashDeals(currency).catch(() => []),
    getHotelDeals(currency).catch(() => [])
  ]);

  const flightDeals = parseFlightToDeals(rawFlights);
  const hotelDeals = parseHotelToDeals(rawHotels, currency);

  // Combinar y mezclar aleatoriamente
  const allDeals = [...flightDeals, ...hotelDeals];
  const shuffledDeals = allDeals.sort(() => Math.random() - 0.5);

  if (shuffledDeals.length === 0) {
    return { deals: [], stats: null };
  }

  // Calcular stats
  const stats = {
    total: shuffledDeals.length,
    flights: flightDeals.length,
    hotels: hotelDeals.length,
    cruises: 0,
    avgDiscount: Math.round(shuffledDeals.reduce((acc, d) => acc + d.discountPercent, 0) / shuffledDeals.length)
  };

  return { deals: shuffledDeals, stats };
}

export default {
  generateFlightLink,
  generateHotelLink,
  getLatestPrices,
  getCheapPrices,
  getPopularDestinations,
  getFlashDeals,
  getHotelDeals,
  getHotelPrices,
  lookupLocation,
  getFormattedDeals,
  parseFlightToDeals,
  parseHotelToDeals,
  isConfigured,
  getCityName,
  getRegion,
  MARKER: TRAVELPAYOUTS_MARKER
};

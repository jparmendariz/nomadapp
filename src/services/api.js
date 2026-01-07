import axios from 'axios';
import travelpayoutsService from './travelpayoutsService';
import bookingService from './bookingService';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

// IDs de afiliados
const TRAVELPAYOUTS_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '486713';
const BOOKING_AFFILIATE_ID = import.meta.env.VITE_BOOKING_AFFILIATE_ID || '2718406';

// Mock data para modo demo (cuando no hay backend)
function generateMockDeals() {
  const destinations = [
    { name: 'Cancun', country: 'Mexico', region: 'caribbean' },
    { name: 'Madrid', country: 'Spain', region: 'europe' },
    { name: 'New York', country: 'USA', region: 'northAmerica' },
    { name: 'Paris', country: 'France', region: 'europe' },
    { name: 'Tokyo', country: 'Japan', region: 'asia' },
    { name: 'Rome', country: 'Italy', region: 'europe' },
    { name: 'Barcelona', country: 'Spain', region: 'europe' },
    { name: 'Miami', country: 'USA', region: 'northAmerica' },
    { name: 'Punta Cana', country: 'Dominican Republic', region: 'caribbean' },
    { name: 'Los Cabos', country: 'Mexico', region: 'national' },
    { name: 'London', country: 'UK', region: 'europe' },
    { name: 'Sydney', country: 'Australia', region: 'oceania' },
  ];

  const origins = ['Ciudad de Mexico', 'Guadalajara', 'Monterrey', 'Tijuana'];
  const types = ['flight', 'hotel', 'cruise'];
  const cruiseLines = [
    { name: 'Royal Caribbean', url: 'https://www.royalcaribbean.com' },
    { name: 'Carnival', url: 'https://www.carnival.com' },
    { name: 'Norwegian', url: 'https://www.ncl.com' },
    { name: 'MSC', url: 'https://www.msccruises.com' }
  ];
  const cabinTypes = ['Interior', 'Ocean View', 'Balcony', 'Suite'];

  // Función para generar links de afiliado
  const generateDealUrl = (type, dest, origin, travelDate, returnDate) => {
    const depDateStr = travelDate.toISOString().split('T')[0];
    const retDateStr = returnDate.toISOString().split('T')[0];

    if (type === 'flight') {
      return travelpayoutsService.generateFlightLink({
        origin: 'MEX',
        destination: dest.name.substring(0, 3).toUpperCase(),
        departureDate: depDateStr,
        returnDate: retDateStr,
        adults: 1
      });
    } else if (type === 'hotel') {
      return bookingService.generateAffiliateLink({
        destination: dest.name,
        checkIn: depDateStr,
        checkOut: retDateStr,
        adults: 2
      });
    }
    return null;
  };

  const deals = [];
  const now = new Date();

  // Generar 60 deals para mejor distribución en el calendario
  for (let i = 0; i < 60; i++) {
    const dest = destinations[Math.floor(Math.random() * destinations.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const basePrice = 200 + Math.floor(Math.random() * 800);
    const discount = 15 + Math.floor(Math.random() * 50);
    const originalPrice = Math.round(basePrice / (1 - discount / 100));
    const nights = 3 + Math.floor(Math.random() * 10);

    // Travel dates: distribuir uniformemente en los próximos 6 meses
    // Asegurar que cada mes tenga deals (10 por mes aproximadamente)
    const monthOffset = Math.floor(i / 10); // 0-5 meses
    const travelDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    // Día aleatorio dentro del mes
    const daysInMonth = new Date(travelDate.getFullYear(), travelDate.getMonth() + 1, 0).getDate();
    travelDate.setDate(1 + Math.floor(Math.random() * daysInMonth));
    const returnDate = new Date(travelDate);
    returnDate.setDate(returnDate.getDate() + nights);

    // Created at: random time in last 24 hours
    const createdAt = new Date(now);
    createdAt.setMinutes(createdAt.getMinutes() - Math.floor(Math.random() * 1440));

    // Seleccionar cruise line si es crucero
    const cruiseLine = type === 'cruise' ? cruiseLines[Math.floor(Math.random() * cruiseLines.length)] : null;

    // Generar URL de booking según el tipo (con links de afiliado)
    let dealUrl;
    if (type === 'cruise' && cruiseLine) {
      dealUrl = cruiseLine.url;
    } else {
      dealUrl = generateDealUrl(type, dest, origin, travelDate, returnDate);
    }

    // 30% de los vuelos son solo ida
    const isOneWayFlight = type === 'flight' && Math.random() < 0.3;

    const deal = {
      id: `deal-${i + 1}`,
      type,
      destinationName: dest.name,
      location: dest.name,
      country: dest.country,
      region: dest.region,
      originName: origin,
      price: isOneWayFlight ? Math.round(basePrice * 0.6) : basePrice, // Solo ida es más barato
      originalPrice: isOneWayFlight ? Math.round(originalPrice * 0.6) : originalPrice,
      discountPercent: discount,
      nights: type !== 'flight' ? nights : null,
      travelDatesStart: travelDate.toISOString().split('T')[0],
      travelDatesEnd: isOneWayFlight ? null : returnDate.toISOString().split('T')[0],
      isOneWay: isOneWayFlight,
      createdAt: createdAt.toISOString(),
      expiresAt: new Date(now.getTime() + (2 + Math.random() * 22) * 60 * 60 * 1000).toISOString(),
      provider: cruiseLine ? cruiseLine.name : null,
      cabinType: type === 'cruise' ? cabinTypes[Math.floor(Math.random() * cabinTypes.length)] : null,
      imageUrl: `https://source.unsplash.com/400x300/?${dest.name.toLowerCase()},travel`,
      dealUrl,
    };

    deals.push(deal);
  }

  return deals;
}

// Cache de deals mock
let mockDealsCache = null;

// Mock data para búsqueda de destinos
function generateMockSearchResults(params) {
  const { origin, budget, departureDate, returnDate, tripType, travelers, noDates } = params;
  const budgetNum = parseFloat(budget) || 500;
  const travelersNum = parseInt(travelers) || 1;
  const originCode = origin || 'MEX';

  const destinations = [
    { city: 'Cancún', country: 'México', code: 'CUN', region: 'caribbean', basePrice: 180, image: 'https://images.unsplash.com/photo-1510097467424-192d713fd8b2?w=400' },
    { city: 'Los Cabos', country: 'México', code: 'SJD', region: 'national', basePrice: 220, image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400' },
    { city: 'Puerto Vallarta', country: 'México', code: 'PVR', region: 'national', basePrice: 150, image: 'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?w=400' },
    { city: 'Miami', country: 'USA', code: 'MIA', region: 'northAmerica', basePrice: 280, image: 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=400' },
    { city: 'New York', country: 'USA', code: 'JFK', region: 'northAmerica', basePrice: 350, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
    { city: 'Madrid', country: 'España', code: 'MAD', region: 'europe', basePrice: 450, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400' },
    { city: 'París', country: 'Francia', code: 'CDG', region: 'europe', basePrice: 520, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
    { city: 'Roma', country: 'Italia', code: 'FCO', region: 'europe', basePrice: 480, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
    { city: 'Barcelona', country: 'España', code: 'BCN', region: 'europe', basePrice: 430, image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400' },
    { city: 'Punta Cana', country: 'Rep. Dominicana', code: 'PUJ', region: 'caribbean', basePrice: 320, image: 'https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?w=400' },
    { city: 'La Habana', country: 'Cuba', code: 'HAV', region: 'caribbean', basePrice: 290, image: 'https://images.unsplash.com/photo-1500759285222-a95626b934cb?w=400' },
    { city: 'Bogotá', country: 'Colombia', code: 'BOG', region: 'southAmerica', basePrice: 250, image: 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=400' },
    { city: 'Lima', country: 'Perú', code: 'LIM', region: 'southAmerica', basePrice: 280, image: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=400' },
    { city: 'Buenos Aires', country: 'Argentina', code: 'EZE', region: 'southAmerica', basePrice: 380, image: 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400' },
    { city: 'Tokio', country: 'Japón', code: 'NRT', region: 'asia', basePrice: 850, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
    { city: 'Bangkok', country: 'Tailandia', code: 'BKK', region: 'asia', basePrice: 720, image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400' },
  ];

  // Calcular fechas
  let depDate, retDate, nights;
  if (noDates || !departureDate) {
    // Sin fechas: generar fechas aleatorias en los próximos 3 meses
    const now = new Date();
    depDate = new Date(now);
    depDate.setDate(depDate.getDate() + 14 + Math.floor(Math.random() * 60));
    nights = 5 + Math.floor(Math.random() * 5);
    retDate = new Date(depDate);
    retDate.setDate(retDate.getDate() + nights);
  } else {
    depDate = new Date(departureDate);
    retDate = returnDate ? new Date(returnDate) : new Date(depDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    nights = Math.ceil((retDate - depDate) / (1000 * 60 * 60 * 24));
  }

  const seasons = ['high', 'medium', 'low'];
  const weathers = [
    { condition: 'sunny', temp: 28 },
    { condition: 'partly_cloudy', temp: 24 },
    { condition: 'cloudy', temp: 20 },
  ];

  return destinations
    .map(dest => {
      // Precio del vuelo con variación aleatoria
      const flightPrice = Math.round(dest.basePrice * (0.8 + Math.random() * 0.4));
      // Precio del hotel por noche
      const hotelPricePerNight = tripType === 'flight_only' ? 0 : Math.round(40 + Math.random() * 80);
      const hotelTotal = hotelPricePerNight * nights;
      // Costo total
      const totalCost = (flightPrice + hotelTotal) * travelersNum;

      // Solo incluir si está dentro del presupuesto
      if (totalCost > budgetNum) return null;

      const depDateStr = depDate.toISOString().split('T')[0];
      const retDateStr = retDate.toISOString().split('T')[0];

      // Generar links de afiliado
      const flightLink = travelpayoutsService.generateFlightLink({
        origin: originCode,
        destination: dest.code,
        departureDate: depDateStr,
        returnDate: retDateStr,
        adults: travelersNum
      });

      const hotelLink = bookingService.generateAffiliateLink({
        destination: dest.code,
        checkIn: depDateStr,
        checkOut: retDateStr,
        adults: travelersNum
      });

      return {
        ...dest,
        name: dest.city,
        price: totalCost,
        totalCost,
        flight: {
          price: flightPrice,
          airline: ['Volaris', 'VivaAerobus', 'Aeromexico', 'American'][Math.floor(Math.random() * 4)],
          departureDate: depDateStr,
          returnDate: retDateStr,
          bookingLink: flightLink // Link de afiliado Skyscanner
        },
        hotel: tripType === 'flight_only' ? null : {
          price: hotelPricePerNight,
          total: hotelTotal,
          name: ['Hotel Fiesta', 'Gran Hotel', 'Resort Paradise', 'City Suites'][Math.floor(Math.random() * 4)],
          stars: 3 + Math.floor(Math.random() * 2),
          bookingLink: hotelLink // Link de afiliado Booking.com
        },
        nights,
        departureDate: depDateStr,
        returnDate: retDateStr,
        weather: weathers[Math.floor(Math.random() * weathers.length)],
        season: seasons[Math.floor(Math.random() * seasons.length)],
        costOfLiving: {
          food: 15 + Math.floor(Math.random() * 35),
        },
        // Proveedores con links de afiliado
        providers: [
          { name: 'Aviasales', price: flightPrice, url: flightLink, type: 'flight' },
          { name: 'Booking.com', price: hotelPricePerNight * nights, url: hotelLink, type: 'hotel' },
        ],
        // Links principales para botones de acción
        affiliateLinks: {
          flight: flightLink,
          hotel: hotelLink
        }
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.totalCost - b.totalCost);
}

// Limpiar cache para forzar regeneración
export function clearDealsCache() {
  mockDealsCache = null;
}

export async function searchDestinations(params) {
  const {
    origin,
    departureDate,
    returnDate,
    budget,
    travelers,
    tripType,
    hotelStars,
    destination,
    flexibleDates,
    flexibleDays,
    noDates
  } = params;

  try {
    const response = await api.get('/search', {
      params: {
        origin,
        departureDate: noDates ? undefined : departureDate,
        returnDate: noDates ? undefined : returnDate,
        budget,
        travelers,
        tripType,
        hotelStars,
        destination: destination || undefined,
        flexibleDates: flexibleDates ? 'true' : 'false',
        flexibleDays: flexibleDays || '0',
        noDates: noDates ? 'true' : 'false'
      }
    });
    return response.data;
  } catch (error) {
    // Modo demo: retornar datos mock cuando no hay backend
    console.log('Using mock search data (demo mode)');
    const destinations = generateMockSearchResults(params);
    return { destinations, cruises: [] };
  }
}

export async function getDestinationDetails(code, params) {
  const response = await api.get(`/destination/${code}`, { params });
  return response.data;
}

// Cache para deals reales de la API
let realDealsCache = null;
let realDealsCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export async function getDeals(filters = {}) {
  const now = Date.now();

  // Usar cache si es válido
  if (realDealsCache && realDealsCacheTime && (now - realDealsCacheTime) < CACHE_DURATION) {
    console.log('Using cached deals data');
    return realDealsCache;
  }

  try {
    // Intentar obtener deals reales del endpoint agregador
    console.log('Fetching real deals from aggregator API...');
    const response = await fetch('/api/deals');

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.deals && data.deals.length > 0) {
        console.log(`Loaded ${data.deals.length} real deals from aggregator`);
        realDealsCache = { deals: data.deals, stats: data.stats };
        realDealsCacheTime = now;
        return realDealsCache;
      }
    }
  } catch (error) {
    console.log('Aggregator API error:', error.message);
  }

  // Fallback: intentar Travelpayouts
  try {
    console.log('Trying Travelpayouts as fallback...');
    const { getFormattedDeals } = await import('./travelpayoutsService');
    const result = await getFormattedDeals('USD');

    if (result.deals && result.deals.length > 0) {
      console.log(`Loaded ${result.deals.length} deals from Travelpayouts`);
      realDealsCache = result;
      realDealsCacheTime = now;
      return result;
    }
  } catch (error) {
    console.log('Travelpayouts error:', error.message);
  }

  // Último fallback: datos mock
  console.log('Using mock data as last fallback');
  if (!mockDealsCache) {
    mockDealsCache = generateMockDeals();
  }

  const deals = mockDealsCache;
  const stats = {
    total: deals.length,
    flights: deals.filter(d => d.type === 'flight').length,
    cruises: deals.filter(d => d.type === 'cruise').length,
    hotels: deals.filter(d => d.type === 'hotel').length,
    avgDiscount: Math.round(deals.reduce((acc, d) => acc + d.discountPercent, 0) / deals.length)
  };

  return { deals, stats };
}

// Limpiar cache de deals reales
export function clearRealDealsCache() {
  realDealsCache = null;
  realDealsCacheTime = null;
}

export default api;

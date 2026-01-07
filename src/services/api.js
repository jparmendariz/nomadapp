import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

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

  // URLs de booking por tipo
  const bookingUrls = {
    flight: 'https://www.skyscanner.com/transport/flights/',
    hotel: 'https://www.booking.com/searchresults.html?ss='
  };

  const deals = [];
  const now = new Date();

  for (let i = 0; i < 40; i++) {
    const dest = destinations[Math.floor(Math.random() * destinations.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const basePrice = 200 + Math.floor(Math.random() * 800);
    const discount = 15 + Math.floor(Math.random() * 50);
    const originalPrice = Math.round(basePrice / (1 - discount / 100));
    const nights = 3 + Math.floor(Math.random() * 10);

    // Travel dates: random date in next 6 months
    const travelDate = new Date(now);
    travelDate.setDate(travelDate.getDate() + Math.floor(Math.random() * 180));
    const returnDate = new Date(travelDate);
    returnDate.setDate(returnDate.getDate() + nights);

    // Created at: random time in last 24 hours
    const createdAt = new Date(now);
    createdAt.setMinutes(createdAt.getMinutes() - Math.floor(Math.random() * 1440));

    // Seleccionar cruise line si es crucero
    const cruiseLine = type === 'cruise' ? cruiseLines[Math.floor(Math.random() * cruiseLines.length)] : null;

    // Generar URL de booking según el tipo
    let dealUrl;
    if (type === 'cruise' && cruiseLine) {
      dealUrl = cruiseLine.url;
    } else if (type === 'flight') {
      dealUrl = `${bookingUrls.flight}${origin.toLowerCase().replace(/ /g, '-')}/${dest.name.toLowerCase()}`;
    } else {
      dealUrl = `${bookingUrls.hotel}${encodeURIComponent(dest.name)}`;
    }

    const deal = {
      id: `deal-${i + 1}`,
      type,
      destinationName: dest.name,
      location: dest.name,
      country: dest.country,
      region: dest.region,
      originName: origin,
      price: basePrice,
      originalPrice,
      discountPercent: discount,
      nights: type !== 'flight' ? nights : null,
      travelDatesStart: travelDate.toISOString().split('T')[0],
      travelDatesEnd: returnDate.toISOString().split('T')[0],
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
}

export async function getDestinationDetails(code, params) {
  const response = await api.get(`/destination/${code}`, { params });
  return response.data;
}

export async function getDeals(filters = {}) {
  try {
    const response = await api.get('/deals', { params: filters });
    return response.data;
  } catch (error) {
    // Modo demo: retornar datos mock cuando no hay backend
    console.log('Using mock deals data (demo mode)');

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
}

export async function getEvents(params = {}) {
  const response = await api.get('/events', { params });
  return response.data;
}

export default api;

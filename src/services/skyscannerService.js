/**
 * Skyscanner Flight Search Service
 *
 * Para usar esta API necesitas:
 * 1. Registrarte en https://developers.skyscanner.net/
 * 2. Obtener tu API Key
 * 3. Agregar VITE_SKYSCANNER_API_KEY a tu .env
 *
 * Documentación: https://developers.skyscanner.net/docs/intro
 */

const SKYSCANNER_API_KEY = import.meta.env.VITE_SKYSCANNER_API_KEY;
const SKYSCANNER_BASE_URL = 'https://partners.api.skyscanner.net/apiservices/v3';

// Tu ID de afiliado para los links de redirección
const AFFILIATE_ID = import.meta.env.VITE_SKYSCANNER_AFFILIATE_ID || 'nomadapp';

// Mapeo de códigos de aeropuerto mexicanos a códigos IATA
const AIRPORT_CODES = {
  'MEX': 'MEXA', // Ciudad de México (todos los aeropuertos)
  'GDL': 'GDLA',
  'MTY': 'MTYA',
  'CUN': 'CUNA',
  'TIJ': 'TIJA',
  'SJD': 'SJDA',
  'PVR': 'PVRA',
  'ACA': 'ACAA',
  'MID': 'MIDA',
  'OAX': 'OAXA',
  'VER': 'VERA',
  'BJX': 'BJXA',
  'CUL': 'CULA',
  'HMO': 'HMOA',
  'QRO': 'QROA'
};

/**
 * Verifica si la API está configurada
 */
export function isSkyscannerConfigured() {
  return !!SKYSCANNER_API_KEY;
}

/**
 * Crea una sesión de búsqueda de vuelos
 */
export async function createFlightSearch({
  origin,
  destination,
  departureDate,
  returnDate,
  adults = 1,
  cabinClass = 'CABIN_CLASS_ECONOMY'
}) {
  if (!isSkyscannerConfigured()) {
    console.warn('Skyscanner API no configurada, usando datos mock');
    return null;
  }

  const originCode = AIRPORT_CODES[origin] || origin;

  const requestBody = {
    query: {
      market: 'MX',
      locale: 'es-MX',
      currency: 'MXN',
      queryLegs: [
        {
          originPlaceId: { iata: originCode },
          destinationPlaceId: { entityId: destination }, // Para búsqueda "anywhere"
          date: {
            year: parseInt(departureDate.split('-')[0]),
            month: parseInt(departureDate.split('-')[1]),
            day: parseInt(departureDate.split('-')[2])
          }
        }
      ],
      adults,
      cabinClass
    }
  };

  // Si hay fecha de regreso, agregar leg de vuelta
  if (returnDate) {
    requestBody.query.queryLegs.push({
      originPlaceId: { entityId: destination },
      destinationPlaceId: { iata: originCode },
      date: {
        year: parseInt(returnDate.split('-')[0]),
        month: parseInt(returnDate.split('-')[1]),
        day: parseInt(returnDate.split('-')[2])
      }
    });
  }

  try {
    const response = await fetch(`${SKYSCANNER_BASE_URL}/flights/live/search/create`, {
      method: 'POST',
      headers: {
        'x-api-key': SKYSCANNER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Skyscanner API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en búsqueda de Skyscanner:', error);
    return null;
  }
}

/**
 * Obtiene precios indicativos (más rápido, datos cacheados)
 * Útil para mostrar "mejores precios" por mes/destino
 */
export async function getIndicativePrices({
  origin,
  destination = null, // null = "anywhere"
  month = null, // formato: '2024-03'
  year = null
}) {
  if (!isSkyscannerConfigured()) {
    return null;
  }

  const originCode = AIRPORT_CODES[origin] || origin;

  const requestBody = {
    query: {
      market: 'MX',
      locale: 'es-MX',
      currency: 'MXN',
      queryLegs: [
        {
          originPlace: { queryPlace: { iata: originCode } },
          destinationPlace: destination
            ? { queryPlace: { iata: destination } }
            : { anywhere: true },
          ...(month ? {
            fixedDate: {
              year: parseInt(month.split('-')[0]),
              month: parseInt(month.split('-')[1])
            }
          } : {
            anytime: true
          })
        }
      ]
    }
  };

  try {
    const response = await fetch(`${SKYSCANNER_BASE_URL}/flights/indicative/search`, {
      method: 'POST',
      headers: {
        'x-api-key': SKYSCANNER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Skyscanner Indicative API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error obteniendo precios indicativos:', error);
    return null;
  }
}

/**
 * Genera un link de afiliado para Skyscanner
 */
export function generateAffiliateLink({
  origin,
  destination,
  departureDate,
  returnDate = null,
  adults = 1
}) {
  const baseUrl = 'https://www.skyscanner.com.mx/transport/flights';
  const depDate = departureDate.replace(/-/g, '');
  const retDate = returnDate ? returnDate.replace(/-/g, '') : '';

  // Formato: /origen/destino/fecha-ida/fecha-vuelta
  let url = `${baseUrl}/${origin.toLowerCase()}/${destination.toLowerCase()}/${depDate}`;

  if (retDate) {
    url += `/${retDate}`;
  }

  // Agregar parámetros de afiliado
  url += `/?adultsv2=${adults}&associateid=${AFFILIATE_ID}`;

  return url;
}

/**
 * Parsea la respuesta de Skyscanner a nuestro formato interno
 */
export function parseSkyscannerResults(response, searchParams) {
  if (!response || !response.content) {
    return [];
  }

  const { results, sortingOptions } = response.content;
  const { itineraries, legs, places, carriers } = results;

  if (!itineraries || Object.keys(itineraries).length === 0) {
    return [];
  }

  // Obtener los itinerarios ordenados por precio
  const bestItineraries = sortingOptions?.best || [];

  return bestItineraries.slice(0, 20).map(itineraryId => {
    const itinerary = itineraries[itineraryId];
    if (!itinerary) return null;

    const price = itinerary.pricingOptions?.[0]?.price?.amount;
    const priceFormatted = price ? Math.round(price / 100) : null; // Convertir de centavos

    const outboundLeg = legs[itinerary.legIds?.[0]];
    const returnLeg = itinerary.legIds?.[1] ? legs[itinerary.legIds[1]] : null;

    const originPlace = places[outboundLeg?.originPlaceId];
    const destPlace = places[outboundLeg?.destinationPlaceId];
    const carrier = carriers[outboundLeg?.operatingCarrierIds?.[0]];

    return {
      id: itineraryId,
      price: priceFormatted,
      currency: 'MXN',
      origin: {
        code: originPlace?.iata,
        name: originPlace?.name,
        city: originPlace?.cityName
      },
      destination: {
        code: destPlace?.iata,
        name: destPlace?.name,
        city: destPlace?.cityName,
        country: destPlace?.countryName
      },
      outbound: {
        departure: outboundLeg?.departureDateTime,
        arrival: outboundLeg?.arrivalDateTime,
        duration: outboundLeg?.durationInMinutes,
        stops: outboundLeg?.stopCount || 0,
        airline: carrier?.name,
        airlineLogo: carrier?.imageUrl
      },
      return: returnLeg ? {
        departure: returnLeg.departureDateTime,
        arrival: returnLeg.arrivalDateTime,
        duration: returnLeg.durationInMinutes,
        stops: returnLeg.stopCount || 0
      } : null,
      deepLink: itinerary.pricingOptions?.[0]?.items?.[0]?.deepLink,
      affiliateLink: generateAffiliateLink({
        origin: searchParams.origin,
        destination: destPlace?.iata || searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate,
        adults: searchParams.adults
      })
    };
  }).filter(Boolean);
}

export default {
  isSkyscannerConfigured,
  createFlightSearch,
  getIndicativePrices,
  generateAffiliateLink,
  parseSkyscannerResults
};

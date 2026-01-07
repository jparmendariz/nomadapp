/**
 * Newsletter Parser for Nomada
 * Extracts flight, hotel, and cruise deals from email newsletters
 */

import { JSDOM } from 'jsdom';

// Airport/City codes mapping
const CITY_CODES = {
  // Mexico
  'ciudad de mexico': 'MEX', 'cdmx': 'MEX', 'mexico city': 'MEX', 'df': 'MEX',
  'guadalajara': 'GDL', 'monterrey': 'MTY', 'tijuana': 'TIJ',
  'cancun': 'CUN', 'cancún': 'CUN', 'los cabos': 'SJD', 'puerto vallarta': 'PVR',
  'merida': 'MID', 'mérida': 'MID', 'oaxaca': 'OAX', 'acapulco': 'ACA',

  // USA
  'miami': 'MIA', 'los angeles': 'LAX', 'new york': 'JFK', 'nueva york': 'JFK',
  'las vegas': 'LAS', 'orlando': 'MCO', 'houston': 'IAH', 'dallas': 'DFW',
  'san francisco': 'SFO', 'chicago': 'ORD', 'denver': 'DEN', 'atlanta': 'ATL',
  'boston': 'BOS', 'seattle': 'SEA', 'phoenix': 'PHX', 'san diego': 'SAN',

  // Europe
  'madrid': 'MAD', 'barcelona': 'BCN', 'paris': 'CDG', 'parís': 'CDG',
  'london': 'LHR', 'londres': 'LHR', 'rome': 'FCO', 'roma': 'FCO',
  'amsterdam': 'AMS', 'frankfurt': 'FRA', 'lisbon': 'LIS', 'lisboa': 'LIS',

  // South America
  'bogota': 'BOG', 'bogotá': 'BOG', 'lima': 'LIM', 'santiago': 'SCL',
  'buenos aires': 'EZE', 'sao paulo': 'GRU', 'são paulo': 'GRU',
  'medellin': 'MDE', 'medellín': 'MDE', 'cartagena': 'CTG',

  // Caribbean
  'havana': 'HAV', 'habana': 'HAV', 'punta cana': 'PUJ', 'san juan': 'SJU',
  'aruba': 'AUA', 'nassau': 'NAS', 'jamaica': 'MBJ', 'kingston': 'KIN'
};

const CITY_NAMES = {
  'MEX': 'Ciudad de México', 'GDL': 'Guadalajara', 'MTY': 'Monterrey',
  'TIJ': 'Tijuana', 'CUN': 'Cancún', 'SJD': 'Los Cabos', 'PVR': 'Puerto Vallarta',
  'MIA': 'Miami', 'LAX': 'Los Angeles', 'JFK': 'New York', 'LAS': 'Las Vegas',
  'MAD': 'Madrid', 'BCN': 'Barcelona', 'CDG': 'París', 'LHR': 'Londres',
  'BOG': 'Bogotá', 'LIM': 'Lima', 'SCL': 'Santiago', 'HAV': 'Havana'
};

/**
 * Main parser - routes to specific parser based on sender
 */
export function parseNewsletter(email) {
  const { sender, subject, text, html } = email;

  const deals = [];

  try {
    // Try HTML parsing first (more structured)
    if (html) {
      const htmlDeals = parseHtmlContent(html, sender, subject);
      deals.push(...htmlDeals);
    }

    // Also try text parsing for additional deals
    if (text) {
      const textDeals = parseTextContent(text, sender, subject);
      // Only add text deals that aren't duplicates
      for (const deal of textDeals) {
        const isDuplicate = deals.some(d =>
          d.originCode === deal.originCode &&
          d.destinationCode === deal.destinationCode &&
          Math.abs(d.price - deal.price) < 10
        );
        if (!isDuplicate) {
          deals.push(deal);
        }
      }
    }
  } catch (err) {
    console.error('Error parsing newsletter:', err);
  }

  // Add metadata to all deals
  return deals.map(deal => ({
    ...deal,
    source: sender.name,
    sourceType: sender.type,
    emailSubject: subject,
    parsedAt: new Date().toISOString()
  }));
}

/**
 * Parse HTML content from newsletter
 */
function parseHtmlContent(html, sender, subject) {
  const deals = [];

  try {
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Extract all links with prices
    const links = doc.querySelectorAll('a[href]');

    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const text = link.textContent || '';
      const parentText = link.parentElement?.textContent || '';

      // Look for price patterns
      const priceMatch = parentText.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '')) : null;

      if (!price || price < 20 || price > 10000) continue;

      // Try to extract route from text
      const route = extractRoute(text + ' ' + parentText);

      if (route) {
        // Look for discount percentage
        const discountMatch = parentText.match(/(\d+)\s*%\s*(off|descuento|menos)/i);
        const discount = discountMatch ? parseInt(discountMatch[1]) : null;

        // Look for dates
        const dates = extractDates(parentText);

        deals.push({
          type: 'flight',
          originCode: route.origin,
          originName: CITY_NAMES[route.origin] || route.origin,
          destinationCode: route.destination,
          destinationName: CITY_NAMES[route.destination] || route.destination,
          price: price,
          currency: 'USD',
          discountPercent: discount,
          originalPrice: discount ? Math.round(price / (1 - discount / 100)) : null,
          isRoundTrip: route.isRoundTrip,
          travelDatesStart: dates.start,
          travelDatesEnd: dates.end,
          dealUrl: cleanAffiliateUrl(href),
          rawText: parentText.substring(0, 200)
        });
      }
    }

    // Also look for structured deal blocks
    const dealBlocks = doc.querySelectorAll('[class*="deal"], [class*="offer"], [class*="promo"], [class*="flight"]');

    for (const block of dealBlocks) {
      const blockText = block.textContent || '';
      const blockLink = block.querySelector('a[href]')?.getAttribute('href') || '';

      const deal = extractDealFromText(blockText, sender);
      if (deal && blockLink) {
        deal.dealUrl = cleanAffiliateUrl(blockLink);
        deals.push(deal);
      }
    }

  } catch (err) {
    console.error('HTML parsing error:', err);
  }

  return deals;
}

/**
 * Parse plain text content from newsletter
 */
function parseTextContent(text, sender, subject) {
  const deals = [];

  // Split into lines and look for deal patterns
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const context = lines.slice(Math.max(0, i - 2), i + 3).join(' ');

    const deal = extractDealFromText(context, sender);
    if (deal) {
      deals.push(deal);
    }
  }

  return deals;
}

/**
 * Extract deal information from a text block
 */
function extractDealFromText(text, sender) {
  // Price pattern: $XXX or $X,XXX
  const priceMatch = text.match(/\$\s*([\d,]+(?:\.\d{2})?)/);
  if (!priceMatch) return null;

  const price = parseFloat(priceMatch[1].replace(',', ''));
  if (price < 20 || price > 10000) return null;

  // Route extraction
  const route = extractRoute(text);
  if (!route) return null;

  // Discount
  const discountMatch = text.match(/(\d+)\s*%\s*(off|descuento|menos|ahorro)/i);
  const discount = discountMatch ? parseInt(discountMatch[1]) : null;

  // Dates
  const dates = extractDates(text);

  // URL
  const urlMatch = text.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/i);

  return {
    type: detectDealType(text, sender),
    originCode: route.origin,
    originName: CITY_NAMES[route.origin] || route.origin,
    destinationCode: route.destination,
    destinationName: CITY_NAMES[route.destination] || route.destination,
    price: price,
    currency: 'USD',
    discountPercent: discount,
    originalPrice: discount ? Math.round(price / (1 - discount / 100)) : null,
    isRoundTrip: route.isRoundTrip,
    travelDatesStart: dates.start,
    travelDatesEnd: dates.end,
    dealUrl: urlMatch ? cleanAffiliateUrl(urlMatch[0]) : null,
    rawText: text.substring(0, 200)
  };
}

/**
 * Extract origin and destination from text
 */
function extractRoute(text) {
  const lowerText = text.toLowerCase();

  // Pattern: "from X to Y" or "X to Y" or "X - Y" or "X → Y"
  const routePatterns = [
    /(?:from|desde|de)\s+([a-záéíóúñ\s]+?)\s+(?:to|a|hacia)\s+([a-záéíóúñ\s]+?)(?:\s|$|,|\.|!)/i,
    /([a-záéíóúñ\s]+?)\s+(?:to|a|→|->|-)\s+([a-záéíóúñ\s]+?)(?:\s|$|,|\.|!)/i,
    /([A-Z]{3})\s*[-→>]\s*([A-Z]{3})/  // Airport codes: MEX-CUN
  ];

  for (const pattern of routePatterns) {
    const match = text.match(pattern);
    if (match) {
      const origin = resolveCity(match[1].trim());
      const destination = resolveCity(match[2].trim());

      if (origin && destination && origin !== destination) {
        // Check if roundtrip mentioned
        const isRoundTrip = /round\s*trip|ida\s*y\s*vuelta|viaje\s*redondo|r\/t/i.test(text);

        return { origin, destination, isRoundTrip };
      }
    }
  }

  return null;
}

/**
 * Resolve city name to airport code
 */
function resolveCity(cityText) {
  const lower = cityText.toLowerCase().trim();

  // Direct code match (3 letters uppercase)
  if (/^[A-Z]{3}$/.test(cityText.trim())) {
    return cityText.trim();
  }

  // Look up in mapping
  return CITY_CODES[lower] || null;
}

/**
 * Extract dates from text
 */
function extractDates(text) {
  const dates = { start: null, end: null };

  // Pattern: various date formats
  const datePatterns = [
    // "Jan 15 - Feb 20" or "15 Jan - 20 Feb"
    /(\w+\s+\d{1,2}|\d{1,2}\s+\w+)\s*[-–]\s*(\w+\s+\d{1,2}|\d{1,2}\s+\w+)/i,
    // "January 15, 2025"
    /(\w+\s+\d{1,2},?\s*\d{4})/gi,
    // "2025-01-15"
    /(\d{4}-\d{2}-\d{2})/g,
    // "15/01/2025" or "01/15/2025"
    /(\d{1,2}\/\d{1,2}\/\d{4})/g
  ];

  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      try {
        const parsed = new Date(matches[0]);
        if (!isNaN(parsed.getTime()) && parsed > new Date()) {
          if (!dates.start) {
            dates.start = parsed.toISOString().split('T')[0];
          } else if (!dates.end) {
            dates.end = parsed.toISOString().split('T')[0];
          }
        }
      } catch (e) {
        // Invalid date, skip
      }
    }
  }

  return dates;
}

/**
 * Detect deal type from content
 */
function detectDealType(text, sender) {
  const lowerText = text.toLowerCase();

  if (sender.type === 'cruise' || /cruise|crucero|navegación/i.test(lowerText)) {
    return 'cruise';
  }

  if (sender.type === 'hotel' || /hotel|resort|accommodation|hospedaje|habitación/i.test(lowerText)) {
    return 'hotel';
  }

  return 'flight';
}

/**
 * Clean and validate affiliate URLs
 */
function cleanAffiliateUrl(url) {
  if (!url) return null;

  try {
    // Remove tracking parameters but keep affiliate IDs
    const parsed = new URL(url);

    // Keep the URL as-is since it likely contains affiliate tracking
    return url;
  } catch (e) {
    return url;
  }
}

/**
 * Validate a parsed deal
 */
export function validateDeal(deal) {
  const errors = [];

  if (!deal.price || deal.price <= 0) {
    errors.push('Invalid price');
  }

  if (!deal.destinationCode) {
    errors.push('Missing destination');
  }

  if (deal.discountPercent && (deal.discountPercent < 0 || deal.discountPercent > 90)) {
    errors.push('Invalid discount percentage');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  parseNewsletter,
  validateDeal,
  CITY_CODES,
  CITY_NAMES
};

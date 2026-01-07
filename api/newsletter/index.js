/**
 * Newsletter & Deals API for Nomada
 * Fetches emails, parses deals, caches hotel data, and stores in Supabase
 *
 * Endpoints:
 * GET /api/newsletter - Get all deals (newsletters + cached hotels)
 * POST /api/newsletter - Trigger email fetch, parsing, and hotel cache update (for cron)
 */

import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { fetchUnreadNewsletters } from './imap.js';
import { parseNewsletter, validateDeal } from './parser.js';

/**
 * Generate a valid UUID v5-like from a string
 * Creates a deterministic UUID based on the input string
 */
function stringToUUID(str) {
  const hash = createHash('sha256').update(str).digest('hex');
  // Format as UUID: 8-4-4-4-12
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const CRON_SECRET = process.env.CRON_SECRET;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'booking-com.p.rapidapi.com';

// Popular hotel destinations for caching
const HOTEL_DESTINATIONS = [
  { code: 'CUN', name: 'Cancún', dest_id: '-1655011', dest_type: 'city' },
  { code: 'MIA', name: 'Miami', dest_id: '20023181', dest_type: 'city' },
  { code: 'MAD', name: 'Madrid', dest_id: '-390625', dest_type: 'city' },
  { code: 'BCN', name: 'Barcelona', dest_id: '-372490', dest_type: 'city' },
  { code: 'NYC', name: 'New York', dest_id: '20088325', dest_type: 'city' }
];

// Initialize Supabase client
function getSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Supabase credentials not configured');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return await getDeals(req, res);
    }

    if (req.method === 'POST') {
      return await processNewsletters(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Newsletter API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * GET - Fetch deals from database
 */
async function getDeals(req, res) {
  const {
    type,        // flight, hotel, cruise
    origin,      // origin airport code
    destination, // destination airport code
    minPrice,
    maxPrice,
    limit = 50,
    offset = 0
  } = req.query;

  const supabase = getSupabase();

  let query = supabase
    .from('newsletter_deals')
    .select('*')
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('created_at', { ascending: false });

  // Apply filters
  if (type) {
    query = query.eq('type', type);
  }

  if (origin) {
    query = query.eq('origin_code', origin.toUpperCase());
  }

  if (destination) {
    query = query.eq('destination_code', destination.toUpperCase());
  }

  if (minPrice) {
    query = query.gte('price', parseFloat(minPrice));
  }

  if (maxPrice) {
    query = query.lte('price', parseFloat(maxPrice));
  }

  // Pagination
  query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  const { data: deals, error, count } = await query;

  if (error) {
    console.error('Supabase query error:', error);
    return res.status(500).json({ error: 'Database error' });
  }

  // Calculate stats
  const stats = {
    total: deals.length,
    flights: deals.filter(d => d.type === 'flight').length,
    hotels: deals.filter(d => d.type === 'hotel').length,
    cruises: deals.filter(d => d.type === 'cruise').length,
    avgDiscount: deals.length > 0
      ? Math.round(deals.reduce((acc, d) => acc + (d.discount_percent || 0), 0) / deals.length)
      : 0
  };

  // Transform to camelCase for frontend
  const formattedDeals = deals.map(deal => ({
    id: deal.id,
    type: deal.type,
    source: deal.source,
    sourceType: deal.source_type,
    originCode: deal.origin_code,
    originName: deal.origin_name,
    destinationCode: deal.destination_code,
    destinationName: deal.destination_name,
    price: parseFloat(deal.price),
    originalPrice: deal.original_price ? parseFloat(deal.original_price) : null,
    discountPercent: deal.discount_percent,
    currency: deal.currency,
    isRoundTrip: deal.is_round_trip,
    travelDatesStart: deal.travel_dates_start,
    travelDatesEnd: deal.travel_dates_end,
    hotelName: deal.hotel_name,
    nights: deal.nights,
    stars: deal.stars,
    cruiseLine: deal.cruise_line,
    destinations: deal.destinations,
    dealUrl: deal.deal_url,
    isVerified: deal.is_verified,
    viewCount: deal.view_count,
    clickCount: deal.click_count,
    expiresAt: deal.expires_at,
    createdAt: deal.created_at,
    isRealData: true
  }));

  return res.status(200).json({
    success: true,
    deals: formattedDeals,
    stats
  });
}

/**
 * Cache hotels from RapidAPI (Booking.com)
 */
async function cacheHotelsFromBooking(supabase) {
  if (!RAPIDAPI_KEY) {
    console.log('RapidAPI key not configured, skipping hotel cache');
    return { cached: 0, errors: [] };
  }

  const results = { cached: 0, errors: [] };
  const BOOKING_AFFILIATE_ID = process.env.VITE_BOOKING_AFFILIATE_ID || '2718406';

  // Get dates for next month
  const checkinDate = new Date();
  checkinDate.setMonth(checkinDate.getMonth() + 1);
  checkinDate.setDate(15);
  const checkin = checkinDate.toISOString().split('T')[0];

  const checkoutDate = new Date(checkinDate);
  checkoutDate.setDate(checkoutDate.getDate() + 3);
  const checkout = checkoutDate.toISOString().split('T')[0];

  for (const dest of HOTEL_DESTINATIONS) {
    try {
      const searchParams = new URLSearchParams({
        dest_id: dest.dest_id,
        dest_type: dest.dest_type,
        checkin_date: checkin,
        checkout_date: checkout,
        adults_number: '2',
        room_number: '1',
        order_by: 'popularity',
        filter_by_currency: 'USD',
        locale: 'es',
        units: 'metric',
        page_number: '0'
      });

      const response = await fetch(
        `https://${RAPIDAPI_HOST}/v1/hotels/search?${searchParams}`,
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST
          }
        }
      );

      if (!response.ok) {
        results.errors.push({ destination: dest.name, error: `HTTP ${response.status}` });
        continue;
      }

      const data = await response.json();
      const hotels = (data.result || []).slice(0, 5); // Top 5 hotels per destination

      for (const hotel of hotels) {
        const price = hotel.min_total_price || hotel.price_breakdown?.gross_price || 0;
        const nights = 3;
        const pricePerNight = nights > 0 ? Math.round(price / nights) : price;

        // Calculate estimated discount (vs average $150/night)
        const avgPricePerNight = 150;
        const savings = avgPricePerNight - pricePerNight;
        const discountPercent = savings > 0 ? Math.min(Math.round((savings / avgPricePerNight) * 100), 50) : 0;

        // Upsert hotel deal (update if exists, insert if not)
        // Generate a valid UUID from the hotel identifier
        const hotelUUID = stringToUUID(`booking-${dest.code}-${hotel.hotel_id}`);
        const { error } = await supabase
          .from('newsletter_deals')
          .upsert({
            id: hotelUUID,
            type: 'hotel',
            source: 'Booking.com',
            source_type: 'hotel',
            destination_code: dest.code,
            destination_name: dest.name,
            price: Math.round(price),
            original_price: Math.round(avgPricePerNight * nights),
            discount_percent: discountPercent,
            currency: 'USD',
            hotel_name: hotel.hotel_name || 'Hotel',
            nights: nights,
            stars: hotel.class || 0,
            travel_dates_start: checkin,
            travel_dates_end: checkout,
            deal_url: `https://www.booking.com/hotel/${hotel.hotel_id}.html?aid=${BOOKING_AFFILIATE_ID}&checkin=${checkin}&checkout=${checkout}`,
            is_active: true,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          }, { onConflict: 'id' });

        if (!error) {
          results.cached++;
        } else {
          results.errors.push({ hotel: hotel.hotel_name, error: error.message });
        }
      }

      // Small delay between API calls
      await new Promise(r => setTimeout(r, 500));

    } catch (error) {
      results.errors.push({ destination: dest.name, error: error.message });
    }
  }

  console.log(`Cached ${results.cached} hotels from Booking.com`);
  return results;
}

/**
 * POST - Process newsletters and cache hotels (triggered by cron)
 */
async function processNewsletters(req, res) {
  // Verify cron secret for security
  const authHeader = req.headers.authorization;
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = getSupabase();
  const results = {
    emailsProcessed: 0,
    dealsFound: 0,
    dealsStored: 0,
    hotelsCached: 0,
    errors: []
  };

  try {
    // 1. Cache hotels from Booking.com (uses ~5 API calls)
    console.log('Caching hotels from Booking.com...');
    const hotelResults = await cacheHotelsFromBooking(supabase);
    results.hotelsCached = hotelResults.cached;
    results.errors.push(...hotelResults.errors);

    // 2. Fetch and process newsletters
    console.log('Fetching unread newsletters...');
    const emails = await fetchUnreadNewsletters(20);
    results.emailsProcessed = emails.length;

    if (emails.length === 0 && results.hotelsCached > 0) {
      return res.status(200).json({
        success: true,
        message: `Cached ${results.hotelsCached} hotels, no new newsletters`,
        results
      });
    }

    if (emails.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No new newsletters to process',
        results
      });
    }

    console.log(`Found ${emails.length} newsletters to process`);

    // Process each email
    for (const email of emails) {
      try {
        // Check if already processed
        const { data: existing } = await supabase
          .from('processed_emails')
          .select('id')
          .eq('message_id', email.messageId)
          .single();

        if (existing) {
          console.log(`Skipping already processed email: ${email.messageId}`);
          continue;
        }

        // Parse the newsletter
        const deals = parseNewsletter(email);
        results.dealsFound += deals.length;

        console.log(`Parsed ${deals.length} deals from ${email.sender.name}`);

        // Store valid deals
        for (const deal of deals) {
          const validation = validateDeal(deal);

          if (!validation.isValid) {
            results.errors.push({
              email: email.subject,
              deal: deal.destinationName,
              errors: validation.errors
            });
            continue;
          }

          // Calculate expiration (7 days from now if not specified)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          // Insert into database
          const { error: insertError } = await supabase
            .from('newsletter_deals')
            .insert({
              type: deal.type,
              source: deal.source,
              source_type: deal.sourceType,
              origin_code: deal.originCode,
              origin_name: deal.originName,
              destination_code: deal.destinationCode,
              destination_name: deal.destinationName,
              price: deal.price,
              original_price: deal.originalPrice,
              discount_percent: deal.discountPercent,
              currency: deal.currency || 'USD',
              is_round_trip: deal.isRoundTrip,
              travel_dates_start: deal.travelDatesStart,
              travel_dates_end: deal.travelDatesEnd,
              hotel_name: deal.hotelName,
              nights: deal.nights,
              stars: deal.stars,
              cruise_line: deal.cruiseLine,
              destinations: deal.destinations,
              deal_url: deal.dealUrl,
              email_subject: deal.emailSubject,
              email_message_id: email.messageId,
              raw_text: deal.rawText,
              expires_at: expiresAt.toISOString()
            });

          if (insertError) {
            console.error('Error inserting deal:', insertError);
            results.errors.push({
              email: email.subject,
              deal: deal.destinationName,
              error: insertError.message
            });
          } else {
            results.dealsStored++;
          }
        }

        // Mark email as processed
        await supabase.from('processed_emails').insert({
          message_id: email.messageId,
          from_address: email.from,
          subject: email.subject,
          deals_extracted: deals.length
        });

        // Update source stats
        await supabase
          .from('newsletter_sources')
          .update({
            deals_count: supabase.raw('deals_count + ?', [deals.length]),
            last_email_at: new Date().toISOString()
          })
          .eq('name', email.sender.name);

      } catch (emailError) {
        console.error(`Error processing email ${email.subject}:`, emailError);
        results.errors.push({
          email: email.subject,
          error: emailError.message
        });
      }
    }

    // Clean up expired deals (older than 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    await supabase
      .from('newsletter_deals')
      .update({ is_active: false })
      .lt('expires_at', twoWeeksAgo.toISOString());

    return res.status(200).json({
      success: true,
      message: `Processed ${results.emailsProcessed} emails, stored ${results.dealsStored} deals`,
      results
    });

  } catch (error) {
    console.error('Newsletter processing error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      results
    });
  }
}

/**
 * Track deal click (called when user clicks "View Deal")
 */
export async function trackClick(req, res) {
  const { dealId } = req.query;

  if (!dealId) {
    return res.status(400).json({ error: 'Missing dealId' });
  }

  const supabase = getSupabase();

  // Increment click count
  await supabase.rpc('increment_deal_clicks', { deal_uuid: dealId });

  // Log click for analytics
  await supabase.from('deal_clicks').insert({
    deal_id: dealId,
    user_agent: req.headers['user-agent'],
    referer: req.headers.referer,
    ip_hash: hashIP(req.headers['x-forwarded-for'] || req.socket.remoteAddress)
  });

  return res.status(200).json({ success: true });
}

function hashIP(ip) {
  if (!ip) return null;
  // Simple hash for privacy
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);
}

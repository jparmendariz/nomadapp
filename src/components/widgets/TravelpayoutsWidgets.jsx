import { useEffect, useRef } from 'react';

const MARKER = '486713';

/**
 * Travelpayouts Search Form Widget (iframe version - more reliable)
 */
export function FlightSearchWidget({
  origin = 'MEX',
  destination = '',
  locale = 'es',
  currency = 'MXN'
}) {
  const iframeSrc = `https://tp.media/content?trs=267028&shmarker=${MARKER}&locale=${locale}&currency=${currency}&origin=${origin}&destination=${destination}&powered_by=false&one_way=false&only_direct=false&disable_header=false&show_logo=true&color_button=%234A5D23&color_icons=%234A5D23&dark=false&promo_id=4132&campaign_id=100`;

  return (
    <div className="w-full">
      <iframe
        src={iframeSrc}
        width="100%"
        height="250"
        frameBorder="0"
        scrolling="no"
        className="rounded-lg"
        title="Flight Search"
      />
    </div>
  );
}

/**
 * Travelpayouts Calendar Widget
 */
export function PriceCalendarWidget({
  origin = 'MEX',
  destination = 'CUN',
  currency = 'MXN',
  locale = 'es'
}) {
  const iframeSrc = `https://www.travelpayouts.com/widgets/calendar/iframe.html?marker=${MARKER}&origin=${origin}&destination=${destination}&currency=${currency}&locale=${locale}&one_way=false&only_direct=false&period_day_from=7&period_day_to=14&powered_by=false`;

  return (
    <div className="w-full">
      <iframe
        src={iframeSrc}
        width="100%"
        height="450"
        frameBorder="0"
        scrolling="no"
        className="rounded-lg"
        title="Price Calendar"
      />
    </div>
  );
}

/**
 * Travelpayouts Map Widget
 */
export function PriceMapWidget({
  origin = 'MEX',
  currency = 'MXN',
  locale = 'es'
}) {
  const iframeSrc = `https://tp.media/content?trs=267028&shmarker=${MARKER}&locale=${locale}&currency=${currency}&origin=${origin}&powered_by=false&one_way=false&only_direct=false&promo_id=4033&campaign_id=100`;

  return (
    <div className="w-full">
      <iframe
        src={iframeSrc}
        width="100%"
        height="520"
        frameBorder="0"
        scrolling="no"
        className="rounded-lg"
        title="Price Map"
      />
    </div>
  );
}

/**
 * Travelpayouts Popular Destinations Widget
 */
export function PopularDestinationsWidget({
  origin = 'MEX',
  currency = 'MXN',
  locale = 'es'
}) {
  const iframeSrc = `https://tp.media/content?trs=267028&shmarker=${MARKER}&locale=${locale}&currency=${currency}&origin=${origin}&powered_by=false&promo_id=4030&campaign_id=100`;

  return (
    <div className="w-full">
      <iframe
        src={iframeSrc}
        width="100%"
        height="400"
        frameBorder="0"
        scrolling="no"
        className="rounded-lg"
        title="Popular Destinations"
      />
    </div>
  );
}

/**
 * Travelpayouts Price Alert Widget
 */
export function PriceAlertWidget({
  origin = 'MEX',
  destination = 'CUN',
  locale = 'es'
}) {
  const iframeSrc = `https://www.travelpayouts.com/subscription_widget/iframe.html?marker=${MARKER}&origin=${origin}&destination=${destination}&locale=${locale}&powered_by=false`;

  return (
    <div className="w-full">
      <iframe
        src={iframeSrc}
        width="100%"
        height="220"
        frameBorder="0"
        scrolling="no"
        className="rounded-lg"
        title="Price Alerts"
      />
    </div>
  );
}

export default {
  FlightSearchWidget,
  PriceCalendarWidget,
  PopularDestinationsWidget,
  PriceMapWidget,
  PriceAlertWidget
};

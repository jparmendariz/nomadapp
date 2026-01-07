import { useEffect, useRef } from 'react';

const MARKER = '486713';

/**
 * Travelpayouts Search Form Widget
 * Allows users to search for flights with real-time data
 */
export function FlightSearchWidget({
  origin = 'MEX',
  destination = '',
  locale = 'es',
  currency = 'MXN'
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    // Create widget script
    const script = document.createElement('script');
    script.src = '//www.travelpayouts.com/widgets/aaff45fe2accde994dedd77279d00496.js?v=2510';
    script.async = true;
    script.charset = 'utf-8';

    // Widget configuration
    const config = {
      marker: MARKER,
      host: 'www.aviasales.com',
      locale: locale,
      currency: currency,
      origin: origin,
      destination: destination,
      one_way: false,
      powered_by: false
    };

    // Create container div with config
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'tp-search-widget';
    widgetDiv.dataset.config = JSON.stringify(config);

    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [origin, destination, locale, currency]);

  return (
    <div
      ref={containerRef}
      className="tp-search-widget-container w-full min-h-[200px]"
    />
  );
}

/**
 * Travelpayouts Calendar Widget
 * Shows cheapest prices by date
 */
export function PriceCalendarWidget({
  origin = 'MEX',
  destination = 'CUN',
  currency = 'MXN',
  locale = 'es'
}) {
  const containerRef = useRef(null);
  const widgetId = `calendar-${origin}-${destination}`;

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    // Calendar widget script
    const scriptUrl = `//www.travelpayouts.com/calendar_widget/iframe.js?marker=${MARKER}&origin=${origin}&destination=${destination}&currency=${currency}&searchUrl=www.aviasales.com&one_way=false&only_direct=false&locale=${locale}&period=year&range=7,14&powered_by=false`;

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.async = true;
    script.charset = 'utf-8';

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [origin, destination, currency, locale]);

  return (
    <div
      ref={containerRef}
      id={widgetId}
      className="tp-calendar-widget w-full min-h-[400px]"
    />
  );
}

/**
 * Travelpayouts Popular Destinations Widget
 * Shows popular routes with real prices
 */
export function PopularDestinationsWidget({
  origin = 'MEX',
  currency = 'MXN',
  locale = 'es'
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    // Popular destinations widget
    const script = document.createElement('script');
    script.async = true;
    script.charset = 'utf-8';
    script.src = `//www.travelpayouts.com/widgets/dfa7adccf8cfbed19152184a7db68b60.js?v=2459`;

    // Create the widget container
    const widgetDiv = document.createElement('div');
    widgetDiv.id = 'tp-popular-routes';
    widgetDiv.className = 'tp-popular-routes-widget';

    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);

    // Initialize widget after script loads
    script.onload = () => {
      if (window.defined_popularRoutes) {
        window.defined_popularRoutes({
          marker: MARKER,
          origin: origin,
          currency: currency,
          locale: locale,
          powered_by: false
        });
      }
    };

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [origin, currency, locale]);

  return (
    <div
      ref={containerRef}
      className="tp-popular-widget w-full min-h-[300px]"
    />
  );
}

/**
 * Travelpayouts Map Widget
 * Interactive map with flight prices
 */
export function PriceMapWidget({
  origin = 'MEX',
  currency = 'MXN',
  locale = 'es'
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.travelpayouts.com/widgets_v2/map?marker=${MARKER}&origin=${origin}&currency=${currency}&locale=${locale}&direct=false&one_way=false&period_day_from=7&period_day_to=14&powered_by=false`;
    iframe.width = '100%';
    iframe.height = '520';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    iframe.scrolling = 'no';

    containerRef.current.appendChild(iframe);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [origin, currency, locale]);

  return (
    <div
      ref={containerRef}
      className="tp-map-widget w-full min-h-[520px] rounded-lg overflow-hidden"
    />
  );
}

/**
 * Travelpayouts Subscription Widget
 * Price alerts for users
 */
export function PriceAlertWidget({
  origin = 'MEX',
  destination = 'CUN',
  locale = 'es'
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.travelpayouts.com/subscription_widget/iframe?marker=${MARKER}&origin=${origin}&destination=${destination}&locale=${locale}&powered_by=false`;
    iframe.width = '100%';
    iframe.height = '220';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    iframe.scrolling = 'no';

    containerRef.current.appendChild(iframe);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [origin, destination, locale]);

  return (
    <div
      ref={containerRef}
      className="tp-alert-widget w-full min-h-[220px] rounded-lg overflow-hidden"
    />
  );
}

export default {
  FlightSearchWidget,
  PriceCalendarWidget,
  PopularDestinationsWidget,
  PriceMapWidget,
  PriceAlertWidget
};

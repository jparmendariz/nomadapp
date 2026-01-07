import { useEffect, useRef, useState } from 'react';

const MARKER = '486713';

/**
 * Flight Search Widget - Uses embedded script approach
 * Since old iframe format is deprecated, we use the JS widget
 */
export function FlightSearchWidget({
  origin = 'MEX',
  destination = '',
  locale = 'es',
  currency = 'MXN'
}) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (containerRef.current && !loaded) {
      // Create iframe with embedded script for isolation
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '300px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';

      const host = 'hydra.aviasales.com';
      const scriptSrc = `https://www.travelpayouts.com/widgets/b7d7ac2b1f87d1a5dd7f85cdbc8a1ac3.js?v=2438&marker=${MARKER}&host=${host}&locale=${locale}&currency=${currency}&origin=${origin}${destination ? `&destination=${destination}` : ''}`;

      iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
          </style>
        </head>
        <body>
          <div id="widget"></div>
          <script src="${scriptSrc}" async></script>
        </body>
        </html>
      `;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
      setLoaded(true);
    }
  }, [origin, destination, locale, currency, loaded]);

  // Reset when params change
  useEffect(() => {
    setLoaded(false);
  }, [origin, destination]);

  return (
    <div ref={containerRef} className="w-full min-h-[300px]">
      <div className="animate-pulse bg-stone-200 rounded-lg h-[300px] flex items-center justify-center">
        <span className="text-stone-400">Cargando búsqueda...</span>
      </div>
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
 * Travelpayouts Map Widget - Using iframe with embedded script
 */
export function PriceMapWidget({
  origin = 'MEX',
  currency = 'MXN',
  locale = 'es'
}) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (containerRef.current && !loaded) {
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '520px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';

      const host = 'hydra.aviasales.com';
      // Map widget script
      const scriptSrc = `https://www.travelpayouts.com/widgets/map/map.js?marker=${MARKER}&host=${host}&locale=${locale}&currency=${currency}&origin=${origin}`;

      iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 500px; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script src="${scriptSrc}" async></script>
        </body>
        </html>
      `;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
      setLoaded(true);
    }
  }, [origin, locale, currency, loaded]);

  useEffect(() => {
    setLoaded(false);
  }, [origin]);

  return (
    <div ref={containerRef} className="w-full min-h-[520px]">
      <div className="animate-pulse bg-stone-200 rounded-lg h-[520px] flex items-center justify-center">
        <span className="text-stone-400">Cargando mapa...</span>
      </div>
    </div>
  );
}

/**
 * Travelpayouts Popular Destinations Widget - Using weedle widget
 */
export function PopularDestinationsWidget({
  origin = 'MEX',
  currency = 'MXN',
  locale = 'es'
}) {
  const containerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  // City names for display
  const originNames = {
    'MEX': 'Ciudad de México',
    'GDL': 'Guadalajara',
    'MTY': 'Monterrey',
    'CUN': 'Cancún',
    'TIJ': 'Tijuana',
    'SJD': 'Los Cabos',
    'PVR': 'Puerto Vallarta'
  };

  useEffect(() => {
    if (containerRef.current && !loaded) {
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '400px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';

      const host = 'hydra.aviasales.com';
      const originName = originNames[origin] || origin;
      // Popular routes widget (weedle)
      const scriptSrc = `https://www.travelpayouts.com/weedle/widget.js?marker=${MARKER}&host=${host}&locale=${locale}&currency=${currency}&origin=${origin}&origin_name=${encodeURIComponent(originName)}`;

      iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 8px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
          </style>
        </head>
        <body>
          <div id="widget"></div>
          <script src="${scriptSrc}" async charset="UTF-8"></script>
        </body>
        </html>
      `;

      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(iframe);
      setLoaded(true);
    }
  }, [origin, locale, currency, loaded]);

  useEffect(() => {
    setLoaded(false);
  }, [origin]);

  return (
    <div ref={containerRef} className="w-full min-h-[400px]">
      <div className="animate-pulse bg-stone-200 rounded-lg h-[400px] flex items-center justify-center">
        <span className="text-stone-400">Cargando destinos...</span>
      </div>
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

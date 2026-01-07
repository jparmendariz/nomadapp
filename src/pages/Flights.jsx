import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  FlightSearchWidget,
  PriceCalendarWidget,
  PriceMapWidget,
  PopularDestinationsWidget
} from '../components/widgets/TravelpayoutsWidgets';

// Mexican airports
const MEXICAN_AIRPORTS = [
  { code: 'MEX', name: 'Ciudad de México' },
  { code: 'GDL', name: 'Guadalajara' },
  { code: 'MTY', name: 'Monterrey' },
  { code: 'CUN', name: 'Cancún' },
  { code: 'TIJ', name: 'Tijuana' },
  { code: 'SJD', name: 'Los Cabos' },
  { code: 'PVR', name: 'Puerto Vallarta' }
];

// Popular destinations
const POPULAR_DESTINATIONS = [
  { code: 'CUN', name: 'Cancún' },
  { code: 'MIA', name: 'Miami' },
  { code: 'LAX', name: 'Los Angeles' },
  { code: 'MAD', name: 'Madrid' },
  { code: 'JFK', name: 'Nueva York' },
  { code: 'BCN', name: 'Barcelona' }
];

export default function Flights() {
  const { t, language } = useLanguage();
  const [origin, setOrigin] = useState('MEX');
  const [destination, setDestination] = useState('CUN');
  const [activeTab, setActiveTab] = useState('search');

  const currency = 'MXN';
  const locale = language === 'es' ? 'es' : 'en';

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header */}
      <div className="bg-olive-600 text-white px-4 py-6">
        <h1 className="text-2xl font-bold mb-2">
          {language === 'es' ? 'Buscar Vuelos' : 'Search Flights'}
        </h1>
        <p className="text-olive-100 text-sm">
          {language === 'es'
            ? 'Precios reales de más de 700 aerolíneas'
            : 'Real prices from 700+ airlines'}
        </p>
      </div>

      {/* Origin/Destination Selectors */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-xs text-stone-500 mb-1">
              {language === 'es' ? 'Origen' : 'From'}
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
            >
              {MEXICAN_AIRPORTS.map((airport) => (
                <option key={airport.code} value={airport.code}>
                  {airport.name} ({airport.code})
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-stone-500 mb-1">
              {language === 'es' ? 'Destino' : 'To'}
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
            >
              <option value="">
                {language === 'es' ? 'Cualquier destino' : 'Any destination'}
              </option>
              {POPULAR_DESTINATIONS.map((dest) => (
                <option key={dest.code} value={dest.code}>
                  {dest.name} ({dest.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200 px-4">
        <div className="flex gap-1">
          {[
            { id: 'search', label: language === 'es' ? 'Buscar' : 'Search', icon: '🔍' },
            { id: 'calendar', label: language === 'es' ? 'Calendario' : 'Calendar', icon: '📅' },
            { id: 'map', label: language === 'es' ? 'Mapa' : 'Map', icon: '🗺️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-olive-600 text-olive-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4">
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">
                {language === 'es' ? 'Buscar vuelos' : 'Search flights'}
              </h2>
              <FlightSearchWidget
                origin={origin}
                destination={destination}
                locale={locale}
                currency={currency}
              />
            </div>

            {/* Popular Routes */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">
                {language === 'es'
                  ? `Vuelos populares desde ${MEXICAN_AIRPORTS.find(a => a.code === origin)?.name || origin}`
                  : `Popular flights from ${MEXICAN_AIRPORTS.find(a => a.code === origin)?.name || origin}`}
              </h2>
              <PopularDestinationsWidget
                origin={origin}
                currency={currency}
                locale={locale}
              />
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold text-stone-800 mb-2">
              {language === 'es' ? 'Calendario de precios' : 'Price calendar'}
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              {language === 'es'
                ? 'Encuentra el día más barato para volar'
                : 'Find the cheapest day to fly'}
            </p>
            {destination ? (
              <PriceCalendarWidget
                origin={origin}
                destination={destination}
                currency={currency}
                locale={locale}
              />
            ) : (
              <div className="text-center py-8 text-stone-500">
                {language === 'es'
                  ? 'Selecciona un destino para ver el calendario'
                  : 'Select a destination to see the calendar'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold text-stone-800 mb-2">
              {language === 'es' ? 'Mapa de precios' : 'Price map'}
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              {language === 'es'
                ? 'Explora destinos y sus precios'
                : 'Explore destinations and their prices'}
            </p>
            <PriceMapWidget
              origin={origin}
              currency={currency}
              locale={locale}
            />
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="mx-4 p-4 bg-olive-50 rounded-xl border border-olive-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✈️</span>
          <div>
            <h3 className="font-semibold text-olive-800 text-sm">
              {language === 'es' ? 'Precios en tiempo real' : 'Real-time prices'}
            </h3>
            <p className="text-xs text-olive-600 mt-1">
              {language === 'es'
                ? 'Los precios que ves son los mismos que encontrarás al reservar. Datos de Aviasales.'
                : 'The prices you see are the same you\'ll find when booking. Data from Aviasales.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

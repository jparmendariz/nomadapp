import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getDeals } from '../services/api';
import Loading from '../components/common/Loading';

const REGIONS = {
  northAmerica: {
    name: { es: 'Norteamérica', en: 'North America' },
    countries: ['USA', 'Canada', 'Mexico'],
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    position: { top: '25%', left: '15%' }
  },
  centralAmerica: {
    name: { es: 'Centroamérica', en: 'Central America' },
    countries: ['Guatemala', 'Costa Rica', 'Panama', 'Cuba', 'Dominican Republic'],
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-600',
    position: { top: '40%', left: '22%' }
  },
  southAmerica: {
    name: { es: 'Sudamérica', en: 'South America' },
    countries: ['Brazil', 'Argentina', 'Colombia', 'Peru', 'Chile'],
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    position: { top: '60%', left: '28%' }
  },
  europe: {
    name: { es: 'Europa', en: 'Europe' },
    countries: ['Spain', 'France', 'Italy', 'UK', 'Germany', 'Netherlands'],
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    position: { top: '25%', left: '48%' }
  },
  asia: {
    name: { es: 'Asia', en: 'Asia' },
    countries: ['Japan', 'China', 'Thailand', 'Vietnam', 'India', 'Korea'],
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600',
    position: { top: '35%', left: '72%' }
  },
  oceania: {
    name: { es: 'Oceanía', en: 'Oceania' },
    countries: ['Australia', 'New Zealand', 'Fiji'],
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-600',
    position: { top: '65%', left: '80%' }
  },
  africa: {
    name: { es: 'África', en: 'Africa' },
    countries: ['Morocco', 'Egypt', 'South Africa', 'Kenya'],
    color: 'bg-yellow-600',
    hoverColor: 'hover:bg-yellow-700',
    position: { top: '50%', left: '52%' }
  }
};

export default function Map() {
  const { t, language } = useLanguage();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      setLoading(true);
      const response = await getDeals({});
      setDeals(response.deals || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  }

  // Agrupar deals por región
  const dealsByRegion = useMemo(() => {
    const grouped = {};

    Object.keys(REGIONS).forEach(regionKey => {
      grouped[regionKey] = deals.filter(deal => {
        const dest = (deal.destinationName || deal.location || '').toLowerCase();
        const region = (deal.region || '').toLowerCase();

        // Mapear destinos a regiones
        if (regionKey === 'northAmerica') {
          return ['usa', 'canada', 'new york', 'los angeles', 'miami', 'toronto', 'vancouver'].some(c => dest.includes(c) || region.includes(c));
        }
        if (regionKey === 'centralAmerica') {
          return ['cancun', 'cancún', 'caribbean', 'caribe', 'cuba', 'dominican', 'costa rica', 'guatemala', 'panama'].some(c => dest.includes(c) || region.includes(c));
        }
        if (regionKey === 'southAmerica') {
          return ['brazil', 'brasil', 'argentina', 'colombia', 'peru', 'chile', 'buenos aires', 'rio', 'bogota'].some(c => dest.includes(c) || region.includes(c));
        }
        if (regionKey === 'europe') {
          return ['spain', 'españa', 'madrid', 'barcelona', 'paris', 'france', 'italy', 'rome', 'london', 'uk', 'germany', 'amsterdam', 'europe'].some(c => dest.includes(c) || region.includes(c));
        }
        if (regionKey === 'asia') {
          return ['japan', 'tokyo', 'china', 'beijing', 'thailand', 'bangkok', 'vietnam', 'india', 'korea', 'seoul', 'asia'].some(c => dest.includes(c) || region.includes(c));
        }
        if (regionKey === 'oceania') {
          return ['australia', 'sydney', 'new zealand', 'fiji', 'oceania'].some(c => dest.includes(c) || region.includes(c));
        }
        if (regionKey === 'africa') {
          return ['morocco', 'egypt', 'south africa', 'kenya', 'africa', 'cairo'].some(c => dest.includes(c) || region.includes(c));
        }
        return false;
      });
    });

    return grouped;
  }, [deals]);

  const selectedDeals = selectedRegion ? dealsByRegion[selectedRegion] : [];
  const selectedRegionData = selectedRegion ? REGIONS[selectedRegion] : null;

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-olive-700 to-olive-600 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">{t('map.title')}</h1>
        <p className="text-olive-100">{t('map.subtitle')}</p>
      </div>

      {/* Mapa Visual */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="relative w-full h-[400px] bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl overflow-hidden">
          {/* Fondo de mapa simplificado */}
          <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full opacity-20">
            <path d="M150,120 L250,100 L300,150 L280,200 L200,220 L150,180 Z" fill="#3B82F6" /> {/* NA */}
            <path d="M200,250 L250,230 L270,280 L240,350 L200,320 Z" fill="#10B981" /> {/* CA */}
            <path d="M250,350 L300,320 L350,400 L300,480 L250,450 L230,380 Z" fill="#22C55E" /> {/* SA */}
            <path d="M450,100 L550,80 L580,150 L520,180 L460,160 Z" fill="#8B5CF6" /> {/* EU */}
            <path d="M700,150 L800,120 L850,200 L800,250 L720,230 Z" fill="#EF4444" /> {/* Asia */}
            <path d="M480,200 L550,220 L530,320 L480,300 Z" fill="#CA8A04" /> {/* Africa */}
            <path d="M800,350 L880,320 L900,400 L850,420 L810,390 Z" fill="#F97316" /> {/* Oceania */}
          </svg>

          {/* Regiones clickeables */}
          {Object.entries(REGIONS).map(([key, region]) => {
            const count = dealsByRegion[key]?.length || 0;
            return (
              <button
                key={key}
                onClick={() => setSelectedRegion(selectedRegion === key ? null : key)}
                style={{ top: region.position.top, left: region.position.left }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                  selectedRegion === key ? 'scale-110 z-10' : 'hover:scale-105'
                }`}
              >
                <div className={`${region.color} ${region.hoverColor} text-white px-4 py-2 rounded-full shadow-lg transition-colors cursor-pointer`}>
                  <p className="font-semibold text-sm whitespace-nowrap">{region.name[language]}</p>
                  <p className="text-xs opacity-90">{count} {t('deals.offers').toLowerCase()}</p>
                </div>
                {count > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                    {count > 9 ? '9+' : count}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {Object.entries(REGIONS).map(([key, region]) => (
            <button
              key={key}
              onClick={() => setSelectedRegion(selectedRegion === key ? null : key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                selectedRegion === key
                  ? `${region.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className={`w-3 h-3 rounded-full ${region.color}`}></span>
              {region.name[language]}
              <span className="text-xs opacity-70">({dealsByRegion[key]?.length || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ofertas de la región seleccionada */}
      {selectedRegion && selectedDeals.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-olive-800">
              {selectedRegionData?.name[language]} - {selectedDeals.length} {t('map.dealsInRegion')}
            </h2>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-olive-500 hover:text-olive-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDeals.slice(0, 6).map(deal => (
              <div key={deal.id} className="border border-olive-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500">{deal.originName || 'Mexico'}</p>
                    <h3 className="font-semibold text-olive-800">{deal.destinationName || deal.location || deal.name}</h3>
                  </div>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                    -{deal.discountPercent}%
                  </span>
                </div>
                <p className="text-lg font-bold text-olive-600 mb-2">
                  ${deal.price?.toLocaleString()} USD
                </p>
                <a
                  href={deal.dealUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-olive-600 hover:bg-olive-700 text-white text-sm py-2 rounded-lg transition-colors"
                >
                  {t('deal.viewDeal')}
                </a>
              </div>
            ))}
          </div>

          {selectedDeals.length > 6 && (
            <div className="mt-4 text-center">
              <Link
                to="/ofertas"
                className="text-olive-600 hover:text-olive-700 font-medium"
              >
                {t('common.seeAll')} ({selectedDeals.length}) →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {selectedRegion && selectedDeals.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-olive-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="text-lg font-medium text-olive-700 mb-2">
            {t('deals.noOffers')}
          </h3>
          <p className="text-olive-500">
            {t('deals.tryOther')}
          </p>
        </div>
      )}

      {/* No hay región seleccionada */}
      {!selectedRegion && (
        <div className="text-center py-8 text-olive-500">
          <p>{language === 'es' ? 'Selecciona una región para ver las ofertas disponibles' : 'Select a region to see available deals'}</p>
        </div>
      )}
    </div>
  );
}

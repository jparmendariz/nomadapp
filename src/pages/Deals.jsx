import { useState, useEffect } from 'react';
import DealCard from '../components/deals/DealCard';
import DealComparator from '../components/deals/DealComparator';
import BudgetCalculator from '../components/common/BudgetCalculator';
import Loading from '../components/common/Loading';
import { getDeals, clearDealsCache } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

// Cache del tipo de cambio
let exchangeRateCache = {
  rate: null,
  timestamp: null
};
const EXCHANGE_RATE_CACHE_DURATION = 60 * 60 * 1000; // 1 hora

async function getExchangeRate() {
  const now = Date.now();

  // Usar cache si es válido
  if (exchangeRateCache.rate && exchangeRateCache.timestamp &&
      (now - exchangeRateCache.timestamp) < EXCHANGE_RATE_CACHE_DURATION) {
    return exchangeRateCache.rate;
  }

  try {
    // API gratuita de tipo de cambio
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    const rate = data.rates.MXN;

    // Guardar en cache
    exchangeRateCache = {
      rate,
      timestamp: now
    };

    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    // Fallback si falla la API
    return exchangeRateCache.rate || 20.0;
  }
}

export default function Deals() {
  const { t } = useLanguage();
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);

  // Filtros
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('discount_high');
  const [currency, setCurrency] = useState('USD');
  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [travelDateFilter, setTravelDateFilter] = useState('any');

  // Comparador
  const [compareList, setCompareList] = useState([]);

  // Calculadora
  const [showCalculator, setShowCalculator] = useState(false);

  // Última actualización
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDeals();
    fetchExchangeRate();
  }, []);

  async function fetchDeals() {
    try {
      setLoading(true);
      setError(null);
      const response = await getDeals({});
      setDeals(response.deals || []);
      setStats(response.stats || null);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    clearDealsCache(); // Limpia el cache para generar nuevas ofertas
    await fetchDeals();
    setIsRefreshing(false);
  }

  async function fetchExchangeRate() {
    const rate = await getExchangeRate();
    setExchangeRate(rate);
  }

  // Convertir precio segun moneda
  const convertPrice = (priceUSD) => {
    if (currency === 'MXN' && exchangeRate) {
      return Math.round(priceUSD * exchangeRate);
    }
    return priceUSD;
  };

  // Obtener origenes unicos de las ofertas actuales
  const uniqueOrigins = [...new Set(
    deals
      .filter(d => d.originName)
      .map(d => d.originName)
  )].sort();

  // Obtener destinos unicos de las ofertas actuales
  const uniqueDestinations = [...new Set(
    deals
      .filter(d => d.destinationName || d.location)
      .map(d => d.destinationName || d.location)
  )].sort();

  // Handlers para comparador
  const handleCompare = (deal) => {
    setCompareList(prev => {
      if (prev.some(d => d.id === deal.id)) {
        return prev.filter(d => d.id !== deal.id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, deal];
    });
  };

  const handleRemoveFromCompare = (deal) => {
    setCompareList(prev => prev.filter(d => d.id !== deal.id));
  };

  // Filtrar por tipo, ubicacion y fechas
  const filteredDeals = deals.filter(deal => {
    if (activeTab === 'flights' && deal.type !== 'flight') return false;
    if (activeTab === 'cruises' && deal.type !== 'cruise') return false;
    if (activeTab === 'hotels' && deal.type !== 'hotel') return false;

    if (selectedOrigin && deal.originName !== selectedOrigin) return false;
    if (selectedDestination) {
      const dealDest = deal.destinationName || deal.location;
      if (dealDest !== selectedDestination) return false;
    }

    // Filtro por fechas de viaje
    if (travelDateFilter !== 'any' && deal.travelDatesStart) {
      const dealDate = new Date(deal.travelDatesStart);
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      const endOf3Months = new Date(now.getFullYear(), now.getMonth() + 4, 0);

      if (travelDateFilter === 'thisMonth' && dealDate > endOfMonth) return false;
      if (travelDateFilter === 'nextMonth' && (dealDate <= endOfMonth || dealDate > endOfNextMonth)) return false;
      if (travelDateFilter === 'next3Months' && dealDate > endOf3Months) return false;
    }

    return true;
  });

  // Ordenar
  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case 'discount_low':
        return a.discountPercent - b.discountPercent;
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'days':
        return (b.nights || 0) - (a.nights || 0);
      case 'discount_high':
      default:
        return b.discountPercent - a.discountPercent;
    }
  });

  // Separar ofertas calientes (top 4 con 45%+ descuento)
  const hotDeals = sortedDeals.filter(d => d.discountPercent >= 45).slice(0, 4);
  const regularDeals = sortedDeals.filter(d => !hotDeals.includes(d));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con estadisticas */}
      <div className="bg-gradient-to-r from-olive-700 to-olive-600 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{t('deals.title')}</h1>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
                title={t('deals.refresh')}
              >
                <svg
                  className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p className="text-olive-100">
              {t('deals.subtitle')}
            </p>
            {lastUpdated && (
              <p className="text-olive-200 text-xs mt-1">
                {t('deals.lastUpdated')}: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          {stats && (
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">{stats.total}</div>
                <div className="text-xs md:text-sm text-olive-200">{t('deals.offers')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">{stats.avgDiscount}%</div>
                <div className="text-xs md:text-sm text-olive-200">{t('deals.avgDiscount')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controles: Tabs + Filtros */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Primera fila: Tabs de tipo */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-olive-100 rounded-lg p-1">
            {[
              { id: 'all', label: t('deals.all'), count: deals.length },
              { id: 'flights', label: t('deals.flights'), count: stats?.flights || 0 },
              { id: 'cruises', label: t('deals.cruises'), count: stats?.cruises || 0 },
              { id: 'hotels', label: t('deals.hotels'), count: stats?.hotels || 0 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-olive-800 shadow-sm'
                    : 'text-olive-600 hover:text-olive-800'
                }`}
              >
                {tab.label}
                <span className="ml-1 text-xs opacity-70">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Segunda fila: Filtros de ubicacion */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Origen */}
          {uniqueOrigins.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('deals.from')}</span>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-olive-200 text-olive-700 bg-white text-sm focus:ring-2 focus:ring-olive-500"
              >
                <option value="">{t('deals.anyCity')}</option>
                {uniqueOrigins.map(origin => (
                  <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>
          )}

          {/* Destino */}
          {uniqueDestinations.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('deals.to')}</span>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-olive-200 text-olive-700 bg-white text-sm focus:ring-2 focus:ring-olive-500"
              >
                <option value="">{t('deals.anyDestination')}</option>
                {uniqueDestinations.map(dest => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>
            </div>
          )}

          {/* Fechas de viaje */}
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <select
              value={travelDateFilter}
              onChange={(e) => setTravelDateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-olive-200 text-olive-700 bg-white text-sm focus:ring-2 focus:ring-olive-500"
            >
              <option value="any">{t('filters.anyDate')}</option>
              <option value="thisMonth">{t('filters.thisMonth')}</option>
              <option value="nextMonth">{t('filters.nextMonth')}</option>
              <option value="next3Months">{t('filters.next3Months')}</option>
            </select>
          </div>

          {/* Botón de calculadora */}
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-olive-100 text-olive-700 hover:bg-olive-200 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {t('budget.title')}
          </button>
        </div>

        {/* Tercera fila: Ordenamiento + Moneda */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Ordenar por */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{t('deals.sortBy')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-olive-200 text-olive-700 bg-white text-sm focus:ring-2 focus:ring-olive-500"
            >
              <option value="discount_high">{t('deals.discountHighLow')}</option>
              <option value="discount_low">{t('deals.discountLowHigh')}</option>
              <option value="price_low">{t('deals.priceLowHigh')}</option>
              <option value="price_high">{t('deals.priceHighLow')}</option>
              <option value="days">{t('deals.moreNights')}</option>
            </select>
          </div>

          {/* Toggle USD/MXN */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-500">{t('deals.currency')}</span>
            <div className="flex bg-olive-100 rounded-lg p-0.5">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currency === 'USD'
                    ? 'bg-white text-olive-800 shadow-sm'
                    : 'text-olive-600 hover:text-olive-800'
                }`}
              >
                USD
              </button>
              <button
                onClick={() => setCurrency('MXN')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currency === 'MXN'
                    ? 'bg-white text-olive-800 shadow-sm'
                    : 'text-olive-600 hover:text-olive-800'
                }`}
              >
                MXN
              </button>
            </div>
            {currency === 'MXN' && exchangeRate && (
              <span className="text-xs text-gray-400">1 USD = ${exchangeRate.toFixed(2)} MXN</span>
            )}
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && <Loading />}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-lg inline-block">
            <p>{error}</p>
            <button
              onClick={fetchDeals}
              className="mt-2 text-sm underline hover:no-underline"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      )}

      {/* Hot Deals Section */}
      {!loading && !error && hotDeals.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-olive-800">{t('deals.hotDeals')}</h2>
            <span className="text-sm text-olive-500">{t('deals.upToDiscount', { percent: Math.max(...hotDeals.map(d => d.discountPercent)) })}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotDeals.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                isHot
                currency={currency}
                convertPrice={convertPrice}
                onCompare={handleCompare}
                isInCompare={compareList.some(d => d.id === deal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Deals */}
      {!loading && !error && regularDeals.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-olive-800 mb-4">
            {activeTab === 'cruises' ? t('deals.cruises') :
             activeTab === 'hotels' ? t('deals.hotels') :
             activeTab === 'flights' ? t('deals.flights') : t('deals.allOffers')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {regularDeals.map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                compact
                currency={currency}
                convertPrice={convertPrice}
                onCompare={handleCompare}
                isInCompare={compareList.some(d => d.id === deal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State - No hay ofertas reales todavía */}
      {!loading && !error && deals.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-olive-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-medium text-olive-700 mb-2">
            Aún no hay ofertas disponibles
          </h2>
          <p className="text-olive-500 mb-4 max-w-md mx-auto">
            Las ofertas aparecerán aquí cuando lleguen promociones a nuestro correo de newsletters de aerolíneas y agencias de viaje.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <a
              href="https://www.google.com/travel/flights?curr=MXN&hl=es"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-olive-600 hover:bg-olive-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Buscar en Google Flights
            </a>
            <a
              href="/buscar"
              className="inline-flex items-center justify-center gap-2 bg-olive-100 hover:bg-olive-200 text-olive-700 font-medium py-2.5 px-5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Buscar por presupuesto
            </a>
          </div>
        </div>
      )}

      {/* Empty State - Filtros sin resultados */}
      {!loading && !error && deals.length > 0 && sortedDeals.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-olive-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-medium text-olive-700 mb-2">
            {t('deals.noOffers')}
          </h2>
          <p className="text-olive-500 mb-4">
            {t('deals.tryOther')}
          </p>
          <button
            onClick={() => {
              setSelectedOrigin('');
              setSelectedDestination('');
              setActiveTab('all');
            }}
            className="text-olive-600 underline hover:no-underline"
          >
            {t('deals.clearFilters')}
          </button>
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-12 bg-olive-50 rounded-xl p-6 mb-24">
        <h3 className="font-semibold text-olive-800 mb-3">{t('deals.howItWorks')}</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-olive-600">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-olive-200 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-olive-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <strong className="block text-olive-700">{t('deals.monitor')}</strong>
              {t('deals.monitorDesc')}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-olive-200 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-olive-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <strong className="block text-olive-700">{t('deals.limited')}</strong>
              {t('deals.limitedDesc')}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-olive-200 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-olive-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div>
              <strong className="block text-olive-700">{t('deals.direct')}</strong>
              {t('deals.directDesc')}
            </div>
          </div>
        </div>
      </div>

      {/* Comparador flotante */}
      {compareList.length > 0 && (
        <DealComparator
          deals={compareList}
          onRemove={handleRemoveFromCompare}
          onClose={() => setCompareList([])}
          currency={currency}
          convertPrice={convertPrice}
        />
      )}

      {/* Calculadora de presupuesto */}
      <BudgetCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
      />
    </div>
  );
}

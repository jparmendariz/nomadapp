import { useState, useMemo } from 'react';
import SearchForm from '../components/search/SearchForm';
import DestinationList from '../components/results/DestinationList';
import DestinationDetail from '../components/results/DestinationDetail';
import Comparator from '../components/results/Comparator';
import CruiseList from '../components/cruises/CruiseList';
import Loading from '../components/common/Loading';
import BudgetCalculator from '../components/common/BudgetCalculator';
import { useSearch } from '../hooks/useSearch';
import { useLanguage } from '../contexts/LanguageContext';
import { useWishlist } from '../contexts/WishlistContext';

// Tipo de cambio aproximado MXN a USD
const MXN_TO_USD = 17;

// Regiones para filtrar destinos
const REGIONS = {
  national: ['mexico', 'cancun', 'cancún', 'guadalajara', 'monterrey', 'oaxaca', 'playa del carmen', 'los cabos', 'puerto vallarta'],
  northAmerica: ['usa', 'united states', 'canada', 'new york', 'los angeles', 'miami', 'las vegas', 'san francisco'],
  europe: ['spain', 'france', 'italy', 'germany', 'uk', 'england', 'paris', 'london', 'rome', 'barcelona', 'amsterdam'],
  caribbean: ['caribbean', 'cuba', 'jamaica', 'dominican', 'bahamas', 'aruba', 'punta cana'],
  southAmerica: ['brazil', 'argentina', 'colombia', 'peru', 'chile', 'bogota', 'buenos aires', 'lima'],
  asia: ['japan', 'china', 'thailand', 'korea', 'tokyo', 'bangkok', 'singapore', 'bali']
};

export default function Search() {
  const { t, language } = useLanguage();
  const { results, cruises, loading, error, search } = useSearch();
  const { isInWishlist } = useWishlist();
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Filtros
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('price_low');
  const [showSurprise, setShowSurprise] = useState(false);

  const handleSearch = (params) => {
    setCompareList([]);
    setHasSearched(true);
    // Convertir presupuesto de MXN a USD para el backend
    const budgetUSD = Math.round(parseFloat(params.budget) / MXN_TO_USD);
    search({
      ...params,
      budget: budgetUSD.toString()
    });
  };

  const handleSelectDestination = (destination) => {
    setSelectedDestination(destination);
  };

  const handleCompare = (destination) => {
    setCompareList(prev => {
      const exists = prev.some(d => d.code === destination.code);
      if (exists) {
        return prev.filter(d => d.code !== destination.code);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, destination];
    });
  };

  const handleRemoveFromCompare = (destination) => {
    setCompareList(prev => prev.filter(d => d.code !== destination.code));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  // Filtrar por región
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results;

    return results.filter(dest => {
      const destName = (dest.name || dest.city || '').toLowerCase();
      const region = REGIONS[activeTab] || [];
      return region.some(r => destName.includes(r));
    });
  }, [results, activeTab]);

  // Ordenar resultados
  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      switch (sortBy) {
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price_low':
        default:
          return (a.price || 0) - (b.price || 0);
      }
    });
  }, [filteredResults, sortBy]);

  // Destino sorpresa (aleatorio)
  const surpriseDestinations = useMemo(() => {
    if (!showSurprise || results.length === 0) return [];
    const shuffled = [...results].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [results, showSurprise]);

  // Stats
  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const avgPrice = Math.round(results.reduce((sum, d) => sum + (d.price || 0), 0) / results.length);
    const minPrice = Math.min(...results.map(d => d.price || Infinity));
    const nationalsCount = results.filter(d => {
      const name = (d.name || '').toLowerCase();
      return REGIONS.national.some(r => name.includes(r));
    }).length;
    return { total: results.length, avgPrice, minPrice, nationals: nationalsCount };
  }, [results]);

  const tabLabels = {
    all: language === 'es' ? 'Todos' : 'All',
    national: language === 'es' ? 'Nacional' : 'National',
    northAmerica: language === 'es' ? 'Norteamérica' : 'North America',
    europe: language === 'es' ? 'Europa' : 'Europe',
    caribbean: language === 'es' ? 'Caribe' : 'Caribbean',
    southAmerica: language === 'es' ? 'Sudamérica' : 'South America',
    asia: language === 'es' ? 'Asia' : 'Asia'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con estadísticas (solo si hay resultados) */}
      {hasSearched && stats && (
        <div className="bg-gradient-to-r from-olive-700 to-olive-600 rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t('search.title')}</h1>
              <p className="text-olive-100">{t('search.subtitle')}</p>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">{stats.total}</div>
                <div className="text-xs md:text-sm text-olive-200">
                  {language === 'es' ? 'Destinos' : 'Destinations'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">${stats.minPrice}</div>
                <div className="text-xs md:text-sm text-olive-200">
                  {language === 'es' ? 'Desde USD' : 'From USD'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header simple si no hay búsqueda */}
      {!hasSearched && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-olive-800 mb-2">
            {t('search.title')}
          </h1>
          <p className="text-olive-600">
            {t('search.subtitle')}
          </p>
        </div>
      )}

      {/* Search Form */}
      <div className="mb-8">
        <SearchForm onSearch={handleSearch} loading={loading} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <Loading />}

      {/* Filtros y ordenamiento (solo si hay resultados) */}
      {!loading && results.length > 0 && (
        <div className="flex flex-col gap-4 mb-6">
          {/* Tabs de región */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap bg-olive-100 rounded-lg p-1 gap-1">
              {Object.keys(tabLabels).map(tab => {
                const count = tab === 'all'
                  ? results.length
                  : results.filter(d => {
                      const name = (d.name || '').toLowerCase();
                      return (REGIONS[tab] || []).some(r => name.includes(r));
                    }).length;
                if (count === 0 && tab !== 'all') return null;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'bg-white text-olive-800 shadow-sm'
                        : 'text-olive-600 hover:text-olive-800'
                    }`}
                  >
                    {tabLabels[tab]}
                    <span className="ml-1 text-xs opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordenamiento y acciones */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('deals.sortBy')}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-olive-200 text-olive-700 bg-white text-sm focus:ring-2 focus:ring-olive-500"
              >
                <option value="price_low">{t('deals.priceLowHigh')}</option>
                <option value="price_high">{t('deals.priceHighLow')}</option>
                <option value="name">{language === 'es' ? 'Nombre A-Z' : 'Name A-Z'}</option>
              </select>
            </div>

            {/* Botón sorpresa */}
            <button
              onClick={() => setShowSurprise(!showSurprise)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                showSurprise
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-olive-100 text-olive-700 hover:bg-olive-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              {language === 'es' ? 'Destino Sorpresa' : 'Surprise Me'}
            </button>

            {/* Calculadora */}
            <button
              onClick={() => setShowCalculator(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-olive-100 text-olive-700 hover:bg-olive-200 text-sm font-medium transition-colors ml-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {t('budget.title')}
            </button>
          </div>
        </div>
      )}

      {/* Destinos sorpresa */}
      {showSurprise && surpriseDestinations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-olive-800">
              {language === 'es' ? 'Te sugerimos estos destinos' : 'We suggest these destinations'}
            </h2>
            <button
              onClick={() => setShowSurprise(false)}
              className="ml-auto text-olive-400 hover:text-olive-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {surpriseDestinations.map((dest, index) => (
              <div
                key={dest.code || index}
                className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleSelectDestination(dest)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-purple-600 font-medium">
                      {language === 'es' ? 'Sorpresa #' : 'Surprise #'}{index + 1}
                    </p>
                    <h3 className="font-bold text-olive-800 text-lg">{dest.name || dest.city}</h3>
                  </div>
                  <span className="text-2xl">🎲</span>
                </div>
                <p className="text-xl font-bold text-purple-600 mb-2">
                  ${dest.price?.toLocaleString()} USD
                </p>
                <p className="text-sm text-olive-500">
                  {language === 'es' ? 'Click para ver detalles' : 'Click for details'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flight/Hotel Results */}
      {!loading && sortedResults.length > 0 && (
        <DestinationList
          destinations={sortedResults}
          onSelect={handleSelectDestination}
          onCompare={handleCompare}
          compareList={compareList}
        />
      )}

      {/* Cruise Results */}
      {!loading && cruises.length > 0 && (
        <CruiseList cruises={cruises} />
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && cruises.length === 0 && !error && (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-olive-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-xl font-medium text-olive-700 mb-2">
            {t('search.empty')}
          </h2>
          <p className="text-olive-500">
            {t('search.emptyDesc')}
          </p>
        </div>
      )}

      {/* Filtered empty state */}
      {!loading && results.length > 0 && sortedResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-olive-500">
            {language === 'es'
              ? 'No hay destinos en esta región. Prueba con otro filtro.'
              : 'No destinations in this region. Try another filter.'}
          </p>
          <button
            onClick={() => setActiveTab('all')}
            className="mt-2 text-olive-600 underline hover:no-underline"
          >
            {language === 'es' ? 'Ver todos' : 'View all'}
          </button>
        </div>
      )}

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <DestinationDetail
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
        />
      )}

      {/* Comparator */}
      {compareList.length > 0 && (
        <Comparator
          destinations={compareList}
          onRemove={handleRemoveFromCompare}
          onClose={clearCompare}
        />
      )}

      {/* Budget Calculator */}
      <BudgetCalculator
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
      />
    </div>
  );
}

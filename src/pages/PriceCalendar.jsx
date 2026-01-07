import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getDeals } from '../services/api';

export default function PriceCalendar() {
  const { t, language } = useLanguage();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDestination, setSelectedDestination] = useState('');

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

  // Obtener destinos únicos
  const destinations = useMemo(() => {
    return [...new Set(deals.map(d => d.destinationName || d.location).filter(Boolean))].sort();
  }, [deals]);

  // Filtrar deals por destino y mes
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      if (selectedDestination && (deal.destinationName || deal.location) !== selectedDestination) {
        return false;
      }
      // Filtrar por mes si el deal tiene fechas de viaje
      if (deal.travelDatesStart) {
        const dealMonth = deal.travelDatesStart.substring(0, 7);
        if (dealMonth !== selectedMonth) return false;
      }
      return true;
    });
  }, [deals, selectedDestination, selectedMonth]);

  // Crear datos del calendario
  const calendarData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    // Agrupar deals por día
    const dealsByDay = {};
    filteredDeals.forEach(deal => {
      if (deal.travelDatesStart) {
        const day = new Date(deal.travelDatesStart).getDate();
        if (!dealsByDay[day]) dealsByDay[day] = [];
        dealsByDay[day].push(deal);
      }
    });

    // Encontrar el día más barato
    let cheapestDay = null;
    let cheapestPrice = Infinity;
    Object.entries(dealsByDay).forEach(([day, dayDeals]) => {
      const minPrice = Math.min(...dayDeals.map(d => d.price));
      if (minPrice < cheapestPrice) {
        cheapestPrice = minPrice;
        cheapestDay = parseInt(day);
      }
    });

    return {
      daysInMonth,
      startDayOfWeek,
      dealsByDay,
      cheapestDay,
      cheapestPrice
    };
  }, [selectedMonth, filteredDeals]);

  // Generar opciones de meses
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const locale = language === 'en' ? 'en-US' : 'es-MX';
      const label = date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, [language]);

  const locale = language === 'en' ? 'en-US' : 'es-MX';
  const dayNames = language === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-olive-800 mb-2">{t('calendar.title')}</h1>
        <p className="text-olive-600">{t('calendar.subtitle')}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <select
          value={selectedDestination}
          onChange={(e) => setSelectedDestination(e.target.value)}
          className="px-4 py-2 rounded-lg border border-olive-200 text-olive-700 bg-white focus:ring-2 focus:ring-olive-500"
        >
          <option value="">{t('calendar.selectDestination')}</option>
          {destinations.map(dest => (
            <option key={dest} value={dest}>{dest}</option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 rounded-lg border border-olive-200 text-olive-700 bg-white focus:ring-2 focus:ring-olive-500"
        >
          {monthOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      {calendarData.cheapestDay && (
        <div className="flex justify-center gap-8 mb-8">
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{calendarData.cheapestDay}</div>
            <div className="text-sm text-green-700">{t('calendar.cheapestDay')}</div>
          </div>
          <div className="bg-olive-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-olive-600">${calendarData.cheapestPrice}</div>
            <div className="text-sm text-olive-700">{t('calendar.averagePrice')}</div>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-3xl mx-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-olive-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array(calendarData.startDayOfWeek).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="h-20" />
          ))}

          {/* Days of month */}
          {Array(calendarData.daysInMonth).fill(null).map((_, i) => {
            const day = i + 1;
            const dayDeals = calendarData.dealsByDay[day] || [];
            const isCheapest = day === calendarData.cheapestDay;
            const minPrice = dayDeals.length > 0 ? Math.min(...dayDeals.map(d => d.price)) : null;

            return (
              <div
                key={day}
                className={`h-20 rounded-lg p-2 transition-colors ${
                  isCheapest
                    ? 'bg-green-100 border-2 border-green-500'
                    : dayDeals.length > 0
                      ? 'bg-olive-50 hover:bg-olive-100 cursor-pointer'
                      : 'bg-gray-50'
                }`}
              >
                <div className={`text-sm font-medium ${isCheapest ? 'text-green-700' : 'text-olive-700'}`}>
                  {day}
                </div>
                {minPrice && (
                  <div className={`text-xs mt-1 ${isCheapest ? 'text-green-600 font-bold' : 'text-olive-500'}`}>
                    ${minPrice}
                  </div>
                )}
                {dayDeals.length > 1 && (
                  <div className="text-xs text-olive-400 mt-1">
                    +{dayDeals.length - 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-500 rounded" />
          <span className="text-olive-600">{t('calendar.cheapestDay')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-olive-50 rounded" />
          <span className="text-olive-600">{t('deals.offers')}</span>
        </div>
      </div>
    </div>
  );
}

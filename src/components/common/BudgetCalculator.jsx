import { useState, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function BudgetCalculator({ isOpen, onClose, initialFlight = 0, initialHotel = 0, nights = 1 }) {
  const { t } = useLanguage();
  const [values, setValues] = useState({
    flight: initialFlight,
    hotel: initialHotel,
    food: 30,
    transport: 15,
    activities: 50,
    travelers: 1,
    nights: nights
  });

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const totals = useMemo(() => {
    const flightTotal = values.flight * values.travelers;
    const hotelTotal = values.hotel * values.nights;
    const foodTotal = values.food * values.nights * values.travelers;
    const transportTotal = values.transport * values.nights;
    const activitiesTotal = values.activities * values.travelers;

    const grandTotal = flightTotal + hotelTotal + foodTotal + transportTotal + activitiesTotal;
    const perPerson = grandTotal / values.travelers;

    return { flightTotal, hotelTotal, foodTotal, transportTotal, activitiesTotal, grandTotal, perPerson };
  }, [values]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-olive-800">{t('budget.title')}</h2>
            <button onClick={onClose} className="text-olive-400 hover:text-olive-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-olive-600 text-sm mb-6">{t('budget.subtitle')}</p>

          <div className="space-y-4">
            {/* Travelers & Nights */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-olive-600 mb-1">{t('budget.travelers')}</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={values.travelers}
                  onChange={(e) => handleChange('travelers', e.target.value)}
                  className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500"
                />
              </div>
              <div>
                <label className="block text-sm text-olive-600 mb-1">{t('budget.nights')}</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={values.nights}
                  onChange={(e) => handleChange('nights', e.target.value)}
                  className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500"
                />
              </div>
            </div>

            {/* Flight */}
            <div>
              <label className="block text-sm text-olive-600 mb-1">{t('budget.flight')} (USD)</label>
              <input
                type="number"
                min="0"
                value={values.flight}
                onChange={(e) => handleChange('flight', e.target.value)}
                className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500"
              />
              <p className="text-xs text-olive-400 mt-1">x {values.travelers} = ${totals.flightTotal.toLocaleString()}</p>
            </div>

            {/* Hotel */}
            <div>
              <label className="block text-sm text-olive-600 mb-1">{t('budget.hotel')} (USD/{t('deal.nights')})</label>
              <input
                type="number"
                min="0"
                value={values.hotel}
                onChange={(e) => handleChange('hotel', e.target.value)}
                className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500"
              />
              <p className="text-xs text-olive-400 mt-1">x {values.nights} {t('budget.nights')} = ${totals.hotelTotal.toLocaleString()}</p>
            </div>

            {/* Food */}
            <div>
              <label className="block text-sm text-olive-600 mb-1">{t('budget.food')}</label>
              <input
                type="number"
                min="0"
                value={values.food}
                onChange={(e) => handleChange('food', e.target.value)}
                className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500"
              />
              <p className="text-xs text-olive-400 mt-1">x {values.nights} x {values.travelers} = ${totals.foodTotal.toLocaleString()}</p>
            </div>

            {/* Transport */}
            <div>
              <label className="block text-sm text-olive-600 mb-1">{t('budget.transport')}</label>
              <input
                type="number"
                min="0"
                value={values.transport}
                onChange={(e) => handleChange('transport', e.target.value)}
                className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500"
              />
              <p className="text-xs text-olive-400 mt-1">x {values.nights} = ${totals.transportTotal.toLocaleString()}</p>
            </div>

            {/* Activities */}
            <div>
              <label className="block text-sm text-olive-600 mb-1">{t('budget.activities')}</label>
              <input
                type="number"
                min="0"
                value={values.activities}
                onChange={(e) => handleChange('activities', e.target.value)}
                className="w-full px-3 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500"
              />
              <p className="text-xs text-olive-400 mt-1">x {values.travelers} = ${totals.activitiesTotal.toLocaleString()}</p>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-olive-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-olive-600">{t('budget.total')}</span>
              <span className="text-2xl font-bold text-olive-800">${totals.grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-olive-500">{t('budget.perPerson')}</span>
              <span className="font-medium text-olive-600">${totals.perPerson.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

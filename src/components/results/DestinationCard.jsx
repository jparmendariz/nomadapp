import { useLanguage } from '../../contexts/LanguageContext';

const weatherIcons = {
  sunny: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
  foggy: '🌫️'
};

const seasonColors = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-green-600 bg-green-50'
};

export default function DestinationCard({ destination, onSelect, onCompare, isSelected }) {
  const { t, language } = useLanguage();
  const {
    city,
    country,
    image,
    totalCost,
    flight,
    hotel,
    weather,
    nights,
    season,
    costOfLiving
  } = destination;

  const seasonLabels = {
    high: t('destination.seasonHigh'),
    medium: t('destination.seasonMedium'),
    low: t('destination.seasonLow')
  };
  const seasonColor = seasonColors[season] || seasonColors.medium;
  const seasonLabel = seasonLabels[season] || seasonLabels.medium;

  return (
    <div className={`card cursor-pointer ${isSelected ? 'ring-2 ring-accent-500' : ''}`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={city}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
          }}
        />
        {/* Weather Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
          {weatherIcons[weather?.condition] || '🌤️'} {weather?.temp}°C
        </div>
        {/* Season Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${seasonColor}`}>
          {seasonLabel}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{city}</h3>
            <p className="text-sm text-gray-500">{country}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">${totalCost}</p>
            <p className="text-xs text-gray-500">{t('destination.total')}</p>
          </div>
        </div>

        {/* Context Info */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          {costOfLiving && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
              ~${costOfLiving.food} {t('destination.foodPerDay')}
            </span>
          )}
        </div>

        {/* Travel dates */}
        {destination.departureDate && (
          <div className="bg-olive-50 rounded-lg p-2 mb-3 text-sm">
            <div className="flex items-center gap-2 text-olive-700">
              <span>📅</span>
              <span className="font-medium">
                {new Date(destination.departureDate).toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { day: 'numeric', month: 'short' })}
                {' → '}
                {new Date(destination.returnDate).toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', { day: 'numeric', month: 'short' })}
              </span>
              <span className="text-olive-500">({nights} {t('destination.nights')})</span>
            </div>
          </div>
        )}

        {/* Quick info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <span>✈️</span>
            <span>${flight?.price}</span>
          </div>
          {hotel && (
            <div className="flex items-center gap-1">
              <span>🏨</span>
              <span>${hotel.price}{t('destination.perNight')}</span>
            </div>
          )}
        </div>

        {/* Booking Links */}
        {destination.affiliateLinks && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">{t('destination.bestPrices')}</p>
            <div className="flex gap-2">
              {destination.affiliateLinks.flight && (
                <a
                  href={destination.affiliateLinks.flight}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
                >
                  ✈️ ${flight?.price}
                </a>
              )}
              {destination.affiliateLinks.hotel && hotel && (
                <a
                  href={destination.affiliateLinks.hotel}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-xs bg-orange-50 text-orange-700 px-3 py-2 rounded-lg hover:bg-orange-100 transition-colors text-center font-medium"
                >
                  🏨 ${hotel?.total}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSelect(destination)}
            className="flex-1 btn-primary text-sm py-2"
          >
            {t('destination.viewDetails')}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCompare(destination);
            }}
            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
              isSelected
                ? 'bg-accent-500 text-white border-accent-500'
                : 'border-gray-300 text-gray-600 hover:border-accent-500 hover:text-accent-500'
            }`}
            title={isSelected ? t('destination.removeCompare') : t('destination.addCompare')}
          >
            {isSelected ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

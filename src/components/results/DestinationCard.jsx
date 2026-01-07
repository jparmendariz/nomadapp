const weatherIcons = {
  sunny: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
  foggy: '🌫️'
};

const seasonLabels = {
  high: { label: 'Temporada alta', color: 'text-red-600 bg-red-50' },
  medium: { label: 'Temporada media', color: 'text-amber-600 bg-amber-50' },
  low: { label: 'Temporada baja', color: 'text-green-600 bg-green-50' }
};

export default function DestinationCard({ destination, onSelect, onCompare, isSelected }) {
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

  const seasonInfo = seasonLabels[season] || seasonLabels.medium;

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
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${seasonInfo.color}`}>
          {seasonInfo.label}
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
            <p className="text-xs text-gray-500">total</p>
          </div>
        </div>

        {/* Context Info */}
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          {costOfLiving && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
              🍽️ ~${costOfLiving.food}/dia comida
            </span>
          )}
        </div>

        {/* Quick info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <span>✈️</span>
            <span>${flight?.price}</span>
          </div>
          {hotel && (
            <div className="flex items-center gap-1">
              <span>🏨</span>
              <span>${hotel.price}/noche</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{nights} noches</span>
          </div>
        </div>

        {/* Providers Preview */}
        {destination.providers && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Mejores precios:</p>
            <div className="flex gap-2">
              {destination.providers.slice(0, 2).map((p, i) => (
                <span key={i} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                  {p.name}: ${p.price}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onSelect(destination)}
            className="flex-1 btn-primary text-sm py-2"
          >
            Ver detalles
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
            title={isSelected ? 'Quitar de comparacion' : 'Agregar a comparacion'}
          >
            {isSelected ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  );
}

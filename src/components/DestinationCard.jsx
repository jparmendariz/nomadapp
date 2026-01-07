const weatherIcons = {
  sunny: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
  foggy: '🌫️'
};

export default function DestinationCard({ destination, onSelect, onCompare, isSelected }) {
  const { city, country, image, totalCost, flight, hotel, weather, days, nights } = destination;

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
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm">
          {weatherIcons[weather?.condition] || '🌤️'} {weather?.temp}°C
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

        {/* Quick info */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>${flight?.price}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>${hotel?.price}/noche</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{nights} noches</span>
          </div>
        </div>

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

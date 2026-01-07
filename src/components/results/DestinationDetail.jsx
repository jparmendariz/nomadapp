import PriceComparison from './PriceComparison';

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
  high: 'Temporada alta',
  medium: 'Temporada media',
  low: 'Temporada baja'
};

export default function DestinationDetail({ destination, onClose }) {
  if (!destination) return null;

  const {
    city,
    country,
    image,
    totalCost,
    perPerson,
    flight,
    hotel,
    weather,
    breakdown,
    days,
    nights,
    season,
    costOfLiving,
    flightProviders,
    hotelProviders
  } = destination;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header Image */}
        <div className="relative h-56">
          <img
            src={image}
            alt={city}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800">{city}</h2>
            <p className="text-sm text-gray-600">{country}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price Summary */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-500">Costo total estimado</p>
              <p className="text-3xl font-bold text-primary-600">${totalCost} USD</p>
              <p className="text-sm text-gray-500">${perPerson} por persona</p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 text-gray-600">
                {weatherIcons[weather?.condition]} {weather?.temp}°C
              </div>
              <p className="text-sm text-gray-500">{days} dias / {nights} noches</p>
              {season && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {seasonLabels[season]}
                </span>
              )}
            </div>
          </div>

          {/* Destination Info */}
          {costOfLiving && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Info del destino</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Comida/dia</p>
                  <p className="font-medium">~${costOfLiving.food}</p>
                </div>
                <div>
                  <p className="text-gray-500">Transporte/dia</p>
                  <p className="font-medium">~${costOfLiving.transport}</p>
                </div>
                <div>
                  <p className="text-gray-500">Costo de vida</p>
                  <p className="font-medium">{costOfLiving.level}</p>
                </div>
                <div>
                  <p className="text-gray-500">Moneda</p>
                  <p className="font-medium">{costOfLiving.currency || 'USD'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Flight Comparison */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              ✈️ Vuelos - Compara precios
            </h3>
            {flightProviders ? (
              <PriceComparison providers={flightProviders} type="flight" />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{flight?.airline}</p>
                    <p className="text-sm text-gray-500">Duracion: {flight?.duration}</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">${flight?.price}</p>
                </div>
              </div>
            )}
          </div>

          {/* Hotel Comparison */}
          {hotel && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🏨 Hoteles - Compara precios
              </h3>
              {hotelProviders ? (
                <PriceComparison providers={hotelProviders} type="hotel" />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{hotel.name}</p>
                      <p className="text-sm text-gray-500">
                        {'⭐'.repeat(Math.round(hotel.rating || 3))}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-800">${hotel.price}/noche</p>
                      <p className="text-sm text-gray-500">${breakdown?.hotel} total</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              📊 Desglose de costos
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Vuelo (ida y vuelta)</span>
                <span className="font-medium">${breakdown?.flight}</span>
              </div>
              {breakdown?.hotel > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Hospedaje ({nights} noches)</span>
                  <span className="font-medium">${breakdown?.hotel}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Comida estimada (~$30/dia)</span>
                <span className="font-medium">${breakdown?.food}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actividades estimadas (~$20/dia)</span>
                <span className="font-medium">${breakdown?.activities}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total estimado</span>
                <span className="text-primary-600">${totalCost}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full btn-secondary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

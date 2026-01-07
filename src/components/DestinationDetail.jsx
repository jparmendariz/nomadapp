const weatherIcons = {
  sunny: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
  foggy: '🌫️'
};

export default function DestinationDetail({ destination, onClose }) {
  if (!destination) return null;

  const { city, country, image, totalCost, perPerson, flight, hotel, weather, breakdown, days, nights } = destination;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg">
            <h2 className="text-xl font-bold text-gray-800">{city}</h2>
            <p className="text-sm text-gray-600">{country}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price Summary */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b">
            <div>
              <p className="text-sm text-gray-500">Costo total del viaje</p>
              <p className="text-3xl font-bold text-primary-600">${totalCost} USD</p>
              <p className="text-sm text-gray-500">${perPerson} por persona</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600">
                {weatherIcons[weather?.condition]} {weather?.temp}°C
              </div>
              <p className="text-sm text-gray-500 mt-1">{days} dias / {nights} noches</p>
            </div>
          </div>

          {/* Flight Info */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Vuelo
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{flight?.airline}</p>
                  <p className="text-sm text-gray-500">Duracion: {flight?.duration}</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">${flight?.price}</p>
              </div>
            </div>
          </div>

          {/* Hotel Info */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Hospedaje
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{hotel?.name}</p>
                  <p className="text-sm text-gray-500">Rating: {'⭐'.repeat(Math.round(hotel?.rating || 4))}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800">${hotel?.price}/noche</p>
                  <p className="text-sm text-gray-500">${breakdown?.hotel} total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Desglose de costos
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Vuelo (ida y vuelta)</span>
                <span className="font-medium">${breakdown?.flight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hospedaje ({nights} noches)</span>
                <span className="font-medium">${breakdown?.hotel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Comida (~$30/dia)</span>
                <span className="font-medium">${breakdown?.food}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actividades (~$20/dia)</span>
                <span className="font-medium">${breakdown?.activities}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total</span>
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

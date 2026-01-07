const weatherIcons = {
  sunny: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  rainy: '🌧️',
  stormy: '⛈️',
  snowy: '❄️',
  foggy: '🌫️'
};

export default function Comparator({ destinations, onRemove, onClose }) {
  if (destinations.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t border-gray-200 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Comparar destinos ({destinations.length}/3)
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-sm font-medium text-gray-500"></th>
                {destinations.map(dest => (
                  <th key={dest.code} className="text-center py-2 px-3">
                    <div className="relative">
                      <button
                        onClick={() => onRemove(dest)}
                        className="absolute -top-1 -right-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <p className="font-semibold text-gray-800">{dest.city}</p>
                      <p className="text-xs text-gray-500">{dest.country}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-t">
                <td className="py-2 px-3 text-gray-600">Costo Total</td>
                {destinations.map(dest => (
                  <td key={dest.code} className="py-2 px-3 text-center font-bold text-primary-600">
                    ${dest.totalCost}
                  </td>
                ))}
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="py-2 px-3 text-gray-600">Vuelo</td>
                {destinations.map(dest => (
                  <td key={dest.code} className="py-2 px-3 text-center">
                    ${dest.flight?.price}
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="py-2 px-3 text-gray-600">Hotel/noche</td>
                {destinations.map(dest => (
                  <td key={dest.code} className="py-2 px-3 text-center">
                    ${dest.hotel?.price}
                  </td>
                ))}
              </tr>
              <tr className="border-t bg-gray-50">
                <td className="py-2 px-3 text-gray-600">Duracion vuelo</td>
                {destinations.map(dest => (
                  <td key={dest.code} className="py-2 px-3 text-center">
                    {dest.flight?.duration}
                  </td>
                ))}
              </tr>
              <tr className="border-t">
                <td className="py-2 px-3 text-gray-600">Clima</td>
                {destinations.map(dest => (
                  <td key={dest.code} className="py-2 px-3 text-center">
                    {weatherIcons[dest.weather?.condition]} {dest.weather?.temp}°C
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

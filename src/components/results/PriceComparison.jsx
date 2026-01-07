export default function PriceComparison({ providers, type }) {
  if (!providers || providers.length === 0) {
    return null;
  }

  // Sort by price and find cheapest
  const sorted = [...providers].sort((a, b) => a.price - b.price);
  const cheapestPrice = sorted[0]?.price;

  return (
    <div className="space-y-2">
      {sorted.map((provider, index) => {
        const isCheapest = provider.price === cheapestPrice;

        return (
          <div
            key={provider.name}
            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              isCheapest
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Provider Logo/Name */}
              <div className="w-24">
                <span className="font-medium text-gray-800">{provider.name}</span>
              </div>

              {/* Additional Info */}
              {provider.info && (
                <span className="text-sm text-gray-500">{provider.info}</span>
              )}

              {/* Cheapest Badge */}
              {isCheapest && (
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  MAS BARATO
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Price */}
              <div className="text-right">
                <p className={`text-lg font-bold ${isCheapest ? 'text-green-600' : 'text-gray-800'}`}>
                  ${provider.price}
                </p>
                {type === 'hotel' && (
                  <p className="text-xs text-gray-500">/noche</p>
                )}
              </div>

              {/* Book Button */}
              <a
                href={provider.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCheapest
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                Reservar
              </a>
            </div>
          </div>
        );
      })}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 mt-2">
        * Precios aproximados. Veras el precio final en el sitio del proveedor.
      </p>
    </div>
  );
}

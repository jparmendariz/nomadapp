import DestinationCard from './DestinationCard';

export default function DestinationList({ destinations, onSelect, onCompare, compareList }) {
  if (destinations.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          No encontramos destinos para tu presupuesto
        </h3>
        <p className="text-gray-500">
          Intenta aumentar tu presupuesto o cambiar las fechas
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {destinations.length} destino{destinations.length !== 1 ? 's' : ''} encontrado{destinations.length !== 1 ? 's' : ''}
        </h2>
        {compareList.length > 0 && (
          <span className="text-sm text-accent-600 font-medium">
            {compareList.length}/3 seleccionados para comparar
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map(destination => (
          <DestinationCard
            key={destination.code}
            destination={destination}
            onSelect={onSelect}
            onCompare={onCompare}
            isSelected={compareList.some(d => d.code === destination.code)}
          />
        ))}
      </div>
    </div>
  );
}

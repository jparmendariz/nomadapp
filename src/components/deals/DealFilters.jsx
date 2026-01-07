const origins = [
  { code: '', name: 'Todos los origenes' },
  { code: 'MEX', name: 'Ciudad de Mexico' },
  { code: 'GDL', name: 'Guadalajara' },
  { code: 'MTY', name: 'Monterrey' },
  { code: 'CUN', name: 'Cancun' },
  { code: 'TIJ', name: 'Tijuana' }
];

export default function DealFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* Origin Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad de origen
          </label>
          <select
            value={filters.origin}
            onChange={(e) => handleChange('origin', e.target.value)}
            className="input-field"
          >
            {origins.map(origin => (
              <option key={origin.code} value={origin.code}>
                {origin.name}
              </option>
            ))}
          </select>
        </div>

        {/* Max Price Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio maximo
          </label>
          <select
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="input-field"
          >
            <option value="">Sin limite</option>
            <option value="200">Hasta $200</option>
            <option value="300">Hasta $300</option>
            <option value="500">Hasta $500</option>
            <option value="1000">Hasta $1,000</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.origin || filters.maxPrice) && (
          <div className="flex items-end">
            <button
              onClick={() => onChange({ origin: '', maxPrice: '' })}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

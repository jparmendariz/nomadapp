const cities = [
  { code: 'CUN', name: 'Cancun' },
  { code: 'MEX', name: 'Ciudad de Mexico' },
  { code: 'GDL', name: 'Guadalajara' },
  { code: 'BOG', name: 'Bogota' },
  { code: 'LIM', name: 'Lima' }
];

const types = [
  { value: '', label: 'Todos los tipos' },
  { value: 'concert', label: 'Conciertos' },
  { value: 'experience', label: 'Experiencias' }
];

export default function EventFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        {/* City Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="input-field"
          >
            {cities.map(city => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="input-field"
          >
            {types.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
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
            <option value="50">Hasta $50</option>
            <option value="100">Hasta $100</option>
            <option value="200">Hasta $200</option>
            <option value="500">Hasta $500</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(filters.type || filters.maxPrice) && (
          <div className="flex items-end">
            <button
              onClick={() => onChange({ city: filters.city, type: '', maxPrice: '' })}
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

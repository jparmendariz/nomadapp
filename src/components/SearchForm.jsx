import { useState } from 'react';

const popularOrigins = [
  { code: 'MEX', name: 'Ciudad de Mexico' },
  { code: 'GDL', name: 'Guadalajara' },
  { code: 'MTY', name: 'Monterrey' },
  { code: 'CUN', name: 'Cancun' },
  { code: 'TIJ', name: 'Tijuana' }
];

export default function SearchForm({ onSearch, loading }) {
  const [formData, setFormData] = useState({
    origin: 'MEX',
    departureDate: '',
    returnDate: '',
    budget: '',
    travelers: '1'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(formData);
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Encuentra tu proximo destino
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Origin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad de origen
          </label>
          <select
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            className="input-field"
            required
          >
            {popularOrigins.map(city => (
              <option key={city.code} value={city.code}>
                {city.name} ({city.code})
              </option>
            ))}
          </select>
        </div>

        {/* Departure Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de salida
          </label>
          <input
            type="date"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            min={today}
            className="input-field"
            required
          />
        </div>

        {/* Return Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de regreso
          </label>
          <input
            type="date"
            name="returnDate"
            value={formData.returnDate}
            onChange={handleChange}
            min={formData.departureDate || today}
            className="input-field"
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Presupuesto (USD)
          </label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="1000"
            min="100"
            className="input-field"
            required
          />
        </div>

        {/* Travelers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Viajeros
          </label>
          <select
            name="travelers"
            value={formData.travelers}
            onChange={handleChange}
            className="input-field"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num} {num === 1 ? 'viajero' : 'viajeros'}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Buscando...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Buscar destinos</span>
          </>
        )}
      </button>
    </form>
  );
}

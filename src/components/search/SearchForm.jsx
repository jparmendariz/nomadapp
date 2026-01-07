import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

// Aeropuertos principales de Mexico por estado
const mexicanAirports = [
  // Principales
  { code: 'MEX', name: 'Ciudad de Mexico (AICM)', state: 'CDMX' },
  { code: 'GDL', name: 'Guadalajara', state: 'Jalisco' },
  { code: 'MTY', name: 'Monterrey', state: 'Nuevo Leon' },
  { code: 'CUN', name: 'Cancun', state: 'Quintana Roo' },
  { code: 'TIJ', name: 'Tijuana', state: 'Baja California' },
  // Por estado
  { code: 'ACA', name: 'Acapulco', state: 'Guerrero' },
  { code: 'AGU', name: 'Aguascalientes', state: 'Aguascalientes' },
  { code: 'BJX', name: 'Leon/Guanajuato', state: 'Guanajuato' },
  { code: 'CJS', name: 'Ciudad Juarez', state: 'Chihuahua' },
  { code: 'CUL', name: 'Culiacan', state: 'Sinaloa' },
  { code: 'CUU', name: 'Chihuahua', state: 'Chihuahua' },
  { code: 'HMO', name: 'Hermosillo', state: 'Sonora' },
  { code: 'HUX', name: 'Huatulco', state: 'Oaxaca' },
  { code: 'LAP', name: 'La Paz', state: 'Baja California Sur' },
  { code: 'MID', name: 'Merida', state: 'Yucatan' },
  { code: 'MLM', name: 'Morelia', state: 'Michoacan' },
  { code: 'MZT', name: 'Mazatlan', state: 'Sinaloa' },
  { code: 'OAX', name: 'Oaxaca', state: 'Oaxaca' },
  { code: 'PVR', name: 'Puerto Vallarta', state: 'Jalisco' },
  { code: 'QRO', name: 'Queretaro', state: 'Queretaro' },
  { code: 'SJD', name: 'San Jose del Cabo', state: 'Baja California Sur' },
  { code: 'SLP', name: 'San Luis Potosi', state: 'San Luis Potosi' },
  { code: 'TGZ', name: 'Tuxtla Gutierrez', state: 'Chiapas' },
  { code: 'TRC', name: 'Torreon', state: 'Coahuila' },
  { code: 'VER', name: 'Veracruz', state: 'Veracruz' },
  { code: 'VSA', name: 'Villahermosa', state: 'Tabasco' },
  { code: 'ZIH', name: 'Zihuatanejo/Ixtapa', state: 'Guerrero' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function SearchForm({ onSearch, loading }) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    tripType: 'flight_hotel',
    origin: 'MEX',
    destination: '',
    departureDate: '',
    returnDate: '',
    flexibleDays: '0',
    noDates: false,
    budget: '',
    travelers: '1',
    hotelStars: '3'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      ...formData,
      flexibleDates: parseInt(formData.flexibleDays) > 0,
      noDates: formData.noDates
    });
  };

  const today = new Date().toISOString().split('T')[0];

  const flexibilityOptions = [
    { value: '0', label: t('search.exactDates') },
    { value: '1', label: '+/- 1 ' + (language === 'es' ? 'día' : 'day') },
    { value: '2', label: '+/- 2 ' + (language === 'es' ? 'días' : 'days') },
    { value: '3', label: '+/- 3 ' + (language === 'es' ? 'días' : 'days') },
    { value: '5', label: '+/- 5 ' + (language === 'es' ? 'días' : 'days') },
    { value: '7', label: '+/- 7 ' + (language === 'es' ? 'días' : 'days') },
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-olive-100">
      {/* Trip Type */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-olive-800 mb-3">
          {t('search.tripType')}
        </label>
        <div className="flex gap-4">
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value="flight_only"
              checked={formData.tripType === 'flight_only'}
              onChange={handleChange}
              className="sr-only"
            />
            <div className={`p-4 rounded-lg border-2 text-center transition-all ${
              formData.tripType === 'flight_only'
                ? 'border-olive-500 bg-olive-50'
                : 'border-olive-200 hover:border-olive-300'
            }`}>
              <svg className="w-8 h-8 mx-auto mb-2 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span className="font-medium text-sm text-olive-700">{t('search.flightOnly')}</span>
            </div>
          </label>
          <label className="flex-1 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              value="flight_hotel"
              checked={formData.tripType === 'flight_hotel'}
              onChange={handleChange}
              className="sr-only"
            />
            <div className={`p-4 rounded-lg border-2 text-center transition-all ${
              formData.tripType === 'flight_hotel'
                ? 'border-olive-500 bg-olive-50'
                : 'border-olive-200 hover:border-olive-300'
            }`}>
              <div className="flex justify-center gap-1 mb-2">
                <svg className="w-6 h-6 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <svg className="w-6 h-6 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-medium text-sm text-olive-700">{t('search.flightHotel')}</span>
            </div>
          </label>
        </div>
      </div>

      {/* Main Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Origin */}
        <div>
          <label className="block text-sm font-medium text-olive-800 mb-1">
            {t('search.origin')}
          </label>
          <select
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            className="input-field"
            required
          >
            {mexicanAirports.map(airport => (
              <option key={airport.code} value={airport.code}>
                {airport.name}, {airport.state}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-olive-800 mb-1">
            {t('search.budget')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-olive-500">$</span>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              placeholder="25000"
              min="1000"
              step="500"
              className="input-field pl-7"
              required
            />
          </div>
        </div>

        {/* Travelers */}
        <div>
          <label className="block text-sm font-medium text-olive-800 mb-1">
            {t('search.travelers')}
          </label>
          <select
            name="travelers"
            value={formData.travelers}
            onChange={handleChange}
            className="input-field"
          >
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>
                {num} {num === 1 ? t('search.traveler') : t('search.travelers_plural')}
              </option>
            ))}
          </select>
        </div>

        {/* No Dates Toggle */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              name="noDates"
              checked={formData.noDates}
              onChange={handleChange}
              className="w-5 h-5 rounded border-olive-300 text-olive-600 focus:ring-olive-500"
            />
            <span className="text-sm font-medium text-olive-700 group-hover:text-olive-800">
              {t('search.noDates')}
            </span>
          </label>
        </div>

        {/* Departure Date */}
        {!formData.noDates && (
          <div>
            <label className="block text-sm font-medium text-olive-800 mb-1">
              {t('search.departureDate')}
            </label>
            <input
              type="date"
              name="departureDate"
              value={formData.departureDate}
              onChange={handleChange}
              min={today}
              className="input-field"
              required={!formData.noDates}
            />
          </div>
        )}

        {/* Return Date */}
        {!formData.noDates && (
          <div>
            <label className="block text-sm font-medium text-olive-800 mb-1">
              {t('search.returnDate')}
            </label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              min={formData.departureDate || today}
              className="input-field"
              required={!formData.noDates}
            />
          </div>
        )}

        {/* Flexible Days */}
        {!formData.noDates && (
          <div>
            <label className="block text-sm font-medium text-olive-800 mb-1">
              {t('search.flexibility')}
            </label>
            <select
              name="flexibleDays"
              value={formData.flexibleDays}
              onChange={handleChange}
              className="input-field"
            >
              {flexibilityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {parseInt(formData.flexibleDays) > 0 && (
              <p className="text-xs text-olive-500 mt-1">
                {t('search.flexibleHint', { days: formData.flexibleDays })}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Hotel Stars (only if flight_hotel) */}
      {formData.tripType === 'flight_hotel' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-olive-800 mb-3">
            {t('search.hotelStars')}
          </label>
          <div className="flex gap-2">
            {['2', '3', '4', '5'].map(stars => (
              <label key={stars} className="cursor-pointer">
                <input
                  type="radio"
                  name="hotelStars"
                  value={stars}
                  checked={formData.hotelStars === stars}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  formData.hotelStars === stars
                    ? 'border-olive-500 bg-olive-50'
                    : 'border-olive-200 hover:border-olive-300'
                }`}>
                  <span className="text-amber-500">{'★'.repeat(parseInt(stars))}</span>
                  <span className="text-olive-200">{'★'.repeat(5 - parseInt(stars))}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-olive-600 hover:bg-olive-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>{t('search.searching')}</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>{t('search.searchButton')}</span>
          </>
        )}
      </button>
    </form>
  );
}

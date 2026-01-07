import CruiseCard from './CruiseCard';

export default function CruiseList({ cruises }) {
  if (!cruises || cruises.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Cruceros disponibles
          </h2>
          <p className="text-sm text-gray-500">
            Opciones de cruceros para tus fechas y presupuesto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cruises.map(cruise => (
          <CruiseCard key={cruise.id} cruise={cruise} />
        ))}
      </div>
    </div>
  );
}

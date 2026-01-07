export default function EventCard({ event }) {
  const isExperience = event.type === 'experience';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {/* Image */}
        <div className="w-1/3 h-32 relative">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400';
            }}
          />
        </div>

        {/* Content */}
        <div className="w-2/3 p-4">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
              {event.name}
            </h3>
            {event.rating && (
              <div className="flex items-center gap-1 text-xs text-amber-600 shrink-0 ml-2">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{event.rating}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mb-2">
            {event.venue} • {event.city}
          </p>

          {event.date && (
            <p className="text-xs text-primary-600 font-medium mb-2">
              {formatDate(event.date)}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="text-lg font-bold text-primary-600">${event.price}</span>
              {event.priceMax && (
                <span className="text-xs text-gray-400 ml-1">- ${event.priceMax}</span>
              )}
            </div>
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              {isExperience ? 'Reservar' : 'Comprar'}
            </a>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            via {event.provider}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-MX', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

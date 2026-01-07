export default function CruiseCard({ cruise }) {
  const {
    name,
    cruiseLine,
    ship,
    departurePort,
    nights,
    destinations,
    pricePerPerson,
    originalPrice,
    image,
    url,
    rating,
    includes
  } = cruise;

  const discount = originalPrice
    ? Math.round((1 - pricePerPerson / originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
            -{discount}%
          </div>
        )}
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Crucero
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Cruise Line & Ship */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span className="font-medium text-gray-700">{cruiseLine}</span>
          <span>-</span>
          <span>{ship}</span>
        </div>

        {/* Name */}
        <h3 className="font-semibold text-gray-800 text-lg mb-2">{name}</h3>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Sale de: <strong>{departurePort}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span><strong>{nights} noches</strong></span>
          </div>

          {destinations && destinations.length > 0 && (
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <span>Visita: {destinations.join(', ')}</span>
            </div>
          )}
        </div>

        {/* What's Included */}
        {includes && includes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {includes.slice(0, 4).map((item, idx) => (
              <span
                key={idx}
                className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 mb-3">
            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <span className="text-sm font-medium">{rating}</span>
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-end justify-between pt-3 border-t">
          <div>
            {originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                ${originalPrice}
              </span>
            )}
            <div className="text-2xl font-bold text-primary-600">
              ${pricePerPerson}
              <span className="text-sm font-normal text-gray-500">/persona</span>
            </div>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm"
          >
            Ver crucero
          </a>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWishlist } from '../../contexts/WishlistContext';

export default function DealCard({ deal, isHot = false, compact = false, currency = 'USD', convertPrice = (p) => p, onCompare, isInCompare = false }) {
  const { t, language } = useLanguage();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isFavorite = isInWishlist(deal.id);
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(deal.expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(deal.expiresAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [deal.expiresAt]);

  const isExpired = timeLeft.total <= 0;
  const isCruise = deal.type === 'cruise';
  const isHotel = deal.type === 'hotel';
  const isFlight = deal.type === 'flight';

  const price = convertPrice(deal.price || 0);
  const originalPrice = convertPrice(deal.originalPrice || 0);
  const currencySymbol = currency === 'MXN' ? 'MX$' : '$';

  // Frescura basada en timestamp del deal (30 min = recién publicada)
  const freshness = useMemo(() => {
    const dealTime = deal.createdAt ? new Date(deal.createdAt).getTime() : (parseInt(deal.id?.split('-')[1]) || Date.now());
    const minutesAgo = Math.floor((Date.now() - dealTime) / (1000 * 60));
    const hoursAgo = Math.floor(minutesAgo / 60);

    if (minutesAgo <= 30) return { text: t('deal.justPosted'), isNew: true };
    if (hoursAgo < 24) return { text: t('deal.hoursAgo', { hours: hoursAgo }), isNew: hoursAgo < 3 };
    return { text: null, isNew: false };
  }, [deal.id, deal.createdAt, t]);

  // Simular popularidad (basado en descuento)
  const viewingCount = useMemo(() => {
    return Math.floor(5 + (deal.discountPercent || 0) / 5);
  }, [deal.discountPercent]);

  // Indicador de tendencia de precio (simulado basado en descuento y frescura)
  const priceTrend = useMemo(() => {
    const discount = deal.discountPercent || 0;
    const dealTime = deal.createdAt ? new Date(deal.createdAt).getTime() : Date.now();
    const hoursAgo = Math.floor((Date.now() - dealTime) / (1000 * 60 * 60));

    // Ofertas recientes con alto descuento = precio bajó
    if (discount >= 40 && hoursAgo < 6) {
      return { trend: 'down', text: t('price.dropped'), color: 'text-green-600', bg: 'bg-green-50' };
    }
    // Descuento medio = estable
    if (discount >= 20) {
      return { trend: 'stable', text: t('price.stable'), color: 'text-gray-500', bg: 'bg-gray-50' };
    }
    // Bajo descuento en oferta vieja = podría subir
    if (hoursAgo > 12) {
      return { trend: 'up', text: t('price.increased'), color: 'text-orange-500', bg: 'bg-orange-50' };
    }
    return { trend: 'stable', text: t('price.stable'), color: 'text-gray-500', bg: 'bg-gray-50' };
  }, [deal.discountPercent, deal.createdAt, t]);

  // Toggle favoritos
  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromWishlist(deal.id);
    } else {
      addToWishlist(deal);
    }
  };

  // Compartir oferta
  const handleShare = async () => {
    const shareData = {
      title: `${deal.discountPercent}% OFF - ${getTitle(deal)}`,
      text: `${t('deal.shareText')} ${currencySymbol}${price.toLocaleString()} (${t('deal.before')} ${currencySymbol}${originalPrice.toLocaleString()})`,
      url: deal.dealUrl || window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        alert(t('deal.linkCopied'));
      }
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  // Obtener titulo y subtitulo segun tipo
  const getInfo = () => {
    if (isCruise) {
      return {
        subtitle: `${deal.nights || 0} ${t('deal.nights')}`,
        title: deal.destinations?.join(' - ') || deal.name || t('deal.cruise')
      };
    }
    if (isHotel) {
      return {
        subtitle: `${deal.location || 'Mexico'} - ${deal.nights || 0} ${t('deal.nights')}`,
        title: deal.name || t('deal.hotel')
      };
    }
    return {
      subtitle: deal.originName || 'Mexico',
      title: deal.destinationName || 'Destino'
    };
  };

  const info = getInfo();

  // Compact layout para ofertas regulares
  if (compact) {
    return (
      <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow ${isExpired ? 'opacity-60' : ''}`}>
        {/* Imagen */}
        <div className="relative h-28 sm:h-32 rounded-t-xl overflow-hidden">
          <img
            src={deal.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
            alt={info.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
            }}
          />
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
            -{deal.discountPercent || 0}%
          </div>
          {/* Badge de tipo */}
          <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium text-white ${
            isCruise ? 'bg-blue-600' : isHotel ? 'bg-purple-600' : 'bg-olive-600'
          }`}>
            {isCruise ? t('deal.cruise') : isHotel ? t('deal.hotel') : t('deal.flight')}
          </div>
          {/* Indicador de frescura */}
          {freshness.isNew && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {freshness.text}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-0.5 truncate">{info.subtitle}</p>
          <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{info.title}</h3>

          {/* Popularidad */}
          <p className="text-xs text-orange-500 mt-1">
            {t('deal.peopleViewing', { count: viewingCount })}
          </p>

          {/* Precio */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-olive-600">
                {currencySymbol}{price.toLocaleString()}
              </p>
              {/* Indicador de tendencia */}
              {priceTrend.trend === 'down' && (
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs ${priceTrend.color} ${priceTrend.bg}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" transform="rotate(180 10 10)" />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              <span className="line-through">{currencySymbol}{originalPrice.toLocaleString()}</span>
              {!isExpired && (
                <span className="text-orange-600 ml-2">{timeLeft.hours}h {timeLeft.minutes}m</span>
              )}
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-1 mt-2">
            <a
              href={deal.dealUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 text-center bg-olive-600 hover:bg-olive-700 text-white text-sm py-1.5 rounded-lg transition-colors ${isExpired ? 'pointer-events-none opacity-50' : ''}`}
            >
              {t('deal.viewDeal')}
            </a>
            <button
              onClick={handleToggleFavorite}
              className={`px-2 py-1.5 rounded-lg transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-olive-600 hover:bg-olive-100'}`}
              title={t('nav.wishlist')}
            >
              <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            {onCompare && (
              <button
                onClick={() => onCompare(deal)}
                className={`px-2 py-1.5 rounded-lg transition-colors ${isInCompare ? 'text-blue-500 bg-blue-50' : 'text-olive-600 hover:bg-olive-100'}`}
                title={t('compare.add')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
            )}
            <button
              onClick={handleShare}
              className="px-2 py-1.5 text-olive-600 hover:bg-olive-100 rounded-lg transition-colors"
              title={t('deal.share')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full layout para hot deals
  return (
    <div className={`bg-white rounded-xl shadow-lg ${isHot ? 'ring-2 ring-red-400' : ''} ${isExpired ? 'opacity-60' : ''}`}>
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="sm:w-2/5 h-40 sm:h-auto relative rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none overflow-hidden">
          <img
            src={deal.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400'}
            alt={info.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
            }}
          />
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            {isHot && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
            )}
            -{deal.discountPercent || 0}%
          </div>
          {/* Badge de tipo */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium text-white ${
            isCruise ? 'bg-blue-600' : isHotel ? 'bg-purple-600' : 'bg-olive-600'
          }`}>
            {isCruise ? t('deal.cruise') : isHotel ? t('deal.hotel') : t('deal.flight')}
          </div>
          {/* Indicador de frescura */}
          {freshness.isNew && (
            <div className="absolute bottom-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              {freshness.text}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="sm:w-3/5 p-4 sm:p-5">
          {/* Info segun tipo */}
          {isCruise && (
            <>
              <p className="text-sm text-gray-500 mb-1">
                {deal.cruiseLine || t('deal.cruise')} - {deal.nights || 0} {t('deal.nights')} {t('deal.from').toLowerCase()} {deal.departurePort || 'Puerto'}
              </p>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{info.title}</h3>
              {deal.cabinType && (
                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mb-2">
                  {t('deal.cabin')} <em>{deal.cabinType}</em>
                </span>
              )}
            </>
          )}

          {isHotel && (
            <>
              <p className="text-sm text-gray-500 mb-1">
                {deal.location || 'Mexico'} - {deal.nights || 0} {t('deal.nights')}
              </p>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{info.title}</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[...Array(deal.stars || 4)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {deal.amenities && (
                  <span className="text-xs text-gray-500">
                    <em>{deal.amenities.slice(0, 2).join(' - ')}</em>
                  </span>
                )}
              </div>
            </>
          )}

          {isFlight && (
            <>
              <p className="text-sm text-gray-500 mb-1">{t('deal.from')} {deal.originName || 'Mexico'}</p>
              <h3 className="font-bold text-gray-800 text-lg mb-2">{info.title}</h3>
              {deal.region && (
                <span className="inline-block bg-olive-100 text-olive-700 text-xs px-2 py-0.5 rounded-full mb-2 capitalize">
                  {deal.region}
                </span>
              )}
            </>
          )}

          {/* Popularidad */}
          <p className="text-sm text-orange-500 mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            {t('deal.peopleViewing', { count: viewingCount })}
          </p>

          {/* Precio */}
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-2xl sm:text-3xl font-bold text-olive-600">
                {currencySymbol}{price.toLocaleString()}
              </p>
              {/* Indicador de tendencia */}
              {priceTrend.trend !== 'stable' && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priceTrend.color} ${priceTrend.bg}`}>
                  {priceTrend.trend === 'down' ? (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  {priceTrend.text}
                </span>
              )}
              <span className="text-xs sm:text-sm font-normal text-gray-500">
                {currency} {isCruise || isHotel ? t('deal.perPerson') : t('deal.roundTrip')}
              </span>
            </div>
            <p className="text-base text-gray-400 line-through">
              {currencySymbol}{originalPrice.toLocaleString()}
            </p>
          </div>

          {/* Timer */}
          {!isExpired ? (
            <div className="flex items-center gap-2 mb-3 text-orange-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">
                {t('deal.expiresIn')} {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-3 text-gray-500">
              <span className="text-sm font-medium">{t('deal.expired')}</span>
            </div>
          )}

          {/* Fechas de viaje */}
          {deal.travelDatesStart && (
            <p className="text-xs text-gray-500 mb-3">
              {t('deal.travel')} {formatDate(deal.travelDatesStart, language)} - {formatDate(deal.travelDatesEnd, language)}
            </p>
          )}
          {deal.checkIn && (
            <p className="text-xs text-gray-500 mb-3">
              {t('deal.checkIn')} {formatDate(deal.checkIn, language)}
            </p>
          )}
          {deal.departureDate && isCruise && (
            <p className="text-xs text-gray-500 mb-3">
              {t('deal.sailsOn')} {formatDate(deal.departureDate, language)}
            </p>
          )}

          {/* Botones */}
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={deal.dealUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 bg-olive-600 hover:bg-olive-700 text-white font-medium py-2 px-4 rounded-lg transition-colors ${isExpired ? 'pointer-events-none opacity-50' : ''}`}
            >
              {t('deal.viewDeal')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={handleToggleFavorite}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-olive-600 hover:bg-olive-100'}`}
              title={t('nav.wishlist')}
            >
              <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            {onCompare && (
              <button
                onClick={() => onCompare(deal)}
                className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${isInCompare ? 'text-blue-500 bg-blue-50' : 'text-olive-600 hover:bg-olive-100'}`}
                title={t('compare.add')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {t('compare.add')}
              </button>
            )}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 px-3 py-2 text-olive-600 hover:bg-olive-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {t('deal.share')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTitle(deal) {
  if (deal.type === 'cruise') return deal.destinations?.join(' - ') || deal.name;
  if (deal.type === 'hotel') return deal.name;
  return deal.destinationName;
}

function getTimeLeft(expiresAt) {
  const total = new Date(expiresAt) - new Date();

  if (total <= 0) {
    return { total: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    total,
    hours: Math.floor(total / (1000 * 60 * 60)),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60)
  };
}

function formatDate(dateStr, language = 'es') {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const locale = language === 'en' ? 'en-US' : 'es-MX';
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

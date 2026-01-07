import { useLanguage } from '../../contexts/LanguageContext';

export default function DealComparator({ deals, onRemove, onClose, currency = 'USD', convertPrice = (p) => p }) {
  const { t } = useLanguage();
  const currencySymbol = currency === 'MXN' ? 'MX$' : '$';

  if (deals.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-40">
      <div className="bg-white rounded-xl shadow-2xl border border-olive-200 p-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-olive-800">{t('compare.title')} ({deals.length}/3)</h3>
          <button
            onClick={onClose}
            className="text-olive-400 hover:text-olive-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-olive-100">
                <th className="text-left py-2 pr-4 text-olive-500 font-medium">{t('compare.destination')}</th>
                {deals.map(deal => (
                  <th key={deal.id} className="text-center py-2 px-3 min-w-[140px]">
                    <div className="relative">
                      <button
                        onClick={() => onRemove(deal)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <span className="font-semibold text-olive-800 text-xs line-clamp-2">
                        {deal.destinationName || deal.location || deal.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-olive-50">
                <td className="py-2 pr-4 text-olive-500">{t('compare.price')}</td>
                {deals.map(deal => (
                  <td key={deal.id} className="text-center py-2 px-3">
                    <span className="font-bold text-olive-700">
                      {currencySymbol}{convertPrice(deal.price).toLocaleString()}
                    </span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-olive-50">
                <td className="py-2 pr-4 text-olive-500">{t('compare.discount')}</td>
                {deals.map(deal => (
                  <td key={deal.id} className="text-center py-2 px-3">
                    <span className="text-red-500 font-medium">-{deal.discountPercent}%</span>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-olive-50">
                <td className="py-2 pr-4 text-olive-500">{t('compare.duration')}</td>
                {deals.map(deal => (
                  <td key={deal.id} className="text-center py-2 px-3">
                    {deal.nights ? `${deal.nights} ${t('deal.nights')}` : '-'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 pr-4 text-olive-500"></td>
                {deals.map(deal => (
                  <td key={deal.id} className="text-center py-2 px-3">
                    <a
                      href={deal.dealUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-olive-600 hover:bg-olive-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors"
                    >
                      {t('deal.viewDeal')}
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

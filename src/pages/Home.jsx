import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {t('home.title')}
          <span className="text-primary-500"> {t('home.titleAccent')}</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('home.subtitle')}
        </p>
      </div>

      {/* Main Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {/* Search */}
        <Link
          to="/search"
          className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-500"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500 transition-colors">
              <svg className="w-8 h-8 text-primary-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('home.searchCard')}</h2>
            <p className="text-gray-500 text-sm">
              {t('home.searchDesc')}
            </p>
          </div>
        </Link>

        {/* Flash Deals */}
        <Link
          to="/deals"
          className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-accent-500"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-500 transition-colors">
              <svg className="w-8 h-8 text-accent-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('home.dealsCard')}</h2>
            <p className="text-gray-500 text-sm">
              {t('home.dealsDesc')}
            </p>
          </div>
        </Link>

        {/* Events */}
        <Link
          to="/events"
          className="group bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500 transition-colors">
              <svg className="w-8 h-8 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('home.eventsCard')}</h2>
            <p className="text-gray-500 text-sm">
              {t('home.eventsDesc')}
            </p>
          </div>
        </Link>
      </div>

      {/* Trust indicators */}
      <div className="mt-16 text-center">
        <p className="text-sm text-gray-400 mb-4">{t('home.trustText')}</p>
        <div className="flex flex-wrap justify-center gap-6 text-gray-400">
          <span className="font-medium">Skyscanner</span>
          <span className="font-medium">Kiwi</span>
          <span className="font-medium">Booking</span>
          <span className="font-medium">Expedia</span>
          <span className="font-medium">Viator</span>
        </div>
      </div>
    </div>
  );
}

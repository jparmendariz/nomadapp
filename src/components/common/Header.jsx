import { Link, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import UserMenu from '../auth/UserMenu';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id';

export default function Header() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, loginWithGoogle, isLoading } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    await loginWithGoogle(credentialResponse.credential);
  };

  const navItems = [
    { path: '/', label: t('nav.deals'), iconType: 'flash' },
    { path: '/buscar', label: t('nav.search'), iconType: 'search' },
    { path: '/eventos', label: t('nav.events'), iconType: 'ticket' },
    { path: '/calendario', label: t('nav.calendar'), iconType: 'calendar' }
  ];

  return (
    <header className="bg-olive-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/assets/isotipo-dark.svg"
              alt="Nomad"
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-olive-100">
              nomad
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  location.pathname === item.path
                    ? 'bg-olive-700 text-olive-100'
                    : 'text-olive-300 hover:bg-olive-700 hover:text-olive-100'
                }`}
              >
                <NavIcon type={item.iconType} />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Map + Alerts + Favorites + Language Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Map */}
            <Link
              to="/mapa"
              className={`relative p-2 rounded-lg transition-colors ${
                location.pathname === '/mapa'
                  ? 'bg-olive-700 text-olive-100'
                  : 'text-olive-300 hover:bg-olive-700 hover:text-olive-100'
              }`}
              title={t('nav.map')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </Link>

            {/* Alerts */}
            <Link
              to="/alertas"
              className={`relative p-2 rounded-lg transition-colors ${
                location.pathname === '/alertas'
                  ? 'bg-olive-700 text-olive-100'
                  : 'text-olive-300 hover:bg-olive-700 hover:text-olive-100'
              }`}
              title={t('nav.alerts')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </Link>

            {/* Favorites */}
            <Link
              to="/favoritos"
              className={`relative p-2 rounded-lg transition-colors ${
                location.pathname === '/favoritos'
                  ? 'bg-olive-700 text-olive-100'
                  : 'text-olive-300 hover:bg-olive-700 hover:text-olive-100'
              }`}
              title={t('nav.wishlist')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>

            {/* Language Toggle */}
            <div className="flex bg-olive-700 rounded-lg p-0.5">
              <button
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  language === 'es'
                    ? 'bg-olive-100 text-olive-800'
                    : 'text-olive-300 hover:text-olive-100'
                }`}
              >
                ES
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-olive-100 text-olive-800'
                    : 'text-olive-300 hover:text-olive-100'
                }`}
              >
                EN
              </button>
            </div>

            {/* Auth: Login Button or User Menu */}
            <div className="border-l border-olive-600 pl-3 ml-1">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log('Login failed')}
                    type="icon"
                    shape="circle"
                    theme="filled_black"
                    size="medium"
                  />
                </GoogleOAuthProvider>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <MobileNav navItems={navItems} currentPath={location.pathname} language={language} setLanguage={setLanguage} />
          </div>
        </div>
      </div>
    </header>
  );
}

function NavIcon({ type }) {
  const icons = {
    search: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    flash: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    ticket: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    calendar: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    heart: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  };
  return icons[type] || null;
}

function MobileNav({ navItems, currentPath, language, setLanguage }) {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-olive-800 border-t border-olive-700 md:hidden z-50">
      <nav className="flex justify-around py-2">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center px-3 py-1 ${
              currentPath === item.path
                ? 'text-olive-100'
                : 'text-olive-400'
            }`}
          >
            <NavIcon type={item.iconType} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
        {/* Profile or Language toggle in mobile */}
        {isAuthenticated ? (
          <Link
            to="/perfil"
            className={`flex flex-col items-center px-3 py-1 ${
              currentPath === '/perfil' ? 'text-olive-100' : 'text-olive-400'
            }`}
          >
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="w-5 h-5 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        ) : (
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex flex-col items-center px-3 py-1 text-olive-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-xs mt-1">{language.toUpperCase()}</span>
          </button>
        )}
      </nav>
    </div>
  );
}

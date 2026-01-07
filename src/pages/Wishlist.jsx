import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useLanguage } from '../contexts/LanguageContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import DealCard from '../components/deals/DealCard';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id';

export default function Wishlist() {
  const { t, language } = useLanguage();
  const { wishlist, clearWishlist, wishlistCount } = useWishlist();
  const { isAuthenticated, loginWithGoogle, user } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    await loginWithGoogle(credentialResponse.credential);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const locale = language === 'en' ? 'en-US' : 'es-MX';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-olive-800 mb-2">{t('wishlist.title')}</h1>
          <p className="text-olive-600">{t('wishlist.subtitle')}</p>
        </div>
        {wishlistCount > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-olive-600">{t('wishlist.count', { count: wishlistCount })}</span>
            <button
              onClick={clearWishlist}
              className="text-red-500 hover:text-red-600 text-sm underline"
            >
              {t('wishlist.clearAll')}
            </button>
          </div>
        )}
      </div>

      {/* Login Prompt */}
      {!isAuthenticated && wishlistCount > 0 && (
        <div className="bg-olive-50 border border-olive-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-olive-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <p className="font-medium text-olive-800">{t('wishlist.loginToSave')}</p>
                <p className="text-sm text-olive-600">{t('wishlist.loginToSaveDesc')}</p>
              </div>
            </div>
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login failed')}
                theme="filled_black"
                size="large"
                text="continue_with"
                shape="rectangular"
              />
            </GoogleOAuthProvider>
          </div>
        </div>
      )}

      {/* Wishlist Grid */}
      {wishlistCount > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(deal => (
            <div key={deal.id} className="relative">
              <DealCard deal={deal} currency="USD" convertPrice={(p) => p} />
              <div className="absolute bottom-2 left-2 bg-white/90 rounded px-2 py-1 text-xs text-olive-500">
                {t('wishlist.addedOn')} {formatDate(deal.addedAt)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-olive-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-xl font-medium text-olive-700 mb-2">{t('wishlist.empty')}</h2>
          <p className="text-olive-500">{t('wishlist.emptyDesc')}</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAlerts } from '../contexts/AlertsContext';
import DealCard from '../components/deals/DealCard';

const TABS = ['saved', 'recommended', 'alerts', 'settings'];

export default function Profile() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading, updatePreferences, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();
  const { alerts, removeAlert, toggleAlert } = useAlerts();

  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return TABS.includes(tab) ? tab : 'saved';
  });

  const [preferences, setPreferences] = useState({
    language: user?.language || 'es',
    currency: user?.currency || 'USD',
    notificationsEnabled: user?.notificationsEnabled ?? true
  });

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== 'saved') {
      setSearchParams({ tab: activeTab });
    } else {
      setSearchParams({});
    }
  }, [activeTab, setSearchParams]);

  // Update preferences when user changes
  useEffect(() => {
    if (user) {
      setPreferences({
        language: user.language || 'es',
        currency: user.currency || 'USD',
        notificationsEnabled: user.notificationsEnabled ?? true
      });
    }
  }, [user]);

  // Get recommended deals based on activity
  const recommendations = useMemo(() => {
    const activities = JSON.parse(localStorage.getItem('nomad-activity') || '[]');
    const viewedDealIds = activities
      .filter(a => a.activityType === 'view')
      .map(a => a.dealId);

    // For demo, return some mock recommendations based on wishlist patterns
    // In production, this would come from the backend
    const mockRecommendations = wishlist.slice(0, 3).map(deal => ({
      ...deal,
      id: `rec-${deal.id}`,
      recommended: true
    }));

    return mockRecommendations;
  }, [wishlist]);

  const handleSavePreferences = async () => {
    await updatePreferences(preferences);
    if (preferences.language !== language) {
      setLanguage(preferences.language);
    }
  };

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-600"></div>
      </div>
    );
  }

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es-MX', {
        month: 'long',
        year: 'numeric'
      })
    : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-olive-700 to-olive-800 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-olive-500"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-olive-600 flex items-center justify-center text-3xl font-bold border-4 border-olive-500">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}

          {/* User Info */}
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{user?.name}</h1>
            <p className="text-olive-200 mb-2">{user?.email}</p>
            <p className="text-olive-300 text-sm">
              {t('profile.memberSince')} {memberSince}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{wishlistCount}</p>
              <p className="text-olive-300 text-sm">{t('profile.saved')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{alerts.length}</p>
              <p className="text-olive-300 text-sm">{t('profile.alerts')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-olive-200 mb-6">
        <nav className="flex gap-2 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-olive-600 text-olive-800'
                  : 'border-transparent text-olive-500 hover:text-olive-700 hover:border-olive-300'
              }`}
            >
              {t(`profile.tabs.${tab}`)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'saved' && (
          <SavedDealsTab
            wishlist={wishlist}
            wishlistCount={wishlistCount}
            removeFromWishlist={removeFromWishlist}
            t={t}
            language={language}
          />
        )}

        {activeTab === 'recommended' && (
          <RecommendedTab
            recommendations={recommendations}
            t={t}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab
            alerts={alerts}
            removeAlert={removeAlert}
            toggleAlert={toggleAlert}
            t={t}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            preferences={preferences}
            setPreferences={setPreferences}
            handleSavePreferences={handleSavePreferences}
            logout={logout}
            t={t}
          />
        )}
      </div>
    </div>
  );
}

// Saved Deals Tab
function SavedDealsTab({ wishlist, wishlistCount, removeFromWishlist, t, language }) {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const locale = language === 'en' ? 'en-US' : 'es-MX';
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  if (wishlistCount === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 mx-auto text-olive-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h3 className="text-lg font-medium text-olive-700 mb-2">{t('profile.noSaved')}</h3>
        <p className="text-olive-500 mb-4">{t('profile.noSavedDesc')}</p>
        <Link to="/ofertas" className="inline-flex items-center gap-2 text-olive-600 hover:text-olive-800 font-medium">
          {t('profile.exploreDeals')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
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
  );
}

// Recommended Tab
function RecommendedTab({ recommendations, t }) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 mx-auto text-olive-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h3 className="text-lg font-medium text-olive-700 mb-2">{t('profile.noRecommendations')}</h3>
        <p className="text-olive-500 mb-4">{t('profile.noRecommendationsDesc')}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-olive-600 hover:text-olive-800 font-medium">
          {t('profile.startSearching')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-olive-600 mb-4">{t('profile.recommendationsDesc')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(deal => (
          <div key={deal.id} className="relative">
            <DealCard deal={deal} currency="USD" convertPrice={(p) => p} />
            <div className="absolute top-2 left-2 bg-olive-600 text-white rounded px-2 py-1 text-xs font-medium">
              {t('profile.recommended')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Alerts Tab
function AlertsTab({ alerts, removeAlert, toggleAlert, t }) {
  if (alerts.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 mx-auto text-olive-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="text-lg font-medium text-olive-700 mb-2">{t('alerts.empty')}</h3>
        <p className="text-olive-500 mb-4">{t('alerts.emptyDesc')}</p>
        <Link to="/alertas" className="inline-flex items-center gap-2 text-olive-600 hover:text-olive-800 font-medium">
          {t('alerts.create')}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`bg-white border rounded-xl p-4 flex items-center justify-between ${
            alert.active ? 'border-olive-200' : 'border-gray-200 opacity-60'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              alert.active ? 'bg-olive-100 text-olive-600' : 'bg-gray-100 text-gray-400'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-olive-800">{alert.destination}</p>
              <p className="text-sm text-olive-500">
                {t('alerts.maxPrice')}: ${alert.maxPrice}
                {alert.origin && ` - ${t('alerts.from')} ${alert.origin}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAlert(alert.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                alert.active
                  ? 'bg-olive-100 text-olive-700 hover:bg-olive-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {alert.active ? t('alerts.pause') : t('alerts.activate')}
            </button>
            <button
              onClick={() => removeAlert(alert.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      ))}
      <Link
        to="/alertas"
        className="flex items-center justify-center gap-2 border-2 border-dashed border-olive-300 rounded-xl p-4 text-olive-600 hover:border-olive-400 hover:text-olive-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        {t('alerts.create')}
      </Link>
    </div>
  );
}

// Settings Tab
function SettingsTab({ preferences, setPreferences, handleSavePreferences, logout, t }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await handleSavePreferences();
    setIsSaving(false);
  };

  return (
    <div className="max-w-xl">
      <div className="space-y-6">
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-olive-700 mb-2">
            {t('profile.settings.language')}
          </label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="w-full border border-olive-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
          >
            <option value="es">Espanol</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-olive-700 mb-2">
            {t('profile.settings.currency')}
          </label>
          <select
            value={preferences.currency}
            onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
            className="w-full border border-olive-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
          >
            <option value="USD">USD ($)</option>
            <option value="MXN">MXN ($)</option>
            <option value="EUR">EUR (E)</option>
          </select>
        </div>

        {/* Notifications */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notificationsEnabled}
              onChange={(e) => setPreferences({ ...preferences, notificationsEnabled: e.target.checked })}
              className="w-5 h-5 text-olive-600 border-olive-300 rounded focus:ring-olive-500"
            />
            <span className="text-sm font-medium text-olive-700">
              {t('profile.settings.notifications')}
            </span>
          </label>
          <p className="text-sm text-olive-500 mt-1 ml-8">
            {t('profile.settings.notificationsDesc')}
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-olive-600 text-white font-medium py-3 rounded-lg hover:bg-olive-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? t('auth.loading') : t('profile.settings.save')}
        </button>

        {/* Logout */}
        <div className="border-t border-olive-200 pt-6">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-medium py-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

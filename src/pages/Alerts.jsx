import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useLanguage } from '../contexts/LanguageContext';
import { useAlerts } from '../contexts/AlertsContext';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id';

export default function Alerts() {
  const { t } = useLanguage();
  const { alerts, createAlert, deleteAlert, toggleAlert, requestNotificationPermission, notificationPermission } = useAlerts();
  const { isAuthenticated, loginWithGoogle, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    destination: '',
    maxPrice: '',
    origin: ''
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    await loginWithGoogle(credentialResponse.credential);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.destination && !formData.maxPrice) return;

    createAlert({
      destination: formData.destination || null,
      maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : null,
      origin: formData.origin || null
    });

    setFormData({ destination: '', maxPrice: '', origin: '' });
    setShowForm(false);
  };

  const handleEnableNotifications = async () => {
    await requestNotificationPermission();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-olive-700 to-olive-600 rounded-2xl p-6 md:p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('alerts.title')}</h1>
            <p className="text-olive-100">{t('alerts.subtitle')}</p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-white text-olive-700 px-4 py-2 rounded-lg font-medium hover:bg-olive-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('alerts.create')}
            </button>
          )}
        </div>
      </div>

      {/* Login Required Banner */}
      {!isAuthenticated && (
        <div className="bg-olive-50 border border-olive-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-olive-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-olive-800">{t('alerts.loginRequired')}</p>
                <p className="text-sm text-olive-600">{t('alerts.loginRequiredDesc')}</p>
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

      {/* Notification Permission Banner */}
      {isAuthenticated && notificationPermission !== 'granted' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">{t('alerts.enableNotifications')}</p>
              <p className="text-sm text-yellow-600">{t('alerts.enableDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
          >
            {t('alerts.enable')}
          </button>
        </div>
      )}

      {/* Create Alert Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-olive-800">{t('alerts.createNew')}</h2>
                <button onClick={() => setShowForm(false)} className="text-olive-400 hover:text-olive-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-1">
                    {t('alerts.destination')}
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    placeholder={t('alerts.destinationPlaceholder')}
                    className="w-full px-4 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-1">
                    {t('alerts.maxPrice')} (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
                    placeholder="500"
                    className="w-full px-4 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-olive-700 mb-1">
                    {t('alerts.origin')} ({t('common.optional')})
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    placeholder={t('alerts.originPlaceholder')}
                    className="w-full px-4 py-2 border border-olive-200 rounded-lg focus:ring-2 focus:ring-olive-500 focus:border-olive-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-olive-200 text-olive-700 rounded-lg hover:bg-olive-50 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-olive-600 text-white rounded-lg hover:bg-olive-700 transition-colors"
                  >
                    {t('alerts.create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl shadow-md p-4 border-l-4 ${
                alert.active ? 'border-olive-500' : 'border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className={`w-5 h-5 ${alert.active ? 'text-olive-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className={`text-sm font-medium ${alert.active ? 'text-olive-600' : 'text-gray-500'}`}>
                      {alert.active ? t('alerts.active') : t('alerts.paused')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {alert.destination && (
                      <p className="text-olive-800">
                        <span className="font-medium">{t('alerts.destination')}:</span> {alert.destination}
                      </p>
                    )}
                    {alert.maxPrice && (
                      <p className="text-olive-800">
                        <span className="font-medium">{t('alerts.maxPrice')}:</span> ${alert.maxPrice} USD
                      </p>
                    )}
                    {alert.origin && (
                      <p className="text-olive-800">
                        <span className="font-medium">{t('alerts.origin')}:</span> {alert.origin}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-olive-400 mt-2">
                    {t('alerts.created')}: {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.active
                        ? 'text-olive-600 hover:bg-olive-100'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={alert.active ? t('alerts.pause') : t('alerts.activate')}
                  >
                    {alert.active ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('common.delete')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-olive-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h2 className="text-xl font-medium text-olive-700 mb-2">{t('alerts.empty')}</h2>
          <p className="text-olive-500 mb-6">{t('alerts.emptyDesc')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-olive-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-olive-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('alerts.createFirst')}
          </button>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-olive-50 rounded-xl p-6">
        <h3 className="font-semibold text-olive-800 mb-3">{t('alerts.howItWorks')}</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-olive-600">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-olive-200 rounded-full flex items-center justify-center shrink-0">
              <span className="font-bold text-olive-700">1</span>
            </div>
            <div>
              <strong className="block text-olive-700">{t('alerts.step1Title')}</strong>
              {t('alerts.step1Desc')}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-olive-200 rounded-full flex items-center justify-center shrink-0">
              <span className="font-bold text-olive-700">2</span>
            </div>
            <div>
              <strong className="block text-olive-700">{t('alerts.step2Title')}</strong>
              {t('alerts.step2Desc')}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-olive-200 rounded-full flex items-center justify-center shrink-0">
              <span className="font-bold text-olive-700">3</span>
            </div>
            <div>
              <strong className="block text-olive-700">{t('alerts.step3Title')}</strong>
              {t('alerts.step3Desc')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

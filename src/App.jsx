import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { AlertsProvider } from './contexts/AlertsContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/common/Header';
import Search from './pages/Search';
import Deals from './pages/Deals';
import Wishlist from './pages/Wishlist';
import Alerts from './pages/Alerts';
import Map from './pages/Map';
import Profile from './pages/Profile';

function AppContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-sand font-outfit">
      <Header />

      <main className="pb-20 md:pb-8">
        <Routes>
          <Route path="/" element={<Deals />} />
          <Route path="/buscar" element={<Search />} />
          <Route path="/favoritos" element={<Wishlist />} />
          <Route path="/alertas" element={<Alerts />} />
          <Route path="/mapa" element={<Map />} />
          <Route path="/perfil" element={<Profile />} />
        </Routes>
      </main>

      <footer className="hidden md:block bg-white border-t border-olive-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-olive-600 text-sm">
          <p>{t('footer.brand')}</p>
          <p className="mt-2 text-xs text-olive-400">
            {t('footer.disclaimer')}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WishlistProvider>
          <AlertsProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AlertsProvider>
        </WishlistProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

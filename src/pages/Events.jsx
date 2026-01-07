import { useState, useEffect } from 'react';
import EventList from '../components/events/EventList';
import EventFilters from '../components/events/EventFilters';
import Loading from '../components/common/Loading';
import { getEvents } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function Events() {
  const { t } = useLanguage();
  const [events, setEvents] = useState({ concerts: [], experiences: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    city: 'CUN', // Default to Cancun
    type: '',
    maxPrice: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    if (!filters.city) {
      setEvents({ concerts: [], experiences: [] });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getEvents({
        city: filters.city,
        type: filters.type || undefined,
        maxPrice: filters.maxPrice || undefined
      });

      // La API retorna eventos organizados o como array
      if (response.events) {
        if (Array.isArray(response.events)) {
          setEvents({
            concerts: response.events.filter(e => e.type === 'concert'),
            experiences: response.events.filter(e => e.type === 'experience')
          });
        } else {
          setEvents({
            concerts: response.events.concerts || [],
            experiences: response.events.experiences || []
          });
        }
      } else {
        setEvents({ concerts: [], experiences: [] });
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  // Refetch when filters change
  useEffect(() => {
    fetchEvents();
  }, [filters.city, filters.type, filters.maxPrice]);

  const concerts = events.concerts || [];
  const experiences = events.experiences || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-700 px-4 py-2 rounded-full mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <span className="font-medium">{t('events.badge')}</span>
        </div>
        <h1 className="text-3xl font-bold text-olive-800 mb-2">
          {t('events.title')}
        </h1>
        <p className="text-olive-600">
          {t('events.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <EventFilters filters={filters} onChange={setFilters} />

      {/* Loading */}
      {loading && <Loading />}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="bg-red-50 text-red-600 px-6 py-4 rounded-lg inline-block">
            <p>{error}</p>
            <button
              onClick={fetchEvents}
              className="mt-2 text-sm underline hover:no-underline"
            >
              {t('common.retry')}
            </button>
          </div>
        </div>
      )}

      {/* Concerts Section */}
      {!loading && !error && concerts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-olive-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            {t('events.concerts')}
          </h2>
          <EventList events={concerts} />
        </div>
      )}

      {/* Experiences Section */}
      {!loading && !error && experiences.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-olive-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('events.experiences')}
          </h2>
          <EventList events={experiences} />
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && concerts.length === 0 && experiences.length === 0 && (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto text-olive-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
          <h2 className="text-xl font-medium text-olive-700 mb-2">
            {t('events.noEvents')}
          </h2>
          <p className="text-olive-500">
            {t('events.tryFilters')}
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-olive-50 rounded-xl p-6">
        <h3 className="font-semibold text-olive-800 mb-2">{t('events.providers')}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-olive-600">
          <span className="bg-white px-3 py-1 rounded-full border border-olive-200">Ticketmaster</span>
          <span className="bg-white px-3 py-1 rounded-full border border-olive-200">Viator</span>
          <span className="bg-white px-3 py-1 rounded-full border border-olive-200">GetYourGuide</span>
          <span className="bg-white px-3 py-1 rounded-full border border-olive-200">Eventbrite</span>
        </div>
      </div>
    </div>
  );
}

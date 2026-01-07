import { useState, useCallback } from 'react';
import { searchDestinations } from '../services/api';

export function useSearch() {
  const [results, setResults] = useState([]);
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState(null);

  const search = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    setSearchParams(params);

    try {
      const data = await searchDestinations(params);
      setResults(data.destinations || []);
      setCruises(data.cruises || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.error || 'Error al buscar destinos. Intenta de nuevo.');
      setResults([]);
      setCruises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setCruises([]);
    setError(null);
    setSearchParams(null);
  }, []);

  return {
    results,
    cruises,
    loading,
    error,
    searchParams,
    search,
    clearResults
  };
}

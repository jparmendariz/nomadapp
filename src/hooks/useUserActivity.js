import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

const ACTIVITY_KEY = 'nomad-activity';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_ACTIVITIES = 100;

/**
 * Hook for tracking user activity to power recommendations
 *
 * Activity types:
 * - search: User searched for a destination
 * - view: User viewed a deal
 * - click: User clicked to view deal details/external link
 * - favorite: User added deal to wishlist
 * - region: User browsed a specific region
 */
export function useUserActivity() {
  const { token, isAuthenticated } = useAuth();
  const syncTimeoutRef = useRef(null);

  // Get activities from localStorage
  const getActivities = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]');
    } catch {
      return [];
    }
  }, []);

  // Save activities to localStorage
  const saveActivities = useCallback((activities) => {
    // Keep only the last MAX_ACTIVITIES
    const trimmed = activities.slice(-MAX_ACTIVITIES);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmed));
  }, []);

  // Track an activity
  const trackActivity = useCallback((activityType, data) => {
    const activity = {
      activityType,
      ...data,
      timestamp: Date.now()
    };

    const activities = getActivities();
    activities.push(activity);
    saveActivities(activities);

    // If authenticated, sync with server
    if (isAuthenticated && token) {
      authService.trackActivity(token, activity).catch(console.warn);
    }
  }, [getActivities, saveActivities, isAuthenticated, token]);

  // Track search activity
  const trackSearch = useCallback((searchData) => {
    trackActivity('search', {
      destination: searchData.destination,
      budget: searchData.budget,
      origin: searchData.origin,
      dates: searchData.dates
    });
  }, [trackActivity]);

  // Track deal view
  const trackView = useCallback((deal) => {
    trackActivity('view', {
      dealId: deal.id,
      destination: deal.destination,
      dealType: deal.type,
      price: deal.price
    });
  }, [trackActivity]);

  // Track deal click (external link)
  const trackClick = useCallback((deal) => {
    trackActivity('click', {
      dealId: deal.id,
      destination: deal.destination,
      dealType: deal.type,
      price: deal.price
    });
  }, [trackActivity]);

  // Track favorite added
  const trackFavorite = useCallback((deal) => {
    trackActivity('favorite', {
      dealId: deal.id,
      destination: deal.destination,
      dealType: deal.type,
      price: deal.price
    });
  }, [trackActivity]);

  // Track region browsed
  const trackRegion = useCallback((region) => {
    trackActivity('region', { region });
  }, [trackActivity]);

  // Get user preferences based on activity history
  const getUserPreferences = useCallback(() => {
    const activities = getActivities();

    // Analyze search patterns
    const destinations = {};
    const dealTypes = {};
    const regions = {};
    const budgets = [];

    activities.forEach(activity => {
      if (activity.destination) {
        destinations[activity.destination] = (destinations[activity.destination] || 0) + 1;
      }
      if (activity.dealType) {
        dealTypes[activity.dealType] = (dealTypes[activity.dealType] || 0) + 1;
      }
      if (activity.region) {
        regions[activity.region] = (regions[activity.region] || 0) + 1;
      }
      if (activity.budget) {
        budgets.push(activity.budget);
      }
    });

    // Sort by frequency
    const topDestinations = Object.entries(destinations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([dest]) => dest);

    const topDealTypes = Object.entries(dealTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    const topRegions = Object.entries(regions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([region]) => region);

    const avgBudget = budgets.length > 0
      ? Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length)
      : null;

    return {
      topDestinations,
      topDealTypes,
      topRegions,
      avgBudget,
      totalActivities: activities.length
    };
  }, [getActivities]);

  // Sync all activities with server when authenticated
  const syncWithServer = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    const activities = getActivities();
    if (activities.length === 0) return;

    try {
      // Get the last synced timestamp
      const lastSync = parseInt(localStorage.getItem('nomad-last-sync') || '0', 10);

      // Filter activities that haven't been synced
      const unsynced = activities.filter(a => a.timestamp > lastSync);

      if (unsynced.length > 0) {
        // Batch sync activities
        for (const activity of unsynced) {
          await authService.trackActivity(token, activity);
        }

        // Update last sync timestamp
        localStorage.setItem('nomad-last-sync', Date.now().toString());
      }
    } catch (err) {
      console.warn('Failed to sync activities:', err);
    }
  }, [isAuthenticated, token, getActivities]);

  // Periodic sync with server
  useEffect(() => {
    if (isAuthenticated) {
      // Initial sync
      syncWithServer();

      // Set up periodic sync
      syncTimeoutRef.current = setInterval(syncWithServer, SYNC_INTERVAL);

      return () => {
        if (syncTimeoutRef.current) {
          clearInterval(syncTimeoutRef.current);
        }
      };
    }
  }, [isAuthenticated, syncWithServer]);

  // Clear all activity data
  const clearActivity = useCallback(() => {
    localStorage.removeItem(ACTIVITY_KEY);
    localStorage.removeItem('nomad-last-sync');
  }, []);

  return {
    trackSearch,
    trackView,
    trackClick,
    trackFavorite,
    trackRegion,
    getUserPreferences,
    clearActivity
  };
}

export default useUserActivity;

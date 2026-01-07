import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper to make authenticated requests
async function authFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Generate a simple JWT for demo purposes (in production, this comes from backend)
function generateDemoToken(user) {
  // This is a simplified demo token - in production, the backend would generate this
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  }));
  const signature = btoa('demo-signature');
  return `${header}.${payload}.${signature}`;
}

const authService = {
  /**
   * Login with Google credential
   * @param {string} googleCredential - The credential from Google Sign-In
   * @returns {Promise<{user: object, token: string, isNewUser: boolean}>}
   */
  async loginWithGoogle(googleCredential) {
    // Check if we have a real API endpoint
    if (API_BASE_URL) {
      return authFetch('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: googleCredential })
      });
    }

    // Demo mode: decode Google credential and create local user
    try {
      const decoded = jwtDecode(googleCredential);

      // Check if user exists in localStorage
      const existingUsers = JSON.parse(localStorage.getItem('nomad-users') || '{}');
      const existingUser = existingUsers[decoded.sub];
      const isNewUser = !existingUser;

      const user = {
        id: decoded.sub,
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        language: existingUser?.language || 'es',
        currency: existingUser?.currency || 'USD',
        notificationsEnabled: existingUser?.notificationsEnabled ?? true,
        createdAt: existingUser?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save user to localStorage (demo mode)
      existingUsers[decoded.sub] = user;
      localStorage.setItem('nomad-users', JSON.stringify(existingUsers));

      const token = generateDemoToken(user);

      return { user, token, isNewUser };
    } catch (err) {
      console.error('Error decoding Google credential:', err);
      throw new Error('Invalid Google credential');
    }
  },

  /**
   * Get current user data
   * @param {string} token - JWT token
   * @returns {Promise<object>}
   */
  async getCurrentUser(token) {
    if (API_BASE_URL) {
      return authFetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    // Demo mode: get user from localStorage
    try {
      const decoded = jwtDecode(token);
      const existingUsers = JSON.parse(localStorage.getItem('nomad-users') || '{}');
      const user = existingUsers[decoded.sub];

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (err) {
      throw new Error('Invalid session');
    }
  },

  /**
   * Logout user
   * @param {string} token - JWT token
   */
  async logout(token) {
    if (API_BASE_URL) {
      return authFetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    // Demo mode: nothing to do on server
    return { success: true };
  },

  /**
   * Update user preferences
   * @param {string} token - JWT token
   * @param {object} preferences - { language, currency, notificationsEnabled }
   */
  async updatePreferences(token, preferences) {
    if (API_BASE_URL) {
      return authFetch('/api/user/preferences', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(preferences)
      });
    }

    // Demo mode: update in localStorage
    try {
      const decoded = jwtDecode(token);
      const existingUsers = JSON.parse(localStorage.getItem('nomad-users') || '{}');
      const user = existingUsers[decoded.sub];

      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = {
        ...user,
        ...preferences,
        updatedAt: new Date().toISOString()
      };

      existingUsers[decoded.sub] = updatedUser;
      localStorage.setItem('nomad-users', JSON.stringify(existingUsers));

      return updatedUser;
    } catch (err) {
      throw new Error('Failed to update preferences');
    }
  },

  // Wishlist sync methods
  async getWishlist(token) {
    if (API_BASE_URL) {
      return authFetch('/api/user/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    // Demo mode: wishlist is already in localStorage via WishlistContext
    return [];
  },

  async syncWishlist(token, wishlist) {
    if (API_BASE_URL) {
      return authFetch('/api/user/wishlist/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wishlist })
      });
    }
    // Demo mode: nothing to sync
    return { success: true };
  },

  // Alerts sync methods
  async getAlerts(token) {
    if (API_BASE_URL) {
      return authFetch('/api/user/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    // Demo mode: alerts are already in localStorage via AlertsContext
    return [];
  },

  async syncAlerts(token, alerts) {
    if (API_BASE_URL) {
      return authFetch('/api/user/alerts/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ alerts })
      });
    }
    // Demo mode: nothing to sync
    return { success: true };
  },

  // Activity tracking
  async trackActivity(token, activity) {
    if (API_BASE_URL) {
      return authFetch('/api/user/activity', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(activity)
      });
    }
    // Demo mode: store in localStorage
    const activities = JSON.parse(localStorage.getItem('nomad-activity') || '[]');
    activities.push({ ...activity, timestamp: Date.now() });
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.splice(0, activities.length - 100);
    }
    localStorage.setItem('nomad-activity', JSON.stringify(activities));
    return { success: true };
  },

  // Get recommendations based on activity
  async getRecommendations(token) {
    if (API_BASE_URL) {
      return authFetch('/api/user/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    // Demo mode: return empty - recommendations will be generated client-side
    return [];
  }
};

export default authService;

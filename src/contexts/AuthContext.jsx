import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import authService from '../services/authService';

const AuthContext = createContext();

const AUTH_TOKEN_KEY = 'nomad-auth-token';
const USER_CACHE_KEY = 'nomad-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_CACHE_KEY);

      if (savedToken) {
        try {
          // Check if token is expired
          const decoded = jwtDecode(savedToken);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            // Token expired, clear storage
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(USER_CACHE_KEY);
          } else {
            // Token valid, restore session
            setToken(savedToken);
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            }
            // Optionally verify with server
            try {
              const userData = await authService.getCurrentUser(savedToken);
              setUser(userData);
              localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
            } catch (err) {
              // Server verification failed, but we have cached data
              console.warn('Could not verify session with server:', err);
            }
          }
        } catch (err) {
          // Invalid token
          console.error('Invalid token:', err);
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_CACHE_KEY);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const loginWithGoogle = useCallback(async (googleCredential) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.loginWithGoogle(googleCredential);

      const { user: userData, token: authToken, isNewUser } = response;

      setToken(authToken);
      setUser(userData);

      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));

      // Trigger sync of local data if callback provided
      if (window.onNomadLogin) {
        window.onNomadLogin({ user: userData, isNewUser });
      }

      return { success: true, isNewUser };
    } catch (err) {
      const errorMessage = err.message || 'Error al iniciar sesion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (err) {
      console.warn('Logout request failed:', err);
    }

    setUser(null);
    setToken(null);
    setError(null);

    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);

    // Trigger logout callback
    if (window.onNomadLogout) {
      window.onNomadLogout();
    }

    setIsLoading(false);
  }, [token]);

  const updatePreferences = useCallback(async (preferences) => {
    if (!token || !user) return { success: false };

    try {
      const updatedUser = await authService.updatePreferences(token, preferences);
      setUser(updatedUser);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [token, user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    error,
    loginWithGoogle,
    logout,
    updatePreferences,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

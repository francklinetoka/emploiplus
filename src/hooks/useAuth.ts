import { useState, useEffect } from 'react';
import { authHeaders } from '@/lib/headers';

// Get API base URL from environment or default
const getAPIBaseURL = () => {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env) return env;
  
  // Fallback for development
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    if (host.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return `http://${host}:5000`;
    }
  }
  return 'http://localhost:5000';
};

const API_BASE_URL = getAPIBaseURL();

// Backend-only auth hook: uses /api/register, /api/login and /api/users/me
export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to boot from localStorage for instant UI
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }

    if (!token) {
      setLoading(false);
      return;
    }

    // validate token and refresh user profile
    fetch(`${API_BASE_URL}/api/users/me`, { headers: authHeaders() })
      .then(async (r) => {
        if (!r.ok) {
          // If unauthorized, token likely invalid — clear auth. For other errors, keep stored user.
          if (r.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            console.warn('Profile fetch returned non-OK status:', r.status);
            // keep previously stored user for offline/temporary server errors
          }
          return;
        }
        try {
          const data = await r.json();
          setUser(data);
          localStorage.setItem('user', JSON.stringify(data));
        } catch (e) {
          console.error('Error parsing profile JSON', e);
          // keep existing stored user instead of wiping it
        }
      })
      .catch((e) => {
        console.error('Fetch profile error', e);
        // network or server error — keep previously stored user to avoid logging out the UI
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...metadata }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user || null);
        }
        return { error: null, user: data.user || null };
      }
      return { error: { message: data.message || 'Erreur' } };
    } catch (err: any) {
      return { error: { message: err.message || 'Erreur' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user || null);
        }
        return { error: null, user: data.user || null };
      }
      return { error: { message: data.message || 'Erreur de connexion' } };
    } catch (err: any) {
      return { error: { message: err.message || 'Erreur' } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    return { error: null };
  };

  return { user, loading, signUp, signIn, signOut };
};

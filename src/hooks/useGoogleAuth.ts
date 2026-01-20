import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { authHeaders } from '@/lib/headers';

// Helper to get the API URL
const getAPIURL = () => {
  // En production, utiliser la variable d'environnement si disponible
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // En développement, déterminer l'adresse du backend en fonction de l'adresse actuelle
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // Si on est sur localhost, utiliser localhost
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // Si on est sur une adresse IP du réseau local, utiliser la même adresse IP pour le backend
    if (currentHost.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return `http://${currentHost}:5000`;
    }
  }
  
  // Fallback par défaut
  return 'http://localhost:5000';
};

export const useGoogleAuth = () => {
  const handleGoogleLogin = async (credentialResponse: any, userType: string = 'candidate') => {
    try {
      const API_URL = getAPIURL();
      
      // Get the credential token (ID token for authorization code flow)
      let token = credentialResponse.credential;
      
      // If using auth-code flow, we receive a code instead
      if (credentialResponse.code) {
        token = credentialResponse.code;
      }
      
      // If access_token only (implicit flow), we cannot verify it server-side with verifyIdToken
      if (!token && credentialResponse.access_token) {
        console.warn('Only access_token received, trying to use it as credential');
        token = credentialResponse.access_token;
      }
      
      if (!token) {
        throw new Error('No token received from Google');
      }
      
      console.log('Sending token to backend, type:', typeof token, 'length:', token.length);
      
      // Send the Google token to the backend
      const res = await fetch(`${API_URL}/api/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          userType: userType === 'company' ? 'company' : 'candidate',
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // Store JWT token from backend
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        return { error: null, user: data.user || null };
      }

      return { error: { message: data.message || 'Erreur lors de la connexion Google' } };
    } catch (err: any) {
      console.error('Google auth error:', err);
      return { error: { message: err.message || 'Erreur de connexion' } };
    }
  };

  return { handleGoogleLogin };
};

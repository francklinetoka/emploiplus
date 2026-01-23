import { supabase } from '../lib/supabase';

export type UserRole = 'candidate' | 'company';

export const useGoogleAuth = () => {
  const handleGoogleLogin = async (userRole: UserRole = 'candidate') => {
    try {
      // Determine the redirect URL based on environment
      const isProduction = window.location.hostname.includes('vercel.app') || 
                          window.location.hostname.includes('emploiplus');
      const redirectTo = isProduction 
        ? `https://emploiplus.vercel.app/auth/callback?role=${userRole}`
        : `${window.location.origin}/auth/callback?role=${userRole}`;

      console.log('🔐 Google OAuth redirect URL:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
        return { 
          error: { 
            message: error.message || 'Erreur lors de la connexion Google. Vérifiez votre configuration.' 
          } 
        };
      }

      console.log('✅ Google OAuth initiated successfully');
      return { error: null, user: data.user || null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la connexion Google';
      console.error('❌ Google auth error:', err);
      return { error: { message } };
    }
  };

  return { handleGoogleLogin };
};

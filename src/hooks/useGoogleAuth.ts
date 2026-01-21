import { supabase } from '../lib/supabase';

export const useGoogleAuth = () => {
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://emploiplus.vercel.app/auth/callback',
      },
    });

    if (error) {
      return { error: { message: error.message || 'Erreur lors de la connexion Google' } };
    }

    return { error: null, user: data.user || null };
  };

  return { handleGoogleLogin };
};

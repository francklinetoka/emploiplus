import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

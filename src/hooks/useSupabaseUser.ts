import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useSupabaseUser = () => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Erreur récupération user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  return { user, loading };
};

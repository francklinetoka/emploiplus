import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface AuthUser {
  id: string;
  email: string;
  user_type: string;
  full_name: string;
  [key: string]: any;
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state on mount
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
        }

        setSession(initialSession);

        // If session exists, fetch user profile from public users table
        if (initialSession?.user) {
          await fetchUserProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err.message : 'Erreur d\'authentification');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      setSession(newSession);

      if (newSession?.user) {
        // User signed in
        await fetchUserProfile(newSession.user.id);
      } else {
        // User signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user profile from public users table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        setError(error.message);
        return null;
      }

      const profile = data as AuthUser;
      setUser(profile);
      return profile;
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Erreur');
      return null;
    }
  };

  // Sign up with email and password
  const signUp = async (
    email: string,
    password: string,
    metadata: {
      full_name: string;
      user_type: string;
      [key: string]: any;
    }
  ) => {
    try {
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata, // Store metadata in raw_user_meta_data
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return { error: signUpError, user: null };
      }

      // Note: User profile will be created by the database trigger
      // after the trigger processes the auth.users insert
      
      return { error: null, user: data.user };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur d\'inscription';
      setError(message);
      return { error: { message }, user: null };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return { error: signInError, user: null };
      }

      // Fetch user profile after sign in
      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        return { error: null, user: profile };
      }

      return { error: null, user: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(message);
      return { error: { message }, user: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setError(null);
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        setError(signOutError.message);
        return { error: signOutError };
      }

      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de déconnexion';
      setError(message);
      return { error: { message } };
    }
  };

  // Get current auth token
  const getToken = async (): Promise<string | null> => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session.access_token;
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    try {
      setError(null);
      
      // Determine the redirect URL based on environment
      const isProduction = window.location.hostname.includes('vercel.app') || 
                          window.location.hostname.includes('emploiplus');
      const redirectTo = isProduction 
        ? 'https://emploiplus.vercel.app/auth/callback'
        : `${window.location.origin}/auth/callback`;

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        return { error: oauthError, user: null };
      }

      return { error: null, user: data.user || null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion Google';
      setError(message);
      return { error: { message }, user: null };
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    getToken,
    supabase, // Export supabase client for direct use if needed
  };
};

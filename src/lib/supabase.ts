// Supabase client initialization for authentication and real-time features
// Uses environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// @ts-ignore
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Auth will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

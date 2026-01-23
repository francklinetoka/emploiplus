// ============================================================================
// SUPABASE AUTH IMPLEMENTATION GUIDE
// ============================================================================
//
// This document explains how to complete the Supabase Auth migration
// and implement session management with onAuthStateChange.
//
// ============================================================================

// STEP 1: SET UP ENVIRONMENT VARIABLES
// ============================================================================
// File: .env.local
//
// Add these to your .env.local file:
//
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key-here
//
// Get these values from:
// 1. Go to Supabase Dashboard → Your Project
// 2. Click "Settings" → "API"
// 3. Copy "Project URL" and "anon public" key

// ============================================================================
// STEP 2: RUN THE SQL TRIGGER SCRIPT
// ============================================================================
// File: supabase_auth_trigger.sql
//
// Instructions:
// 1. Copy the entire content of supabase_auth_trigger.sql
// 2. Open your Supabase Dashboard
// 3. Go to SQL Editor
// 4. Click "New query"
// 5. Paste the script
// 6. Click "Run"
//
// This will:
// - Create a function public.handle_new_user()
// - Create a trigger on_auth_user_created
// - Automatically sync new users from auth.users to public.users table

// ============================================================================
// STEP 3: UPDATE YOUR COMPONENTS
// ============================================================================
//
// REGISTER.TSX - Already updated to use useSupabaseAuth()
// LOGINUSER.TSX - Already updated to use useSupabaseAuth()
//
// Both components now:
// - Use supabase.auth.signUp() for registration
// - Use supabase.auth.signInWithPassword() for login
// - Include user metadata (full_name, user_type, etc.)
// - Show proper toast messages with email confirmation notice

// ============================================================================
// STEP 4: UPDATE MAIN APP COMPONENT
// ============================================================================
// File: src/App.tsx
//
// Add onAuthStateChange listener to detect login/logout:

import { useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function App() {
  const { user, session, loading } = useSupabaseAuth();

  useEffect(() => {
    console.log('Auth state changed:', {
      user: user?.email,
      session: !!session,
      loading
    });

    // When user logs in (session exists):
    if (session && user) {
      console.log('User logged in:', user.email);
      // UI will automatically update via state
    }

    // When user logs out (session is null):
    if (!session && !loading) {
      console.log('User logged out');
      // UI will automatically update via state
    }
  }, [session, user, loading]);

  return (
    // Your app routes...
  );
}

// ============================================================================
// STEP 5: IMPLEMENT LOGOUT
// ============================================================================
// In any component, to logout:

import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function LogoutButton() {
  const { signOut } = useSupabaseAuth();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur de déconnexion');
    } else {
      toast.success('Vous avez été déconnecté');
      // Redirect will happen automatically via router
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Déconnexion
    </Button>
  );
}

// ============================================================================
// STEP 6: HANDLE EMAIL CONFIRMATION
// ============================================================================
// 
// When users sign up, they receive a confirmation email.
// After clicking the link, the email_confirmed_at field is set in auth.users.
//
// Option A: Auto-update is_verified in public.users (recommended)
// Add this trigger to supabase_auth_trigger.sql:
//
// CREATE OR REPLACE FUNCTION public.handle_email_verified()
// RETURNS trigger
// LANGUAGE plpgsql
// SECURITY DEFINER SET search_path = public
// AS $$
// BEGIN
//   IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
//     UPDATE public.users
//     SET is_verified = TRUE, updated_at = NOW()
//     WHERE id = NEW.id::integer;
//   END IF;
//   RETURN NEW;
// END;
// $$;
//
// CREATE OR REPLACE TRIGGER on_auth_email_verified
// AFTER UPDATE ON auth.users
// FOR EACH ROW
// EXECUTE FUNCTION public.handle_email_verified();
//
// Option B: Manual verification (in your admin panel)
// Admins manually set is_verified = TRUE in the users table

// ============================================================================
// STEP 7: HANDLE SESSION PERSISTENCE
// ============================================================================
//
// Supabase automatically handles session persistence via:
// - Browser localStorage (using the Supabase JS SDK)
// - Automatic session recovery on page reload
// - Refresh token management
//
// The useSupabaseAuth hook handles this automatically.

// ============================================================================
// STEP 8: PROTECT ROUTES
// ============================================================================
// File: src/App.tsx or src/components/PrivateRoute.tsx
//
// Protect authenticated routes:

import { Navigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function PrivateRoute({ children }) {
  const { user, loading } = useSupabaseAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  return children;
}

// ============================================================================
// STEP 9: TROUBLESHOOTING
// ============================================================================
//
// Issue: Users don't appear in Supabase "Authentication" tab
// Solution: Make sure SQL trigger is running. Check:
// - Go to SQL Editor → Run: SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
// - Should return one row. If not, run the trigger script again.
//
// Issue: Email confirmation not working
// Solution: Check Supabase Email settings:
// - Dashboard → Authentication → Email Templates
// - Verify sender email is configured
// - Check spam folder
//
// Issue: User profile not syncing to public.users
// Solution: 
// - Manually insert: INSERT INTO public.users (id, email, full_name, user_type, ...)
// - Or run trigger script again to create the trigger
//
// Issue: onAuthStateChange not firing
// Solution: Make sure useSupabaseAuth hook is mounted at app level (in App.tsx)
//
// Issue: "createClient is not a function"
// Solution: Install Supabase JS SDK:
// npm install @supabase/supabase-js

// ============================================================================
// STEP 10: TEST YOUR IMPLEMENTATION
// ============================================================================
//
// 1. Go to http://localhost:5173/register
// 2. Create a new account with email: test@example.com
// 3. Check Supabase Dashboard → Authentication → Users
//    - You should see the new user
// 4. Check Database → users table
//    - You should see the new user profile (created by trigger)
// 5. Check email (or spam folder)
//    - You should receive a confirmation email
// 6. Click the confirmation link
//    - Email should be confirmed in auth.users
//    - is_verified should become TRUE (if trigger is set up)
// 7. Go to http://localhost:5173/connexion
// 8. Login with the email and password
// 9. You should be redirected to /fil-actualite (newsfeed)
// 10. Click logout button (when you add it)
//     - You should be logged out and redirected to /connexion

// ============================================================================
// QUICK REFERENCE: API FUNCTIONS
// ============================================================================
//
// useSupabaseAuth() returns:
// {
//   user: AuthUser | null,              // Current authenticated user
//   session: Session | null,            // Current session
//   loading: boolean,                   // Is checking auth state
//   error: string | null,               // Last error message
//   signUp(email, password, metadata),  // Register new user
//   signIn(email, password),            // Login user
//   signOut(),                          // Logout user
//   getToken(),                         // Get JWT token
//   supabase                            // Supabase client for direct use
// }
//
// Example: Get the token for API calls
//
// const { getToken } = useSupabaseAuth();
// const token = await getToken();
// const headers = {
//   'Authorization': `Bearer ${token}`,
//   'Content-Type': 'application/json'
// };

// ============================================================================
// FILES TO UPDATE/CREATE
// ============================================================================
//
// ✅ Created:
// - src/hooks/useSupabaseAuth.ts    (new Supabase auth hook)
// - supabase_auth_trigger.sql       (database trigger script)
//
// ✅ Updated:
// - src/pages/Register.tsx          (use useSupabaseAuth)
// - src/pages/LoginUser.tsx         (use useSupabaseAuth)
//
// ⏳ Still need to update:
// - src/App.tsx                     (add onAuthStateChange listener)
// - src/components/LogoutButton.tsx (if exists, use signOut)
// - src/lib/headers.ts              (update authHeaders to use getToken)

// ============================================================================

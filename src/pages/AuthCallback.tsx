import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, session, loading } = useSupabaseAuth();
  const [processed, setProcessed] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(true);

  useEffect(() => {
    if (processed) return;

    const handleAuthCallback = async () => {
      try {
        // Extract role from URL
        const roleParam = searchParams.get('role') as ('candidate' | 'company') || 'candidate';
        console.log('📋 Role from URL:', roleParam);

        // Check if we have hash (OAuth code)
        const hash = window.location.hash;
        console.log('🔍 Has OAuth code in URL:', !!hash);

        // Wait for auth state to be processed
        if (loading) {
          console.log('⏳ Still loading auth state...');
          return;
        }

        console.log('✅ Auth state loaded. User:', session?.user?.email);

        if (session && session.user) {
          // User is authenticated via Google OAuth
          const googleUser = session.user;
          console.log('🔐 User authenticated via Google:', googleUser.email);

          try {
            // Sync user to database
            setSyncInProgress(true);
            const syncResponse = await fetch(
              `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/sync-google`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: googleUser.id,
                  email: googleUser.email,
                  full_name: googleUser.user_metadata?.full_name || googleUser.email?.split('@')[0] || 'User',
                  profile_image_url: googleUser.user_metadata?.avatar_url,
                  user_type: roleParam,
                }),
              }
            );

            if (!syncResponse.ok) {
              const error = await syncResponse.json();
              console.error('❌ Sync error:', error);
              // Don't fail, user can still use the app
            } else {
              const data = await syncResponse.json();
              console.log('✅ User synced successfully:', data);
            }
          } catch (syncErr) {
            console.error('❌ Sync exception:', syncErr);
            // Continue anyway - user is authenticated
          } finally {
            setSyncInProgress(false);
          }

          // Redirect after sync
          setTimeout(() => {
            console.log('🚀 Redirecting to home...');
            toast.success('Connexion réussie!');
            navigate('/', { replace: true });
          }, 1500);
        } else if (hash) {
          // Hash exists but session not yet processed
          console.log('⏳ Hash exists but session not processed, waiting...');
          setTimeout(() => {
            console.log('🔄 Reloading page to process hash...');
            window.location.reload();
          }, 1000);
        } else {
          // No session and no hash
          console.log('❌ No session and no hash, redirecting to login');
          toast.error('Authentification échouée. Veuillez réessayer.');
          navigate('/connexion', { replace: true });
        }

        setProcessed(true);
      } catch (err) {
        console.error('❌ AuthCallback error:', err);
        toast.error('Erreur lors de la connexion');
        navigate('/connexion', { replace: true });
        setProcessed(true);
      }
    };

    handleAuthCallback();
  }, [loading, session, navigate, searchParams, processed]);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg font-semibold">Finalisation de votre connexion...</p>
        {syncInProgress && (
          <p className="text-sm text-muted-foreground">Synchronisation du profil en cours</p>
        )}
        {!syncInProgress && (
          <p className="text-sm text-muted-foreground">Redirection en cours</p>
        )}
      </div>
    </div>
  );
};

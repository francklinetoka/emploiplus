import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading, error } = useSupabaseAuth();
  const [callbackProcessed, setCallbackProcessed] = useState(false);

  useEffect(() => {
    if (callbackProcessed) return;

    const processCallback = async () => {
      try {
        // Check if we have a hash fragment (OAuth code)
        const hash = window.location.hash;
        
        if (hash && !loading) {
          // Supabase will automatically process the hash and update auth state
          // onAuthStateChange will be triggered in useSupabaseAuth
          
          if (user) {
            // User is authenticated
            toast.success('Connexion réussie!');
            navigate('/');
          } else if (error) {
            // Auth error
            toast.error(error);
            navigate('/connexion');
          }
        } else if (!loading && !user && !hash) {
          // No hash and not authenticated
          navigate('/connexion');
        }
        
        setCallbackProcessed(true);
      } catch (err) {
        console.error('Callback error:', err);
        toast.error('Erreur lors de la connexion');
        navigate('/connexion');
      }
    };

    processCallback();
  }, [user, loading, error, navigate, callbackProcessed]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-lg text-muted-foreground">Traitement de votre connexion...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

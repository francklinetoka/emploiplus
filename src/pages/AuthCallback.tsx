import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Supabase récupère automatiquement le code dans l'URL et crée la session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erreur callback:', error.message);
        toast.error("Erreur lors de la récupération de la session.");
        navigate('/connexion');
        return;
      }

      if (session) {
        const user = session.user;
        
        // 1. On extrait les infos venant de Google
        const googleName = user.user_metadata?.full_name || user.email;
        const googleAvatar = user.user_metadata?.avatar_url;

        // 2. On met à jour (ou on crée) le profil dans ta table publique
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            email: user.email,
            full_name: googleName,
            avatar_url: googleAvatar,
            updated_at: new Date(),
          });

        if (upsertError) {
          console.error("Erreur lors de la mise à jour du profil:", upsertError);
        }

        toast.success("Connexion réussie !");
        
        // 3. Rediriger vers le dashboard
        navigate('/dashboard');
      } else {
        navigate('/connexion');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold text-blue-800">Finalisation de la connexion...</p>
      </div>
    </div>
  );
};

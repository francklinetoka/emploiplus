import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
  autoRedirect?: boolean;
  userType?: 'candidate' | 'company';
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  className,
  autoRedirect = true,
  userType = 'candidate',
}) => {
  const [loading, setLoading] = useState(false);
  const { handleGoogleLogin } = useGoogleAuth();
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      setLoading(true);
      try {
        console.log('Google auth successful, processing...');
        const result = await handleGoogleLogin(credentialResponse, userType);
        if (result.error) {
          console.error('Google login error:', result.error);
          toast.error(result.error.message || 'Erreur lors de la connexion Google');
          onError?.(result.error);
        } else {
          toast.success('Connexion réussie!');
          onSuccess?.(result.user);
          
          // Auto-redirect if enabled
          if (autoRedirect) {
            // Redirect all users to newsfeed
            navigate('/');
          }
        }
      } catch (error: any) {
        console.error('Google login exception:', error);
        const errorMsg = error?.message || 'Erreur de connexion';
        toast.error(errorMsg);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      const errorMsg = 'Erreur lors de la connexion Google';
      console.error('Google login error:', errorMsg);
      toast.error(errorMsg);
      onError?.({ message: errorMsg });
    },
    flow: 'implicit',
    scope: 'openid profile email',
  });

  return (
    <Button
      onClick={() => login()}
      disabled={loading}
      className={className}
      variant="outline"
      type="button"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        <path d="M1 1h22v22H1z" fill="none"/>
      </svg>
      {loading ? 'Connexion...' : 'Continuer avec Google'}
    </Button>
  );
};

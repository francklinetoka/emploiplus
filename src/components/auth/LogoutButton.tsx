import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button, ButtonProps } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';

export interface LogoutButtonProps extends ButtonProps {
  showIcon?: boolean;
  text?: string;
}

export function LogoutButton({
  showIcon = true,
  text = 'Déconnexion',
  ...buttonProps
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const { signOut } = useSupabaseAuth();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur de déconnexion');
    } else {
      toast.success('Vous avez été déconnecté');
      navigate('/connexion');
    }
  };

  return (
    <Button onClick={handleLogout} {...buttonProps}>
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {text}
    </Button>
  );
}

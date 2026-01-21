import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export const GoogleProfile = () => {
  const { user, loading } = useSupabaseUser();

  if (loading) return null;

  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || user.email;
  const initials = fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-10 h-10 border-2 border-blue-600">
        <AvatarImage src={avatarUrl} alt={fullName} />
        <AvatarFallback className="bg-blue-600 text-white">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-900">{fullName}</span>
        <span className="text-xs text-gray-500">{user.email}</span>
      </div>
    </div>
  );
};

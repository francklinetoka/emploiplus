// src/components/connections/NetworkStats.tsx
import { Users, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface NetworkStatsData {
  followerCount: number;
  followingCount: number;
}

export function NetworkStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['networkStats'],
    queryFn: api.getNetworkStats,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const stats = data as NetworkStatsData || { followerCount: 0, followingCount: 0 };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Votre Réseau</h3>

      <div className="space-y-4">
        {/* Followers */}
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 rounded-lg p-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Abonnés</p>
            <p className="text-2xl font-bold text-gray-900">{stats.followerCount}</p>
          </div>
        </div>

        {/* Following */}
        <div className="flex items-start gap-4">
          <div className="bg-purple-100 rounded-lg p-3">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Abonnements</p>
            <p className="text-2xl font-bold text-gray-900">{stats.followingCount}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* Total Network */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-600">Taille du réseau</p>
        <p className="text-lg font-bold text-gray-900">
          {stats.followerCount + stats.followingCount}
        </p>
      </div>
    </div>
  );
}

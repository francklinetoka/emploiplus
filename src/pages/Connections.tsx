// src/pages/Connections.tsx
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/ui/loader';
import { NetworkStats } from '@/components/connections/NetworkStats';
import { SuggestedProfiles } from '@/components/connections/SuggestedProfiles';
import { NetworkActivity } from '@/components/connections/NetworkActivity';
import { Network } from 'lucide-react';

export function Connections() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Veuillez vous connecter pour accéder à vos connexions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Network className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Connexions</h1>
          </div>
          <p className="text-gray-600">
            Découvrez des professionnels, construisez votre réseau et restez connecté
          </p>
        </div>
      </div>

      {/* Main Content - 3 Columns Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Network Stats */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <NetworkStats />
            </div>
          </div>

          {/* Center Column: Suggestions */}
          <div className="lg:col-span-1">
            <SuggestedProfiles />
          </div>

          {/* Right Column: Activity */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <NetworkActivity />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Users, Briefcase, BookOpen, FileText } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user?.id);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/connexion');
      } else if (role && !['super_admin', 'admin_offers', 'admin_users'].includes(role)) {
        toast.error("Accès non autorisé");
        navigate('/');
      }
    }
  }, [user, role, authLoading, roleLoading, navigate]);

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isSuperAdmin = role === 'super_admin';
  const canManageOffers = role === 'super_admin' || role === 'admin_offers';
  const canManageUsers = role === 'super_admin' || role === 'admin_users';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Panneau d'administration</h1>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          {canManageUsers && <TabsTrigger value="users">Utilisateurs</TabsTrigger>}
          {canManageOffers && <TabsTrigger value="offers">Offres d'emploi</TabsTrigger>}
          {canManageOffers && <TabsTrigger value="formations">Formations</TabsTrigger>}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <Briefcase className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Offres d'emploi</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Formations</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Publications</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {canManageUsers && (
          <TabsContent value="users">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h2>
              <p className="text-muted-foreground">Interface de gestion des utilisateurs à développer</p>
            </Card>
          </TabsContent>
        )}

        {canManageOffers && (
          <>
            <TabsContent value="offers">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Gestion des offres d'emploi</h2>
                <p className="text-muted-foreground">Interface de gestion des offres à développer</p>
              </Card>
            </TabsContent>

            <TabsContent value="formations">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-4">Gestion des formations</h2>
                <p className="text-muted-foreground">Interface de gestion des formations à développer</p>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Admin;

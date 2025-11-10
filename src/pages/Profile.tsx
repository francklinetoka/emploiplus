import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole(user?.id);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && role) {
      fetchProfile();
    }
  }, [user, role]);

  const fetchProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (role === 'candidate') {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfileData(data);
      } else if (role === 'company') {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfileData(data);
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      if (role === 'candidate') {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);

        if (error) throw error;
      } else if (role === 'company') {
        const { error } = await supabase
          .from('company_profiles')
          .update(profileData)
          .eq('id', user.id);

        if (error) throw error;
      }

      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

      <Card className="p-6">
        <form onSubmit={handleUpdate} className="space-y-6">
          {role === 'candidate' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={profileData.first_name || ''}
                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={profileData.last_name || ''}
                    onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professional_title">Titre professionnel</Label>
                <Input
                  id="professional_title"
                  value={profileData.professional_title || ''}
                  onChange={(e) => setProfileData({ ...profileData, professional_title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={profileData.location || ''}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Secteur</Label>
                  <Input
                    id="sector"
                    value={profileData.sector || ''}
                    onChange={(e) => setProfileData({ ...profileData, sector: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilité du profil</Label>
                <Select
                  value={profileData.visibility || 'public'}
                  onValueChange={(value) => setProfileData({ ...profileData, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="network">Réseau</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de l'entreprise</Label>
                <Input
                  id="company_name"
                  value={profileData.company_name || ''}
                  onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={profileData.description || ''}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sector">Secteur</Label>
                  <Input
                    id="sector"
                    value={profileData.sector || ''}
                    onChange={(e) => setProfileData({ ...profileData, sector: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    value={profileData.website || ''}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilité</Label>
                <Select
                  value={profileData.visibility || 'public'}
                  onValueChange={(value) => setProfileData({ ...profileData, visibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="network">Réseau</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90" disabled={loading}>
            {loading ? "Mise à jour..." : "Mettre à jour le profil"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Profile;

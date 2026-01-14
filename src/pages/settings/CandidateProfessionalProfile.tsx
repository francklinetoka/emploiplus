import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authHeaders } from '@/lib/headers';

export default function CandidateProfessionalProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [profession, setProfession] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", { headers });
      if (!res.ok) throw new Error('Erreur chargement profil');
      const data = await res.json();
      setProfileData(data);
      setJobTitle(data.job_title || "");
      setProfession(data.profession || "");
      setBio((data as any).bio || "");
      setSkills((data as any).skills ? (Array.isArray(data.skills) ? data.skills.join(', ') : data.skills) : "");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const headersPut: Record<string, string> = authHeaders('application/json');
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({
          job_title: jobTitle,
          profession: profession,
          bio: bio,
          skills: skillsArray,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      toast.success("Profil professionnel mis à jour");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Profil Professionnel</h2>
        {!editing ? (
          <Button onClick={() => setEditing(true)}>Modifier</Button>
        ) : (
          <Button variant="ghost" onClick={() => setEditing(false)}>Annuler</Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profession */}
        <div className="space-y-2">
          <Label htmlFor="profession">Profession</Label>
          <Input
            id="profession"
            value={profession}
            disabled={!editing}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="Ex: Développeur, Infirmière, Mécanicien"
          />
        </div>

        {/* Titre du profil */}
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Titre du profil</Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            disabled={!editing}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Ex: Comptable Senior, Électricien industriel"
          />
        </div>

        {/* Résumé / Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Résumé professionnel</Label>
          <Textarea
            id="bio"
            value={bio}
            disabled={!editing}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Un court texte de présentation (utile pour l'IA)"
            rows={4}
          />
        </div>

        {/* Compétences */}
        <div className="space-y-2">
          <Label htmlFor="skills">Compétences (séparées par virgule)</Label>
          <Textarea
            id="skills"
            value={skills}
            disabled={!editing}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Ex: Excel, PHP, Leadership, Gestion de projet"
            rows={3}
          />
          <p className="text-sm text-muted-foreground">Incluez les Hard skills (Excel, PHP) et Soft skills (Leadership, Ponctualité)</p>
        </div>

        {editing && (
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
          </Button>
        )}
      </form>
    </Card>
  );
}

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authHeaders } from '@/lib/headers';

export default function CandidateInformation() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [diploma, setDiploma] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [contractType, setContractType] = useState("");
  const [availability, setAvailability] = useState("");
  const [salary, setSalary] = useState("");
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Determine which sections should be visible based on filled data
  const showParcoursSections = diploma || experienceYears;
  const showPreferencesSections = contractType || availability || salary;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/connexion");
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", { headers });
      if (!res.ok) throw new Error('Erreur chargement profil');
      const data = await res.json();
      setProfileData(data);
      setDiploma(data.diploma || "");
      setExperienceYears(data.experience_years || "");
      setContractType(typeof data.contract_type === 'string' ? data.contract_type : "");
      setAvailability(typeof data.availability === 'string' ? data.availability : "");
      setSalary(typeof data.salary_expectation === 'string' ? data.salary_expectation : "");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const handleSaveSection = async (section: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const headersPut: Record<string, string> = authHeaders('application/json');
      const body: Record<string, unknown> = {};
      
      if (section === 'parcours') {
        body.diploma = diploma;
        body.experience_years = parseInt(experienceYears) || 0;
      } else if (section === 'preferences') {
        body.contract_type = contractType;
        body.availability = availability;
        body.salary_expectation = salary;
      }

      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditingSection(null);
      toast.success("Section mise à jour");
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
      <h2 className="text-2xl font-bold mb-6">Mes informations</h2>

      <div className="space-y-8">
        {/* SECTION 1: Parcours & Documents */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Parcours & Documents</h3>
            {editingSection !== 'parcours' ? (
              <Button size="sm" variant="outline" onClick={() => setEditingSection('parcours')}>Modifier</Button>
            ) : (
              <div className="space-x-2">
                <Button size="sm" onClick={() => handleSaveSection('parcours')} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingSection(null)}>Annuler</Button>
              </div>
            )}
          </div>

          {/* Diplôme */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="diploma">Diplôme / Qualification</Label>
            <Input
              id="diploma"
              value={diploma}
              disabled={editingSection !== 'parcours'}
              onChange={(e) => setDiploma(e.target.value)}
              placeholder="Ex: Bac+5 Informatique, Master en Gestion"
            />
            {editingSection !== 'parcours' && diploma && (
              <p className="text-xs text-muted-foreground">{diploma}</p>
            )}
          </div>

          {/* Années d'expérience */}
          <div className="space-y-2">
            <Label htmlFor="experienceYears">Années d'expérience</Label>
            <Input
              id="experienceYears"
              type="number"
              min="0"
              max="70"
              value={experienceYears}
              disabled={editingSection !== 'parcours'}
              onChange={(e) => setExperienceYears(e.target.value)}
            />
            {editingSection !== 'parcours' && experienceYears && (
              <p className="text-xs text-muted-foreground">{experienceYears} ans</p>
            )}
          </div>

          {/* Note sur les documents - toujours visible */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 mt-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Documents requis (PDF uniquement)</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• CV</li>
              <li>• Lettres de recommandation</li>
              <li>• Diplômes</li>
              <li>• Certificats</li>
              <li>• Pièce d'identité (CNI)</li>
              <li>• NUI (Numéro d'identification unique) - si République du Congo</li>
              <li>• Passeport</li>
            </ul>
            <p className="text-xs text-yellow-700 mt-3">Gérez vos documents via la section "Documents" du tableau de bord.</p>
          </div>
        </div>

        {/* SECTION 2: Préférences de Recherche - Affichage dynamique */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Préférences de Recherche</h3>
            {editingSection !== 'preferences' ? (
              <Button size="sm" variant="outline" onClick={() => setEditingSection('preferences')}>Modifier</Button>
            ) : (
              <div className="space-x-2">
                <Button size="sm" onClick={() => handleSaveSection('preferences')} disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingSection(null)}>Annuler</Button>
              </div>
            )}
          </div>

          {/* Type de contrat */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="contractType">Type de contrat recherché</Label>
            <Select value={contractType} onValueChange={setContractType} disabled={editingSection !== 'preferences'}>
              <SelectTrigger id="contractType">
                <SelectValue placeholder="Sélectionner un type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CDI">CDI (Contrat à Durée Indéterminée)</SelectItem>
                <SelectItem value="CDD">CDD (Contrat à Durée Déterminée)</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
                <SelectItem value="Prestation">Prestation</SelectItem>
              </SelectContent>
            </Select>
            {editingSection !== 'preferences' && contractType && (
              <p className="text-xs text-muted-foreground">Contrat : {contractType}</p>
            )}
          </div>

          {/* Disponibilité */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="availability">Disponibilité</Label>
            <Select value={availability} onValueChange={setAvailability} disabled={editingSection !== 'preferences'}>
              <SelectTrigger id="availability">
                <SelectValue placeholder="Sélectionner votre disponibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Immediate">Immédiate</SelectItem>
                <SelectItem value="WithNotice">Avec préavis</SelectItem>
                <SelectItem value="Flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
            {editingSection !== 'preferences' && availability && (
              <p className="text-xs text-muted-foreground">Disponible : {availability}</p>
            )}
          </div>

          {/* Prétentions salariales */}
          <div className="space-y-2">
            <Label htmlFor="salary">Prétentions salariales (optionnel)</Label>
            <Input
              id="salary"
              type="text"
              value={salary}
              disabled={editingSection !== 'preferences'}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Ex: 500 000 - 1 000 000 CFA"
            />
            <p className="text-sm text-muted-foreground">Cette information vous aide à filtrer les offres correspondant à vos attentes.</p>
            {editingSection !== 'preferences' && salary && (
              <p className="text-xs text-muted-foreground">Salaire attendu : {salary}</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

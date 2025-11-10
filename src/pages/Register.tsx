import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Briefcase, Mail, Lock, User, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [accountType, setAccountType] = useState<"candidat" | "entreprise">("candidat");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Candidat form state
  const [candidatForm, setCandidatForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    password: "",
    confirmPassword: "",
  });

  // Entreprise form state
  const [entrepriseForm, setEntrepriseForm] = useState({
    companyName: "",
    representative: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleCandidatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (candidatForm.password !== candidatForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!acceptTerms) {
      toast.error("Vous devez accepter les conditions générales");
      return;
    }

    setLoading(true);

    const metadata = {
      account_type: "candidate",
      first_name: candidatForm.firstName,
      last_name: candidatForm.lastName,
      country: candidatForm.country
    };

    const { error } = await signUp(candidatForm.email, candidatForm.password, metadata);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      navigate('/connexion');
    }
    
    setLoading(false);
  };

  const handleEntrepriseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (entrepriseForm.password !== entrepriseForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (!acceptTerms) {
      toast.error("Vous devez accepter les conditions générales");
      return;
    }

    setLoading(true);

    const metadata = {
      account_type: "company",
      company_name: entrepriseForm.companyName,
      representative_name: entrepriseForm.representative,
      address: entrepriseForm.address
    };

    const { error } = await signUp(entrepriseForm.email, entrepriseForm.password, metadata);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      navigate('/connexion');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
      <Card className="w-full max-w-2xl p-8 space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary mx-auto">
            <Briefcase className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Créer un compte Emploi+</h1>
          <p className="text-sm text-muted-foreground">
            Choisissez votre type de compte pour commencer
          </p>
        </div>

        {/* Account Type Tabs */}
        <Tabs value={accountType} onValueChange={(v) => setAccountType(v as "candidat" | "entreprise")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="candidat">Candidat</TabsTrigger>
            <TabsTrigger value="entreprise">Entreprise</TabsTrigger>
          </TabsList>

          {/* Candidat Form */}
          <TabsContent value="candidat" className="space-y-4 mt-6">
            <form onSubmit={handleCandidatSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      placeholder="Votre prénom"
                      className="pl-10"
                      value={candidatForm.firstName}
                      onChange={(e) => setCandidatForm({ ...candidatForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      placeholder="Votre nom"
                      className="pl-10"
                      value={candidatForm.lastName}
                      onChange={(e) => setCandidatForm({ ...candidatForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    className="pl-10"
                    value={candidatForm.email}
                    onChange={(e) => setCandidatForm({ ...candidatForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Pays *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Select 
                    value={candidatForm.country} 
                    onValueChange={(value) => setCandidatForm({ ...candidatForm, country: value })}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Sélectionnez votre pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="congo">République du Congo</SelectItem>
                      <SelectItem value="rdc">République Démocratique du Congo</SelectItem>
                      <SelectItem value="gabon">Gabon</SelectItem>
                      <SelectItem value="cameroun">Cameroun</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={candidatForm.password}
                      onChange={(e) => setCandidatForm({ ...candidatForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={candidatForm.confirmPassword}
                      onChange={(e) => setCandidatForm({ ...candidatForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm leading-relaxed">
                  J'accepte les{" "}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Conditions Générales d'Utilisation
                  </Button>{" "}
                  et la{" "}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Politique de Confidentialité
                  </Button>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={!acceptTerms || loading}
              >
                {loading ? "Inscription en cours..." : "Créer mon compte candidat"}
              </Button>
            </form>
          </TabsContent>

          {/* Entreprise Form */}
          <TabsContent value="entreprise" className="space-y-4 mt-6">
            <form onSubmit={handleEntrepriseSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    placeholder="Nom de votre entreprise"
                    className="pl-10"
                    value={entrepriseForm.companyName}
                    onChange={(e) => setEntrepriseForm({ ...entrepriseForm, companyName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="representative">Représentant/Gérant *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="representative"
                    placeholder="Nom complet du représentant"
                    className="pl-10"
                    value={entrepriseForm.representative}
                    onChange={(e) => setEntrepriseForm({ ...entrepriseForm, representative: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyEmail">Adresse e-mail *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="contact@entreprise.com"
                    className="pl-10"
                    value={entrepriseForm.email}
                    onChange={(e) => setEntrepriseForm({ ...entrepriseForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse/Siège social *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    placeholder="Adresse complète de l'entreprise"
                    className="pl-10"
                    value={entrepriseForm.address}
                    onChange={(e) => setEntrepriseForm({ ...entrepriseForm, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyPassword">Mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={entrepriseForm.password}
                      onChange={(e) => setEntrepriseForm({ ...entrepriseForm, password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyConfirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyConfirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={entrepriseForm.confirmPassword}
                      onChange={(e) => setEntrepriseForm({ ...entrepriseForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsEntreprise"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <label htmlFor="termsEntreprise" className="text-sm leading-relaxed">
                  J'accepte les{" "}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Conditions Générales d'Utilisation
                  </Button>{" "}
                  et la{" "}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    Politique de Confidentialité
                  </Button>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-secondary hover:opacity-90"
                disabled={!acceptTerms || loading}
              >
                {loading ? "Inscription en cours..." : "Créer mon compte entreprise"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Login Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">Vous avez déjà un compte ? </span>
          <Button variant="link" asChild className="p-0 h-auto text-primary">
            <Link to="/connexion">Se connecter</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Register;

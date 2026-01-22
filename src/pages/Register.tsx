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
import { COUNTRIES, CONGO_CITIES } from '@/lib/options';
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFooter } from "@/components/auth/AuthFooter";

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
    city: "",
    phone: "",
    gender: "",
    birthdate: "",
    password: "",
    confirmPassword: "",
  });
  // use centralized lists from src/lib/options.ts
  // CONGO_CITIES imported above

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
      // respect optional redirect param after registration
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      navigate(redirect || '/');
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

    // Only allow registrations from République du Congo
    if (candidatForm.country !== 'congo') {
      toast.error("Seuls les candidats de la République du Congo peuvent créer un compte");
      setLoading(false);
      return;
    }

    setLoading(true);

    const metadata: Record<string, unknown> = {
      user_type: "candidate",
      full_name: `${candidatForm.firstName} ${candidatForm.lastName}`.trim(),
      country: candidatForm.country,
    };
    if (candidatForm.phone) metadata.phone = candidatForm.phone;
    if (candidatForm.city) metadata.city = candidatForm.city;
    if (candidatForm.gender) metadata.gender = candidatForm.gender;
    if (candidatForm.birthdate) metadata.birthdate = candidatForm.birthdate;

    const { error } = await signUp(candidatForm.email, candidatForm.password, metadata);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Inscription réussie ! Veuillez vous connecter.");
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
      user_type: "company",
      full_name: entrepriseForm.representative || entrepriseForm.companyName,
      company_name: entrepriseForm.companyName,
      company_address: entrepriseForm.address
      ,country: 'congo'
    };

    const { error } = await signUp(entrepriseForm.email, entrepriseForm.password, metadata);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Inscription réussie ! Veuillez vous connecter.");
      navigate('/connexion');
    }
    
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <AuthHeader />
      
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4">
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
                      <SelectItem value="congo">🇨🇬 République du Congo</SelectItem>
                      <SelectItem value="rdc">🇨🇩 République Démocratique du Congo</SelectItem>
                      <SelectItem value="gabon">🇬🇦 Gabon</SelectItem>
                      <SelectItem value="cameroun">🇨🇲 Cameroun</SelectItem>
                      <SelectItem value="centrafrique">🇨🇫 Centrafrique</SelectItem>
                      <SelectItem value="tchad">🇹🇩 Tchad</SelectItem>
                      <SelectItem value="sao_tome">🇸🇹 Sao Tomé-et-Principe</SelectItem>
                      <SelectItem value="guinee_equatoriale">🇬🇶 Guinée équatoriale</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* City - shown for Congo */}
              {candidatForm.country === 'congo' && (
                <div className="space-y-2">
                  <Label htmlFor="city">Ville *</Label>
                  <Select value={candidatForm.city} onValueChange={(value) => setCandidatForm({ ...candidatForm, city: value })}>
                    <SelectTrigger className="pl-3">
                      <SelectValue placeholder="Sélectionnez votre ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONGO_CITIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Gender and Birthdate */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select value={candidatForm.gender} onValueChange={(value) => setCandidatForm({ ...candidatForm, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthdate">Date de naissance</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={candidatForm.birthdate}
                    onChange={(e) => setCandidatForm({ ...candidatForm, birthdate: e.target.value })}
                  />
                </div>
              </div>

              {/* Phone number - auto prefix for Congo */}
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="relative">
                  <Input
                    id="phone"
                    placeholder={candidatForm.country === 'congo' ? "+242 6xxxxxxxx" : "+242 ..."}
                    className="pl-3"
                    value={candidatForm.phone}
                    onChange={(e) => setCandidatForm({ ...candidatForm, phone: e.target.value })}
                    required
                  />
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">Ou</span>
                </div>
              </div>

              <GoogleLoginButton 
                onSuccess={(user) => {
                  toast.success("Inscription réussie avec Google !");
                }}
                onError={(error) => {
                  toast.error(error?.message || "Erreur lors de l'inscription Google");
                }}
                className="w-full"
                userType="candidate"
              />
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-muted-foreground">Ou</span>
                </div>
              </div>

              <GoogleLoginButton 
                onSuccess={(user) => {
                  toast.success("Inscription réussie avec Google !");
                }}
                onError={(error) => {
                  toast.error(error?.message || "Erreur lors de l'inscription Google");
                }}
                className="w-full"
                userType="company"
              />
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
      
      <AuthFooter />
    </div>
  );
};

export default Register;

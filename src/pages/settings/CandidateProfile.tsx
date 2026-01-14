import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { GENDERS } from '@/lib/options';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { uploadFile } from '@/lib/upload';
import { Loader2, Trash2, Upload, FileCheck } from "lucide-react";
import { authHeaders } from '@/lib/headers';

export default function CandidateProfile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Informations personnelles
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [profession, setProfession] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  
  // Parcours & Documents
  const [qualification, setQualification] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [documents, setDocuments] = useState<Record<string, string>>({
    cv: "",
    recommendation: "",
    diploma: "",
    certificate: "",
    identity: "",
    nui: "",
    passport: ""
  });
  const [uploadingDocs, setUploadingDocs] = useState<Record<string, boolean>>({});
  
  // Préférences de Recherche
  const [contractType, setContractType] = useState("");
  const [availability, setAvailability] = useState("");
  const [salary, setSalary] = useState("");
  
  // États de modification
  const [editing, setEditing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      setFullName(data.full_name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setCity(typeof data.city === 'string' ? data.city : "");
      setBirthdate(typeof data.birthdate === 'string' ? data.birthdate : "");
      setGender(typeof data.gender === 'string' ? data.gender : "");
      setLinkedin(typeof data.linkedin === 'string' ? data.linkedin : "");
      setProfession(data.profession || "");
      setJobTitle(data.job_title || "");
      setBio(typeof data.bio === 'string' ? data.bio : "");
      setSkills(typeof data.skills === 'string' || Array.isArray(data.skills) ? (Array.isArray(data.skills) ? data.skills.join(', ') : data.skills) : "");
      
      // Charger les données des sections supplémentaires
      setQualification(data.qualification || "");
      setYearsExperience(data.years_experience || "");
      setDocuments({
        cv: data.documents?.cv || "",
        recommendation: data.documents?.recommendation || "",
        diploma: data.documents?.diploma || "",
        certificate: data.documents?.certificate || "",
        identity: data.documents?.identity || "",
        nui: data.documents?.nui || "",
        passport: data.documents?.passport || ""
      });
      setContractType(data.contract_type || "");
      setAvailability(data.availability || "");
      setSalary(data.salary || "");
      
      if (data.profile_image_url) {
        setPreviewUrl(data.profile_image_url);
      }
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !user) return;

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const newImageUrl = await uploadFile(imageFile, token, 'profiles');

      // Update API with new image
      const headersPut: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({ profile_image_url: newImageUrl }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour photo');
      const updated = await res.json();
      setProfileData(updated);
      setImageFile(null);
      setPreviewUrl(newImageUrl);
      toast.success("Photo de profil mise à jour");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du chargement de la photo");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!user) return;
    try {
      const headersPut: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({ profile_image_url: null }),
      });

      if (!res.ok) throw new Error('Erreur suppression photo');
      const updated = await res.json();
      setProfileData(updated);
      setPreviewUrl(null);
      setImageFile(null);
      toast.success("Photo de profil supprimée");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la suppression de la photo");
    }
  };

  // Fonction pour télécharger un document
  const handleDocumentUpload = async (docType: string) => {
    const fileInput = document.getElementById(`doc-${docType}`) as HTMLInputElement;
    const file = fileInput?.files?.[0];
    
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    // Vérifier que c'est un PDF
    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptés");
      return;
    }

    setUploadingDocs(prev => ({ ...prev, [docType]: true }));
    try {
      const token = localStorage.getItem('token');
      const documentUrl = await uploadFile(file, token, 'documents');

      // Mettre à jour les documents
      const updatedDocs = { ...documents, [docType]: documentUrl };
      setDocuments(updatedDocs);

      // Sauvegarder dans la base de données
      const headersPut: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({ documents: updatedDocs }),
      });

      if (!res.ok) throw new Error('Erreur lors de la sauvegarde du document');
      toast.success(`Document ${docType} téléchargé avec succès`);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors du téléchargement du document");
    } finally {
      setUploadingDocs(prev => ({ ...prev, [docType]: false }));
      if (fileInput) fileInput.value = "";
    }
  };

  // Fonction pour supprimer un document
  const handleRemoveDocument = async (docType: string) => {
    try {
      const updatedDocs = { ...documents, [docType]: "" };
      setDocuments(updatedDocs);

      const headersPut: Record<string, string> = authHeaders('application/json');
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({ documents: updatedDocs }),
      });

      if (!res.ok) throw new Error('Erreur lors de la suppression');
      toast.success(`Document ${docType} supprimé`);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la suppression du document");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const profileImageUrl = profileData?.profile_image_url || null;

      const headersPut: Record<string, string> = authHeaders('application/json');
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s);
      
      const res = await fetch("/api/users/me", {
        method: 'PUT',
        headers: headersPut,
        body: JSON.stringify({
          full_name: fullName,
          email: email,
          phone: phone,
          city: city,
          birthdate: birthdate,
          gender: gender,
          linkedin: linkedin,
          profession: profession,
          job_title: jobTitle,
          bio: bio,
          skills: skillsArray,
          profile_image_url: profileImageUrl,
          qualification: qualification,
          years_experience: yearsExperience,
          documents: documents,
          contract_type: contractType,
          availability: availability,
          salary: salary,
        }),
      });

      if (!res.ok) throw new Error('Erreur mise à jour');
      const updated = await res.json();
      setProfileData(updated);
      setEditing(false);
      setEditingSection(null);
      toast.success("Profil mis à jour");
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

  // Configuration des documents
  const docConfig = {
    cv: { label: "CV", description: "Votre CV au format PDF" },
    recommendation: { label: "Lettres de recommandation", description: "Lettres de vos anciens superviseurs" },
    diploma: { label: "Diplômes", description: "Vos diplômes et certifications" },
    certificate: { label: "Certificats", description: "Certificats professionnels" },
    identity: { label: "Pièce d'identité (CNI)", description: "Copie de votre CNI/ID" },
    nui: { label: "NUI (Numéro d'identification unique)", description: "Votre NUI - si République du Congo" },
    passport: { label: "Passeport", description: "Copie de votre passeport" }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 0: Photo de profil */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Photo de profil</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={previewUrl || (profileData?.profile_image_url as string)} />
              <AvatarFallback>{String(fullName).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted bg-blue-50 text-blue-700 font-medium">
                  {uploadingImage ? 'Chargement...' : 'Changer la photo'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  hidden
                />
              </label>
              {(previewUrl || profileData?.profile_image_url) && (
                <Button
                  variant="outline"
                  onClick={handleRemoveImage}
                  disabled={uploadingImage}
                  className="text-red-600 hover:text-red-700"
                >
                  Supprimer la photo
                </Button>
              )}
            </div>
          </div>
          {imageFile && (
            <div className="flex gap-2">
              <Button
                onClick={handleImageUpload}
                disabled={uploadingImage}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {uploadingImage ? 'Enregistrement...' : 'Enregistrer la photo'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(profileData?.profile_image_url as string || null);
                }}
                disabled={uploadingImage}
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* SECTION 1: Informations personnelles */}
      <Card className="p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Mes informations</h2>
          {editingSection !== 'personal' ? (
            <Button onClick={() => setEditingSection('personal')} variant="outline">
              Modifier
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setEditingSection(null)}>
              Annuler
            </Button>
          )}
        </header>

        <form className="space-y-4">
          {/* Nom complet */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              value={fullName}
              disabled={editingSection !== 'personal'}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled={editingSection !== 'personal'}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={phone}
              disabled={editingSection !== 'personal'}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Date de naissance */}
          <div className="space-y-2">
            <Label htmlFor="birthdate">Date de naissance</Label>
            <Input
              id="birthdate"
              type="date"
              value={birthdate}
              disabled={editingSection !== 'personal'}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>

          {/* Genre */}
          <div className="space-y-2">
            <Label htmlFor="gender">Genre</Label>
            <Select value={gender} onValueChange={setGender} disabled={editingSection !== 'personal'}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Sélectionner le genre" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map((g) => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ville */}
          <div className="space-y-2">
            <Label htmlFor="city">Ville / Quartier</Label>
            <Input
              id="city"
              value={city}
              disabled={editingSection !== 'personal'}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Brazzaville, Kinshasa"
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">Profil LinkedIn</Label>
            <Input
              id="linkedin"
              value={linkedin}
              disabled={editingSection !== 'personal'}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://www.linkedin.com/in/..."
            />
          </div>

          {/* Profession */}
          <div className="space-y-2">
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              value={profession}
              disabled={editingSection !== 'personal'}
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
              disabled={editingSection !== 'personal'}
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
              disabled={editingSection !== 'personal'}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Un court texte de présentation"
              rows={3}
            />
          </div>

          {/* Compétences */}
          <div className="space-y-2">
            <Label htmlFor="skills">Compétences (séparées par virgule)</Label>
            <Textarea
              id="skills"
              value={skills}
              disabled={editingSection !== 'personal'}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Ex: Excel, PHP, Leadership, Gestion de projet"
              rows={2}
            />
            <p className="text-sm text-muted-foreground">Incluez les Hard skills (Excel, PHP) et Soft skills (Leadership, Ponctualité)</p>
          </div>

          {editingSection === 'personal' && (
            <Button 
              type="button" 
              onClick={handleSubmit} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          )}
        </form>
      </Card>

      {/* SECTION 2: Parcours & Documents */}
      <Card className="p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Parcours & Documents</h2>
          {editingSection !== 'career' ? (
            <Button onClick={() => setEditingSection('career')} variant="outline">
              Modifier
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setEditingSection(null)}>
              Annuler
            </Button>
          )}
        </header>

        <div className="space-y-6">
          {/* Diplôme / Qualification */}
          <div className="space-y-2">
            <Label htmlFor="qualification">Diplôme / Qualification</Label>
            {editingSection === 'career' ? (
              <Input
                id="qualification"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="Ex: Bac+5 Informatique, Master en Gestion"
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                {qualification || "Non renseigné"}
              </p>
            )}
          </div>

          {/* Années d'expérience */}
          <div className="space-y-2">
            <Label htmlFor="yearsExperience">Années d'expérience</Label>
            {editingSection === 'career' ? (
              <Input
                id="yearsExperience"
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="Ex: 5, 10, 15..."
                min="0"
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                {yearsExperience ? `${yearsExperience} ans` : "Non renseigné"}
              </p>
            )}
          </div>

          {/* Documents */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Documents requis (PDF uniquement)</h3>
            <p className="text-sm text-muted-foreground">Gérez vos documents via les champs ci-dessous</p>

            {Object.entries(docConfig).map(([docType, config]) => (
              <div key={docType} className="space-y-2 p-4 border rounded-lg bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">{config.label}</Label>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                  {documents[docType] && (
                    <FileCheck className="h-5 w-5 text-green-600" />
                  )}
                </div>

                {editingSection === 'career' ? (
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:bg-blue-50 hover:border-blue-400 transition">
                        <Upload className="h-4 w-4" />
                        {uploadingDocs[docType] ? 'Envoi...' : 'Cliquer pour télécharger'}
                      </div>
                      <input
                        id={`doc-${docType}`}
                        type="file"
                        accept=".pdf"
                        onChange={() => handleDocumentUpload(docType)}
                        disabled={uploadingDocs[docType]}
                        hidden
                      />
                    </label>
                    {documents[docType] && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveDocument(docType)}
                        disabled={uploadingDocs[docType]}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">
                    {documents[docType] ? (
                      <span className="text-green-600 font-medium">✓ Document téléchargé</span>
                    ) : (
                      <span className="text-amber-600">⚠ Document manquant</span>
                    )}
                  </p>
                )}
              </div>
            ))}

            {editingSection === 'career' && (
              <Button 
                type="button" 
                onClick={handleSubmit} 
                className="w-full mt-4" 
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* SECTION 3: Préférences de Recherche */}
      <Card className="p-6">
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Préférences de Recherche</h2>
          {editingSection !== 'preferences' ? (
            <Button onClick={() => setEditingSection('preferences')} variant="outline">
              Modifier
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setEditingSection(null)}>
              Annuler
            </Button>
          )}
        </header>

        <div className="space-y-6">
          {/* Type de contrat */}
          <div className="space-y-2">
            <Label htmlFor="contractType">Type de contrat recherché</Label>
            {editingSection === 'preferences' ? (
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger id="contractType">
                  <SelectValue placeholder="Sélectionner un type de contrat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cdi">CDI (Contrat à Durée Indéterminée)</SelectItem>
                  <SelectItem value="cdd">CDD (Contrat à Durée Déterminée)</SelectItem>
                  <SelectItem value="stage">Stage</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                  <SelectItem value="interim">Intérim</SelectItem>
                  <SelectItem value="apprentissage">Apprentissage</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                {contractType || "Non renseigné"}
              </p>
            )}
          </div>

          {/* Disponibilité */}
          <div className="space-y-2">
            <Label htmlFor="availability">Disponibilité</Label>
            {editingSection === 'preferences' ? (
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger id="availability">
                  <SelectValue placeholder="Sélectionner votre disponibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immédiate</SelectItem>
                  <SelectItem value="2weeks">2 semaines</SelectItem>
                  <SelectItem value="1month">1 mois</SelectItem>
                  <SelectItem value="2months">2 mois</SelectItem>
                  <SelectItem value="3months">3 mois</SelectItem>
                  <SelectItem value="not-available">Non disponible pour le moment</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                {availability || "Non renseigné"}
              </p>
            )}
          </div>

          {/* Prétentions salariales */}
          <div className="space-y-2">
            <Label htmlFor="salary">Prétentions salariales (optionnel)</Label>
            {editingSection === 'preferences' ? (
              <Input
                id="salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="Ex: 500 000 - 1 000 000 CFA"
              />
            ) : (
              <p className="text-sm p-2 bg-muted rounded">
                {salary || "Non renseigné"}
              </p>
            )}
            <p className="text-sm text-muted-foreground">Cette information vous aide à filtrer les offres correspondant à vos attentes</p>
          </div>

          {editingSection === 'preferences' && (
            <Button 
              type="button" 
              onClick={handleSubmit} 
              className="w-full" 
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Loader2, ChevronDown } from "lucide-react";
import { authHeaders } from '@/lib/headers';
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from '@/components/ui/progress';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const search = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const q = (search.get('q') || '').toLowerCase().trim();
  const [docsCount, setDocsCount] = useState<number | null>(null);
  const [skillsCount, setSkillsCount] = useState<number | null>(null);
  const [applicationsCount, setApplicationsCount] = useState<number | null>(null);
  const [jobsPostedCount, setJobsPostedCount] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [showCompletenessDetails, setShowCompletenessDetails] = useState(false);

  // Compute greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    return "Bonsoir";
  };

  // Determine user role
  const userRole = user && String(user.user_type || '').toLowerCase() === 'company' ? 'company' : 'candidate';

  // Compute profile completeness
  const completeness = useMemo(() => {
    if (!profileData) return { percent: 0, missing: [] as string[] };
    const fields: string[] = [];
    const missing: string[] = [];
    
    // Common fields
    if (profileData.full_name || profileData.company_name) fields.push('nom'); else missing.push('nom complet');
    if (profileData.email) fields.push('email'); else missing.push('email');
    if (profileData.profile_image_url) fields.push('photo'); else missing.push('photo');
    if (profileData.phone) fields.push('phone'); else missing.push('téléphone');

    // Role-specific fields
    if (userRole === 'candidate') {
      // Candidate fields
      const candidateFields = [
        { key: 'profession', label: 'profession' },
        { key: 'job_title', label: 'intitulé du poste' },
        { key: 'bio', label: 'biographie' },
        { key: 'skills', label: 'compétences' },
        { key: 'diploma', label: 'diplôme' },
        { key: 'experience_years', label: 'années d\'expérience' },
        { key: 'contract_type', label: 'type de contrat' },
        { key: 'availability', label: 'disponibilité' },
      ];
      for (const f of candidateFields) {
        if (profileData[f.key]) fields.push(f.key); else missing.push(f.label);
      }
    } else if (userRole === 'company') {
      // Company fields
      const companyFields = [
        { key: 'company_name', label: 'nom de l\'entreprise' },
        { key: 'sector', label: 'secteur d\'activité' },
        { key: 'company_size', label: 'taille de l\'entreprise' },
        { key: 'company_address', label: 'adresse' },
        { key: 'website', label: 'site web' },
        { key: 'description', label: 'description' },
        { key: 'mission', label: 'mission' },
        { key: 'values', label: 'valeurs' },
      ];
      for (const f of companyFields) {
        if (profileData[f.key]) fields.push(f.key); else missing.push(f.label);
      }
    }

    // Build percent
    const totalRequired = fields.length + missing.length;
    const filled = fields.length;
    const percent = totalRequired > 0 ? Math.round((filled / totalRequired) * 100) : 0;
    return { percent, missing };
  }, [profileData, userRole]);

  useEffect(() => {
    if (loading) return;

    // fetch user profile for completeness
    (async () => {
      try {
        const headers: Record<string,string> = authHeaders('application/json');
        const res = await fetch('/api/users/me', { headers });
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (e) {
        console.warn('Profile fetch error', e);
      }
    })();

    // fetch user documents
    (async () => {
      try {
        const headers: Record<string,string> = authHeaders('application/json');
        const docsRes = await fetch('/api/user-documents', { headers });
        if (docsRes.ok) {
          const docs = await docsRes.json();
          setDocsCount(Array.isArray(docs) ? docs.length : 0);
        } else {
          setDocsCount(0);
        }

        const skillsRes = await fetch('/api/user-skills', { headers });
        if (skillsRes.ok) {
          const skills = await skillsRes.json();
          setSkillsCount(Array.isArray(skills) ? skills.length : 0);
        } else {
          setSkillsCount(0);
        }

        // If candidate: job applications count
        if (userRole === 'candidate') {
          const appsRes = await fetch('/api/applications?user_id=' + user?.id, { headers });
          if (appsRes.ok) {
            const apps = await appsRes.json();
            setApplicationsCount(Array.isArray(apps) ? apps.length : 0);
          } else setApplicationsCount(0);
        }

        // If company: jobs posted count by this company
        if (userRole === 'company') {
          const jobsRes = await fetch('/api/jobs', { headers });
          if (jobsRes.ok) {
            const jobs = await jobsRes.json();
            const companyName = String(user?.company_name || '').toLowerCase();
            const posted = Array.isArray(jobs)
              ? jobs.filter((j) => (j.company || '').toLowerCase().includes(companyName)).length
              : 0;
            setJobsPostedCount(posted);
          } else setJobsPostedCount(0);
        }
      } catch (e) {
        console.warn('Dashboard fetch error', e);
        setDocsCount(0);
        setSkillsCount(0);
        setApplicationsCount(0);
        setJobsPostedCount(0);
      }
    })();
  }, [loading, user, userRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const showCard = (label: string) => {
    if (!q) return true;
    return label.toLowerCase().includes(q);
  };

  return (
    <div>
      {/* SECTION 1: Greeting card at the top */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-2">{getGreeting()}, {userRole === 'company' ? profileData?.company_name || user?.company_name : user?.full_name}! 👋</h2>
        <p className="text-muted-foreground">
          {userRole === 'candidate' 
            ? 'Bienvenue sur votre tableau de bord. Gérez votre profil, vos candidatures et vos documents depuis le menu à gauche.'
            : 'Bienvenue sur votre tableau de bord. Publiez des offres, gérez vos candidats et contrôlez votre entreprise depuis le menu à gauche.'}
        </p>
      </Card>

      {/* SECTION 2: Profile completeness with expandable details */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Score de profil</div>
              <div className="text-lg font-semibold">Votre profil est complété à {completeness.percent}%</div>
            </div>
            <button
              onClick={() => setShowCompletenessDetails(!showCompletenessDetails)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Voir les détails"
            >
              <ChevronDown 
                size={24} 
                className={`transition-transform ${showCompletenessDetails ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
          <div>
            <Progress value={completeness.percent} />
          </div>

          {/* Expandable details section */}
          {showCompletenessDetails && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-3">Détails de complétude</h4>
              
              {/* Filled fields */}
              {completeness.missing.length < 
                (userRole === 'candidate' 
                  ? 12 
                  : 8) && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-green-700 mb-2">✅ Éléments remplis ({Math.round(completeness.percent)}%)</h5>
                  <div className="text-sm text-gray-600">
                    {userRole === 'candidate' ? (
                      <p>Vous avez complété la plupart de votre profil. Continuez en remplissant les informations manquantes ci-dessous.</p>
                    ) : (
                      <p>Votre profil entreprise est bien avancé. Complétez les informations manquantes ci-dessous.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Missing fields with suggestions */}
              {completeness.missing.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-orange-700 mb-3">⚠️ Éléments manquants ({completeness.missing.length})</h5>
                  <div className="space-y-2">
                    {completeness.missing.map((missing, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <span className="text-sm text-gray-700 capitalize">{missing}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            // Mapping des éléments manquants aux bonnes pages/sections
                            const missingLower = missing.toLowerCase();
                            
                            if (userRole === 'candidate') {
                              // Candidat
                              if (missingLower.includes('photo') || missingLower.includes('nom') || missingLower.includes('email') || missingLower.includes('téléphone') || missingLower.includes('naissance') || missingLower.includes('genre') || missingLower.includes('ville') || missingLower.includes('linkedin')) {
                                window.location.href = '/parametres/profil';
                              } else if (missingLower.includes('profession') || missingLower.includes('titre') || missingLower.includes('biographie') || missingLower.includes('compétence')) {
                                window.location.href = '/parametres/profil';
                              } else if (missingLower.includes('diplôme') || missingLower.includes('expérience') || missingLower.includes('contrat') || missingLower.includes('disponibilité') || missingLower.includes('salaire')) {
                                window.location.href = '/parametres/informations';
                              }
                            } else if (userRole === 'company') {
                              // Entreprise
                              if (missingLower.includes('photo') || missingLower.includes('logo')) {
                                window.location.href = '/parametres/profil';
                              } else if (missingLower.includes('nom') || missingLower.includes('email') || missingLower.includes('secteur') || missingLower.includes('taille') || missingLower.includes('description') || missingLower.includes('mission') || missingLower.includes('valeur')) {
                                window.location.href = '/parametres/profil';
                              } else if (missingLower.includes('site') || missingLower.includes('adresse') || missingLower.includes('localisation')) {
                                window.location.href = '/parametres/localisation';
                              } else if (missingLower.includes('bénéfice') || missingLower.includes('avantage')) {
                                window.location.href = '/parametres/profil';
                              }
                            }
                          }}
                        >
                          Remplir
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completeness.percent === 100 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">🎉 Votre profil est 100% complet !</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
        <div className="space-x-2">
          <Button asChild>
            <Link to="/parametres">Gérer mon compte</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {showCard('Profil') && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Profil</h3>
            <p className="text-muted-foreground mb-3">{userRole === 'company' ? (profileData?.company_name || user?.company_name || '—') : (user?.full_name || '—')}</p>
            <div className="text-sm">Type de compte: <strong>{String(user?.user_type || '—')}</strong></div>
            <div className="text-sm">Certifié: <strong>{user?.is_verified ? 'Oui' : 'Non'}</strong></div>
          </Card>
        )}

        {showCard('Documents') && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Documents</h3>
            <p className="text-muted-foreground">CVs, lettres et pièces téléchargées</p>
            <div className="mt-4 text-3xl font-bold">{docsCount ?? '—'}</div>
            <div className="mt-3">
              <Button asChild>
                <Link to="/documents">Gérer mes documents</Link>
              </Button>
            </div>
          </Card>
        )}

        {showCard('Compétences') && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Compétences</h3>
            <p className="text-muted-foreground">Vos compétences et recommandations</p>
            <div className="mt-4 text-3xl font-bold">{skillsCount ?? '—'}</div>
            <div className="mt-3">
              <Button asChild>
                <Link to="/parametres/recommandations">Gérer mes compétences</Link>
              </Button>
            </div>
          </Card>
        )}

        {showCard('Candidatures') && userRole === 'candidate' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Candidatures</h3>
            <p className="text-muted-foreground">Offres d'emploi auxquelles vous avez postulé</p>
            <div className="mt-4 text-3xl font-bold">{applicationsCount ?? '—'}</div>
            <div className="mt-3">
              <Button asChild>
                <Link to="/emplois">Voir les offres</Link>
              </Button>
            </div>
          </Card>
        )}

        {showCard('Offres') && userRole === 'company' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Offres publiées</h3>
            <p className="text-muted-foreground">Offres d'emploi que vous avez créées</p>
            <div className="mt-4 text-3xl font-bold">{jobsPostedCount ?? '—'}</div>
            <div className="mt-3">
              <Button asChild>
                <Link to="/mes-offres">Gérer les offres</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

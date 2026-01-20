import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useProfanityFilter } from "@/hooks/useProfanityFilter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ProfanityWarningModal } from "@/components/ui/ProfanityWarningModal";
import { CommentsSection } from "@/components/CommentsSection";
import { PublicationActionsMenu } from "@/components/PublicationActionsMenu";
import { ReactionBar } from "@/components/ReactionBar";
import { EditPublicationModal } from "@/components/EditPublicationModal";
import DiscreetModeCard from "@/components/DiscreetModeCard";
import PublicationSkeleton from "@/components/PublicationSkeleton";
import { toast } from "sonner";
import { Loader2, Send, ThumbsUp, Share2, MessageCircle, Image as ImageIcon, X, Edit2, Trash2, FileText, BookOpen, Briefcase, User, MoreVertical, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { authHeaders } from '@/lib/headers';
import { fr } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Publication {
  id: number;
  author_id: number;
  user_type: string;
  full_name?: string;
  company_name?: string;
  profile_image_url?: string;
  content: string;
  image_url?: string;
  category?: string; // 'conseil' or 'annonce' for admins
  created_at: string;
  likes_count?: number;
  comments_count?: number;
  liked?: boolean;
  achievement?: string;
}

interface Formation {
  id: number;
  title: string;
  provider?: string;
  created_at: string;
}

interface Job {
  id: number;
  job_title: string;
  company?: string;
  created_at: string;
}

interface Candidate {
  id: number;
  full_name: string;
  profession?: string;
  location?: string;
  profile_image_url?: string;
  created_at: string;
}

const Newsfeed = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { role } = useUserRole(user);
  const { filterContent, warningCount, isTemporarilySuspended, getRemainingLiftTime } = useProfanityFilter();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [category, setCategory] = useState("conseil");
  const [achievementEnabled, setAchievementEnabled] = useState(false);
  const [achievementJob, setAchievementJob] = useState("");
  const [companyStats, setCompanyStats] = useState({ jobsCount: 0, applicationsCount: 0, viewsCount: 0, verified: false, subscription: false });
  const [candidateStats, setCandidateStats] = useState({ verified: false, subscription: false, documents: 0, applicationsCount: 0, profession: "", job_title: "", profileViewsWeek: 0, profileViewsTotal: 0 });
  const [formExpanded, setFormExpanded] = useState(false);
  const [profanityWarningOpen, setProfanityWarningOpen] = useState(false);
  const [blockedContent, setBlockedContent] = useState("");
  const [blockedWords, setBlockedWords] = useState<string[]>([]);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [publicationComments, setPublicationComments] = useState<Record<number, any[]>>({});
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Données pour le Mode Recherche Discrète
  const [candidateCompany, setCandidateCompany] = useState("");
  const [candidateCompanyId, setCandidateCompanyId] = useState("");
  
  // États pour le chargement infini
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePublications, setHasMorePublications] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const pageSize = 10;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/connexion');
    }
    
    // Charger les données du candidat incluant l'entreprise
    if (user && role === 'candidate') {
      const fetchCandidateData = async () => {
        try {
          const headers = authHeaders('application/json');
          const res = await fetch('/api/users/me', { headers });
          if (res.ok) {
            const data = await res.json();
            setCandidateCompany(data.company || '');
            setCandidateCompanyId(data.company_id || '');
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données candidat:', error);
        }
      };
      fetchCandidateData();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      // Charger la première page seulement
      setCurrentPage(0);
      fetchPublicationsPage(0);
      fetchJobs();
      fetchFormations();
      fetchCandidates();
      fetchCompanyStats();
      fetchCandidateStats();
    }
  }, [user, role]);

  const fetchPublicationsPage = async (page: number) => {
    try {
      if (page === 0) setLoading(true); // Premier chargement
      else setIsLoadingMore(true); // Chargement supplémentaire
      
      const offset = page * pageSize;
      const headers = authHeaders('application/json');
      const res = await fetch(`/api/publications?limit=${pageSize}&offset=${offset}`, { headers });
      
      if (!res.ok) throw new Error('Erreur chargement publications');
      const data = await res.json();
      
      // Gérer la nouvelle structure de réponse
      const newPublications = Array.isArray(data.publications) ? data.publications : [];
      const hasMore = data.hasMore !== false;
      
      if (page === 0) {
        setPublications(newPublications);
      } else {
        setPublications(prev => [...prev, ...newPublications]);
      }
      
      setHasMorePublications(hasMore);
      setCurrentPage(page);
    } catch (error) {
      const err = error as Error;
      toast.error("Erreur lors du chargement des publications");
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMorePublications = async () => {
    if (isLoadingMore || !hasMorePublications) return;
    await fetchPublicationsPage(currentPage + 1);
  };

  // Détecte quand l'utilisateur scrolle vers le bas
  useEffect(() => {
    if (!feedContainerRef.current) return;
    
    const handleScroll = () => {
      const element = feedContainerRef.current;
      if (!element) return;
      
      // Déclencher le chargement à 80% du scroll
      if (
        element.scrollHeight - element.scrollTop - element.clientHeight < element.clientHeight * 0.2
        && !isLoadingMore
        && hasMorePublications
      ) {
        loadMorePublications();
      }
    };
    
    const container = feedContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [feedContainerRef, isLoadingMore, hasMorePublications, currentPage]);

  const fetchPublications = async () => {
    // Fonction obsolète - gardée pour compatibilité
    fetchPublicationsPage(0);
  };


  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs?limit=5');
      if (!res.ok) throw new Error('Erreur chargement offres');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error("Erreur chargement offres:", error);
    }
  };

  const fetchFormations = async () => {
    try {
      const res = await fetch('/api/formations?limit=5');
      if (!res.ok) throw new Error('Erreur chargement formations');
      const data = await res.json();
      setFormations(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error("Erreur chargement formations:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/users/candidates?limit=5');
      if (!res.ok) throw new Error('Erreur chargement candidats');
      const data = await res.json();
      setCandidates(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error("Erreur chargement candidats:", error);
    }
  };

  const fetchCompanyStats = async () => {
    if (role !== 'company') return;
    try {
      const headers = authHeaders();
      const res = await fetch('/api/company/stats', { headers });
      if (!res.ok) throw new Error('Erreur chargement stats');
      const data = await res.json();
      setCompanyStats({
        jobsCount: data.jobsCount || 0,
        applicationsCount: data.applicationsCount || 0,
        viewsCount: data.viewsCount || 0,
        verified: data.verified || false,
        subscription: data.subscription || false,
      });
    } catch (error) {
      console.error("Erreur chargement stats:", error);
    }
  };

  const fetchCandidateStats = async () => {
    if (role !== 'candidate') return;
    try {
      const headers = authHeaders();
      
      // Fetch candidate stats
      const res = await fetch('/api/candidate/stats', { headers });
      if (!res.ok) throw new Error('Erreur chargement stats');
      const data = await res.json();
      
      // Fetch profile view stats
      let profileViewsWeek = 0;
      let profileViewsTotal = 0;
      try {
        const profileStatsRes = await fetch('/api/users/me/profile-stats', { headers });
        if (profileStatsRes.ok) {
          const profileStats = await profileStatsRes.json();
          profileViewsWeek = profileStats.profile_views_week || 0;
          profileViewsTotal = profileStats.profile_views_total || 0;
        }
      } catch (err) {
        console.warn("Could not fetch profile stats:", err);
      }

      setCandidateStats({
        verified: data.verified || false,
        subscription: data.subscription || false,
        documents: data.documents || 0,
        applicationsCount: data.applicationsCount || 0,
        profession: data.profession || "",
        job_title: user?.job_title || "",
        profileViewsWeek,
        profileViewsTotal,
      });
    } catch (error) {
      console.error("Erreur chargement stats candidat:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim()) {
      toast.error("Le contenu de la publication ne peut pas être vide");
      return;
    }

    // Vérifier le filtre de profanité
    const filterResult = filterContent(newPost);
    if (filterResult.isBlocked) {
      setBlockedContent(newPost);
      setBlockedWords(filterResult.triggeredWords);
      setProfanityWarningOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Préparer les données - convertir image en base64 si présente
      let image_url: string | null = null;
      
      if (selectedImage) {
        const reader = new FileReader();
        image_url = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedImage);
        });
      }

      const publicationData = {
        content: newPost,
        visibility: 'public',
        category: role === 'super_admin' ? category : 'conseil',
        achievement: achievementEnabled && achievementJob ? `Poste: ${achievementJob}` : null,
        image_url: image_url || null,
      };

      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(publicationData),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur création publication');
      }

      toast.success("Publication créée avec succès");
      setNewPost("");
      setSelectedImage(null);
      setImagePreview("");
      setCategory("conseil");
      setAchievementEnabled(false);
      setAchievementJob("");
      await fetchPublications();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la création de la publication");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (publicationId: number) => {
    try {
      const currentPublication = publications.find(p => p.id === publicationId);
      const wasLiked = currentPublication?.liked || false;

      // Optimistic update
      setPublications(publications.map(p => 
        p.id === publicationId 
          ? { 
              ...p, 
              liked: !wasLiked, 
              likes_count: (p.likes_count || 0) + (wasLiked ? -1 : 1)
            }
          : p
      ));

      const res = await fetch(`/api/publications/${publicationId}/like`, {
        method: 'POST',
        headers: authHeaders('application/json'),
      });
      
      if (res.ok) {
        toast.success(wasLiked ? "J'aime supprimé" : "Publication aimée !");
      } else {
        // Revert the optimistic update if the request fails
        setPublications(publications.map(p => 
          p.id === publicationId 
            ? { 
                ...p, 
                liked: wasLiked, 
                likes_count: (p.likes_count || 0) + (wasLiked ? 1 : -1)
              }
            : p
        ));
        toast.error("Erreur lors du like");
      }
    } catch (error) {
      console.error("Erreur like:", error);
      // Revert on error
      const currentPublication = publications.find(p => p.id === publicationId);
      const wasLiked = currentPublication?.liked || false;
      setPublications(publications.map(p => 
        p.id === publicationId 
          ? { 
              ...p, 
              liked: wasLiked, 
              likes_count: (p.likes_count || 0) + (wasLiked ? 1 : -1)
            }
          : p
      ));
      toast.error("Erreur lors du like");
    }
  };

  const handleLoadComments = async (publicationId: number) => {
    if (publicationComments[publicationId]) {
      // Already loaded, just toggle
      setExpandedComments(expandedComments === publicationId ? null : publicationId);
      return;
    }

    try {
      const res = await fetch(`/api/publications/${publicationId}/comments`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const comments = await res.json();
        setPublicationComments({
          ...publicationComments,
          [publicationId]: Array.isArray(comments) ? comments : []
        });
        setExpandedComments(publicationId);
      }
    } catch (error) {
      console.error("Erreur chargement commentaires:", error);
      toast.error("Erreur lors du chargement des commentaires");
    }
  };

  const handleCommentAdded = (publicationId: number, newComment: any) => {
    setPublications(publications.map(p =>
      p.id === publicationId
        ? { ...p, comments_count: (p.comments_count || 0) + 1 }
        : p
    ));
    setPublicationComments({
      ...publicationComments,
      [publicationId]: [...(publicationComments[publicationId] || []), newComment]
    });
  };

  const handleCommentDeleted = (publicationId: number, commentId: number) => {
    setPublications(publications.map(p =>
      p.id === publicationId
        ? { ...p, comments_count: Math.max(0, (p.comments_count || 0) - 1) }
        : p
    ));
    setPublicationComments({
      ...publicationComments,
      [publicationId]: (publicationComments[publicationId] || []).filter(c => c.id !== commentId)
    });
  };

  const handleDelete = async (publicationId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/publications/${publicationId}`, {
        method: 'DELETE',
        headers: authHeaders('application/json'),
      });
      if (res.ok) {
        toast.success("Publication supprimée");
        setPublications(publications.filter(p => p.id !== publicationId));
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (publication: Publication) => {
    setEditingPublication(publication);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedPublication: Publication) => {
    // Update the publication in the list
    setPublications(publications.map(p => 
      p.id === updatedPublication.id ? updatedPublication : p
    ));
    setIsEditModalOpen(false);
    setEditingPublication(null);
  };

  const handleProfanityWarningModify = () => {
    setProfanityWarningOpen(false);
    // Le contenu reste dans le textarea pour édition
  };

  const handleProfanityWarningCancel = () => {
    setProfanityWarningOpen(false);
    setNewPost("");
    setSelectedImage(null);
    setImagePreview("");
    setBlockedContent("");
    setBlockedWords([]);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/50">
        <Card className="w-full max-w-md p-8 border-0 shadow-lg">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Fil d'actualité</h1>
            <p className="text-muted-foreground">Connectez-vous pour voir le fil d'actualité et partager avec la communauté.</p>
            <Button asChild className="w-full mt-6">
              <Link to="/connexion">Se connecter</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/inscription">Créer un compte</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const canCreatePost = role === 'company' || role === 'super_admin' || role === 'candidate';
  const isAdmin = role === 'super_admin';
  const isCompany = role === 'company';
  const isCandidate = role === 'candidate';

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLONNE GAUCHE - PROFIL */}
          <div className="lg:col-span-3">
            <Card className="p-6 border-0 shadow-md sticky top-24">
              {/* Photo et infos de base */}
              <div className="text-center mb-6">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={user?.profile_image_url} alt={user?.full_name} />
                  <AvatarFallback className="text-2xl font-bold">
                    {(user?.full_name || user?.company_name || "")
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{user?.full_name || user?.company_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {isCandidate ? "Candidat" : isCompany ? "Entreprise" : "Administrateur"}
                </p>
                {isCandidate && candidateStats.job_title && (
                  <p className="text-xs text-primary font-semibold mt-1">💼 {candidateStats.job_title}</p>
                )}
                {isCandidate && candidateStats.profession && (
                  <p className="text-xs text-primary font-semibold mt-0.5">{candidateStats.profession}</p>
                )}
              </div>

              {/* Score de complétude (si candidat) */}
              {isCandidate && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Profil Complet</span>
                    <span className="text-lg font-bold text-primary">42%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full" 
                      style={{ width: '42%' }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Complétez votre profil pour augmenter vos chances</p>
                </div>
              )}

              {/* Statistiques de visites du profil - Candidats et Entreprises */}
              {(isCandidate || isCompany) && (
                <div className="mb-6 p-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-xs mb-3 text-blue-900 flex items-center gap-2">
                    📊 Visites du profil
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-blue-800">Cette semaine</span>
                      <span className="font-bold text-sm text-blue-600">{candidateStats.profileViewsWeek || 0}</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full" 
                        style={{ width: `${Math.min(candidateStats.profileViewsWeek * 10, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-blue-200">
                      <span className="text-xs text-blue-700">Total</span>
                      <span className="font-semibold text-xs text-blue-600">{candidateStats.profileViewsTotal || 0}</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2 italic">
                    💡 Améliore ton profil!
                  </p>
                </div>
              )}

              {/* Mode Recherche Discrète - Uniquement pour les candidats */}
              {isCandidate && (
                <DiscreetModeCard
                  userType={role}
                  company={candidateCompany}
                  companyId={candidateCompanyId}
                  onStatusChange={(enabled, companyId, companyName) => {
                    // Le composant gère la sauvegarde via l'API
                    // On peut ajouter un callback supplémentaire ici si nécessaire
                  }}
                />
              )}

              {/* Statistiques rapides */}
              <div className="border-t pt-4 mb-4">
                <div className="space-y-2">
                  {isCandidate && (
                    <>
                      <Link to="/parametres/verification" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                        <span className="text-muted-foreground">Statut</span>
                        <span className={`font-semibold ${candidateStats.verified ? 'text-green-600' : 'text-red-600'}`}>
                          {candidateStats.verified ? '✓ Vérifié' : '✗ Non vérifié'}
                        </span>
                      </Link>
                      <Link to="/parametres/abonnement" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                        <span className="text-muted-foreground">Abonnement</span>
                        <span className={`font-semibold ${candidateStats.subscription ? 'text-green-600' : 'text-gray-600'}`}>
                          {candidateStats.subscription ? 'Actif' : 'Inactif'}
                        </span>
                      </Link>
                      <Link to="/candidats" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                        <span className="text-muted-foreground">Candidatures</span>
                        <span className="font-semibold text-primary">{candidateStats.applicationsCount}</span>
                      </Link>
                    </>
                  )}
                  {isCompany && (
                    <>
                      <Link to="/parametres/verification" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                        <span className="text-muted-foreground">Statut</span>
                        <span className={`font-semibold ${companyStats.verified ? 'text-green-600' : 'text-red-600'}`}>
                          {companyStats.verified ? '✓ Vérifié' : '✗ Non vérifié'}
                        </span>
                      </Link>
                      <Link to="/parametres/abonnement" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                        <span className="text-muted-foreground">Abonnement</span>
                        <span className={`font-semibold ${companyStats.subscription ? 'text-green-600' : 'text-gray-600'}`}>
                          {companyStats.subscription ? 'Actif' : 'Inactif'}
                        </span>
                      </Link>
                      <Link to="/emplois" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                        <span className="text-muted-foreground">Offres</span>
                        <span className="font-semibold text-primary">{companyStats.jobsCount}</span>
                      </Link>
                      <Link to="/candidatures" className="flex justify-between text-xs hover:bg-muted p-2 rounded transition-colors">
                        <span className="text-muted-foreground">Candidatures</span>
                        <span className="font-semibold text-primary">{companyStats.applicationsCount}</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              {/* Lien vers Documents - En bas */}
              {isCandidate && (
                <Button asChild variant="outline" className="w-full" size="sm">
                  <Link to="/parametres/profil">
                    <FileText className="h-4 w-4 mr-2" />
                    Mes documents
                  </Link>
                </Button>
              )}

              {/* Admin Stats */}
              {isAdmin && (
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Publications</span>
                      <span className="font-semibold">{publications.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Utilisateurs actifs</span>
                      <span className="font-semibold">1,234</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Lien vers paramètres */}
              <Button asChild variant="ghost" className="w-full mt-4" size="sm">
                <Link to="/parametres">
                  ⚙️ Paramètres du profil
                </Link>
              </Button>
            </Card>
          </div>

          {/* COLONNE CENTRALE - FLUX */}
          <div className="lg:col-span-6">
            <div 
              ref={feedContainerRef}
              className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-4"
            >
              <h1 className="text-4xl font-bold">Fil d'actualité</h1>

              {/* Create Post Card - Style LinkedIn - Compact */}
              {canCreatePost && (
                <Card className="p-4 border-0 shadow-md">
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    {!formExpanded ? (
                      // Compact form
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={user?.profile_image_url} alt={user?.full_name} />
                          <AvatarFallback>
                            {(user?.full_name || user?.company_name || "")
                              .split(" ")
                              .map(n => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Input
                          placeholder="Partagez une actualité, un conseil ou une annonce..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          onFocus={() => setFormExpanded(true)}
                          className="border-0 bg-muted/50 focus:bg-white"
                        />
                      </div>
                    ) : (
                      // Expanded form
                      <>
                        {/* User info header */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user?.profile_image_url} alt={user?.full_name} />
                            <AvatarFallback>
                              {(user?.full_name || user?.company_name || "")
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{user?.full_name || user?.company_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {isCandidate ? "Candidat" : isCompany ? "Entreprise" : "Administrateur"}
                            </p>
                          </div>
                        </div>

                        {/* Text area */}
                        <Textarea
                          placeholder="Partagez une actualité, un conseil ou une annonce..."
                          value={newPost}
                          onChange={(e) => setNewPost(e.target.value)}
                          rows={4}
                          className="resize-none border-0 bg-muted/50 focus:bg-white"
                          autoFocus
                        />

                        {/* Image preview */}
                        {imagePreview && (
                          <div className="relative">
                            <img src={imagePreview} alt="Aperçu" className="w-full h-48 object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview("");
                              }}
                              className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {/* Admin category selection */}
                        {isAdmin && (
                          <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <Label htmlFor="category" className="text-sm font-semibold">Catégorie</Label>
                            <Select value={category} onValueChange={setCategory}>
                              <SelectTrigger id="category">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="conseil">💡 Conseil</SelectItem>
                                <SelectItem value="annonce">📢 Annonce</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Actions bar */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <label className="cursor-pointer hover:bg-muted rounded-lg p-2 transition-colors flex items-center gap-2 text-sm text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              className="hidden"
                            />
                          </label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFormExpanded(false);
                                setNewPost("");
                                setSelectedImage(null);
                                setImagePreview("");
                              }}
                            >
                              Annuler
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              className="bg-gradient-primary hover:opacity-90"
                              disabled={loading || !newPost.trim()}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Publier
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </form>
                </Card>
              )}

              {/* Publications Feed */}
              <div className="space-y-4">
                {/* Show skeletons while loading */}
                {loading && publications.length === 0 && (
                  <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <PublicationSkeleton key={`skeleton-${i}`} />
                    ))}
                  </div>
                )}

                {/* Show message if no publications */}
                {!loading && publications.length === 0 ? (
                  <Card className="p-12 text-center border-0 shadow-md">
                    <p className="text-muted-foreground">Aucune publication pour le moment. Soyez le premier à partager !</p>
                  </Card>
                ) : (
                  <>
                    {publications.map((publication) => (
                    <Card key={publication.id} className="p-6 border-0 shadow-md">
                      {/* Header with user info */}
                      <div className="flex items-start justify-between mb-4">
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => navigate(`/utilisateur/${publication.author_id}`)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={publication.profile_image_url} />
                            <AvatarFallback>
                              {(publication.full_name || publication.company_name || "")
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-bold text-sm hover:text-primary transition-colors">
                              {publication.full_name || publication.company_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {publication.user_type === 'company' 
                                  ? 'Entreprise' 
                                  : publication.user_type === 'super_admin' || publication.user_type === 'admin_offers'
                                  ? 'Administrateur'
                                  : 'Candidat'}
                              </span>
                              •
                              <span>
                                {formatDistanceToNow(new Date(publication.created_at), { addSuffix: true, locale: fr })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {/* Actions menu for owner and report */}
                        <div className="flex items-center gap-2">
                          {user?.id === publication.author_id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingPublication(publication);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  <span>Modifier</span>
                                </DropdownMenuItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700"
                                      onSelect={(e) => e.preventDefault()}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span>Supprimer</span>
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogTitle>Supprimer la publication</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.
                                    </AlertDialogDescription>
                                    <div className="flex gap-3">
                                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(publication.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Supprimer
                                      </AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                          {/* Actions menu - toujours disponible si pas l'auteur */}
                          {user?.id !== publication.author_id && (
                            <PublicationActionsMenu
                              publicationId={publication.id}
                              publicationAuthorId={publication.author_id}
                            />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-foreground whitespace-pre-wrap mb-4">
                        {publication.content}
                      </p>

                      {/* Achievement badge */}
                      {publication.achievement && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                          <span className="text-lg">🎉</span>
                          <div>
                            <p className="text-sm font-semibold text-yellow-900">Nouvelle opportunité !</p>
                            <p className="text-sm text-yellow-800">{publication.achievement}</p>
                          </div>
                        </div>
                      )}

                      {/* Image */}
                      {publication.image_url && (
                        <img 
                          src={publication.image_url} 
                          alt="Publication"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-96 object-cover rounded-lg mb-4 transition-opacity duration-300"
                        />
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 py-2 border-y">
                        <span>{publication.likes_count || 0} J'aime</span>
                        <span>{publication.comments_count || 0} Commentaires</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-around gap-2 mb-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleLike(publication.id)}
                          className={`flex-1 ${publication.liked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'} transition-colors`}
                        >
                          <ThumbsUp className={`h-4 w-4 mr-2 ${publication.liked ? 'fill-red-500' : ''}`} />
                          <span className="hidden sm:inline">{publication.liked ? 'Aimé' : "J'aime"}</span>
                          <span className="sm:hidden">{publication.likes_count || 0}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 hover:text-blue-500 transition-colors"
                          onClick={() => setExpandedComments(expandedComments === publication.id ? null : publication.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Commenter</span>
                          <span className="sm:hidden">{publication.comments_count || 0}</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex-1 hover:text-green-500 transition-colors"
                          onClick={() => {
                            const url = window.location.href;
                            navigator.clipboard.writeText(`Je partage: ${url}`);
                            toast.success('Lien copié pour partager!');
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Partager</span>
                        </Button>
                      </div>

                      {/* Barre de réactions rapides */}
                      <div className="border-t pt-3">
                        <p className="text-xs text-muted-foreground mb-2">Réagir rapidement :</p>
                        <ReactionBar 
                          publicationId={publication.id}
                          onReactionAdded={() => handleCommentAdded(publication.id, { 
                            id: Math.random(), 
                            content: '👍',
                            author_name: user?.full_name || user?.company_name
                          })}
                        />
                      </div>

                      {/* Commentaires */}
                      <CommentsSection
                        publicationId={publication.id}
                        comments={publicationComments[publication.id] || []}
                        onCommentAdded={(comment) => handleCommentAdded(publication.id, comment)}
                        onCommentDeleted={(commentId) => handleCommentDeleted(publication.id, commentId)}
                      />
                    </Card>
                    ))}

                    {/* Loading indicator when fetching more publications */}
                    {isLoadingMore && (
                      <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Chargement des publications...</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* COLONNE DROITE - SUGGESTIONS & TENDANCES */}
          <div className="lg:col-span-3">
            <div className="space-y-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
              {/* Bouton Mes Publications - Disponible pour tous */}
              <Button asChild className="w-full" size="lg">
                <Link to="/mes-publications" className="gap-2">
                  📝 Mes Publications
                </Link>
              </Button>

              {/* Bouton Créer mon CV - Disponible pour les candidats */}
              {isCandidate && (
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800" size="lg">
                  <Link to="/cv-generator" className="gap-2">
                    📄 Créer mon CV
                  </Link>
                </Button>
              )}

              {/* CONTENU INVERSÉ BASÉ SUR LE RÔLE */}
              
              {/* Si CANDIDAT: Affiche les offres d'emploi */}
              {isCandidate && (
                <>
                  <Card className="p-6 border-0 shadow-md">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Offres à la une
                    </h3>
                    <div className="space-y-3">
                      {jobs.length > 0 ? (
                        jobs.map((job) => (
                          <Link key={job.id} to={`/emplois`} className="block p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-primary">
                            <p className="font-semibold text-sm line-clamp-1">{job.job_title}</p>
                            <p className="text-xs text-muted-foreground">{job.company || "Entreprise"}</p>
                            <p className="text-xs text-primary mt-1">📍 Publié il y a peu</p>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Aucune offre disponible</p>
                      )}
                    </div>
                    <Button asChild variant="outline" className="w-full mt-4" size="sm">
                      <Link to="/emplois">
                        Voir toutes les offres
                      </Link>
                    </Button>
                  </Card>

                  {/* Formations recommandées */}
                  <Card className="p-6 border-0 shadow-md">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-secondary" />
                      Formations recommandées
                    </h3>
                    <div className="space-y-3">
                      {formations.length > 0 ? (
                        formations.map((formation) => (
                          <Link key={formation.id} to={`/formations`} className="block p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-secondary">
                            <p className="font-semibold text-sm line-clamp-1">{formation.title}</p>
                            <p className="text-xs text-muted-foreground">{formation.provider || "Formation"}</p>
                            <p className="text-xs text-secondary mt-1">⏱️ Découvrez le contenu</p>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Aucune formation disponible</p>
                      )}
                    </div>
                    <Button asChild variant="outline" className="w-full mt-4" size="sm">
                      <Link to="/formations">
                        Découvrir toutes les formations
                      </Link>
                    </Button>
                  </Card>

                  {/* Entreprises à découvrir */}
                  <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-purple-600" />
                      Entreprises à découvrir
                    </h3>
                    <div className="space-y-3">
                      {candidates.length > 0 ? (
                        candidates
                          .filter((c: any) => c.user_type === 'company')
                          .slice(0, 5)
                          .map((company: any) => (
                            <Link key={company.id} to={`/utilisateur/${company.id}`} className="block p-3 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer border-l-4 border-purple-500 hover:border-purple-600">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10 flex-shrink-0 border border-purple-200">
                                  <AvatarImage src={company.profile_image_url} alt={company.company_name} />
                                  <AvatarFallback className="text-xs bg-purple-500 text-white">
                                    {(company.company_name || "")
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm line-clamp-1 text-gray-900">{company.company_name}</p>
                                  <p className="text-xs text-gray-600 line-clamp-1">Entreprise</p>
                                  <p className="text-xs text-purple-600 mt-1 font-semibold">⭐ Offres disponibles</p>
                                </div>
                              </div>
                            </Link>
                          ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Aucune entreprise disponible</p>
                      )}
                    </div>
                    <Button asChild variant="outline" className="w-full mt-4 border-purple-500 text-purple-600 hover:bg-purple-50" size="sm">
                      <Link to="/entreprises">
                        Consulter toutes les entreprises
                      </Link>
                    </Button>
                  </Card>
                </>
              )}

              {/* Si ENTREPRISE: Affiche les profils candidats */}
              {isCompany && (
                <>
                  <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-500">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-orange-600" />
                      Candidats à la une
                    </h3>
                    <div className="space-y-3">
                      {candidates.length > 0 ? (
                        candidates.map((candidate) => (
                          <Link key={candidate.id} to={`/candidate/${candidate.id}`} className="block p-3 hover:bg-orange-100 rounded-lg transition-colors cursor-pointer border-l-4 border-orange-500 hover:border-orange-600">
                            <div className="flex items-start gap-2">
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage src={candidate.profile_image_url} alt={candidate.full_name} />
                                <AvatarFallback className="text-xs bg-orange-500 text-white">
                                  {(candidate.full_name || "")
                                    .split(" ")
                                    .map(n => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm line-clamp-1 text-gray-900">{candidate.full_name}</p>
                                <p className="text-xs text-gray-600 line-clamp-1">{candidate.profession || "Candidat"}</p>
                                <p className="text-xs text-orange-600 mt-1 font-semibold">⭐ 4.5/5 • Profil complet</p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground">Aucun candidat disponible</p>
                      )}
                    </div>
                    <Button asChild variant="outline" className="w-full mt-4 border-orange-500 text-orange-600 hover:bg-orange-50" size="sm">
                      <Link to="/candidats">
                        Consulter tous les candidats
                      </Link>
                    </Button>
                  </Card>

                  {/* Services pour entreprises */}
                  <Card className="p-6 border-0 shadow-md">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-secondary" />
                      Services de recrutement
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-secondary">
                        <p className="font-semibold text-sm line-clamp-1">Recherche ciblée</p>
                        <p className="text-xs text-muted-foreground">Trouver le candidat idéal</p>
                        <p className="text-xs text-secondary mt-1">💼 Premium • À partir de 29,99$</p>
                      </div>
                      <div className="p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-secondary">
                        <p className="font-semibold text-sm line-clamp-1">Analyse de CV</p>
                        <p className="text-xs text-muted-foreground">Évaluation professionnelle</p>
                        <p className="text-xs text-secondary mt-1">📊 Pro • À partir de 19,99$</p>
                      </div>
                      <div className="p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-secondary">
                        <p className="font-semibold text-sm line-clamp-1">Entretien à distance</p>
                        <p className="text-xs text-muted-foreground">Vidéo screening facilitée</p>
                        <p className="text-xs text-secondary mt-1">📹 Plus • À partir de 9,99$</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" className="w-full mt-4" size="sm">
                      <Link to="/services">
                        Découvrir tous les services
                      </Link>
                    </Button>
                  </Card>
                </>
              )}

              {/* ADMIN: Affiche les deux */}
              {isAdmin && (
                <>
                  <Card className="p-6 border-0 shadow-md">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      Offres à la une
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-primary">
                        <p className="font-semibold text-sm line-clamp-1">Développeur Full Stack</p>
                        <p className="text-xs text-muted-foreground">TechHub Congo</p>
                        <p className="text-xs text-primary mt-1">📍 Brazzaville • Publié il y a 2j</p>
                      </div>
                      <div className="p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-primary">
                        <p className="font-semibold text-sm line-clamp-1">Community Manager</p>
                        <p className="text-xs text-muted-foreground">Digital Agency</p>
                        <p className="text-xs text-primary mt-1">📍 Kinshasa • Publié il y a 3j</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 border-0 shadow-md">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-secondary" />
                      Candidats à la une
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-secondary">
                        <p className="font-semibold text-sm line-clamp-1">Jean Dupont</p>
                        <p className="text-xs text-muted-foreground">Développeur Full Stack</p>
                        <p className="text-xs text-secondary mt-1">⭐ 4.8/5</p>
                      </div>
                      <div className="p-3 hover:bg-muted rounded-lg transition-colors cursor-pointer border-l-4 border-secondary">
                        <p className="font-semibold text-sm line-clamp-1">Marie Leblanc</p>
                        <p className="text-xs text-muted-foreground">Community Manager</p>
                        <p className="text-xs text-secondary mt-1">⭐ 4.6/5</p>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* Conseil du jour - Pour tous */}
              <Card className="p-6 border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  💡 Conseil du jour
                </h3>
                <p className="text-sm text-foreground">
                  {isCandidate 
                    ? "Optimisez votre profil en ajoutant une photo professionnelle et en détaillant votre expérience. Les profils complets reçoivent 5x plus de messages !"
                    : isCompany
                    ? "Consultez régulièrement les candidats à la une et engagez la conversation rapidement. Les meilleurs talents sont souvent rapidement contactés."
                    : "Maintenez la plateforme active en partageant des conseils pertinents et en encourageant la communauté à interagir."}
                </p>
                <Button asChild variant="outline" className="w-full mt-4 bg-white" size="sm">
                  <Link to={isCandidate ? "/services" : isCompany ? "/annuaire" : "/services"}>
                    En savoir plus
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modale d'avertissement de contenu profane */}
      <ProfanityWarningModal
        isOpen={profanityWarningOpen}
        onModify={handleProfanityWarningModify}
        onCancel={handleProfanityWarningCancel}
        triggeredWords={blockedWords}
        warningCount={warningCount}
        isTemporarilySuspended={isTemporarilySuspended}
        remainingTime={getRemainingLiftTime()}
      />

      {/* Modale d'édition de publication */}
      <EditPublicationModal
        publication={editingPublication}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPublication(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default Newsfeed;

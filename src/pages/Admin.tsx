// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api"; // ← Nouveau fichier api.t;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Briefcase, BookOpen, Bell, Trash2 } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'offers';
    } catch {
      return 'offers';
    }
  });

  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const adminRole = admin.role || 'admin';

  // Formulaire Notification site-wide
  const [notification, setNotification] = useState({ title: "", message: "", target: "all", category: "", image_url: "", link: "" });

  // Formulaire Offre
  const [job, setJob] = useState({
    title: "", company: "", location: "", type: "CDI", sector: "", description: "", salary: ""
  });

  // Formulaire Formation
  const [formation, setFormation] = useState({
    title: "", category: "", level: "Débutant", duration: "", description: "", price: ""
  });

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: api.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Offre d'emploi ajoutée !");
      setJob({ title: "", company: "", location: "", type: "CDI", sector: "", description: "", salary: "" });
    },
    onError: () => toast.error("Erreur lors de l'ajout")
  });

  const createFormationMutation = useMutation({
    mutationFn: api.createFormation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      toast.success("Formation ajoutée !");
      setFormation({ title: "", category: "", level: "Débutant", duration: "", description: "", price: "" });
    },
    onError: () => toast.error("Erreur lors de l'ajout")
  });

  const createNotificationMutation = useMutation({
    mutationFn: (payload: any) => api.createSiteNotification(payload),
    onSuccess: () => {
      toast.success("Notification publiée !");
      setNotification({ title: "", message: "", target: "all", category: "", image_url: "", link: "" });
      queryClient.invalidateQueries({ queryKey: ["site-notifications"] });
    },
    onError: () => toast.error("Erreur lors de la publication")
  });

  // Stats en temps réel
  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: api.getJobs });
  const { data: formations = [] } = useQuery({ queryKey: ["formations"], queryFn: api.getFormations });
  const { data: siteNotifications = [] } = useQuery({ queryKey: ["site-notifications"], queryFn: api.getSiteNotifications });
  const { data: stats = { jobs: 0, formations: 0, admins: 0, users: 0, candidates: 0, companies: 0, applications: 0 } } = useQuery({ queryKey: ["stats"], queryFn: api.getStats });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: any) => api.deleteSiteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-notifications"] });
      toast.success('Notification supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);


  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Panneau d'administration</h1>

      {/* Dashboard summary visible to super_admin on the main dashboard */}
      {adminRole === 'super_admin' && activeTab === 'offers' && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Offres d'emploi</div>
            <div className="text-2xl font-bold">{stats.jobs ?? jobs.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Formations</div>
            <div className="text-2xl font-bold">{stats.formations ?? formations.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Candidats</div>
            <div className="text-2xl font-bold">{stats.candidates ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Entreprises</div>
            <div className="text-2xl font-bold">{stats.companies ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Candidatures reçues</div>
            <div className="text-2xl font-bold">{stats.applications ?? 0}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Notifications</div>
                <div className="text-2xl font-bold">{siteNotifications ? siteNotifications.length : 0}</div>
              </div>
              <div>
                <Button onClick={() => navigate('/admin/notifications')} variant="outline">Voir</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Offres d'emploi ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="formations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Formations ({formations.length})
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* === AJOUT OFFRE D'EMPLOI === */}
        <TabsContent value="offers" className="space-y-6">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Nouvelle offre d'emploi</h2>
            <form onSubmit={(e) => { e.preventDefault(); createJobMutation.mutate(job); }} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Titre du poste *</Label>
                <Input required value={job.title} onChange={e => setJob({ ...job, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Entreprise *</Label>
                <Input required value={job.company} onChange={e => setJob({ ...job, company: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Ville *</Label>
                <Input required value={job.location} onChange={e => setJob({ ...job, location: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type de contrat *</Label>
                <Select value={job.type} onValueChange={v => setJob({ ...job, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Appel à projet">Appel à projet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Secteur *</Label>
                <Input required value={job.sector} onChange={e => setJob({ ...job, sector: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Salaire (facultatif)</Label>
                <Input value={job.salary} onChange={e => setJob({ ...job, salary: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={5} value={job.description} onChange={e => setJob({ ...job, description: e.target.value })} />
              </div>
              <Button type="submit" size="lg" className="md:col-span-2" disabled={createJobMutation.isPending}>
                {createJobMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier l'offre"}
              </Button>
            </form>
          </Card>
        </TabsContent>

        {/* === AJOUT NOTIFICATION SITE-WIDE === */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Nouvelle notification (site)</h2>
            <form onSubmit={(e) => { e.preventDefault(); createNotificationMutation.mutate(notification); }} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Titre *</Label>
                <Input required value={notification.title} onChange={e => setNotification({ ...notification, title: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Message</Label>
                <Textarea rows={4} value={notification.message} onChange={e => setNotification({ ...notification, message: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Cible</Label>
                <Select value={notification.target} onValueChange={v => setNotification({ ...notification, target: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="candidate">Candidats</SelectItem>
                    <SelectItem value="company">Entreprises</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catégorie (facultatif)</Label>
                <Input value={notification.category} onChange={e => setNotification({ ...notification, category: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Lien (facultatif)</Label>
                <Input value={notification.link} onChange={e => setNotification({ ...notification, link: e.target.value })} />
              </div>
              <Button type="submit" size="lg" className="md:col-span-2" disabled={createNotificationMutation.isPending}>
                {createNotificationMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer la notification"}
              </Button>
            </form>
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Notifications existantes</h3>
              {siteNotifications && siteNotifications.length > 0 ? (
                <div className="space-y-4">
                  {siteNotifications.map((n: any) => (
                    <div key={n.id} className="flex items-start justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-sm text-muted-foreground">{n.message}</div>
                        <div className="text-xs text-muted-foreground mt-1">Cible: {n.target || 'all'} — {new Date(n.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="destructive" size="sm" onClick={() => deleteNotificationMutation.mutate(n.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Aucune notification trouvée</div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* === AJOUT FORMATION === */}
        <TabsContent value="formations" className="space-y-6">
          <Card className="p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Nouvelle formation</h2>
            <form onSubmit={(e) => { e.preventDefault(); createFormationMutation.mutate(formation); }} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Intitulé de la formation *</Label>
                <Input required value={formation.title} onChange={e => setFormation({ ...formation, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Input required value={formation.category} onChange={e => setFormation({ ...formation, category: e.target.value })} placeholder="ex: Informatique, Marketing..." />
              </div>
              <div className="space-y-2">
                <Label>Niveau *</Label>
                <Select value={formation.level} onValueChange={v => setFormation({ ...formation, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée *</Label>
                <Input required value={formation.duration} onChange={e => setFormation({ ...formation, duration: e.target.value })} placeholder="ex: 8 semaines" />
              </div>
              <div className="space-y-2">
                <Label>Prix (facultatif)</Label>
                <Input value={formation.price} onChange={e => setFormation({ ...formation, price: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={5} value={formation.description} onChange={e => setFormation({ ...formation, description: e.target.value })} />
              </div>
              <Button type="submit" size="lg" className="md:col-span-2" disabled={createFormationMutation.isPending}>
                {createFormationMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier la formation"}
              </Button>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
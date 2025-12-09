// src/pages/Admin.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Loader2, Briefcase, BookOpen } from "lucide-react";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("offers");

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
    mutationFn: db.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Offre d'emploi ajoutée !");
      setJob({ title: "", company: "", location: "", type: "CDI", sector: "", description: "", salary: "" });
    },
    onError: () => toast.error("Erreur lors de l'ajout")
  });

  const createFormationMutation = useMutation({
    mutationFn: db.createFormation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formations"] });
      toast.success("Formation ajoutée !");
      setFormation({ title: "", category: "", level: "Débutant", duration: "", description: "", price: "" });
    },
    onError: () => toast.error("Erreur lors de l'ajout")
  });

  // Stats en temps réel
  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: db.getJobs });
  const { data: formations = [] } = useQuery({ queryKey: ["formations"], queryFn: db.getFormations });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Panneau d'administration</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Offres d'emploi ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="formations" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" /> Formations ({formations.length})
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
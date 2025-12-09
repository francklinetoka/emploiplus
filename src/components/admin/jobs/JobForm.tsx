// src/components/admin/jobs/JobForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, Briefcase } from "lucide-react";

interface JobFormProps {
  job?: any;
  onSuccess: () => void;
}

export default function JobForm({ job, onSuccess }: JobFormProps) {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "CDI",
    salary: "",
    description: "",
    image: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(job?.image_url || null);

  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || "",
        company: job.company || "",
        location: job.location || "",
        type: job.type || "CDI",
        salary: job.salary || "",
        description: job.description || "",
        image: null,
      });
      setPreview(job.image_url || null);
    }
  }, [job]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("company", form.company);
    formData.append("location", form.location);
    formData.append("type", form.type);
    formData.append("salary", form.salary);
    formData.append("description", form.description);
    if (form.image) formData.append("image", form.image);

    try {
      const url = job ? `/api/jobs/${job.id}` : "/api/jobs";
      const method = job ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (res.ok) {
        toast.success(job ? "Offre modifiée !" : "Offre créée avec succès !");
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur");
      }
    } catch {
      toast.error("Serveur injoignable");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10">
      <div className="text-center mb-12">
        <Briefcase className="h-20 w-20 mx-auto text-primary mb-6" />
        <h2 className="text-4xl font-bold">
          {job ? "Modifier l'offre" : "Créer une nouvelle offre d'emploi"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* IMAGE UPLOAD */}
        <div className="space-y-4">
          <Label>Image de l'offre (facultatif)</Label>
          <div className="border-4 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-primary transition">
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Aperçu" className="mx-auto max-h-96 rounded-xl shadow-lg" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute -top-3 -right-3 rounded-full"
                  onClick={() => {
                    setPreview(null);
                    setForm({ ...form, image: null });
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="job-image"
                />
                <Label htmlFor="job-image" className="cursor-pointer">
                  <Button type="button" size="lg" variant="outline">
                    Choisir une image
                  </Button>
                </Label>
                <p className="text-sm text-muted-foreground mt-4">
                  JPG, PNG, WebP • Max 5 Mo • Recommandé : 1200x800px
                </p>
              </>
            )}
          </div>
        </div>

        {/* FORMULAIRE */}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Intitulé du poste *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                placeholder="ex: Développeur Fullstack React & Node.js"
              />
            </div>

            <div className="space-y-2">
              <Label>Entreprise *</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                required
                placeholder="ex: Orange Congo, MTN..."
              />
            </div>

            <div className="space-y-2">
              <Label>Lieu *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
                placeholder="ex: Brazzaville, Pointe-Noire..."
              />
            </div>

            <div className="space-y-2">
              <Label>Type de contrat</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="Stage">Stage</SelectItem>
                  <SelectItem value="Freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Salaire (facultatif)</Label>
              <Input
                value={form.salary}
               onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="ex: 500 000 - 800 000 FCFA"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description complète *</Label>
          <Textarea
            rows={12}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            placeholder="Décrivez les missions, compétences requises, avantages..."
          />
        </div>

        <div className="flex justify-center gap-6 pt-10">
          <Button type="button" variant="outline" size="lg" onClick={onSuccess}>
            Annuler
          </Button>
          <Button type="submit" size="lg" className="px-12">
            {job ? "Enregistrer" : "Publier"} l'offre
          </Button>
        </div>
      </form>
    </div>
  );
}
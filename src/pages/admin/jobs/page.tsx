// src/pages/admin/jobs/page.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";
import JobList from "@/components/admin/jobs/JobList";
import JobForm from "@/components/admin/jobs/JobForm";

export default function JobsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="p-10 min-h-screen">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-bold text-gray-900">Gestion des offres d'emploi</h1>
          <p className="text-xl text-muted-foreground mt-3">
            Ajoutez, modifiez ou publiez vos offres en toute simplicité
          </p>
        </div>
        <Button
          size="lg"
          className="shadow-lg hover:shadow-xl transition"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="mr-3 h-6 w-6" />
          Nouvelle offre
        </Button>
      </div>

      {/* Modal du formulaire */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-10 py-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold flex items-center gap-4">
                <Briefcase className="h-10 w-10 text-primary" />
                Créer une nouvelle offre d'emploi
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </Button>
            </div>
            <div className="p-10">
              <JobForm onSuccess={() => setShowCreateForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Liste des offres */}
      <div className="mt-8">
        <JobList />
      </div>
    </div>
  );
}
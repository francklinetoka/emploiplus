// src/components/admin/formations/FormationList.tsx
import { useState, useEffect } from "react";
import FormationCard from "./FormationCard";
import FormationForm from "./FormationForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function FormationList() {
  const [formations, setFormations] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchFormations = async () => {
    const res = await fetch("/api/formations");
    const data = await res.json();
    setFormations(data);
  };

  useEffect(() => { fetchFormations(); }, []);

  const togglePublish = async (id: string, published: boolean) => {
    await fetch(`/api/formations/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    toast.success(published ? "Formation dépubliée" : "Formation publiée");
    fetchFormations();
  };

  const deleteFormation = async (id: string) => {
    if (!confirm("Supprimer cette formation ?")) return;
    await fetch(`/api/formations/${id}`, { method: "DELETE" });
    toast.success("Formation supprimée");
    fetchFormations();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Formations</h1>
        <Button size="lg" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Nouvelle formation
        </Button>
      </div>

      {showForm || editing ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <FormationForm 
              formation={editing} 
              onSuccess={() => {
                setShowForm(false);
                setEditing(null);
                fetchFormations();
              }} 
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        {formations.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="h-24 w-24 mx-auto mb-6 opacity-20" />
            <p className="text-2xl">Aucune formation</p>
          </div>
        ) : (
          formations.map((f: any) => (
            <FormationCard
              key={f.id}
              formation={f}
              onEdit={() => setEditing(f)}
              onToggle={() => togglePublish(f.id, f.published)}
              onDelete={() => deleteFormation(f.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
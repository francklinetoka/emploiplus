// src/pages/admin/formations/page.tsx

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { Plus, BookOpen } from "lucide-react";

import FormationList from "@/components/admin/formations/FormationList";

import FormationForm from "@/components/admin/formations/FormationForm";

export default function FormationsPage() {

  const [showCreateForm, setShowCreateForm] = useState(false);

  return (

    <div className="p-10">

      <div className="flex justify-between items-center mb-12">

        <h1 className="text-5xl font-bold">Formations</h1>

        <Button size="lg" onClick={() => setShowCreateForm(true)}>

          <Plus className="mr-3 h-6 w-6" />

          Nouvelle formation

        </Button>

      </div>

      {showCreateForm && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-3xl p-10 max-w-4xl w-full max-h-screen overflow-y-auto shadow-2xl">

            <h2 className="text-3xl font-bold mb-8 text-center">Créer une nouvelle formation</h2>

            <CreateFormationForm onSuccess={() => setShowCreateForm(false)} />

            <div className="text-center mt-6">

              <Button variant="outline" size="lg" onClick={() => setShowCreateForm(false)}>

                Fermer

              </Button>

            </div>

          </div>

        </div>

      )}

      <FormationList />

    </div>

  );

}
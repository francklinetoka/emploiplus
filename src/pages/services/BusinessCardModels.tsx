import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MODELS = [
  { id: 1, title: "Modèle Simple", desc: "Nom, poste, contact" },
  { id: 2, title: "Modèle Créatif", desc: "Design coloré, logo" },
  { id: 3, title: "Modèle Minimal", desc: "Noir & blanc professionnel" },
];

export default function BusinessCardModels() {
  return (
    <div className="container py-8">
      <Breadcrumb items={[{ label: 'Accueil', to: '/' }, { label: 'Services' }, { label: 'Modèles cartes' }]} />
      <h1 className="text-2xl font-bold my-4">Modèles de cartes de visite</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {MODELS.map((m) => (
          <Card key={m.id} className="p-4">
            <h3 className="font-semibold">{m.title}</h3>
            <p className="text-sm text-muted-foreground">{m.desc}</p>
            <div className="mt-3 flex gap-2">
              <Button onClick={() => alert('Aperçu rapide')}>Aperçu</Button>
              <Button variant="outline">Utiliser</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, PenTool, Mail, GraduationCap } from "lucide-react";
import BusinessCardModal from "@/components/BusinessCardModal";
import { useState } from "react";
import { sendInteraction } from "@/lib/analytics";

export default function VisualCreation() {
  const [open, setOpen] = useState(false);
  return (
    <section id="creation-visuelle" className="py-12 bg-white">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Création visuelle</h2>
          <p className="text-muted-foreground">Modèles éditables, export PNG/JPG et PDF. Ouvrez l'outil — les comptes connectés bénéficient d'options supplémentaires.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Cartes de visite</h3>
                <p className="text-sm text-muted-foreground">Éditeur recto/verso, icônes et logo, export PDF/image.</p>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => { sendInteraction({ service: 'business-card', event_type: 'create_click' }); setOpen(true); }} className="bg-primary text-white">Créer une carte</Button>
                      <Button variant="outline" asChild><Link to="/services/business-card-models" onClick={() => sendInteraction({ service: 'business-card', event_type: 'view_models' })}>Voir les modèles</Link></Button>
                    </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg bg-rose-100 flex items-center justify-center">
                <PenTool className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Flyers</h3>
                <p className="text-sm text-muted-foreground">3 modèles, textes multiples, images, tailles A4/A5/DL, export PNG/JPG/PDF.</p>
                    <div className="mt-4 flex gap-2">
                      <Button asChild className="bg-rose-600 text-white"><Link to="/services/flyer-creator" onClick={() => sendInteraction({ service: 'flyers', event_type: 'create_click' })}>Créer</Link></Button>
                      <Button variant="outline" asChild><Link to="/services/flyer-creator" onClick={() => sendInteraction({ service: 'flyers', event_type: 'view_templates' })}>Voir</Link></Button>
                    </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Bannières</h3>
                <p className="text-sm text-muted-foreground">Formats réseaux sociaux, alignement et couleurs personnalisables.</p>
                <div className="mt-4 flex gap-2">
                  <Button asChild className="bg-indigo-600 text-white"><Link to="/services/banner-creator">Créer</Link></Button>
                  <Button variant="outline" asChild><Link to="/services/banner-creator">Voir</Link></Button>
                </div>
              </div>
            </div>
          </Card>

          
        </div>
      </div>

      <BusinessCardModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}

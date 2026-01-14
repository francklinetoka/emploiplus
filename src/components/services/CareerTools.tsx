import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, CheckCircle2 } from "lucide-react";

export default function CareerTools() {
  return (
    <section id="Entretiens-preparation" className="py-12">
      <div className="container">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Préparez-vous aux entretiens</h2>
          <p className="text-muted-foreground"> Ouvrez l'outil — les comptes connectés bénéficient d'options supplémentaires.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-stretch">
          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Simulateur d'entretien</h3>
              </div>
              <p className="text-sm text-muted-foreground">Pratiquez pour vos entretiens d'embauche avec un simulateur interactif.</p>
            </div>
            <div className="mt-4">
              <Button asChild className="w-full bg-primary text-white"><Link to="/simulateur-entretien">Démarrer la simulation</Link></Button>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold">Tests de compétence</h3>
              </div>
              <p className="text-sm text-muted-foreground">Testez vos compétences avec des questions spécialisées dans différents domaines.</p>
            </div>
            <div className="mt-4">
              <Button asChild className="w-full"><Link to="/test-competence">Commencer un test</Link></Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

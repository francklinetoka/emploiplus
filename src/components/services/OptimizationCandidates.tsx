import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function OptimizationCandidates() {
  return (
    <section id="optimisation-candidature" className="py-16 bg-muted/30">
      <div className="container">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-bold">Optimisation <span className="text-secondary">Candidature</span></h2>
          <p className="text-muted-foreground">Démarquez-vous avec des documents professionnels</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          <Card className="p-6">
            <h3 className="text-xl font-semibold">Créer un CV professionnel</h3>
            <p className="text-sm text-muted-foreground mt-2">Créez votre CV en ligne et générez-le en PDF ou Word avec nos modèles professionnels.</p>
            <div className="mt-4 flex gap-3">
              <Button asChild className="bg-gradient-primary">
                <Link to="/cv-generator">Créer mon CV</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/cv-modeles">Voir les modèles</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold">Lettre de motivation</h3>
            <p className="text-sm text-muted-foreground mt-2">Rédigez une lettre de motivation impactante avec nos outils et modèles personnalisables.</p>
            <div className="mt-4 flex gap-3">
              <Button asChild className="bg-gradient-secondary">
                <Link to="/letter-generator">Créer ma lettre</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/letter-modeles">Voir les modèles</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-semibold">Assistance par experts</h3>
              <p className="text-sm text-muted-foreground mt-2">Nos experts en recrutement vous accompagnent pour optimiser vos documents et maximiser vos chances de décrocher l'emploi de vos rêves.</p>
            </div>
            <div className="mt-4">
              <Button variant="link" className="p-0 h-auto text-primary" asChild>
                <Link to="/services/conseil-recrutement">En savoir plus <ArrowRight className="ml-2 h-4 w-4 inline" /></Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

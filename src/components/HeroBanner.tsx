import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-main.jpg";

export default function HeroBanner({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
              {title || (
                <>Votre carrière commence ici avec <span className="text-secondary">Emploi+</span></>
              )}
            </h1>
            <p className="text-lg text-primary-foreground/90 md:text-xl">
              {subtitle || "La plateforme de référence pour connecter les talents et les entreprises en République du Congo et dans la sous-région."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
                <Link to="/inscription">
                  Commencer maintenant
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground text-foreground hover:bg-primary-foreground/10">
                <Link to="/emplois">Voir les offres</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-strong">
              <img
                src={heroImage}
                alt="Professionnels collaborant"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

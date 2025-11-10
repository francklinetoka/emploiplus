import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, Award, TrendingUp, Building2, GraduationCap, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-main.jpg";

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
                Votre carrière commence ici avec <span className="text-secondary">Emploi+</span>
              </h1>
              <p className="text-lg text-primary-foreground/90 md:text-xl">
                La plateforme de référence pour connecter les talents et les entreprises en République du Congo et dans la sous-région.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
                  <Link to="/inscription">
                    Commencer maintenant
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
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

      {/* Mission & Values */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Notre mission
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simplifier la recherche d'emploi et faciliter le recrutement en offrant des outils innovants et efficaces.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 space-y-4 border-2 hover:border-primary transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Publication d'offres</h3>
              <p className="text-sm text-muted-foreground">
                Publiez vos offres d'emploi et atteignez des milliers de candidats qualifiés.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-2 hover:border-secondary transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-xl">Recrutement facilité</h3>
              <p className="text-sm text-muted-foreground">
                Trouvez les meilleurs profils grâce à nos outils de recherche avancés.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-2 hover:border-primary transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-xl">Services numériques</h3>
              <p className="text-sm text-muted-foreground">
                Bénéficiez de nos services de rédaction, conception et conseil.
              </p>
            </Card>

            <Card className="p-6 space-y-4 border-2 hover:border-secondary transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="font-semibold text-xl">Information multicanal</h3>
              <p className="text-sm text-muted-foreground">
                Restez informé des opportunités via nos différents canaux.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Emploi+ */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-medium">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-center space-y-4 p-8">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Building2 className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-lg font-medium">Vidéo de présentation</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Pourquoi choisir <span className="text-primary">Emploi+</span> ?
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Plateforme locale</h3>
                    <p className="text-sm text-muted-foreground">
                      Spécialisée dans le marché du travail congolais et de la sous-région.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/10">
                    <span className="font-bold text-secondary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Outils complets</h3>
                    <p className="text-sm text-muted-foreground">
                      De la création de CV à la recherche d'emploi, tout en un seul endroit.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Accompagnement personnalisé</h3>
                    <p className="text-sm text-muted-foreground">
                      Nos experts vous accompagnent dans votre recherche d'emploi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-16 bg-background">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">Nos partenaires</h2>
          <div className="flex justify-center items-center gap-12 flex-wrap opacity-60">
            <div className="h-16 w-32 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="h-16 w-32 rounded-lg bg-muted flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
            Prêt à démarrer votre parcours professionnel ?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Rejoignez des milliers de candidats et entreprises qui font confiance à Emploi+.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
              <Link to="/inscription">
                Créer un compte
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/connexion">Se connecter</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

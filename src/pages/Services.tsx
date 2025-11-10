import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Briefcase, 
  GraduationCap, 
  PenTool, 
  Code, 
  Palette,
  FileCheck,
  ArrowRight,
  Mail
} from "lucide-react";
import servicesImage from "@/assets/services-digital.jpg";

const Services = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Nos <span className="text-primary">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Des solutions complètes pour booster votre carrière et développer votre entreprise
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 bg-background">
        <div className="container space-y-6">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-bold">Services principaux</h2>
            <p className="text-muted-foreground">Tout ce dont vous avez besoin pour réussir</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6 space-y-4 hover:shadow-medium transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Recherche d'emploi</h3>
              <p className="text-sm text-muted-foreground">
                Accédez à des milliers d'offres d'emploi dans tous les secteurs d'activité.
              </p>
              <Button variant="link" asChild className="p-0 h-auto text-primary">
                <Link to="/emplois">
                  Voir les offres
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-medium transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Publication d'offres</h3>
              <p className="text-sm text-muted-foreground">
                Publiez vos offres et trouvez les meilleurs candidats pour votre entreprise.
              </p>
              <Button variant="link" asChild className="p-0 h-auto text-primary">
                <Link to="/inscription">
                  Publier une offre
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>

            <Card className="p-6 space-y-4 hover:shadow-medium transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Formations</h3>
              <p className="text-sm text-muted-foreground">
                Développez vos compétences avec nos formations en informatique, design et commerce.
              </p>
              <Button variant="link" asChild className="p-0 h-auto text-primary">
                <Link to="/formations">
                  Découvrir les formations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Employability Services */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-bold">Optimisation <span className="text-secondary">Candidature</span></h2>
            <p className="text-muted-foreground">Démarquez-vous avec des documents professionnels</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="p-8 space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-primary">
                <FileText className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">Créer un CV professionnel</h3>
              <p className="text-muted-foreground">
                Créez votre CV en ligne et générez-le en PDF ou Word avec nos modèles professionnels.
              </p>
              <div className="flex gap-3">
                <Button asChild className="bg-gradient-primary">
                  <Link to="/creer-cv">Créer mon CV</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/modeles-cv">Voir les modèles</Link>
                </Button>
              </div>
            </Card>

            <Card className="p-8 space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-secondary">
                <Mail className="h-7 w-7 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-semibold">Lettre de motivation</h3>
              <p className="text-muted-foreground">
                Rédigez une lettre de motivation impactante avec nos outils et modèles personnalisables.
              </p>
              <div className="flex gap-3">
                <Button asChild className="bg-gradient-secondary">
                  <Link to="/creer-lettre">Créer ma lettre</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/modeles-lettre">Voir les modèles</Link>
                </Button>
              </div>
            </Card>
          </div>

          <Card className="mt-8 p-6 max-w-4xl mx-auto border-primary/20">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Assistance par experts</h3>
                <p className="text-muted-foreground">
                  Nos experts en recrutement vous accompagnent pour optimiser vos documents et maximiser vos chances de décrocher l'emploi de vos rêves.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary">
                  En savoir plus
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Digital Services */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl font-bold">Services <span className="text-primary">Numériques</span></h2>
            <p className="text-muted-foreground">Solutions digitales pour votre entreprise</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 items-center mb-12">
            <div className="order-2 lg:order-1">
              <div className="grid gap-4">
                <Card className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <PenTool className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Rédaction de documents stratégiques</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Business plan, cahiers des charges, études de marché et documents professionnels.
                  </p>
                </Card>

                <Card className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <Code className="h-5 w-5 text-secondary" />
                    </div>
                    <h3 className="font-semibold text-lg">Conception de systèmes informatiques</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sites web, applications mobiles et solutions logicielles sur mesure.
                  </p>
                </Card>

                <Card className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Gestion de vos plateformes</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Administration et animation de vos réseaux sociaux et sites web.
                  </p>
                </Card>

                <Card className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                      <Palette className="h-5 w-5 text-secondary" />
                    </div>
                    <h3 className="font-semibold text-lg">Conception graphique</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Logos, chartes graphiques, flyers et supports de communication visuelle.
                  </p>
                </Card>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-medium">
                <img 
                  src={servicesImage} 
                  alt="Services numériques" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-primary">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Prêt à profiter de nos services ?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Inscrivez-vous dès maintenant pour accéder à tous nos services et booster votre carrière ou votre entreprise.
          </p>
          <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
            <Link to="/inscription">
              Commencer maintenant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Services;

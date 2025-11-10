import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Code, 
  Palette, 
  TrendingUp, 
  Clock,
  Users,
  Star,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockFormations = [
  {
    id: 1,
    title: "Développement Web Full Stack",
    category: "Informatique",
    level: "Intermédiaire",
    duration: "12 semaines",
    students: 245,
    rating: 4.8,
    description: "Apprenez à créer des applications web modernes avec React, Node.js et MongoDB.",
    icon: Code
  },
  {
    id: 2,
    title: "Design UI/UX avec Figma",
    category: "Design",
    level: "Débutant",
    duration: "8 semaines",
    students: 189,
    rating: 4.7,
    description: "Maîtrisez les fondamentaux du design d'interface et d'expérience utilisateur.",
    icon: Palette
  },
  {
    id: 3,
    title: "Marketing Digital",
    category: "Commerce",
    level: "Débutant",
    duration: "10 semaines",
    students: 321,
    rating: 4.9,
    description: "Stratégies marketing digitales, SEO, réseaux sociaux et analytics.",
    icon: TrendingUp
  },
  {
    id: 4,
    title: "Python pour Data Science",
    category: "Informatique",
    level: "Intermédiaire",
    duration: "14 semaines",
    students: 167,
    rating: 4.6,
    description: "Analyse de données, Machine Learning et visualisation avec Python.",
    icon: Code
  },
  {
    id: 5,
    title: "Adobe Creative Suite",
    category: "Design",
    level: "Débutant",
    duration: "6 semaines",
    students: 198,
    rating: 4.5,
    description: "Photoshop, Illustrator et InDesign pour créer des visuels professionnels.",
    icon: Palette
  }
];

const Formations = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredFormations = selectedCategory === "all" 
    ? mockFormations 
    : mockFormations.filter(f => f.category.toLowerCase() === selectedCategory);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Développez vos <span className="text-primary">compétences</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Accédez à des formations de qualité pour booster votre carrière
            </p>
          </div>
        </div>
      </section>

      {/* Formations List */}
      <section className="py-12 bg-background">
        <div className="container">
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
              <TabsTrigger value="all" onClick={() => setSelectedCategory("all")}>
                Toutes
              </TabsTrigger>
              <TabsTrigger value="informatique" onClick={() => setSelectedCategory("informatique")}>
                Informatique
              </TabsTrigger>
              <TabsTrigger value="design" onClick={() => setSelectedCategory("design")}>
                Design
              </TabsTrigger>
              <TabsTrigger value="commerce" onClick={() => setSelectedCategory("commerce")}>
                Commerce
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredFormations.length}</span> formations disponibles
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredFormations.map((formation) => {
                  const Icon = formation.icon;
                  return (
                    <Card key={formation.id} className="p-6 space-y-4 hover:shadow-medium transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <Badge variant="secondary">{formation.level}</Badge>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                          {formation.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {formation.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formation.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {formation.students}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          {formation.rating}
                        </div>
                      </div>

                      <Button variant="outline" className="w-full group">
                        En savoir plus
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Card>
                  );
                })}
              </div>

              {/* Login Prompt */}
              <Card className="p-8 text-center border-2 border-dashed mt-8">
                <div className="space-y-4 max-w-lg mx-auto">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary mx-auto">
                    <GraduationCap className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Vous avez vu un aperçu de nos formations
                  </p>
                  <p className="font-medium text-lg">
                    Inscrivez-vous pour accéder à l'ensemble du catalogue et commencer votre apprentissage
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild className="bg-gradient-primary">
                      <Link to="/inscription">
                        S'inscrire gratuitement
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/connexion">Se connecter</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Prêt à développer vos compétences ?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Rejoignez des milliers d'apprenants et accédez à nos formations certifiantes.
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

export default Formations;

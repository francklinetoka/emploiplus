import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  Clock,
  ArrowRight,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for demo
const mockJobs = [
  {
    id: 1,
    title: "Développeur Full Stack",
    company: "Tech Solutions Congo",
    location: "Brazzaville",
    type: "CDI",
    sector: "Informatique",
    postedAt: "Il y a 2 jours",
    description: "Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe dynamique..."
  },
  {
    id: 2,
    title: "Chef de Projet Marketing",
    company: "Marketing Pro",
    location: "Pointe-Noire",
    type: "CDD",
    sector: "Marketing",
    postedAt: "Il y a 5 jours",
    description: "Rejoignez notre équipe en tant que Chef de Projet Marketing et participez à des projets innovants..."
  },
  {
    id: 3,
    title: "Comptable Senior",
    company: "Audit & Finance SA",
    location: "Brazzaville",
    type: "CDI",
    sector: "Finance",
    postedAt: "Il y a 1 semaine",
    description: "Cabinet d'expertise comptable recherche un comptable senior pour gérer un portefeuille clients..."
  },
  {
    id: 4,
    title: "Designer Graphique",
    company: "Creative Studio",
    location: "Brazzaville",
    type: "Freelance",
    sector: "Design",
    postedAt: "Il y a 3 jours",
    description: "Studio de création recherche un designer graphique talentueux pour des missions variées..."
  },
  {
    id: 5,
    title: "Ingénieur Civil",
    company: "Construction Congo",
    location: "Pointe-Noire",
    type: "CDI",
    sector: "BTP",
    postedAt: "Il y a 4 jours",
    description: "Entreprise de construction recherche un ingénieur civil pour superviser des projets d'envergure..."
  }
];

const Jobs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [contractType, setContractType] = useState("");
  const [sector, setSector] = useState("");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Trouvez votre <span className="text-primary">emploi idéal</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des milliers d'opportunités professionnelles vous attendent
            </p>
          </div>

          {/* Search Bar */}
          <Card className="p-6 max-w-5xl mx-auto shadow-medium">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Titre du poste, mots-clés..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Localisation"
                  className="pl-10"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Search className="mr-2 h-4 w-4" />
                Rechercher
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="space-y-6">
              <Card className="p-6 space-y-6">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-lg">Filtres</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type de contrat</label>
                    <Select value={contractType} onValueChange={setContractType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="cdi">CDI</SelectItem>
                        <SelectItem value="cdd">CDD</SelectItem>
                        <SelectItem value="stage">Stage</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="projet">Appel à projet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Secteur</label>
                    <Select value={sector} onValueChange={setSector}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tous" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="informatique">Informatique</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="btp">BTP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setContractType("");
                      setSector("");
                      setSearchTerm("");
                      setLocation("");
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </Card>

              {/* Info Card */}
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
                <div className="space-y-3">
                  <h3 className="font-semibold">Plus d'opportunités</h3>
                  <p className="text-sm text-muted-foreground">
                    Inscrivez-vous pour accéder à toutes les offres et postuler directement en ligne.
                  </p>
                  <Button asChild className="w-full bg-gradient-primary">
                    <Link to="/inscription">
                      S'inscrire gratuitement
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Job Listings */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{mockJobs.length}</span> offres trouvées
                </p>
              </div>

              <div className="space-y-4">
                {mockJobs.map((job) => (
                  <Card key={job.id} className="p-6 hover:shadow-medium transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <h3 className="text-xl font-semibold hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {job.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {job.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {job.postedAt}
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="shrink-0">
                          {job.type}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>

                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline" className="border-primary/20 text-primary">
                          <Briefcase className="mr-1 h-3 w-3" />
                          {job.sector}
                        </Badge>
                        <Button variant="link" className="text-primary p-0 h-auto">
                          Voir l'offre
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Load More / Login Prompt */}
              <Card className="p-8 text-center border-2 border-dashed">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Vous avez vu les 5 premières offres
                  </p>
                  <p className="font-medium">
                    Inscrivez-vous pour voir toutes les offres et postuler
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button asChild className="bg-gradient-primary">
                      <Link to="/inscription">
                        S'inscrire
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/connexion">Se connecter</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Jobs;

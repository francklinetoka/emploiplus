// src/components/jobs/JobSearch.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Briefcase, Clock, Filter, X } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export default function JobSearch() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: api.getJobs,
    staleTime: 1000 * 60 * 5,
  });

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs;

    // Recherche par mot-clé (titre, entreprise, description)
    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerSearch) ||
          job.company.toLowerCase().includes(lowerSearch) ||
          job.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Filtre par lieu
    if (location) {
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filtre par type de contrat
    if (type !== "all") {
      filtered = filtered.filter((job) => job.type === type);
    }

    // Tri
    const sorted = [...filtered];
    if (sortBy === "recent") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "salary") {
      sorted.sort((a, b) => {
        const salaryA = parseSalary(a.salary);
        const salaryB = parseSalary(b.salary);
        return salaryB - salaryA;
      });
    } else if (sortBy === "company") {
      sorted.sort((a, b) => a.company.localeCompare(b.company));
    }

    return sorted;
  }, [jobs, search, location, type, sortBy]);

  const parseSalary = (salary?: string): number => {
    if (!salary) return 0;
    const match = salary.match(/(\d+(?:\s*\d+)?)/);
    return match ? parseInt(match[0].replace(/\s/g, ""), 10) : 0;
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setType("all");
    setSortBy("recent");
  };

  const hasActiveFilters = search || location || type !== "all" || sortBy !== "recent";

  return (
    <div className="container py-12 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Trouvez l'emploi de vos rêves
        </h1>
        <p className="text-xl text-muted-foreground">
          Plus de {jobs.length} offres disponibles au Congo
        </p>
      </div>

      {/* BARRE DE RECHERCHE PRINCIPALE */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 sticky top-4 z-10 border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Rechercher un poste, entreprise, compétence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 text-lg h-14"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Lieu (Brazzaville, Pointe-Noire...)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-12 w-64 h-14"
              />
            </div>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-48 h-14">
                <SelectValue placeholder="Type de contrat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les contrats</SelectItem>
                <SelectItem value="CDI">CDI</SelectItem>
                <SelectItem value="CDD">CDD</SelectItem>
                <SelectItem value="Stage">Stage</SelectItem>
                <SelectItem value="Freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 h-14">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récentes</SelectItem>
                <SelectItem value="salary">Meilleur salaire</SelectItem>
                <SelectItem value="company">Par entreprise</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="h-14">
                <X className="mr-2 h-5 w-5" />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Indicateur de filtres actifs */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtres actifs :</span>
            {search && <Badge variant="secondary">{search}</Badge>}
            {location && <Badge variant="secondary">{location}</Badge>}
            {type !== "all" && <Badge variant="secondary">{type}</Badge>}
          </div>
        )}
      </div>

      {/* RÉSULTATS */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-8">
                <Skeleton className="h-8 w-96 mb-4" />
                <Skeleton className="h-5 w-64 mb-6" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedJobs.length === 0 ? (
        <div className="text-center py-24">
          <Briefcase className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <p className="text-2xl font-semibold text-muted-foreground">
            Aucune offre ne correspond à vos critères
          </p>
          <Button onClick={clearFilters} className="mt-6" size="lg">
            <Filter className="mr-2" />
            Supprimer tous les filtres
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-lg text-muted-foreground">
            {filteredAndSortedJobs.length} offre{filteredAndSortedJobs.length > 1 ? "s" : ""} trouvée{filteredAndSortedJobs.length > 1 ? "s" : ""}
          </p>

          {filteredAndSortedJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-xl transition-all duration-300 hover:border-primary/50 cursor-pointer">
              <CardContent className="p-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    {job.image_url ? (
                      <img src={job.image_url} alt={job.company} className="w-20 h-20 rounded-xl object-cover" />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-20 h-20 flex items-center justify-center">
                        <Briefcase className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-primary">{job.title}</h3>
                    <p className="text-xl font-semibold mt-1">{job.company}</p>

                    <div className="flex flex-wrap gap-4 mt-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        <span>{job.type}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-2 font-bold text-primary">
                          <span>{job.salary}</span>
                        </div>
                      )}
                    </div>

                    <p className="mt-4 text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    <div className="mt-6">
                      <Button size="lg">
                        Voir l'offre complète
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
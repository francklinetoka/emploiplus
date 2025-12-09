// src/components/formations/FormationSearch.tsx
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, BookOpen, Clock, Filter, X, ArrowRight } from "lucide-react";

interface Formation {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  price?: string;
  description: string;
  image_url?: string;
  created_at: string;
}

export default function FormationSearch() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const { data: formations = [], isLoading } = useQuery<Formation[]>({
    queryKey: ["formations"],
    queryFn: api.getFormations,
    staleTime: 1000 * 60 * 5,
  });

  const filteredAndSortedFormations = useMemo(() => {
    let filtered = formations;

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.title.toLowerCase().includes(lowerSearch) ||
          f.category.toLowerCase().includes(lowerSearch) ||
          f.description.toLowerCase().includes(lowerSearch)
      );
    }

    if (category) {
      filtered = filtered.filter((f) =>
        f.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (level !== "all") {
      filtered = filtered.filter((f) => f.level === level);
    }

    const sorted = [...filtered];
    if (sortBy === "recent") {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === "price") {
      sorted.sort((a, b) => {
        const priceA = parsePrice(a.price);
        const priceB = parsePrice(b.price);
        return priceA - priceB;
      });
    } else if (sortBy === "duration") {
      sorted.sort((a, b) => a.duration.localeCompare(b.duration));
    }

    return sorted;
  }, [formations, search, category, level, sortBy]);

  const parsePrice = (price?: string): number => {
    if (!price) return 999999999;
    const match = price.match(/(\d+(?:\s*\d+)?)/);
    return match ? parseInt(match[0].replace(/\s/g, ""), 10) : 999999999;
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("all");
    setSortBy("recent");
  };

  const hasActiveFilters = search || category || level !== "all" || sortBy !== "recent";

  return (
    <div className="container py-12 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          Trouvez la formation idéale
        </h1>
        <p className="text-xl text-muted-foreground">
          Plus de {formations.length} formations disponibles au Congo
        </p>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-10 sticky top-4 z-10 border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Rechercher une formation, compétence, domaine..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 text-lg h-14"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Catégorie (Informatique, Marketing...)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="pl-12 w-64 h-14"
              />
            </div>

            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="w-48 h-14">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                <SelectItem value="Débutant">Débutant</SelectItem>
                <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                <SelectItem value="Avancé">Avancé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-56 h-14">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récentes</SelectItem>
                <SelectItem value="price">Prix croissant</SelectItem>
                <SelectItem value="duration">Durée</SelectItem>
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

        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtres actifs :</span>
            {search && <Badge variant="secondary">{search}</Badge>}
            {category && <Badge variant="secondary">{category}</Badge>}
            {level !== "all" && <Badge variant="secondary">{level}</Badge>}
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
      ) : filteredAndSortedFormations.length === 0 ? (
        <div className="text-center py-24">
          <BookOpen className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <p className="text-2xl font-semibold text-muted-foreground">
            Aucune formation ne correspond à vos critères
          </p>
          <Button onClick={clearFilters} className="mt-6" size="lg">
            <Filter className="mr-2" />
            Supprimer les filtres
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-lg text-muted-foreground">
            {filteredAndSortedFormations.length} formation{filteredAndSortedFormations.length > 1 ? "s" : ""} trouvée{filteredAndSortedFormations.length > 1 ? "s" : ""}
          </p>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedFormations.map((formation) => (
              <Card
                key={formation.id}
                className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30 cursor-pointer"
              >
                {formation.image_url ? (
                  <div className="relative overflow-hidden">
                    <img
                      src={formation.image_url}
                      alt={formation.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <Badge className="absolute bottom-4 left-4 text-lg px-4 py-2 bg-primary text-white">
                      {formation.level}
                    </Badge>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-56 flex items-center justify-center">
                    <BookOpen className="h-20 w-20 text-primary/40" />
                  </div>
                )}

                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-primary">{formation.title}</h3>
                  <p className="text-lg font-medium text-muted-foreground mt-1">
                    {formation.category}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{formation.duration}</span>
                    </div>
                    {formation.price && (
                      <div className="flex items-center gap-2 font-bold text-lg text-green-600">
                        <span>{formation.price} FCFA</span>
                      </div>
                    )}
                  </div>

                  <p className="mt-4 text-muted-foreground line-clamp-3">
                    {formation.description}
                  </p>

                  <Button className="w-full mt-6" size="lg">
                    Voir la formation
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
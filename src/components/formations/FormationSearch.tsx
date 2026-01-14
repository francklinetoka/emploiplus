// src/components/formations/FormationSearch.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, X } from "lucide-react";
export default function FormationSearch() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLevel("all");
    setSortBy("recent");
  };

  const hasActiveFilters = search || category || level !== "all" || sortBy !== "recent";

  // Only render the search bar (the page shows the header and results)
  return (
    <div className="bg-white rounded-2xl shadow-xl p-3 mb-10 sticky top-4 z-10 border">
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
  );
}
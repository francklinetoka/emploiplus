// src/pages/Formations.tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Users, Calendar, ArrowRight } from "lucide-react";

// ⚠️ NOUVELLE IMPORTATION : Importez votre composant de recherche
import FormationSearch from "@/components/formations/FormationSearch";

export default function Formations() {
  const { data: formations = [], isLoading, isError } = useQuery({
    queryKey: ["formations"],
    queryFn: api.getFormations,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // --- RENDU DE CHARGEMENT ET ERREUR (inchangé) ---

  if (isLoading) {
    return (
      <div className="container py-16">
        <h1 className="text-5xl font-bold text-center mb-12">Nos Formations</h1>
        {/* Vous pouvez ajouter un Skeleton pour la barre de recherche ici si vous le souhaitez */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container py-32 text-center">
        <BookOpen className="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <p className="text-2xl text-muted-foreground">
          Impossible de charger les formations pour le moment.
        </p>
        <p className="text-muted-foreground mt-4">Veuillez réessayer plus tard.</p>
      </div>
    );
  }

  // --- RENDU PRINCIPAL AVEC LA RECHERCHE ---
  return (
    <div className="container py-16 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Découvrez nos Formations Professionnelles
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Boostez votre carrière avec des formations certifiantes adaptées au marché congolais
        </p>
      </div>

      {/* 🟢 INTÉGRATION DU COMPOSANT DE RECHERCHE 🟢 */}
      <div className="mb-12">
        <FormationSearch />
      </div>

      {formations.length === 0 ? (
        <div className="text-center py-32">
          <BookOpen className="h-32 w-32 mx-auto text-gray-300 mb-8" />
          <p className="text-3xl font-semibold text-muted-foreground">
            Aucune formation disponible pour le moment
          </p>
          <p className="text-lg text-muted-foreground mt-4">
            Revenez bientôt, de nouvelles formations arrivent chaque semaine !
          </p>
        </div>
      ) : (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {/* ... (Reste du code pour afficher les cartes de formation) ... */}
          {formations.map((formation: any) => (
            <Card
              key={formation.id}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/20"
            >
              {formation.image_url ? (
                <div className="relative overflow-hidden">
                  <img
                    src={formation.image_url}
                    alt={formation.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute bottom-4 left-4 text-lg px-4 py-2">
                    {formation.level}
                  </Badge>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-primary/20 to-primary/10 h-56 flex items-center justify-center">
                  <BookOpen className="h-20 w-20 text-primary/50" />
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl line-clamp-2">
                    {formation.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-lg font-medium text-primary">
                  {formation.category}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <p className="text-muted-foreground line-clamp-3">
                  {formation.description || "Formation complète avec accompagnement personnalisé."}
                </p>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>{formation.duration || "Durée non précisée"}</span>
                  </div>
                  {formation.price && (
                    <div className="flex items-center gap-2 font-bold text-lg text-primary">
                      <span>{formation.price} FCFA</span>
                    </div>
                  )}
                </div>

                <Button className="w-full group" size="lg">
                  Voir les détails
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
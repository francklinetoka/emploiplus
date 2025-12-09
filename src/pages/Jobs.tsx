// src/pages/Jobs.tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";

// ⚠️ NOUVELLE IMPORTATION : Importez votre composant de recherche
import JobSearch from "@/components/jobs/JobSearch"; 

const Jobs = () => {
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.getJobs,
  });

  if (isLoading) {
    return (
      <div className="container py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Offres d'emploi</h1>
        <p className="text-xl text-muted-foreground">
          {jobs.length} offre{jobs.length > 1 ? "s" : ""} disponible{jobs.length > 1 ? "s" : ""}
        </p>
      </div>

      {/* 🟢 INTÉGRATION DU COMPOSANT DE RECHERCHE 🟢 */}
      {/* Il est préférable de le placer avant la liste des résultats */}
      <div className="mb-12">
        <JobSearch />
      </div>
      
      {jobs.length === 0 ? (
        <div className="text-center py-32">
          <Briefcase className="h-32 w-32 mx-auto text-gray-300 mb-8" />
          <p className="text-2xl text-muted-foreground">Aucune offre pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job: any) => (
            <div key={job.id} className="transform hover:-translate-y-2 transition">
              {/* Tu peux créer JobCard.tsx ou mettre le code ici */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border hover:border-primary transition">
                <h3 className="text-2xl font-bold mb-3">{job.title}</h3>
                <p className="text-lg text-muted-foreground mb-4">{job.company} • {job.location}</p>
                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                <div className="mt-6 flex justify-between items-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${job.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                    {job.published ? "Publiée" : "Brouillon"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(job.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;
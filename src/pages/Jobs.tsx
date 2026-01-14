// src/pages/Jobs.tsx
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, ExternalLink, ChevronDown, ChevronUp, MapPin, Calendar, Building } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from 'react-router-dom';

// ⚠️ NOUVELLE IMPORTATION : Importez votre composant de recherche
import JobSearch from "@/components/jobs/JobSearch";
import JobRecommendations from "@/components/jobs/JobRecommendations";
import { toast } from 'sonner';
import SaveJobButton from "@/components/jobs/SaveJobButton";

const Jobs = () => {
  const location = useLocation();

  const [filters, setFilters] = useState({
    search: "",
    location: "",
    country: "",
    company: "",
    sector: "",
    competence: "",
    type: "all",
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || params.get('search') || '';
      if (q) setFilters((s) => ({ ...s, search: q }));
    } catch (e) {}
  }, [location.search]);

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => api.getJobs({ q: filters.search || '', location: filters.location || '', company: filters.company || '', sector: filters.sector || '', type: filters.type && filters.type !== 'all' ? filters.type : '' }),
    keepPreviousData: true,
  });

  const { user } = useAuth();
  const profession = user?.profession || '';
  const skills: string[] = Array.isArray(user?.skills) ? user.skills : [];
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  
  // Filter state is handled above and passed to JobSearch

  // Server returns already filtered jobs based on query; use as-is
  const filteredJobs = jobs;

  // Personalized recommendations: simple matching by profession or skills in title/description
  const recommended = filteredJobs.filter((j: Record<string, unknown>) => {
    const hay = `${String(j['title'] || '')} ${String(j['description'] || '')} ${String(j['sector'] || '')}`.toLowerCase();
    if (profession && hay.includes(String(profession).toLowerCase())) return true;
    for (const s of skills) {
      if (hay.includes(String(s).toLowerCase())) return true;
    }
    return false;
  }).slice(0, 4);

  if (isLoading) {
    return (
      <div className="container py-20">
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-7xl mx-auto">
      {/* Page Header 
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Offres d'emploi</h1>
        <p className="text-xl text-muted-foreground">
          Plus de {jobs.length} offre{jobs.length > 1 ? "s" : ""} disponible{jobs.length > 1 ? "s" : ""} au Congo
        </p>
      </div>
*/}
      {/* Search Component */}
      <div className="mb-12">
        <JobSearch onFilterChange={setFilters} />
      </div>
      
      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-32">
          <Briefcase className="h-32 w-32 mx-auto text-gray-300 mb-8" />
          <p className="text-2xl text-muted-foreground">Aucune offre pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {filteredJobs.map((jobItem: Record<string, unknown>) => {
            const job = jobItem as Record<string, unknown>;
            const isExpanded = expandedJobId === String(job.id);
            const hasApplicationUrl = String(job.application_url || '').trim() !== '';
            
            return (
              <article key={String(job.id)} className="transform hover:-translate-y-2 transition">
                <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border hover:border-primary transition h-full flex flex-col">
                  {/* Header */}
                  <div className="mb-4">
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="text-2xl font-bold mb-1 line-clamp-2">{String(job.title)}</h3>
                          <p className="text-sm text-muted-foreground">{String(job.company)} • {String(job.location)}</p>
                        </div>
                      </div>
                  </div>

                  {/* Description - clipped or full */}
                  <p className={`text-sm text-gray-600 flex-1 ${isExpanded ? '' : 'line-clamp-4'}`}>
                    {String(job.description)}
                  </p>

                  {/* Status & Sector badges */}
                    <div className="mt-6 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${job.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {job.published ? "Publiée" : "Brouillon"}
                      </span>
                      {job.sector && <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">{String(job.sector)}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{String(job.location)}</span>
                      <Calendar className="h-4 w-4 ml-2" />
                      <span>
                        {job.deadline ? new Date(String(job.deadline)).toLocaleDateString('fr-FR') : new Date(String(job.published && job.published_at ? job.published_at : job.created_at)).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    {/* Expand/Collapse button */}
                    <button
                      onClick={() => setExpandedJobId(isExpanded ? null : String(job.id))}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Voir moins
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Voir plus
                        </>
                      )}
                    </button>

                    {/* Save job button */}
                    <SaveJobButton jobId={String(job.id)} />

                    {/* Apply buttons */}
                    {job.application_via_emploi && (() => {
                      const dl = job.deadline ? new Date(String(job.deadline)).getTime() : null;
                      const expired = dl ? dl < Date.now() : false;
                      if (!expired) {
                        return (
                          <a
                            href={`/recrutement/postuler/${String(job.id)}`}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                          >
                            Postuler avec Emploi+
                          </a>
                        );
                      }

                      return (
                        <button
                          type="button"
                          title="La date limite de candidature est passée"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                          onClick={() => toast.error("Date limite de candidature dépassée — vous ne pouvez plus postuler.")}
                        >
                          Date limite passée
                        </button>
                      );
                    })()}
                    {hasApplicationUrl && (
                      <a
                        href={String(job.application_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition"
                      >
                        Lien externe
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* CTA Section at bottom */}
      <div className="mt-20 bg-gradient-to-r from-blue-50 to-orange-50 p-12 rounded-2xl border border-blue-200">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Offres recommandées pour vous</h2>
          <p className="text-muted-foreground mb-6">
            {user 
              ? "Basées sur votre profil et vos préférences"
              : "Connectez-vous pour voir des offres personnalisées selon votre profil."
            }
          </p>
          {!user && (
            <div className="flex gap-4 justify-center">
              <a href="/login" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition">
                Se connecter
              </a>
              <a href="/register" className="border border-primary text-primary px-6 py-3 rounded-lg font-semibold hover:bg-primary hover:text-white transition">
                Créer un compte
              </a>
            </div>
          )}
        </div>

        {user && (
          <div className="max-w-4xl mx-auto">
            <JobRecommendations />
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
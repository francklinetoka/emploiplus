import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Candidate {
  id: number;
  full_name: string;
  profile_image_url?: string;
  profession?: string;
}

const Candidates = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsCount, setJobsCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) return;
        const data = await res.json();
        setJobsCount(data.jobs || null);
      } catch (e) {
        // ignore
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) return setCandidates([]);
        const all = await res.json();
        setCandidates((all || []).filter((u: any) => u.user_type === 'candidate' || u.user_type === 'candidat'));
      } catch (e) {
        console.error('Fetch candidates error', e);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profils candidats</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">Candidats: <span className="font-semibold">{candidates.length}</span></div>
          <div className="text-sm text-muted-foreground">Offres: <span className="font-semibold">{jobsCount ?? '—'}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((c) => (
          <Card key={c.id} className="p-4 flex items-center space-x-4">
            <Avatar className="h-14 w-14">
              {c.profile_image_url ? <AvatarImage src={c.profile_image_url} alt={c.full_name} /> : <AvatarFallback>{(c.full_name || 'U').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>}
            </Avatar>
            <div>
              <div className="font-semibold">{c.full_name}</div>
              <div className="text-sm text-muted-foreground">{c.profession || '—'}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Candidates;

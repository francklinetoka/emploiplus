import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin } from 'lucide-react';
import { authHeaders } from '@/lib/headers';

export default function CompanyPage() {
  const { id } = useParams();
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        if (!mounted) return;
        setCompany(data);
      } catch (e) {
        setCompany(null);
      } finally { setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="container py-12">Chargement…</div>;
  if (!company) return <div className="container py-12">Entreprise introuvable.</div>;

  return (
    <div className="container py-12 max-w-4xl">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{company.company_name || company.full_name}</h1>
          <div className="text-sm text-muted-foreground mt-2">{company.sector} • {company.city || company.location || '—'}</div>
          <div className="mt-4 text-gray-700">{company.description || 'Aucune description fournie.'}</div>

          <div className="mt-6 flex gap-3">
            {company.website && <a href={company.website} target="_blank" rel="noreferrer"><Button variant="outline">Visiter le site</Button></a>}
            <Link to="/recrutement"><Button variant="ghost">Voir offres</Button></Link>
          </div>

          {company.documents && Array.isArray(company.documents) && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Documents publiés</h3>
              <div className="space-y-2">
                {company.documents.map((d: any) => (
                  <Card key={d.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{d.title || d.doc_type}</div>
                        <div className="text-sm text-muted-foreground">{d.doc_type}</div>
                      </div>
                      {d.storage_url && <a href={d.storage_url} target="_blank" rel="noreferrer" className="text-primary">Télécharger</a>}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

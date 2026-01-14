import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, ExternalLink, Phone } from "lucide-react";

export default function Annuaire() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      // backend returns all users; filter companies
      const comps = Array.isArray(data) ? data.filter((u: any) => String(u.user_type).toLowerCase() === 'company') : [];
      setCompanies(comps);
    } catch (e) {
      setCompanies([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const filtered = companies.filter(c => {
    if (!q) return true;
    const hay = `${c.company_name || c.full_name || ''} ${c.city || ''} ${c.sector || ''}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="container py-12 max-w-6xl">
      <h1 className="text-3xl font-bold mb-4">Annuaire des entreprises</h1>
      <p className="text-muted-foreground mb-6">Liste des entreprises enregistrées au Congo. Recherchez par nom, ville ou secteur.</p>

      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Input value={q} onChange={(e:any)=>setQ(e.target.value)} placeholder="Rechercher entreprise, ville ou secteur..." />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={()=>setQ('')}>Effacer</Button>
          </div>
        </div>
      </Card>

      {loading ? <p>Chargement...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c:any) => (
            <div key={c.id} className="block">
              <Card className="p-4 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                      {c.company_name ? String(c.company_name).slice(0,1).toUpperCase() : <Briefcase className="w-6 h-6" />}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{c.company_name || c.full_name}</h3>
                        <div className="text-sm text-muted-foreground mt-1">{c.sector}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{c.city || c.location || '—'}</div>
                    </div>

                    <div className="text-sm text-muted-foreground mt-3">{c.description ? String(c.description).slice(0,140) + (String(c.description).length>140? '…':'') : '—'}</div>

                    <div className="mt-4 flex items-center gap-3">
                      <Link to={`/company/${c.id}`} className="text-sm text-primary font-semibold">Voir la fiche</Link>
                      {c.website && (
                        <a href={c.website} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground inline-flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" /> Site web
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="text-sm text-muted-foreground inline-flex items-center gap-2">
                          <Phone className="w-4 h-4" /> {String(c.phone)}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
          {filtered.length === 0 && <div className="text-muted-foreground">Aucune entreprise trouvée.</div>}
        </div>
      )}
    </div>
  );
}

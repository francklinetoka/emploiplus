import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink } from 'lucide-react';

export default function DocumentsPage() {
  const [q, setQ] = useState('');
  const docs = [
    {
      id: 'code-travail-congo',
      title: 'Code du travail - République du Congo (version officielle)',
      description: "Texte officiel du Code du travail appliqué en République du Congo.",
      url: 'https://www.legislation-congo.cg/code-du-travail.pdf'
    },
    {
      id: 'reglementation-emploi',
      title: "Règlementation du travail et sécurité sociale",
      description: 'Réglementations et bonnes pratiques liées à l’emploi et la sécurité des travailleurs au Congo.',
      url: 'https://www.legislation-congo.cg/reglementation-emploi.pdf'
    }
  ];

  const filtered = useMemo(() => {
    if (!q) return docs;
    return docs.filter(d => `${d.title} ${d.description}`.toLowerCase().includes(q.toLowerCase()));
  }, [q, docs]);

  return (
    <div className="container py-12 max-w-6xl">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Documents — Code du travail & Réglementation</h1>
          <p className="text-muted-foreground">Ressources officielles et guides pratiques relatifs au droit du travail en République du Congo.</p>
        </div>
        <div className="w-full max-w-sm">
          <Input placeholder="Rechercher un document…" value={q} onChange={(e:any) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(d => (
          <Card key={d.id} className="p-4 hover:shadow-lg transition">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{d.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">{d.description}</p>
                <div className="mt-3 flex items-center gap-3">
                  <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-primary font-semibold">
                    <ExternalLink className="w-4 h-4" /> Voir / Télécharger
                  </a>
                </div>
              </div>
            </div>
          </Card>
        ))}

        <Card className="p-4 hover:shadow-lg transition">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Contribuer</h2>
              <p className="text-sm text-muted-foreground mt-1">Si vous disposez d’un document officiel à ajouter, contactez l’administrateur ou utilisez le formulaire de contact.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

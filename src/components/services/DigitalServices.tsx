import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PenTool, Code, Briefcase, Palette, ArrowRight } from "lucide-react";
import { sendInteraction } from "@/lib/analytics";

export default function DigitalServices() {
  return (
    <section id="numeriques" className="py-16 bg-background">
      <div className="container">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-3xl font-bold">Services <span className="text-primary">Numériques</span></h2>
          <p className="text-muted-foreground">Solutions digitales pour votre entreprise</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-1 items-stretch">
          <div className="grid gap-4">
            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <PenTool className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Rédaction de documents stratégiques</h3>
              </div>
              <p className="text-sm text-muted-foreground">Business plan, cahiers des charges, études de marché et documents professionnels.</p>
              <Button variant="link" asChild className="p-0 h-auto text-primary">
                <Link to="/services/redaction-documents" onClick={() => sendInteraction({ service: 'redaction', event_type: 'view_more', payload: { from: 'digital_services' } })}>En savoir plus <ArrowRight className="ml-2 h-4 w-4 inline" /></Link>
              </Button>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                  <Code className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">Conception de systèmes informatiques</h3>
              </div>
              <p className="text-sm text-muted-foreground">Sites web, applications mobiles et solutions logicielles sur mesure.</p>
              <Button variant="link" asChild className="p-0 h-auto text-primary">
                <Link to="/services/conception-informatique" onClick={() => sendInteraction({ service: 'informatique', event_type: 'view_more', payload: { from: 'digital_services' } })}>En savoir plus <ArrowRight className="ml-2 h-4 w-4 inline" /></Link>
              </Button>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Gestion de vos plateformes</h3>
              </div>
              <p className="text-sm text-muted-foreground">Administration et animation de vos réseaux sociaux et sites web.</p>
              <Button variant="link" asChild className="p-0 h-auto text-primary">
                <Link to="/services/gestion-plateformes" onClick={() => sendInteraction({ service: 'digital', event_type: 'view_more', payload: { from: 'digital_services' } })}>En savoir plus <ArrowRight className="ml-2 h-4 w-4 inline" /></Link>
              </Button>
            </Card>

            <Card className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                  <Palette className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="font-semibold text-lg">Conception graphique</h3>
              </div>
              <p className="text-sm text-muted-foreground">Logos, chartes graphiques, flyers et supports de communication visuelle.</p>
              <Button variant="link" asChild className="p-0 h-auto text-primary">
                <Link to="/services/conception-graphique" onClick={() => sendInteraction({ service: 'graphique', event_type: 'view_more', payload: { from: 'digital_services' } })}>En savoir plus <ArrowRight className="ml-2 h-4 w-4 inline" /></Link>
              </Button>
            </Card>
          </div>

            <div className="order-1 lg:order-2">
              {/* image removed to keep page focused; catalogues below provide visuals */}
            </div>
        </div>
      </div>
    </section>
  );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Target, 
  Eye, 
  Heart, 
  Users, 
  Star,
  MessageCircle,
  ArrowRight
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import aboutTeamImage from "@/assets/about-team.jpg";

const About = () => {
  const faqs = [
    {
      question: "Comment créer un compte sur Emploi+ ?",
      answer: "Cliquez sur 'Inscription' dans le menu, choisissez votre type de compte (Candidat ou Entreprise), remplissez le formulaire et validez votre email. C'est gratuit et rapide !"
    },
    {
      question: "Est-ce que Emploi+ est gratuit ?",
      answer: "Oui, l'inscription et l'accès aux fonctionnalités de base sont entièrement gratuits pour les candidats et les entreprises. Des services premium sont également disponibles."
    },
    {
      question: "Comment postuler à une offre d'emploi ?",
      answer: "Une fois connecté, parcourez les offres, cliquez sur celle qui vous intéresse et suivez les instructions pour soumettre votre candidature avec votre CV et lettre de motivation."
    },
    {
      question: "Puis-je publier une offre d'emploi ?",
      answer: "Oui, si vous avez un compte Entreprise vérifié, vous pouvez publier des offres d'emploi directement depuis votre tableau de bord."
    },
    {
      question: "Comment optimiser mon CV ?",
      answer: "Utilisez notre outil de création de CV professionnel dans la section Services, ou faites appel à nos experts pour une assistance personnalisée."
    }
  ];

  const testimonials = [
    {
      name: "Marie Nkounkou",
      role: "Développeuse Web",
      content: "Emploi+ m'a permis de trouver mon emploi actuel en moins d'un mois. L'interface est intuitive et les offres sont pertinentes.",
      rating: 5
    },
    {
      name: "Jean Mbemba",
      role: "Directeur RH",
      content: "Excellent outil pour recruter. Nous avons trouvé plusieurs talents qualifiés grâce à cette plateforme.",
      rating: 5
    },
    {
      name: "Sarah Loukabou",
      role: "Designer Graphique",
      content: "Les formations proposées sont de qualité et m'ont aidé à développer mes compétences. Je recommande !",
      rating: 5
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              À propos d'<span className="text-primary">Emploi+</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              La plateforme qui connecte les talents et les opportunités en République du Congo
            </p>
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Notre histoire</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Emploi+ est né de la volonté de révolutionner le marché de l'emploi en République du Congo et dans la sous-région. Face aux défis que rencontrent les candidats dans leur recherche d'opportunités et les entreprises dans leur quête de talents qualifiés, nous avons créé une solution innovante et adaptée aux réalités locales.
                </p>
                <p>
                  Notre plateforme combine technologie moderne et connaissance approfondie du marché du travail congolais pour offrir une expérience unique tant aux chercheurs d'emploi qu'aux recruteurs.
                </p>
                <p>
                  Aujourd'hui, Emploi+ est la référence pour le recrutement et la formation professionnelle, avec des milliers d'utilisateurs actifs et des centaines d'entreprises partenaires.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-strong">
                <img
                  src={aboutTeamImage}
                  alt="Équipe Emploi+"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Valeurs */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-8 space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary mx-auto">
                <Target className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Notre Mission</h3>
              <p className="text-muted-foreground">
                Faciliter l'accès à l'emploi et aux formations pour tous, tout en aidant les entreprises à trouver les meilleurs talents.
              </p>
            </Card>

            <Card className="p-8 space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-secondary mx-auto">
                <Eye className="h-8 w-8 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Notre Vision</h3>
              <p className="text-muted-foreground">
                Devenir la plateforme de référence pour l'emploi et la formation en Afrique centrale, reconnue pour son innovation et son impact.
              </p>
            </Card>

            <Card className="p-8 space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary mx-auto">
                <Heart className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold">Nos Valeurs</h3>
              <p className="text-muted-foreground">
                Excellence, intégrité, innovation et engagement envers le développement professionnel de notre communauté.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Ce que disent nos utilisateurs</h2>
            <p className="text-muted-foreground">Des milliers de personnes nous font confiance</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                <div className="pt-4 border-t">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Questions fréquentes</h2>
            <p className="text-muted-foreground">Trouvez rapidement les réponses à vos questions</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6 bg-background">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Community */}
      <section className="py-16 bg-background">
        <div className="container">
          <Card className="p-12 text-center space-y-6 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary mx-auto">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold">Rejoignez notre communauté</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Suivez-nous sur les réseaux sociaux pour rester informé des dernières opportunités, conseils carrière et actualités.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                Nous contacter
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-primary">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold text-primary-foreground">
            Prêt à commencer votre parcours ?
          </h2>
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
            Rejoignez Emploi+ dès aujourd'hui et découvrez toutes les opportunités qui vous attendent.
          </p>
          <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
            <Link to="/inscription">
              Créer un compte gratuit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default About;

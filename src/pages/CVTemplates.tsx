import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";

const CV_TEMPLATES = [
  {
    id: "modern",
    name: "CV Moderne",
    description:
      "Un design élégant et contemporain idéal pour les secteurs tech et créatifs",
    features: [
      "Couleurs dynamiques",
      "Layout innovant",
      "Section compétences avancée",
    ],
    image: "🎨",
  },
  {
    id: "classic",
    name: "CV Classique",
    description:
      "Le format traditionnel apprécié des recruteurs conservateurs et grandes entreprises",
    features: [
      "Format professionnel",
      "Lisibilité maximale",
      "Impression optimisée",
    ],
    image: "📄",
  },
  {
    id: "minimal",
    name: "CV Minimaliste",
    description: "Un design épuré qui met l'accent sur vos compétences et expérience",
    features: [
      "Design épuré",
      "Pas de distractions",
      "Ultra-lisible",
    ],
    image: "✨",
  },
];

export default function CVTemplates() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Modèles de CV</h1>
          <p className="text-xl text-muted-foreground">
            Choisissez parmi nos modèles professionnels et créez votre CV en quelques minutes
          </p>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info */}
        <Card className="p-8 mb-12 bg-blue-50 border-l-4 border-l-blue-600">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tous les modèles sont gratuits</h2>
          <p className="text-gray-700 mb-4">
            Explorez nos différents modèles de CV et créez celui qui vous représente le mieux.
            Vous pouvez télécharger en PDF ou Word, et modifier autant de fois que vous le souhaitez.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-gray-900">Entièrement gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <span className="text-gray-900">Éditables à volonté</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💾</span>
              <span className="text-gray-900">Téléchargements illimités</span>
            </div>
          </div>
        </Card>

        {/* Modèles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CV_TEMPLATES.map((template) => (
            <Card key={template.id} className="hover:shadow-2xl transition overflow-hidden flex flex-col">
              {/* Aperçu visuel */}
              <div className="p-12 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-b">
                <span className="text-6xl">{template.image}</span>
              </div>

              {/* Contenu */}
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-muted-foreground mb-6 flex-1">{template.description}</p>

                {/* Caractéristiques */}
                <div className="mb-8">
                  <h4 className="font-semibold text-gray-900 mb-3">Caractéristiques</h4>
                  <ul className="space-y-2">
                    {template.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Boutons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Aperçu
                  </Button>
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => navigate("/cv-generator")}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Utiliser
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="p-12 mt-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Prêt à créer votre CV?</h2>
            <p className="text-lg text-blue-50 mb-8">
              Rejoignez des milliers de candidats qui ont trouvé leur emploi avec Emploi+
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => navigate("/cv-generator")}
            >
              Créer un CV maintenant
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Edit, Trash2, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import { CVTemplateFrancklyn } from "@/components/cv-templates/CVTemplateFrancklyn";
import { CVTemplateMinimalist } from "@/components/cv-templates/CVTemplateMinimalist";
import { CVTemplateGeometric } from "@/components/cv-templates/CVTemplateGeometric";
import { CVTemplateInfographic } from "@/components/cv-templates/CVTemplateInfographic";
import { CVTemplateClassicSober } from "@/components/cv-templates/CVTemplateClassicSober";
import { CVTemplateOrangeDynamic } from "@/components/cv-templates/CVTemplateOrangeDynamic";
import { CVTemplateModernRibbon } from "@/components/cv-templates/CVTemplateModernRibbon";
import { CVTemplatePastelJunior } from "@/components/cv-templates/CVTemplatePastelJunior";
import { CVTemplateRibbonSidebar } from "@/components/cv-templates/CVTemplateRibbonSidebar";
import { CVTemplateExecutive } from "@/components/cv-templates/CVTemplateExecutive";
import { CVTemplateNavyBlue } from "@/components/cv-templates/CVTemplateNavyBlue";
import { CVTemplateWarmMinimal } from "@/components/cv-templates/CVTemplateWarmMinimal";
import { CVTemplateTurquoiseOrange } from "@/components/cv-templates/CVTemplateTurquoiseOrange";
import { CVTemplateYellowMask } from "@/components/cv-templates/CVTemplateYellowMask";
import { CVTemplateHighEnd } from "@/components/cv-templates/CVTemplateHighEnd";
import { CVTemplateNavyWhite } from "@/components/cv-templates/CVTemplateNavyWhite";
import { CVTemplateBlackWhite } from "@/components/cv-templates/CVTemplateBlackWhite";
import { CVTemplateYellowGeometric } from "@/components/cv-templates/CVTemplateYellowGeometric";
import { CVTemplateInfographicBlueOrange } from "@/components/cv-templates/CVTemplateInfographicBlueOrange";
import { CVTemplateRibbonLayers } from "@/components/cv-templates/CVTemplateRibbonLayers";
import { CVTemplateTurquoiseOrangeV2 } from "@/components/cv-templates/CVTemplateTurquoiseOrangeV2";
import { CVTemplateExecutiveCadre } from "@/components/cv-templates/CVTemplateExecutiveCadre";
import { CVTemplateOrangeCreative } from "@/components/cv-templates/CVTemplateOrangeCreative";
import { CVTemplateStudentPastel } from "@/components/cv-templates/CVTemplateStudentPastel";
import { CVTemplateTimeline } from "@/components/cv-templates/CVTemplateTimeline";
import { CVTemplateNavyModern } from "@/components/cv-templates/CVTemplateNavyModern";
import { CVEditorModal, CVData } from "@/components/CVEditorModal";
import { useCVStorage } from "@/hooks/useCVStorage";

const CV_TEMPLATES = [
  {
    id: "francklyn",
    name: "Modèle 1 - Francklin Sylver",
    description:
      "Design professionnel deux colonnes avec barre latérale - Idéal pour mettre en valeur vos compétences et expériences",
    features: [
      "Barre latérale avec compétences et langues",
      "Design deux colonnes moderne",
      "Éléments graphiques élégants",
      "Format A4 optimisé pour impression",
    ],
    image: "💼",
  },
  {
    id: "minimalist",
    name: "Modèle 2 - Minimaliste",
    description:
      "Design minimaliste noir et blanc épuré avec deux colonnes distinctes - Idéal pour un CV classique et professionnel",
    features: [
      "Colonne latérale sombre avec informations de contact",
      "Design épuré et minimaliste",
      "Excellente lisibilité",
      "Format A4 optimisé pour impression",
    ],
    image: "⬛",
  },
  {
    id: "geometric",
    name: "Modèle 3 - Géométrique",
    description:
      "Design moderne et géométrique avec couleurs jaune vif et gris - Parfait pour les candidats créatifs",
    features: [
      "Formes géométriques modernes",
      "Palette de couleurs jaune et gris",
      "Barres de progression pour les compétences",
      "Design innovant et attractif",
    ],
    image: "🟨",
  },
  {
    id: "infographic",
    name: "Modèle 4 - Infographique",
    description:
      "Design infographique visuel avec graphiques circulaires et barres de progression colorées - Pour un impact maximal",
    features: [
      "Graphiques circulaires pour les compétences",
      "Palette bleu nuit et jaune orangé",
      "Icônes dans des cercles colorés",
      "Mise en page aérée et moderne",
    ],
    image: "📊",
  },
  {
    id: "classicsober",
    name: "Modèle 5 - Classique Sobre",
    description:
      "Design professionnel et sobre avec contraste gris/blanc - Idéal pour une lecture rapide par les recruteurs",
    features: [
      "Header gris anthracite avec informations",
      "Deux colonnes bien définies",
      "Compétences et formation sur fond sombre",
      "Typographie élégante et professionnelle",
    ],
    image: "🎩",
  },
  {
    id: "orangedynamic",
    name: "Modèle 6 - Orange Dynamique",
    description:
      "Design dynamique avec contraste orange/noir/blanc - Pour une présentation énergique et moderne",
    features: [
      "Bannière orange impactante",
      "Photo circulaire centrée",
      "Barres de progression orange",
      "Icônes de réseaux sociaux intégrées",
    ],
    image: "🟠",
  },
  {
    id: "modernribbon",
    name: "Modèle 7 - Ruban Moderne",
    description:
      "Design avec rubans et timeline moderne - Idéal pour un CV créatif et structuré",
    features: [
      "Titres en forme de pilules arrondies",
      "Timeline verticale avec points orange",
      "Diagrammes circulaires pour compétences",
      "Mise en page très moderne et aérée",
    ],
    image: "🎀",
  },
  {
    id: "pasteljunior",
    name: "Modèle 8 - Pastel Junior",
    description:
      "Design doux et aéré pour juniors/étudiants - Parfait pour les jeunes talents",
    features: [
      "Header en couleur pastel rose",
      "Colonne gauche étroite avec sections structurées",
      "Colonne droite spacieuse avec détails",
      "Très aéré avec beaucoup d'espaces blancs",
    ],
    image: "🌸",
  },
  {
    id: "ribbonsidebar",
    name: "Modèle 9 - Ruban Latéral",
    description:
      "Design avec rubans gris qui dépassent + timeline verticale - Pour un CV structuré et moderne",
    features: [
      "Colonne latérale grise (35%) avec rubans qui dépassent",
      "Rubans gris foncé avec effet d'ombre",
      "Timeline verticale fine avec points solides",
      "Très épuré et professionnel",
    ],
    image: "🎀",
  },
  {
    id: "executive",
    name: "Modèle 10 - Cadre Professionnel",
    description:
      "Design haute performance pour cadres - Photo carrée, barre grise avec coordonnées",
    features: [
      "Photo carrée en haut gauche",
      "Nom et titre à droite du header",
      "Barre grise avec coordonnées alignées",
      "Typographie Serif pour les titres",
    ],
    image: "🏢",
  },
  {
    id: "navyblue",
    name: "Modèle 11 - Bleu Marine",
    description:
      "Design professionnel avec header bleu marine - Photo circulaire qui chevauche",
    features: [
      "Header bleu marine (#000080)",
      "Photo circulaire chevauchant le header",
      "Barre latérale grise clair avec sections",
      "Titres bleu marine soulignés",
    ],
    image: "🌊",
  },
  {
    id: "warmminimal",
    name: "Modèle 12 - Minimaliste Chaleureux",
    description:
      "Design doux avec palette beige - Expériences en blocs arrondis chaleureux",
    features: [
      "Fond beige très clair (#fdf6ec)",
      "Photo circulaire en haut à gauche",
      "Blocs d'expérience arrondis en beige",
      "Couleurs brunes douces et premium",
    ],
    image: "☕",
  },
  {
    id: "turquoiseorange",
    name: "Modèle 13 - Turquoise & Orange",
    description:
      "Design vibrant avec barre latérale turquoise et accents orange - Photo avec bordure orange",
    features: [
      "Barre latérale turquoise (#2bb0ac) 30% de largeur",
      "Photo de profil cercle avec bordure orange (#f39c12)",
      "Titres de sections avec soulignés orange",
      "Barres de progression pour compétences",
    ],
    image: "🌊",
  },
  {
    id: "yellowmask",
    name: "Modèle 14 - Bloc Jaune & Masque",
    description:
      "Design moderne avec bloc jaune vif et photo qui dépasse - Timeline verticale jaune",
    features: [
      "Bloc jaune vif (#f1c40f) avec photo qui dépasse",
      "Effet de masque arrondi U-shape sur la photo",
      "Timeline verticale jaune pour les expériences",
      "Colonne gauche gris clair (#f8f8f8) pour infos",
    ],
    image: "⭐",
  },
  {
    id: "highend",
    name: "Modèle 15 - High-End Minimaliste",
    description:
      "Design premium ultra épuré - Header gris avec deux colonnes et ligne discrète",
    features: [
      "Header gris (#f2f2f2) avec nom en orange (#e67e22)",
      "Deux colonnes avec ligne verticale très discrète",
      "Police légère et majuscules largement espacées",
      "Minimaliste et très professionnel",
    ],
    image: "💼",
  },
  {
    id: "navywhite",
    name: "Modèle 16 - Bleu Marine Bicolore",
    description:
      "Design bicolore professionnel - Barre latérale bleu marine avec photo en double cercle",
    features: [
      "Barre latérale bleu marine foncé (#0a1d37) 33%",
      "Photo en double cercle blanc avec effet de profondeur",
      "Titres de sections en capsules bleues (#0a1d37)",
      "Marges étroites pour maximiser le contenu",
    ],
    image: "🎩",
  },
  {
    id: "blackwhite",
    name: "Modèle 17 - Noir & Blanc Minimaliste",
    description:
      "Design épuré noir/blanc avec barre latérale noire et barres de progression",
    features: [
      "Barre latérale noire (#1a1a1a) avec texte blanc",
      "Photo profil arrondie en bas",
      "Barres de progression pour compétences",
      "Très minimaliste et professionnel",
    ],
    image: "⬛",
  },
  {
    id: "yellowgeometric",
    name: "Modèle 18 - Jaune Géométrique",
    description:
      "Design moderne avec accents géométriques jaunes et ligne verticale de séparation",
    features: [
      "Bloc jaune (#f39c12) en haut à gauche derrière photo",
      "Ligne verticale grise avec points jaunes de repère",
      "Triangles jaunes dans les coins pour l'équilibre",
      "Design géométrique et très moderne",
    ],
    image: "✨",
  },
  {
    id: "infographicblueorange",
    name: "Modèle 19 - Infographique Bleu/Orange",
    description:
      "Design infographique avec vagues fluides, diagrammes circulaires et capsules oranges",
    features: [
      "Colonne latérale bleu nuit (#101820)",
      "Vague orange cuivré (#cf8d2e) autour de la photo",
      "Diagrammes circulaires SVG pour compétences",
      "Capsules orange avec timeline",
    ],
    image: "🌀",
  },
  {
    id: "ribbonlayers",
    name: "Modèle 20 - Rubans Superposés",
    description:
      "Design avec rubans qui se chevauchent et arche pour la photo de profil",
    features: [
      "Colonne latérale grise avec photos en cadre arche",
      "Titres en blocs rectangulaires gris qui dépassent",
      "Timeline des expériences avec rubans gris",
      "Effet de superposition très élégant",
    ],
    image: "🎀",
  },
  {
    id: "turquoiseorangev2",
    name: "Modèle 21 - Turquoise Orange V2",
    description:
      "Design bicolore turquoise/orange avec barres fines et lignes de soulignement",
    features: [
      "Barre latérale turquoise (#2bb0ac)",
      "Photo cercle avec bordure orange (#f39c12)",
      "Barres horizontales fines pour compétences",
      "Titres soulignés par ligne orange",
    ],
    image: "💎",
  },  {
    id: "executivecadre",
    name: "Modèle 22 - Exécutif Cadre",
    description:
      "Design professionnel pour cadre - Photo carrée, bloc gris anthracite, barre contact",
    features: [
      "Photo carrée à gauche dans le header",
      "Bloc gris anthracite (#4a4a4a) avec nom/titre en blanc",
      "Barre contact gris clair (#f2f2f2)",
      "Colonne gauche noire avec polices serif",
    ],
    image: "👔",
  },
  {
    id: "orangecreative",
    name: "Modèle 23 - Orange Créatif",
    description:
      "Design créatif bicolore - Grand bandeau orange, colonne noire, icônes sociales",
    features: [
      "Bandeau orange vif (#f39c12) en haut",
      "Photo circulaire bordée de noir",
      "Colonne latérale droite noire avec barres orange",
      "Icônes réseaux sociaux en bas",
    ],
    image: "🎨",
  },
  {
    id: "studentpastel",
    name: "Modèle 24 - Étudiant Pastel",
    description:
      "Design doux pour étudiants - Header rose pastel, sections noires, très aéré",
    features: [
      "Header rose pastel (#fce4ec)",
      "Photo carrée arrondie à gauche",
      "Titres sur rectangles noirs avec texte blanc",
      "Très aéré et moderne pour juniors",
    ],
    image: "🎓",
  },
  {
    id: "timeline",
    name: "Modèle 25 - Timeline Pointillée",
    description:
      "Design avec timeline infographique - Ligne pointillée, cercles jaunes d'accent",
    features: [
      "Sidebar gris perle (#dcdde1) avec photo",
      "Timeline verticale pointillée avec points jaunes (#fbc531)",
      "Icônes de sections sur la ligne",
      "Segments rectangulaires pour langues",
    ],
    image: "⏳",
  },
  {
    id: "navymodern",
    name: "Modèle 26 - Bleu Marine Moderne",
    description:
      "Design bicolore bleu marine - Photo circulaire qui chevauche le header",
    features: [
      "Bandeau bleu marine (#000080) en haut",
      "Photo circulaire qui chevauche header/contenu",
      "Colonne gauche et droite bien équilibrées",
      "Titres bleus avec lignes de soulignement fines",
    ],
    image: "🌀",
  },];

// Données d'exemple pour le prévisualisation
const SAMPLE_CV_DATA = {
  full_name: "Jean Dupont",
  job_title: "Développeur Full Stack Senior",
  phone: "+33 6 12 34 56 78",
  email: "jean.dupont@email.com",
  location: "Paris, France",
  summary: "Développeur passionné avec 8 années d'expérience dans le développement web. Spécialisé en React, Node.js et architecture microservices. Aime les défis techniques et travailler en équipe.",
  experiences: [
    {
      company: "TechCorp",
      position: "Développeur Full Stack Senior",
      startDate: "2021",
      endDate: "Présent",
      description: "Leadership technique sur les projets web. Implémentation d'architectures scalables avec React et Node.js.",
    },
    {
      company: "WebSolutions",
      position: "Développeur Full Stack",
      startDate: "2018",
      endDate: "2021",
      description: "Développement d'applications e-commerce. Optimisation des performances. Mentorat des juniors.",
    },
  ],
  education: [
    {
      school: "École Nationale Supérieure d'Informatique",
      degree: "Master Informatique",
      field: "Développement Logiciel",
      year: "2016",
    },
    {
      school: "Université de Technologie",
      degree: "Licence Informatique",
      field: "Programmation et Systèmes",
      year: "2014",
    },
  ],
  skills: ["React", "Node.js", "TypeScript", "MongoDB", "PostgreSQL", "Docker", "AWS", "GraphQL"],
  languages: [
    { name: "Français", level: "Expert" },
    { name: "Anglais", level: "Avancé" },
    { name: "Espagnol", level: "Intermédiaire" },
  ],
  qualities: ["Leadership", "Communication", "Créativité", "Résolution de problèmes", "Rigueur"],
};

const getTemplateComponent = (templateId: string) => {
  switch (templateId) {
    case "francklyn":
      return CVTemplateFrancklyn;
    case "minimalist":
      return CVTemplateMinimalist;
    case "geometric":
      return CVTemplateGeometric;
    case "infographic":
      return CVTemplateInfographic;
    case "classicsober":
      return CVTemplateClassicSober;
    case "orangedynamic":
      return CVTemplateOrangeDynamic;
    case "modernribbon":
      return CVTemplateModernRibbon;
    case "pasteljunior":
      return CVTemplatePastelJunior;
    case "ribbonsidebar":
      return CVTemplateRibbonSidebar;
    case "executive":
      return CVTemplateExecutive;
    case "navyblue":
      return CVTemplateNavyBlue;
    case "warmminimal":
      return CVTemplateWarmMinimal;
    case "turquoiseorange":
      return CVTemplateTurquoiseOrange;
    case "yellowmask":
      return CVTemplateYellowMask;
    case "highend":
      return CVTemplateHighEnd;
    case "navywhite":
      return CVTemplateNavyWhite;
    case "blackwhite":
      return CVTemplateBlackWhite;
    case "yellowgeometric":
      return CVTemplateYellowGeometric;
    case "infographicblueorange":
      return CVTemplateInfographicBlueOrange;
    case "ribbonlayers":
      return CVTemplateRibbonLayers;
    case "turquoiseorangev2":
      return CVTemplateTurquoiseOrangeV2;
    case "executivecadre":
      return CVTemplateExecutiveCadre;
    case "orangecreative":
      return CVTemplateOrangeCreative;
    case "studentpastel":
      return CVTemplateStudentPastel;
    case "timeline":
      return CVTemplateTimeline;
    case "navymodern":
      return CVTemplateNavyModern;
    default:
      return CVTemplateFrancklyn;
  }
};

export default function CVTemplates() {
  const { cvs, addCV, updateCV, deleteCV } = useCVStorage();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingCV, setEditingCV] = useState<CVData | null>(null);
  const [previewCVId, setPreviewCVId] = useState<string | null>(null);

  const handleNewCV = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setEditingCV(null);
    setEditorOpen(true);
  };

  const handleEditCV = (cv: CVData) => {
    setEditingCV(cv);
    setSelectedTemplateId(cv.template);
    setEditorOpen(true);
  };

  const handleSaveCV = (cvData: CVData) => {
    if (editingCV) {
      updateCV(editingCV.id, cvData);
      toast.success("CV mis à jour!");
    } else {
      addCV(cvData);
      toast.success("CV créé avec succès!");
    }
    setEditorOpen(false);
    setEditingCV(null);
  };

  const handleDeleteCV = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce CV?")) {
      deleteCV(id);
      toast.success("CV supprimé!");
    }
  };

  const handleExportPDF = (cv: CVData) => {
    const TemplateComponent = getTemplateComponent(cv.template);
    const element = document.createElement("div");
    const root = document.createElement("div");
    element.appendChild(root);

    // Render to a temporary container
    const tempDiv = document.createElement("div");
    document.body.appendChild(tempDiv);
    tempDiv.innerHTML = `<div style="width: 210mm; aspect-ratio: 210/297;"></div>`;

    const opt = {
      margin: 0,
      filename: `${cv.full_name || "CV"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    // For PDF export, we'll use a simplified approach
    setTimeout(() => {
      window.print();
    }, 100);

    toast.success("Préparation de l'export PDF...");
  };

  const cvsByTemplate = CV_TEMPLATES.map((template) => ({
    ...template,
    cvs: cvs.filter((cv) => cv.template === template.id),
  }));

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

      {/* Editor Modal */}
      {editorOpen && selectedTemplateId && (
        <CVEditorModal
          isOpen={editorOpen}
          templateId={selectedTemplateId}
          onClose={() => setEditorOpen(false)}
          onSave={handleSaveCV}
          initialData={editingCV || undefined}
        />
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-12">
          {cvsByTemplate.map((templateGroup) => (
            <div key={templateGroup.id}>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {templateGroup.name}
                </h2>
                <p className="text-gray-600 mb-4">{templateGroup.description}</p>

                {/* Template Preview Card */}
                <Card className="hover:shadow-2xl transition overflow-hidden mb-6">
                  <div className="grid grid-cols-2 gap-8 p-8">
                    {/* Aperçu visuel du CV */}
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
                      {(() => {
                        const TemplateComponent = getTemplateComponent(
                          templateGroup.id
                        );
                        return (
                          <div
                            className="w-full max-w-xs"
                            style={{ aspectRatio: "210/297" }}
                          >
                            <div
                              className="bg-white shadow-lg h-full overflow-hidden rounded border"
                              style={{ scale: "0.8", transformOrigin: "top" }}
                            >
                              <TemplateComponent data={SAMPLE_CV_DATA} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Informations du modèle */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        {templateGroup.name}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {templateGroup.description}
                      </p>

                      {/* Caractéristiques */}
                      <div className="mb-8">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Caractéristiques
                        </h4>
                        <ul className="space-y-2">
                          {templateGroup.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-sm text-gray-700"
                            >
                              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Boutons */}
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                        onClick={() => handleNewCV(templateGroup.id)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Créer un CV avec ce modèle
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* CVs créés avec ce modèle */}
                {templateGroup.cvs.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Vos CVs avec ce modèle ({templateGroup.cvs.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {templateGroup.cvs.map((cv) => (
                        <Card
                          key={cv.id}
                          className="p-4 hover:shadow-lg transition flex flex-col"
                        >
                          <div className="mb-4 flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {cv.full_name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {cv.job_title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Créé le:{" "}
                              {new Date(cv.createdAt).toLocaleDateString("fr-FR")}
                            </p>
                          </div>

                          <div className="flex gap-2 pt-4 border-t">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-2"
                              onClick={() => setPreviewCVId(cv.id)}
                            >
                              <Eye className="w-4 h-4" />
                              Voir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-2"
                              onClick={() => handleEditCV(cv)}
                            >
                              <Edit className="w-4 h-4" />
                              Éditer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 gap-2"
                              onClick={() => handleExportPDF(cv)}
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteCV(cv.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
              onClick={() => {
                if (CV_TEMPLATES.length > 0) {
                  handleNewCV(CV_TEMPLATES[0].id);
                }
              }}
            >
              Créer un CV maintenant
            </Button>
          </div>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewCVId && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-screen p-4 flex items-center justify-center">
            <Card className="w-full max-w-4xl bg-white relative">
              <button
                onClick={() => setPreviewCVId(null)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <span className="text-2xl">×</span>
              </button>

              <div className="p-8">
                {(() => {
                  const cv = cvs.find((c) => c.id === previewCVId);
                  if (!cv) return null;

                  const TemplateComponent = getTemplateComponent(cv.template);
                  return (
                    <div>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                          Aperçu - {cv.full_name}
                        </h2>
                        <div className="flex gap-4">
                          <Button
                            onClick={() => {
                              handleEditCV(cv);
                              setPreviewCVId(null);
                            }}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Éditer
                          </Button>
                          <Button
                            onClick={() => handleExportPDF(cv)}
                            variant="outline"
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </Button>
                        </div>
                      </div>

                      <div className="border rounded-lg bg-gray-50 p-4 max-h-[80vh] overflow-auto">
                        <div
                          className="mx-auto bg-white shadow-lg"
                          style={{ width: "210mm", aspectRatio: "210/297" }}
                        >
                          <TemplateComponent data={cv} />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

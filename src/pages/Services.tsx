import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import BusinessCardModal from "@/components/BusinessCardModal";
import {
  FileText,
  Briefcase,
  GraduationCap,
  PenTool,
  Code,
  Palette,
  FileCheck,
  ArrowRight,
  Mail,
  CheckCircle,
  Zap,
  Eye,
  HelpCircle,
} from "lucide-react";
import servicesImage from "@/assets/services-digital.jpg";
import Breadcrumb from "@/components/Breadcrumb";

import HeroServices from "@/components/services/HeroServices";
import OptimizationCandidates from "@/components/services/OptimizationCandidates";
import OptimizationCompanies from "@/components/services/OptimizationCompanies";
import CareerTools from "@/components/services/CareerTools";
import VisualCreation from "@/components/services/VisualCreation";
import DigitalServices from "@/components/services/DigitalServices";

export default function Services() {
  const { user } = useAuth();
  const { isCompany } = useUserRole();
  const [activeTab, setActiveTab] = useState<
    "optimization" | "tools" | "visual" | "digital"
  >("optimization");

  const navigation = [
    {
      id: "optimization",
      label: "Optimisation",
      icon: Zap,
      description: "Améliorer votre profil et candidature",
    },
    {
      id: "tools",
      label: "Outils",
      icon: Briefcase,
      description: "Accéder aux outils professionnels",
    },
    {
      id: "visual",
      label: "Création Visuelle",
      icon: Palette,
      description: "Créer des documents professionnels",
    },
    {
      id: "digital",
      label: "Services Numériques",
      icon: Code,
      description: "Services techniques avancés",
    },
  ];

  return (
    <div className="min-h-screen bg-white">


    

      <div className="bg-slate-50 py-9">

       
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-3">
                <h3 className="text-lg font-semibold text-slate-900 px-2 mb-4">Services</h3>

                <div className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() =>
                          setActiveTab(
                            item.id as
                              | "optimization"
                              | "tools"
                              | "visual"
                              | "digital"
                          )
                        }
                        className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 border border-blue-200 text-blue-900"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="font-medium text-sm">{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Help Card */}
                <Card className="p-4 mt-6 border border-slate-200 bg-white">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">
                        Besoin d'aide ?
                      </h4>
                      <p className="text-xs text-slate-600 mb-3">
                        Contactez-nous pour un accompagnement.
                      </p>
                      <Link to="/contact">
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Nous contacter
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {/* Header */}
                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">
                    {navigation.find((n) => n.id === activeTab)?.label}
                  </h2>
                  <p className="text-slate-600">
                    {navigation.find((n) => n.id === activeTab)?.description}
                  </p>
                </div>

                {/* Optimization Section */}
                {activeTab === "optimization" && (
                  <div className="animate-fadeIn">
                    {isCompany ? (
                      <OptimizationCompanies />
                    ) : (
                      <OptimizationCandidates />
                    )}
                  </div>
                )}

                {/* Tools Section */}
                {activeTab === "tools" && (
                  <div className="animate-fadeIn">
                    <CareerTools />
                  </div>
                )}

                {/* Visual Creation Section */}
                {activeTab === "visual" && (
                  <div className="animate-fadeIn">
                    <VisualCreation />
                  </div>
                )}

                {/* Digital Services Section - Only for companies */}
                {activeTab === "digital" && isCompany && (
                  <div className="animate-fadeIn">
                    <DigitalServices />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
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
} from "lucide-react";
import servicesImage from "@/assets/services-digital.jpg";
import Breadcrumb from "@/components/Breadcrumb";

import HeroServices from "@/components/services/HeroServices";
import OptimizationCandidates from "@/components/services/OptimizationCandidates";
import CareerTools from "@/components/services/CareerTools";
import VisualCreation from "@/components/services/VisualCreation";
import DigitalServices from "@/components/services/DigitalServices";

function CreateBusinessCardButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-primary text-white">
        Créer une carte
      </Button>
      <BusinessCardModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const Services = () => {
  return (
    <div className="flex flex-col">
      <HeroServices />
     



      <div className="container mt-8 space-y-12">
        <OptimizationCandidates />

        <hr />
        <CareerTools />
        <hr />
        <VisualCreation />

        <hr />
        <DigitalServices />
      </div>
    </div>
  );
};

export default Services;

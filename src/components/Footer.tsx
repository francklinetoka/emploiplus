import { Link } from "react-router-dom";
import { Briefcase, Mail, MapPin, Phone, Facebook, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-primary">Emploi+</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme de référence pour le recrutement et la formation professionnelle en République du Congo et dans la sous-région.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/emplois" className="text-muted-foreground hover:text-primary transition-colors">
                  Offres d'emploi
                </Link>
              </li>
              <li>
                <Link to="/formations" className="text-muted-foreground hover:text-primary transition-colors">
                  Formations
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                  Nos services
                </Link>
              </li>
              <li>
                <Link to="/a-propos" className="text-muted-foreground hover:text-primary transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Brazzaville, République du Congo</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="mailto:contact@emploiplus.cg" className="text-muted-foreground hover:text-primary transition-colors">
                  contact@emploiplus.cg
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <a href="tel:+242000000000" className="text-muted-foreground hover:text-primary transition-colors">
                  +242 00 000 00 00
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold">Suivez-nous</h3>
            <div className="flex space-x-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Emploi+. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

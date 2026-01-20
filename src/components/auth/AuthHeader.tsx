import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";

export function AuthHeader() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login' || location.pathname === '/connexion';
  const isRegisterPage = location.pathname === '/register' || location.pathname === '/inscription';

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Emploi+</span>
        </Link>

        {/* Navigation Button */}
        <div className="flex items-center gap-4">
          {isLoginPage && (
            <Link to="/inscription">
              <Button variant="default">Inscription</Button>
            </Link>
          )}
          {isRegisterPage && (
            <Link to="/connexion">
              <Button variant="default">Connexion</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

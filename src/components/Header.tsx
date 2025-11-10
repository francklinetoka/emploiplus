import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, Briefcase, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { role } = useUserRole(user?.id);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const getNavLinks = () => {
    if (!user) {
      return [
        { path: "/", label: "Accueil" },
        { path: "/emplois", label: "Emplois" },
        { path: "/services", label: "Services" },
        { path: "/formations", label: "Formations" },
        { path: "/a-propos", label: "À propos" },
      ];
    }

    if (role === 'candidate') {
      return [
        { path: "/", label: "Accueil" },
        { path: "/emplois", label: "Emplois" },
        { path: "/services", label: "Services" },
        { path: "/formations", label: "Formations" },
        { path: "/a-propos", label: "À propos" },
      ];
    }

    if (role === 'company') {
      return [
        { path: "/fil-actualite", label: "Fil d'actualité" },
        { path: "/services", label: "Services" },
        { path: "/emplois", label: "Emplois" },
        { path: "/a-propos", label: "À propos" },
      ];
    }

    if (role === 'super_admin' || role === 'admin_offers' || role === 'admin_users') {
      return [
        { path: "/admin", label: "Admin" },
        { path: "/emplois", label: "Emplois" },
        { path: "/formations", label: "Formations" },
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-primary">Emploi+</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.path)
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center space-x-3 md:flex">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/compte">
                  <User className="h-4 w-4 mr-2" />
                  Compte
                </Link>
              </Button>
              <Button variant="ghost" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/connexion">Connexion</Link>
              </Button>
              <Button asChild className="bg-gradient-primary hover:opacity-90">
                <Link to="/inscription">Inscription</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container space-y-3 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-2">
              {user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/compte" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-4 w-4 mr-2" />
                      Compte
                    </Link>
                  </Button>
                  <Button variant="ghost" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/connexion" onClick={() => setMobileMenuOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                  <Button asChild className="bg-gradient-primary hover:opacity-90">
                    <Link to="/inscription" onClick={() => setMobileMenuOpen(false)}>
                      Inscription
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

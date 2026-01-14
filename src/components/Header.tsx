import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SearchBar from '@/components/SearchBar';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { authHeaders } from '@/lib/headers';
import { Menu, X, Briefcase, User, LogOut, Settings, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

interface UserProfile {
  id?: number;
  full_name?: string;
  profile_image_url?: string;
}

const AccountQuickMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers: Record<string,string> = {};
          Object.assign(headers, authHeaders());
          const res = await fetch('/api/users/me', { headers });
          if (res.ok) {
            const data: UserProfile = await res.json();
            setProfileData(data);
          }
        } catch (err) {
          console.error('Failed to fetch profile:', err);
        }
      };
      fetchProfile();
    }
  }, [user, location.pathname]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const initials = (profileData?.full_name || user.email)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative ml-3">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-full hover:bg-muted/50 transition-colors"
        aria-label="Menu compte"
      >
        <Avatar className="h-9 w-9">
          <AvatarImage src={profileData?.profile_image_url || undefined} alt={profileData?.full_name} />
          <AvatarFallback className="text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-50">
          <Link to="/parametres" className="flex items-center px-3 py-2 text-sm hover:bg-muted/50 transition-colors" onClick={() => setOpen(false)}>
            <Settings className="h-4 w-4 mr-2" /> Paramètres
          </Link>
          <Link to="/a-propos" className="flex items-center px-3 py-2 text-sm hover:bg-muted/50 transition-colors" onClick={() => setOpen(false)}>
            <User className="h-4 w-4 mr-2" /> À propos
          </Link>
          <Link to="/contact" className="flex items-center px-3 py-2 text-sm hover:bg-muted/50 transition-colors" onClick={() => setOpen(false)}>
            <Briefcase className="h-4 w-4 mr-2" /> Contact
          </Link>
          <button onClick={handleSignOut} className="w-full text-left flex items-center px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-t">
            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
          </button>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const location = useLocation();
    const path = location.pathname;
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const { user, signOut } = useAuth();
  const { role } = useUserRole(user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string,string> = {};
        Object.assign(headers, authHeaders());
        const res = await fetch('/api/notifications', { headers });
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const count = (data || []).filter((n: any) => !n.read).length;
        setUnreadCount(count);
      } catch (e) {
        console.error('Fetch notifications count error', e);
      }
    };

    // If currently on notifications page, clear badge locally (do not mark server-side)
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
    } else {
      fetchCount();
    }

    const iv = setInterval(() => {
      if (location.pathname !== '/notifications') fetchCount();
    }, 30_000);

    const onUpdated = () => {
      if (location.pathname === '/notifications') {
        setUnreadCount(0);
      } else {
        fetchCount();
      }
    };
    window.addEventListener('notifications-updated', onUpdated);

    return () => { mounted = false; clearInterval(iv); window.removeEventListener('notifications-updated', onUpdated); };
  }, [user]);

    // Minimal header for auth pages
    if (path === '/connexion' || path === '/inscription' || path === '/register' || path === '/login') {
      return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95">
          <nav className="container flex h-16 items-center justify-start">
            <Link to="/" className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg">
                <img src="/Logo.png" alt="Logo Emploi+" />
              </div>
            </Link>
          </nav>
        </header>
      );
    }

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  const performSearch = (q?: string) => {
    const query = String(q ?? globalSearch ?? '').trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setMobileMenuOpen(false);
  };

  const getNavLinks = () => {
    // Standard ordered navigation required by product: Accueil, Emplois, Services, Formations, À propos, Contact
    const base = [
      { path: "/", label: "Accueil" },
      { path: "/emplois", label: "Emplois" },
      { path: "/services", label: "Services" },
      { path: "/resources", label: "Ressources", children: [ { path: '/annuaire', label: 'Annuaire' }, { path: '/documents', label: 'Documents' } ] },
      { path: "/formations", label: "Formations" },
      { path: "/a-propos", label: "À propos" },
      { path: "/contact", label: "Contact" },
    ];

    // If no user, show base nav
    if (!user) return base;

    // For authenticated users we remove About/Contact from the main nav (they will be in profile menu)
    const filtered = base.filter((l) => l.path !== '/a-propos' && l.path !== '/contact');

    // For candidates, show filtered base
    if (role === 'candidate') return filtered;

    // For companies, use custom order: Accueil, Service, Recrutement, Candidats
    if (role === 'company') {
      return [
        { path: "/", label: "Accueil" },
        { path: "/services", label: "Service" },
        { path: "/recrutement", label: "Recrutement" },
        { path: "/candidats", label: "Candidats" },
      ];
    }

    // Admin roles: keep admin entry then base links
    if (role === 'super_admin' || role === 'admin_offers' || role === 'admin_users') {
      return [{ path: "/admin", label: "Admin" }, ...filtered];
    }

    return base;
  };

  const navLinks = getNavLinks();
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link to="/" className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg">
              <img src="/Logo.png" alt="Logo Emploi+" />
            </div>
          </Link>
          <span className="text-xl font-bold text-primary ml-2">Emploi+</span>
        </div>


        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          {navLinks.map((link) => {
            if (!user && link.path === '/resources') return null;
            if (link.path === '/services') {
              return (
                <div key={link.path} className="relative group">
                  <Link to="/services" className={`text-sm font-medium transition-colors px-2 py-1 rounded ${isActive('/services') ? 'text-primary' : 'text-muted-foreground'} `}>{link.label}</Link>
                  <div className="absolute left-0 mt-2 w-64 rounded-md border bg-white shadow-lg z-50 hidden group-hover:block">
                    <div className="flex flex-col p-2 space-y-1">
                     <a href="/services#optimisation-candidature" className="px-3 py-2 text-sm rounded hover:bg-gray-50">Optimisation Candidature</a>
                     <a href="/services#Entretiens-preparation" className="px-3 py-2 text-sm rounded hover:bg-gray-50">Entretiens</a>
                      <a href="/services#creation-visuelle" className="px-3 py-2 text-sm rounded hover:bg-gray-50">créations visuelles</a>
                      <a href="/services#numeriques" className="px-3 py-2 text-sm rounded hover:bg-gray-50">Services Numériques</a>
                      <div className="border-t my-1" />
                      <a href="/contact" className="px-3 py-2 text-sm rounded hover:bg-gray-50">Assistance par experts</a>
                    </div>
                  </div>
                </div>
              );
            }
            if ((link as any).children) {
              return (
                <div key={link.path} className="relative group">
                  <button className={`text-sm font-medium transition-colors px-2 py-1 rounded ${isActive(link.path) ? 'text-primary' : 'text-muted-foreground'}`}>
                    {link.label}
                  </button>
                  <div className="absolute left-0 mt-2 w-44 rounded-md border bg-white shadow-lg z-50 hidden group-hover:block">
                    <div className="flex flex-col p-2 space-y-1">
                      {((link as any).children || []).map((c: any) => (
                        <Link key={c.path} to={c.path} className="px-3 py-2 text-sm rounded hover:bg-gray-50">{c.label}</Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Global search (desktop) - visible only after login */}
        {user && (
          <div className="hidden md:flex items-center ml-4">
            <form onSubmit={(e) => { e.preventDefault(); performSearch(); }} className="flex items-center gap-2">
              <div className="w-64">
                <SearchBar value={globalSearch} onChange={setGlobalSearch} placeholder={role === 'company' ? 'Rechercher candidatures, candidats...' : 'Rechercher emplois, services, formations...'} />
              </div>
              <Button type="submit">Rechercher</Button>
            </form>
          </div>
        )}

        {/* Desktop Auth Buttons */}
        <div className="hidden items-center space-x-3 md:flex">
          {user ? (
            <>
              <div className="relative">
                <Button variant="ghost" asChild>
                  <Link to="/notifications" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                  </Link>
                </Button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-destructive rounded-full">{unreadCount}</span>
                )}
              </div>
              <AccountQuickMenu />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="bg-gradient-secondary text-muted hover:opacity-90">
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
            {user && (
              <div className="px-2">
                <SearchBar value={globalSearch} onChange={setGlobalSearch} placeholder={role === 'company' ? 'Rechercher candidatures...' : 'Rechercher emplois, services...'} />
                <div className="mt-2 flex gap-2">
                  <Button onClick={() => performSearch()} size="sm">Rechercher</Button>
                </div>
              </div>
            )}
            {navLinks.map((link) => {
              if ((link as any).children) {
                return (
                  <div key={link.path} className="space-y-1">
                    <div className="py-2 text-sm font-medium text-muted-foreground">{link.label}</div>
                    {((link as any).children || []).map((c: any) => (
                      <Link key={c.path} to={c.path} className="block py-2 pl-4 text-sm font-medium transition-colors text-muted-foreground hover:text-primary" onClick={() => setMobileMenuOpen(false)}>{c.label}</Link>
                    ))}
                  </div>
                );
              }

              return (
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
              );
            })}
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
                  <Button variant="ghost" asChild >
                    <Link to="/connexion" onClick={() => setMobileMenuOpen(false)}>
                      Connexion
                    </Link>
                  </Button>
                  <Button asChild className="bg-gradient-primary hover:opacity-90">
                    <Link to="/inscription" onClick={() => setMobileMenuOpen(false)}>
                      Inscription
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                      Connexion Admin
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

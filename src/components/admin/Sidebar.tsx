// src/components/admin/Sidebar.tsx
import { LogOut, Shield, Users, Briefcase, BookOpen, LayoutDashboard, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const role = admin.role || "admin";

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast.success("Déconnexion réussie");
    navigate("/admin/login");
  };

  const menuItems = [
    { label: "Tableau de bord", icon: LayoutDashboard, path: "/admin" },
    ...(role === "super_admin" ? [
      { label: "Créer Admin", icon: UserPlus, path: "/admin/register" },
      { label: "Administrateurs", icon: Shield, path: "/admin/admins" },
    ] : []),
    ...(role === "super_admin" || role === "admin_offres" ? [
      { label: "Offres d'emploi", icon: Briefcase, path: "/admin/jobs" },
      { label: "Formations", icon: BookOpen, path: "/admin/formations" },
    ] : []),
    ...(role === "super_admin" || role === "admin_users" ? [
      { label: "Utilisateurs", icon: Users, path: "/admin/users" },
    ] : []),
  ];

  const currentPath = location.pathname;

  return (
    <aside className="fixed left-0 top-0 z-50 w-72 h-screen bg-gradient-to-b from-primary to-primary/95 text-white shadow-2xl">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-12">
          <Shield className="h-12 w-12" />
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm opacity-90 capitalize">{role.replace("_", " ")}</p>
          </div>
        </div>

        <nav className="space-y-3 mt-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start h-14 text-lg rounded-xl ${
                  isActive ? "bg-white/25 shadow-lg" : "hover:bg-white/15"
                }`}
                onClick={() => navigate(item.path)}
              >
                <Icon className="mr-4 h-6 w-6" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 border-t border-white/20">
        <Button variant="ghost" className="w-full h-14 text-lg hover:bg-white/20" onClick={logout}>
          <LogOut className="mr-4 h-6 w-6" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}
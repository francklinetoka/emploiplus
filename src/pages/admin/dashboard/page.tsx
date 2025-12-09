// src/pages/admin/dashboard/page.tsx
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, Shield, BookOpen } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ jobs: 0, users: 0, admins: 0, formations: 0 });
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-5xl font-bold mb-6">
        <span className="text-primary">{admin.full_name || admin.email}</span>
      </h1>
      <p className="text-xl text-muted-foreground mb-12">
        Rôle : <strong className="capitalize">{admin.role?.replace("_", " ") || "Admin"}</strong>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="p-8 text-center hover:shadow-2xl transition-all bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <Briefcase className="h-16 w-16 mx-auto mb-4" />
          <p className="text-5xl font-bold">{stats.jobs}</p>
          <p className="text-blue-100 text-lg">Offres publiées</p>
        </Card>
        <Card className="p-8 text-center hover:shadow-2xl transition-all bg-gradient-to-br from-green-500 to-green-600 text-white">
          <Users className="h-16 w-16 mx-auto mb-4" />
          <p className="text-5xl font-bold">{stats.users}</p>
          <p className="text-green-100 text-lg">Utilisateurs</p>
        </Card>
        <Card className="p-8 text-center hover:shadow-2xl transition-all bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <Shield className="h-16 w-16 mx-auto mb-4" />
          <p className="text-5xl font-bold">{stats.admins}</p>
          <p className="text-purple-100 text-lg">Admins</p>
        </Card>
        <Card className="p-8 text-center hover:shadow-2xl transition-all bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <BookOpen className="h-16 w-16 mx-auto mb-4" />
          <p className="text-5xl font-bold">{stats.formations}</p>
          <p className="text-orange-100 text-lg">Formations</p>
        </Card>
      </div>

      <div className="mt-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Emploi Connect Congo</h2>
        <p className="text-2xl text-muted-foreground">
          Tu es <strong className="text-primary">Super Administrateur</strong>
        </p>
      </div>
    </div>
  );
}
// src/pages/admin/admins/page.tsx
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Plus, Mail, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminsPage() {
  const navigate = useNavigate();

  const admins = [
    { name: "Francklin Etoka", email: "super@emploi.cg", role: "super_admin", date: "2025-04-05" },
  ];

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">Administrateurs</h1>
        <Button size="lg" onClick={() => navigate("/admin/register/super-admin")}>
          <Plus class="mr-2 h-5 w-5" />
          Créer un admin
        </Button>
      </div>

      <div className="space-y-6">
        {admins.map((admin) => (
          <Card key={admin.email} className="p-8 flex justify-between items-center hover:shadow-lg transition">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-primary/10 rounded-xl">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{admin.name}</h3>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {admin.email}
                </p>
                <p className="text-lg capitalize mt-2">
                  Rôle : <strong>{admin.role.replace("_", " ")}</strong>
                </p>
              </div>
            </div>
            <div className="text-right text-muted-foreground">
              <p className="flex items-center gap-2 justify-end">
                <Calendar className="h-4 w-4" />
                Inscrit le {admin.date}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
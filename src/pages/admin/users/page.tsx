// src/pages/admin/users/page.tsx
import PageHeader from "@/components/admin/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Users, Search, MoreVertical } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="p-10">
      <PageHeader title="Utilisateurs" />

      <div className="flex gap-4 mb-8">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-6 font-medium">Nom</th>
              <th className="text-left p-6 font-medium">Email</th>
              <th className="text-left p-6 font-medium">Rôle</th>
              <th className="text-left p-6 font-medium">Inscrit le</th>
              <th className="text-right p-6"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50">
              <td className="p-6">Marie Kongo</td>
              <td className="p-6">marie@example.com</td>
              <td className="p-6"><span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Candidat</span></td>
              <td className="p-6">5 déc. 2025</td>
              <td className="p-6 text-right">
                <Button size="sm" variant="ghost"><MoreVertical className="h-5 w-5" /></Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
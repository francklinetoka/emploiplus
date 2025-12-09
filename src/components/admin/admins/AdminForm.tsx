// src/components/admin/admins/AdminForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AdminFormProps {
  admin?: any;
  onSuccess: () => void;
}

export default function AdminForm({ admin, onSuccess }: AdminFormProps) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "admin_offres" as "super_admin" | "admin_offres" | "admin_users" | "admin",
  });

  useEffect(() => {
    if (admin) {
      setForm({
        full_name: admin.full_name || "",
        email: admin.email || "",
        password: "",
        role: admin.role,
      });
    }
  }, [admin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = admin ? `/api/admins/${admin.id}` : "/api/admin/create";
    const method = admin ? "PUT" : "POST";

    const body: any = {
      full_name: form.full_name,
      email: form.email,
      role: form.role,
    };
    if (form.password) body.password = form.password;

    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(admin ? "Admin modifié !" : "Admin créé avec succès !");
        onSuccess();
      } else {
        const error = await res.json();
        toast.error(error.message || "Erreur");
      }
    } catch {
      toast.error("Serveur injoignable");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Label>Nom complet</Label>
        <Input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required={!admin}
        />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          disabled={!!admin}
        />
      </div>

      <div class="space-y-2">
        <Label>Mot de passe {admin ? "(laisser vide pour ne pas changer)" : "*"}</Label>
        <Input
          type="password"
          placeholder={admin ? "••••••••" : ""}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!admin}
          minLength={6}
        />
      </div>

      <div class="space-y-2">
        <Label>Rôle</Label>
        <Select value={form.role} onValueChange={(v: any) => setForm({ ...form, role: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin_offres">Admin Offres</SelectItem>
            <SelectItem value="admin_users">Admin Utilisateurs</SelectItem>
            <SelectItem value="admin">Admin Simple</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline onClick={onSuccess}>
          Annuler
        </Button>
        <Button type="submit">
          {admin ? "Modifier" : "Créer"} l'administrateur
        </Button>
      </div>
    </form>
  );
}
// src/pages/admin/register/content-admin/page.tsx
import RegisterForm from "../components/RegisterForm";

export default function ContentAdminRegister() {
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold text-center mb-8">
        Créer un Admin Contenu / Offres
      </h1>
      <RegisterForm role="admin_offres" title="Admin Offres" color="text-blue-600" />
    </div>
  );
}
// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

// Pages publiques
import Home from "./pages/Home";
import Services from "./pages/Services";
import Jobs from "./pages/Jobs";
import Formations from "./pages/Formations";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Newsfeed from "./pages/Newsfeed";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Admin
import AdminLogin from "./pages/admin/login/page";
import SuperAdminRegister from "./pages/admin/register/super-admin/page";
import ContentAdminRegister from "./pages/admin/register/content-admin/page";
import UserAdminRegister from "./pages/admin/register/user-admin/page";

import AdminLayout from "./pages/admin/layout";
import DashboardPage from "./pages/admin/dashboard/page";
import JobsPage from "./pages/admin/jobs/page";
import UsersPage from "./pages/admin/users/page";
import AdminsPage from "./pages/admin/admins/page";
import FormationsPage from "./pages/admin/formations/page";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/emplois" element={<Jobs />} />
            <Route path="/formations" element={<Formations />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/compte" element={<Profile />} />
            <Route path="/fil-actualite" element={<Newsfeed />} />
          </Route>

          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />

          {/* ADMIN — TOUT DANS LE LAYOUT */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="formations" element={<FormationsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="admins" element={<AdminsPage />} />
          </Route>

          {/* Pages spéciales */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register/super-admin" element={<SuperAdminRegister />} />
          <Route path="/admin/register/content-admin" element={<ContentAdminRegister />} />
          <Route path="/admin/register/user-admin" element={<UserAdminRegister />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
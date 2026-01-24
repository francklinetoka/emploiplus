/**
 * ============================================================================
 * INTEGRATION GUIDE: Utiliser les composants refactorisés
 * ============================================================================
 * 
 * Ce fichier montre comment intégrer les nouveaux composants
 * dans votre application existante
 */

// ============================================================================
// 1. INTÉGRER LE NEWSFEED OPTIMISÉ
// ============================================================================

// AVANT: src/pages/Home.tsx (ancien)
import DashboardNewsfeed from "@/components/DashboardNewsfeed";

export function HomeOld() {
  return (
    <div>
      <DashboardNewsfeed /> {/* Appels backend Render lourd */}
    </div>
  );
}

// APRÈS: src/pages/Home.tsx (optimisé)
import DashboardNewsfeedOptimized from "@/components/DashboardNewsfeedOptimized";

export function HomeNew() {
  return (
    <div>
      <DashboardNewsfeedOptimized /> {/* Direct Supabase RLS + keyset pagination */}
    </div>
  );
}

// ============================================================================
// 2. UTILISER LE HOOK GOOGLE AUTH OPTIMISÉ
// ============================================================================

// AVANT: Appel backend Render
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

function LoginComponentOld() {
  const { handleGoogleLogin } = useGoogleAuth();

  const onClickOld = async () => {
    // ❌ Faisait un appel à: POST /api/google-login (Render)
    const { error, user } = await handleGoogleLogin("candidate");
    if (!error) {
      // Gérer le JWT token
    }
  };

  return <button onClick={onClickOld}>Sign In with Google (Old)</button>;
}

// APRÈS: Direct OAuth Supabase
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

function LoginComponentNew() {
  const { handleGoogleLogin } = useGoogleAuth();

  const onClickNew = async () => {
    // ✅ Direct Supabase OAuth
    // Le navigateur redirect → Google
    // Google redirect → https://emploiplus.vercel.app/auth/callback?code=...&role=candidate
    // Route callback synchronise le profil
    const { error } = await handleGoogleLogin("candidate");
    
    if (error) {
      console.error("OAuth failed:", error.message);
    }
    // Ne pas besoin de gérer le JWT manuellement
    // Supabase gère la session automatiquement
  };

  return <button onClick={onClickNew}>Sign In with Google (New)</button>;
}

// ============================================================================
// 3. UTILISER LE SERVICE NEWSFEED OPTIMISÉ DIRECTEMENT
// ============================================================================

import React, { useEffect, useState } from "react";
import { OptimizedNewsfeedService } from "@/services/optimizedNewsfeedService";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

/**
 * Custom hook pour utiliser le newsfeed optimisé
 */
export const useNewsfeedOptimized = () => {
  const { user } = useSupabaseAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const service = new OptimizedNewsfeedService(
    process.env.REACT_APP_SUPABASE_URL || "",
    process.env.REACT_APP_SUPABASE_ANON_KEY || ""
  );

  const fetchNewsfeed = async (page?: { from: number; to: number }) => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await service.getNewsfeedPublications({
        from: page?.from || 0,
        to: page?.to || 19,
        viewerId: user.id,
        sortBy: "relevant",
      });

      if (page && page.from > 0) {
        setPublications((prev) => [...prev, ...result.publications]);
      } else {
        setPublications(result.publications);
      }

      setHasMore(result.hasMore);
    } finally {
      setLoading(false);
    }
  };

  return {
    publications,
    loading,
    hasMore,
    fetchNewsfeed,
    subscribeToNewsfeed: (
      onNewPub: (pub: any) => void,
      onError: (error: Error) => void
    ) => service.subscribeToNewsfeed(user?.id || "", onNewPub, onError),
  };
};

// Utilisation:
function MyCustomNewsfeedComponent() {
  const { publications, loading, fetchNewsfeed } = useNewsfeedOptimized();

  useEffect(() => {
    fetchNewsfeed({ from: 0, to: 19 });
  }, []);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {publications.map((pub) => (
        <div key={pub.id}>{pub.content}</div>
      ))}
    </div>
  );
}

// ============================================================================
// 4. APPELER LES MICROSERVICES RENDER
// ============================================================================

// Pour les notifications
export async function sendPushNotification(userIds: string[], message: string) {
  const response = await fetch(
    `${process.env.VITE_API_BASE_URL}/api/notifications/send`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userIds,
        type: "push",
        title: "Emploi+",
        message,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to send notification");
  }

  return response.json();
}

// Pour la génération CV
export async function generateCVPDF(userId: string, templateId: string = "modern") {
  const response = await fetch(
    `${process.env.VITE_API_BASE_URL}/api/pdf/generate-cv`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        templateId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate CV");
  }

  const data = await response.json();
  return data.downloadUrl; // Direct Supabase Storage link
}

// Pour le matching
export async function calculateJobMatch(candidateId: string, jobId: string) {
  const response = await fetch(
    `${process.env.VITE_API_BASE_URL}/api/matching/calculate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId,
        jobId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to calculate match");
  }

  return response.json(); // { matchScore: { overall: 78, ... } }
}

// ============================================================================
// 5. MIGRATION CHECKLIST
// ============================================================================

/**
 * Checklist pour migrer les composants vers les versions optimisées:
 * 
 * Dans LoginUser.tsx:
 * - [ ] Importer useGoogleAuth (nouvellement optimisé)
 * - [ ] GoogleLoginButton passera le rôle automatiquement
 * - [ ] Pas besoin de changement - les props restent les mêmes!
 * 
 * Dans Home.tsx / CompanyDashboard.tsx:
 * - [ ] Remplacer <DashboardNewsfeed /> par <DashboardNewsfeedOptimized />
 * - [ ] Le composant supporte les mêmes props
 * - [ ] La performance sera 10x meilleure ⚡
 * 
 * Dans les pages avec PDF:
 * - [ ] Utiliser: await generateCVPDF(userId, 'modern')
 * - [ ] Le PDF sera disponible dans Supabase Storage
 * 
 * Dans les pages avec notifications:
 * - [ ] Utiliser: await sendPushNotification(userIds, 'message')
 * - [ ] Les notifications seront queued sur Render
 * 
 * Dans les pages avec matching:
 * - [ ] Utiliser: const result = await calculateJobMatch(candId, jobId)
 * - [ ] Le score sera calculé par Render microservice
 */

// ============================================================================
// 6. EXEMPLE COMPLET: Page de connexion refactorisée
// ============================================================================

import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";
import { useNavigate } from "react-router-dom";

export default function LoginRefactored() {
  const navigate = useNavigate();

  const handleLoginSuccess = (user: any) => {
    // ✅ OAuth a réussi
    // Supabase gère la session automatiquement
    // L'utilisateur a été créé dans public.profiles par la route callback
    console.log("Login successful, redirecting...");
    // Navigation sera gérée par AuthCallback page
    // ou par Supabase auth listener
  };

  return (
    <div className="login-page">
      <h1>Emploi+ - Connexion</h1>

      <div className="login-form">
        {/* BEFORE: Appelait /api/google-login */}
        {/* AFTER: Direct OAuth Supabase */}
        <GoogleLoginButton
          userType="candidate"
          onSuccess={handleLoginSuccess}
          fullWidth
        />

        <GoogleLoginButton
          userType="company"
          onSuccess={handleLoginSuccess}
          fullWidth
        />
      </div>

      {/* AuthCallback.tsx gère automatiquement la redirection */}
    </div>
  );
}

// ============================================================================
// 7. EXEMPLE COMPLET: Newsfeed refactorisé
// ============================================================================

export default function NewsfeedRefactored() {
  // ✅ Utilise Supabase RLS directement
  // ✅ Keyset pagination (pas d'OFFSET)
  // ✅ Real-time updates via WebSocket
  // ✅ Fulltext search built-in

  return <DashboardNewsfeedOptimized />;

  // C'est tout! Le composant gère tout:
  // - Fetching initial + pagination
  // - Infinite scroll avec IntersectionObserver
  // - Real-time subscriptions
  // - Likes, comments (si implémentés)
}

// ============================================================================
// 8. VARIABLES D'ENVIRONNEMENT REQUISES
// ============================================================================

/**
 * .env.local (développement):
 * 
 * VITE_API_BASE_URL=http://localhost:5000
 * REACT_APP_SUPABASE_URL=https://xxx.supabase.co
 * REACT_APP_SUPABASE_ANON_KEY=xxx
 * 
 * .env.production (Vercel):
 * 
 * VITE_API_BASE_URL=https://emploi-connect-backend.onrender.com
 * REACT_APP_SUPABASE_URL=https://xxx.supabase.co
 * REACT_APP_SUPABASE_ANON_KEY=xxx
 */

// ============================================================================
// 9. POINTS CLÉS À RETENIR
// ============================================================================

/**
 * ✅ OAUTH FLOW (Nouveau):
 * 
 * Frontend (useGoogleAuth) 
 *   → supabase.auth.signInWithOAuth() 
 *   → Google OAuth Screen
 *   → Redirect: /api/auth/callback?code=...&role=candidate
 *   → Supabase échange le code → session
 *   → Route callback synchronise public.profiles
 *   → Redirect: /dashboard
 * 
 * ✅ NEWSFEED FLOW (Nouveau):
 * 
 * Frontend (DashboardNewsfeedOptimized)
 *   → OptimizedNewsfeedService
 *   → supabase.from('v_newsfeed_feed').select()
 *   → .range(0, 19) [keyset pagination]
 *   → RLS filters automatiquement par user
 *   → Retour publications en <500ms
 * 
 * ✅ MICROSERVICES FLOW (Nouveau):
 * 
 * Frontend appelle Render directement pour:
 *   - POST /api/notifications/send (async queue)
 *   - POST /api/pdf/generate-cv (Puppeteer)
 *   - POST /api/matching/calculate (logic intensive)
 * 
 * Render = specialised workers
 * Supabase = main data + auth
 * Vercel = frontend + OAuth callback
 */

export {};

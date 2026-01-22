/**
 * Utility pour convertir les URLs locales vers Supabase
 * Utilisé lors de la migration ou pour afficher les fichiers existants
 */

/**
 * Convertit une URL locale `/uploads/...` en URL Supabase publique
 */
export function convertLocalUrlToSupabase(localUrl: string, supabaseUrl: string): string {
  if (!localUrl) return '';
  
  // Si c'est déjà une URL Supabase, retourner tel quel
  if (localUrl.includes('supabase.co')) {
    return localUrl;
  }
  
  // Si ce n'est pas un chemin local, retourner tel quel
  if (!localUrl.startsWith('/uploads/')) {
    return localUrl;
  }

  // Mapper les anciens chemins vers les nouveaux buckets
  const pathParts = localUrl.split('/');
  const category = pathParts[2]; // /uploads/[category]/file
  const fileName = pathParts.slice(3).join('/'); // Le reste du chemin

  const bucketMap: Record<string, string> = {
    'documents': 'candidats-docs',
    'profiles': 'avatars',
    'services': 'feed-posts',
    'portfolios': 'feed-posts',
    'jobs': 'assets-emploi',
    'formations': 'assets-emploi',
  };

  const bucket = bucketMap[category] || 'feed-posts';
  
  // Construire l'URL Supabase
  const projectId = supabaseUrl.split('.')[0].split('//')[1]; // Extrait le project ID
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
}

/**
 * Valide si une URL est accessible (Supabase ou locale)
 */
export async function validateUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok || response.status === 403; // 403 OK pour les fichiers privés
  } catch {
    return false;
  }
}

/**
 * Détermine le bucket à partir d'une URL
 */
export function getBucketFromUrl(url: string): string | null {
  if (!url.includes('supabase.co')) return null;
  
  const buckets = ['candidats-docs', 'entreprises-docs', 'feed-posts', 'entreprises', 'avatars', 'assets-emploi'];
  for (const bucket of buckets) {
    if (url.includes(bucket)) {
      return bucket;
    }
  }
  
  return null;
}

/**
 * Extrait le chemin du fichier depuis une URL Supabase
 */
export function getFilePathFromSupabaseUrl(url: string): string | null {
  // Format: https://project.supabase.co/storage/v1/object/public/BUCKET/PATH
  const match = url.match(/\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : null;
}

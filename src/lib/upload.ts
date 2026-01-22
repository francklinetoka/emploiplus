/**
 * Upload utilities - Using Supabase Storage
 * All files are stored in Supabase buckets instead of local Mac storage
 * 
 * This file is a re-export of supabaseStorage for backwards compatibility
 */

export { 
  uploadToSupabase, 
  uploadAvatar, 
  uploadCandidateDocument, 
  uploadCompanyDocument, 
  uploadCompanyLogo, 
  uploadFeedPost, 
  uploadJobAsset, 
  validateFile, 
  BUCKET_CONFIG,
  deleteFromSupabase,
  getPublicUrl
} from '@/lib/supabaseStorage';

/**
 * Legacy uploadFile function - Redirects to appropriate Supabase bucket
 * @deprecated Use specific upload functions (uploadAvatar, uploadFeedPost, etc.)
 */
export async function uploadFile(file: File, token?: string | null, category: string = 'documents'): Promise<string> {
  // Map legacy categories to new Supabase buckets
  const categoryMap: Record<string, string> = {
    'profiles': 'avatars',
    'documents': 'candidats-docs', // Default to candidat docs
    'jobs': 'assets-emploi',
    'formations': 'assets-emploi',
    'services': 'feed-posts',
    'portfolios': 'feed-posts',
  };

  const bucketName = (categoryMap[category] || 'feed-posts') as any;
  
  // Try to get userId from localStorage
  const userData = localStorage.getItem('user');
  const userId = userData ? JSON.parse(userData)?.id : undefined;

  // Call the appropriate Supabase upload function
  try {
    const { uploadToSupabase } = await import('@/lib/supabaseStorage');
    return await uploadToSupabase(file, bucketName, userId);
  } catch (error) {
    throw new Error(`Upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

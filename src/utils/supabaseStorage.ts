import { supabase } from '@/integrations/supabase/client';

/**
 * Parse a Supabase storage URL to extract bucket name and file path
 * @param url The Supabase storage URL to parse
 * @returns An object containing the bucket name and file path
 */
export const parseSupabaseUrl = (url: string): { bucketName: string; filePath: string } => {
  try {
    // Handle empty or invalid URLs
    if (!url) {
      return { bucketName: 'vet_profiles', filePath: '' };
    }

    // Fix for malformed URLs with "object/sign/object/public" pattern
    if (url.includes('object/sign/object/public')) {
      // Extract the path after 'public'
      const parts = url.split('public/');
      if (parts.length > 1) {
        // The first part of the path after 'public/' is usually the bucket name
        const pathAfterPublic = parts[1].split('/');
        if (pathAfterPublic.length > 1) {
          const bucketName = pathAfterPublic[0];
          const filePath = pathAfterPublic.slice(1).join('/');
          return { bucketName, filePath };
        }
      }
    }
    
    // Handle different Supabase URL formats
    if (url.includes('storage.googleapis.com') || url.includes('supabase.co/storage')) {
      // Parse the URL to extract the bucket name and file path
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      
      // Find the bucket name in the URL path
      let bucketName = 'vet_profiles';
      let filePath = '';
      
      // Check if this is a public URL or a signed URL format
      if (pathParts.includes('public')) {
        // Format: /storage/v1/object/public/[bucket]/[filepath]
        const publicIndex = pathParts.indexOf('public');
        if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
          bucketName = pathParts[publicIndex + 1];
          filePath = pathParts.slice(publicIndex + 2).join('/');
        }
      } else if (pathParts.includes('sign')) {
        // Format: /storage/v1/object/sign/[bucket]/[filepath]
        const signIndex = pathParts.indexOf('sign');
        if (signIndex !== -1 && signIndex + 1 < pathParts.length) {
          bucketName = pathParts[signIndex + 1];
          filePath = pathParts.slice(signIndex + 2).join('/');
        }
      } else if (pathParts.includes('object')) {
        // Handle other object storage formats
        const objectIndex = pathParts.indexOf('object');
        if (objectIndex !== -1 && objectIndex + 2 < pathParts.length) {
          bucketName = pathParts[objectIndex + 2];
          filePath = pathParts.slice(objectIndex + 3).join('/');
        }
      }
      
      if (bucketName && filePath) {
        return { bucketName, filePath };
      }
    }
    
    // Handle direct storage paths
    if (url.startsWith('vet_profiles/') || url.includes('/vet_profiles/')) {
      const parts = url.split('vet_profiles/');
      return { 
        bucketName: 'vet_profiles', 
        filePath: parts[parts.length - 1] 
      };
    }

    // Handle license URLs specifically
    if (url.includes('licenses/')) {
      const parts = url.split('licenses/');
      return {
        bucketName: 'vet_profiles',
        filePath: 'licenses/' + parts[parts.length - 1]
      };
    }
  } catch (error) {
    console.error('Error parsing Supabase URL:', error);
  }
  
  // Default fallback
  return { 
    bucketName: 'vet_profiles', 
    filePath: url.split('/').pop() || '' 
  };
};

/**
 * Create a signed URL for a file in Supabase storage
 * @param url The original URL of the file
 * @param expiresIn Expiration time in seconds (default: 60)
 * @returns A promise that resolves to the signed URL or null if an error occurs
 */
export const createSignedUrl = async (url: string, expiresIn = 60): Promise<string | null> => {
  try {
    if (!url) return null;
    
    const { bucketName, filePath } = parseSupabaseUrl(url);
    
    if (!filePath) return null;
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    
    return data?.signedUrl || null;
  } catch (error) {
    console.error('Error in createSignedUrl:', error);
    return null;
  }
};

/**
 * Download a file from Supabase storage
 * @param url The URL of the file to download
 * @param customFileName Optional custom file name for the download
 * @returns A promise that resolves to true if download was initiated, false otherwise
 */
export const downloadFile = async (url: string, customFileName?: string): Promise<boolean> => {
  try {
    if (!url) return false;
    
    // Try to get a signed URL first
    const signedUrl = await createSignedUrl(url);
    const { filePath } = parseSupabaseUrl(url);
    const fileName = customFileName || filePath.split('/').pop() || 'download';
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = signedUrl || url; // Use signed URL if available, otherwise use original
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Error downloading file:', error);
    return false;
  }
};

/**
 * Open a file from Supabase storage in a new tab
 * @param url The URL of the file to open
 * @returns A promise that resolves to true if the file was opened, false otherwise
 */
export const openFile = async (url: string): Promise<boolean> => {
  try {
    if (!url) return false;
    
    // Try to get a signed URL first
    const signedUrl = await createSignedUrl(url);
    
    // Open the file in a new tab
    window.open(signedUrl || url, '_blank');
    
    return true;
  } catch (error) {
    console.error('Error opening file:', error);
    return false;
  }
};

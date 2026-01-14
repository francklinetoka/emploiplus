// Compresse une image avant upload pour éviter "entity too large"
async function compressImage(file: File, maxWidth: number = 1024, maxHeight: number = 1024, quality: number = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculer les nouvelles dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Créer un canvas et redessiner l'image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Exporter en JPEG avec compression
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function uploadFile(file: File, token?: string | null, category: string = 'documents'): Promise<string> {
  // Compresser les images avant upload
  let fileToUpload = file;
  if (file.type.startsWith('image/')) {
    try {
      const compressedBlob = await compressImage(file);
      fileToUpload = new File([compressedBlob], file.name, { type: 'image/jpeg' });
    } catch (error) {
      console.warn('Image compression failed, trying with original file', error);
      // Continue avec le fichier original si la compression échoue
    }
  }

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const payload = result.split(",")[1] || "";
      resolve(payload);
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileToUpload);
  });

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ base64Content: base64, originalName: fileToUpload.name, category }),
  });

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Upload failed');
    return data.storage_url;
  }

  // If server returned non-JSON (HTML error page), capture text and surface it
  const text = await res.text();
  throw new Error(text || 'Upload failed (non-JSON response)');
}

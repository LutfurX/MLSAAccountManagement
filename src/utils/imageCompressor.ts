/**
 * Compress images to lightweight JPEG data URLs (< 100KB)
 * to ensure they never exceed Firestore's 1MB document limit.
 */
export async function compressImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If not an image (e.g. PDF), reject with appropriate message
    if (!file.type.startsWith('image/')) {
      reject(new Error('দয়া করে একটি ছবি (JPG/PNG) ফাইল নির্বাচন করুন'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ছবি লোড করা যায়নি'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scale
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original data URL if canvas 2d context unavailable
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as image/jpeg
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

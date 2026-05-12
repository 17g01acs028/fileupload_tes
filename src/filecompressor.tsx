// utils/compressImage.ts
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;       // 0 to 1
  mimeType?: string;      // e.g. 'image/jpeg', defaults to original
  maxSizeKB?: number;     // optional size cap — will lower quality until met
}

export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1280,
    maxHeight = 720,
    quality = 0.8,
    mimeType,
    maxSizeKB,
  } = options;

  return new Promise((resolve, reject) => {
    const blobURL = URL.createObjectURL(file);
    const image = new Image();
    image.src = blobURL;

    image.onerror = () => {
      URL.revokeObjectURL(blobURL);
      reject(new Error('Failed to load image'));
    };

    image.onload = () => {
      URL.revokeObjectURL(blobURL);

      // Maintain aspect ratio
      let { width, height } = image;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Could not get canvas context'));

      ctx.drawImage(image, 0, 0, width, height);

      const outputType = mimeType || file.type || 'image/jpeg';

      const compress = (q: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));

            // If a max size is set and we haven't bottomed out on quality, retry
            if (maxSizeKB && blob.size / 1024 > maxSizeKB && q > 0.1) {
              compress(parseFloat((q - 0.1).toFixed(1)));
              return;
            }

            // Return a proper File so it works with Ant Design's Upload
            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          outputType,
          q
        );
      };

      compress(quality);
    };
  });
};
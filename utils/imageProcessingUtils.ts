import { resizeImage } from './imageUtils';
import heic2any from 'heic2any';

interface ProcessImageOptions {
  width: number | null;
  height: number | null;
  scalePercentage: number | null;
  maintainAspectRatio: boolean;
  compressionType: 'lossy' | 'lossless';
  compressionQuality: number;
  outputFormat: 'jpeg' | 'png' | 'webp';
}

/**
 * Process an image by resizing and compressing it
 * Supports standard formats and Apple HEIC/HEIF formats
 */
export const processImage = async (
  file: File,
  options: ProcessImageOptions
): Promise<File | null> => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.warn('processImage can only be used in a browser environment');
    return null;
  }

  try {
    // Check if the file is an Apple HEIC/HEIF format and convert if needed
    let processableFile = file;
    if (file.type === 'image/heic' || file.type === 'image/heif' || 
        file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      try {
        console.log('Converting HEIC/HEIF image to JPEG...');
        const blob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.9
        }) as Blob;
        
        // Create a new file from the converted blob
        processableFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
          type: 'image/jpeg'
        });
        console.log('HEIC/HEIF conversion successful');
      } catch (error) {
        console.error('Error converting HEIC/HEIF image:', error);
        throw new Error('Failed to convert HEIC/HEIF image. This format requires conversion before processing.');
      }
    }

    // Create a canvas to draw the image
    const img = await createImageBitmap(processableFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Calculate new dimensions
    let newWidth = img.width;
    let newHeight = img.height;
    
    if (options.width && options.height && !options.scalePercentage) {
      // Resize to specific dimensions
      newWidth = options.width;
      newHeight = options.height;
      
      // Maintain aspect ratio if needed
      if (options.maintainAspectRatio) {
        const aspectRatio = img.width / img.height;
        
        if (newWidth / newHeight > aspectRatio) {
          newWidth = Math.round(newHeight * aspectRatio);
        } else {
          newHeight = Math.round(newWidth / aspectRatio);
        }
      }
    } else if (options.scalePercentage) {
      // Scale by percentage
      newWidth = Math.round(img.width * (options.scalePercentage / 100));
      newHeight = Math.round(img.height * (options.scalePercentage / 100));
    }

    // Set canvas dimensions
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Draw the image on the canvas with the new dimensions
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    // Determine mime type and quality settings based on output format and compression type
    let mimeType: string;
    let quality: number | undefined;
    
    // Default to JPEG for lossy compression as it generally produces smaller files
    if (options.compressionType === 'lossy' && options.outputFormat !== 'webp') {
      mimeType = 'image/jpeg';
      quality = options.compressionQuality / 100;
    } else {
      switch (options.outputFormat) {
        case 'jpeg':
          mimeType = 'image/jpeg';
          quality = options.compressionQuality / 100;
          break;
        case 'png':
          mimeType = 'image/png';
          // PNG with lossy compression doesn't work well with canvas.toBlob
          // For lossy compression, we'll convert to JPEG instead
          if (options.compressionType === 'lossy') {
            mimeType = 'image/jpeg';
            quality = options.compressionQuality / 100;
          } else {
            // For lossless PNG, quality doesn't work the same way
            mimeType = 'image/png';
            quality = undefined; // Let the browser decide the best quality
          }
          break;
        case 'webp':
          mimeType = 'image/webp';
          quality = options.compressionType === 'lossless' 
            ? 1.0 
            : options.compressionQuality / 100;
          break;
        default:
          mimeType = 'image/jpeg';
          quality = options.compressionQuality / 100;
      }
    }
    
    // Convert canvas to blob with appropriate quality
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            throw new Error('Failed to create blob from canvas');
          }
        },
        mimeType,
        quality
      );
    });

    // If the processed image is still larger than the original and we're trying to compress,
    // try more aggressive compression with JPEG
    if (blob.size > processableFile.size && options.compressionType === 'lossy') {
      // Force JPEG with lower quality for better compression
      const jpegBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              throw new Error('Failed to create blob from canvas');
            }
          },
          'image/jpeg',
          Math.min(0.7, (options.compressionQuality - 10) / 100) // More aggressive compression
        );
      });
      
      // If JPEG compression worked better, use it
      if (jpegBlob.size < blob.size) {
        const fileName = getProcessedFileName(file.name, 'jpeg');
        return new File([jpegBlob], fileName, { type: 'image/jpeg' });
      }
    }

    // If we're trying to compress but the file got larger, try WebP as a fallback
    if (blob.size > processableFile.size && options.compressionType === 'lossy' && options.outputFormat !== 'webp') {
      try {
        const webpBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                throw new Error('Failed to create WebP blob');
              }
            },
            'image/webp',
            options.compressionQuality / 100
          );
        });
        
        // If WebP is smaller, use it
        if (webpBlob.size < blob.size && webpBlob.size < processableFile.size) {
          const fileName = getProcessedFileName(file.name, 'webp');
          return new File([webpBlob], fileName, { type: 'image/webp' });
        }
      } catch (error) {
        console.warn('WebP conversion failed, falling back to original format', error);
      }
    }

    // If all compression attempts failed and the result is larger than the original,
    // just resize without additional compression
    if (blob.size > processableFile.size * 1.1) {
      // If we're only resizing (not trying to reduce dimensions), return the original
      const isResizing = 
        (options.width && options.width < img.width) || 
        (options.height && options.height < img.height) ||
        (options.scalePercentage && options.scalePercentage < 100);
      
      if (!isResizing) {
        // Just return a copy of the original file with the new name
        const fileName = getProcessedFileName(file.name, file.name.split('.').pop() || 'jpg');
        return new File([file], fileName, { type: file.type });
      }
    }

    // Create a new file from the blob
    const extension = mimeType.split('/')[1];
    const fileName = getProcessedFileName(file.name, extension);
    return new File([blob], fileName, { type: mimeType });
  } catch (error) {
    console.error('Error processing image:', error);
    return null;
  }
};

/**
 * Generate a filename for the processed image
 */
const getProcessedFileName = (originalName: string, outputFormat: string): string => {
  const nameParts = originalName.split('.');
  const baseName = nameParts.length > 1 
    ? nameParts.slice(0, -1).join('.')
    : originalName;
  
  return `${baseName}-processed.${outputFormat}`;
};

/**
 * Check if the browser supports HEIC/HEIF format
 */
export const isHeicSupported = (): boolean => {
  // Currently, no browser natively supports HEIC/HEIF
  return false;
};

/**
 * Calculate the aspect ratio of an image
 */
export const calculateAspectRatio = (width: number, height: number): number => {
  return width / height;
};

/**
 * Format file size in a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 
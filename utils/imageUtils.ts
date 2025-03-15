import html2canvas from 'html2canvas';

/**
 * Convert an HTML element to a canvas
 */
export const elementToCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  return await html2canvas(element, {
    scale: 2, // Higher scale for better quality
    useCORS: true, // Enable CORS for images
    allowTaint: true,
    backgroundColor: '#ffffff',
  });
};

/**
 * Convert a canvas to a Blob
 */
export const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/png', quality = 0.95): Promise<Blob> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        // Fallback if toBlob is not supported
        const dataURL = canvas.toDataURL(type, quality);
        const binaryString = atob(dataURL.split(',')[1]);
        const length = binaryString.length;
        const binaryArray = new Uint8Array(length);
        
        for (let i = 0; i < length; i++) {
          binaryArray[i] = binaryString.charCodeAt(i);
        }
        
        resolve(new Blob([binaryArray], { type }));
      }
    }, type, quality);
  });
};

/**
 * Convert a canvas to a File
 */
export const canvasToFile = async (
  canvas: HTMLCanvasElement,
  filename: string,
  type = 'image/png',
  quality = 0.95
): Promise<File> => {
  const blob = await canvasToBlob(canvas, type, quality);
  return new File([blob], filename, { type });
};

/**
 * Resize an image file
 */
export const resizeImage = async (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert canvas to file
      const resizedFile = await canvasToFile(
        canvas,
        file.name,
        file.type,
        0.9
      );
      resolve(resizedFile);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert image file to base64 string
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert base64 string to image file
 */
export const base64ToImageFile = (
  base64String: string,
  filename: string,
  type = 'image/png'
): File => {
  const byteString = atob(base64String.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new File([ab], filename, { type });
}; 
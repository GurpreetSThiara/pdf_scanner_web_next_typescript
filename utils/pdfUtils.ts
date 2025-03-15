import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

/**
 * Convert image files to a PDF document
 */
export const imagesToPdf = async (imageFiles: File[]): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.create();
  
  for (const imageFile of imageFiles) {
    // Convert File to ArrayBuffer
    const imageBytes = await readFileAsArrayBuffer(imageFile);
    
    // Determine image type and embed accordingly
    let image;
    if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (imageFile.type === 'image/png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      continue; // Skip unsupported image types
    }
    
    // Add a page with the image dimensions
    const page = pdfDoc.addPage([image.width, image.height]);
    
    // Draw the image on the page
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  
  // Serialize the PDFDocument to bytes
  return await pdfDoc.save();
};

/**
 * Extract images from a PDF document
 */
export const extractImagesFromPdf = async (pdfFile: File): Promise<string[]> => {
  // This is a simplified version as pdf-lib doesn't directly support image extraction
  // In a real implementation, you might need to use a different library or a server-side solution
  
  // For now, we'll return a placeholder message
  return ['Image extraction requires server-side processing or additional libraries'];
};

/**
 * Merge multiple PDF documents into one
 */
export const mergePdfs = async (pdfFiles: File[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();
  
  for (const pdfFile of pdfFiles) {
    const pdfBytes = await readFileAsArrayBuffer(pdfFile);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }
  
  return await mergedPdf.save();
};

/**
 * Split a PDF document into multiple PDFs based on page ranges
 */
export const splitPdf = async (
  pdfFile: File,
  pageRanges: { start: number; end: number }[]
): Promise<Uint8Array[]> => {
  const pdfBytes = await readFileAsArrayBuffer(pdfFile);
  const pdf = await PDFDocument.load(pdfBytes);
  const totalPages = pdf.getPageCount();
  
  const splitPdfs: Uint8Array[] = [];
  
  for (const range of pageRanges) {
    const newPdf = await PDFDocument.create();
    
    // Adjust for 0-based indexing and ensure within bounds
    const start = Math.max(0, range.start - 1);
    const end = Math.min(totalPages - 1, range.end - 1);
    
    if (start <= end) {
      const pageIndices = Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
      
      const copiedPages = await newPdf.copyPages(pdf, pageIndices);
      copiedPages.forEach((page) => {
        newPdf.addPage(page);
      });
      
      splitPdfs.push(await newPdf.save());
    }
  }
  
  return splitPdfs;
};

/**
 * Rearrange pages in a PDF document
 */
export const rearrangePdfPages = async (
  pdfFile: File,
  newOrder: number[]
): Promise<Uint8Array> => {
  const pdfBytes = await readFileAsArrayBuffer(pdfFile);
  const pdf = await PDFDocument.load(pdfBytes);
  const totalPages = pdf.getPageCount();
  
  // Create a new PDF with the rearranged pages
  const newPdf = await PDFDocument.create();
  
  for (const pageIndex of newOrder) {
    // Adjust for 0-based indexing and ensure within bounds
    const adjustedIndex = Math.min(Math.max(0, pageIndex - 1), totalPages - 1);
    const [copiedPage] = await newPdf.copyPages(pdf, [adjustedIndex]);
    newPdf.addPage(copiedPage);
  }
  
  return await newPdf.save();
};

/**
 * Add text to a PDF document
 */
export const addTextToPdf = async (
  pdfFile: File,
  textAnnotations: {
    pageIndex: number;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: [number, number, number];
  }[]
): Promise<Uint8Array> => {
  const pdfBytes = await readFileAsArrayBuffer(pdfFile);
  const pdf = await PDFDocument.load(pdfBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  
  for (const annotation of textAnnotations) {
    const page = pdf.getPage(annotation.pageIndex - 1); // Adjust for 0-based indexing
    
    page.drawText(annotation.text, {
      x: annotation.x,
      y: annotation.y,
      size: annotation.fontSize,
      font,
      color: rgb(
        annotation.color[0],
        annotation.color[1],
        annotation.color[2]
      ),
    });
  }
  
  return await pdf.save();
};

/**
 * Helper function to read a File as ArrayBuffer
 */
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Convert PDF to base64 string for display
 */
export const pdfToBase64 = async (pdfBytes: Uint8Array): Promise<string> => {
  const bytes = new Uint8Array(pdfBytes);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof window !== "undefined") {
    return `data:application/pdf;base64,${window.btoa(binary)}`;
  }
  
};

/**
 * Download PDF as a file
 */
export const downloadPdf = (pdfBytes: Uint8Array, filename: string): void => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}; 
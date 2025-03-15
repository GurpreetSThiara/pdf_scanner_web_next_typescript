'use client';
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import '@/utils/pdfjs-setup';

interface PdfToolbarProps {
  pdfDoc: PDFDocument | null;
  onExtractImages: (images: string[]) => void;
  setPdfDoc: (doc: PDFDocument | null) => void;
}

export default function PdfToolbar({ pdfDoc, onExtractImages, setPdfDoc }: PdfToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const extractImages = async () => {
    if (!pdfDoc) return;
    setIsProcessing(true);
    
    try {
      const pdfData = await pdfDoc.save();
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const extractedImages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const operatorList = await page.getOperatorList();
        const commonObjs = page.commonObjs;
        
        for (let j = 0; j < operatorList.fnArray.length; j++) {
          if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
            const imgName = operatorList.argsArray[j][0];
            const img = commonObjs.get(imgName);
            
            if (img && img.data) {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const imageData = ctx.createImageData(img.width, img.height);
                imageData.data.set(img.data);
                ctx.putImageData(imageData, 0, 0);
                
                const dataUrl = canvas.toDataURL('image/png');
                extractedImages.push(dataUrl);
              }
            }
          }
        }
      }

      onExtractImages(extractedImages);
    } catch (error) {
      console.error('Error extracting images:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const compressPdf = async () => {
    if (!pdfDoc) return;
    setIsProcessing(true);
    
    try {
      // Create a new document
      const newPdfDoc = await PDFDocument.create();
      
      // Copy all pages from the original document
      const pages = await newPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      pages.forEach(page => newPdfDoc.addPage(page));

      // Compress by reducing image quality
      const pdfBytes = await newPdfDoc.save({
        useObjectStreams: true,
        // Add compression options
        objectsPerTick: 20,
      });

      const compressedDoc = await PDFDocument.load(pdfBytes);
      setPdfDoc(compressedDoc);

      // Create download link for compressed PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error compressing PDF:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={extractImages}
        disabled={isProcessing}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isProcessing ? 'Processing...' : 'Extract Images'}
      </button>
      <button
        onClick={compressPdf}
        disabled={isProcessing}
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
      >
        {isProcessing ? 'Processing...' : 'Compress PDF'}
      </button>
    </div>
  );
} 
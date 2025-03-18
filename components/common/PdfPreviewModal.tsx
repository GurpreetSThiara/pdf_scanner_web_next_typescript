'use client';

import { useState, useEffect } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import Button from './Button';

interface PdfPreviewModalProps {
  file: File;
  isOpen: boolean;
  onClose: () => void;
}

export default function PdfPreviewModal({ file, isOpen, onClose }: PdfPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    
    // Create an object URL for the PDF file
    const objectUrl = URL.createObjectURL(file);
    setPdfUrl(objectUrl);
    
    // Clean up the object URL when component unmounts or file changes
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const handleDownload = () => {
    if (!file) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col animate-in fade-in zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold truncate pr-4">{file.name}</h3>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleDownload}
              icon={FiDownload}
              variant="outline"
              size="sm"
            >
              Download
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0 rounded"
              title={`PDF Preview: ${file.name}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
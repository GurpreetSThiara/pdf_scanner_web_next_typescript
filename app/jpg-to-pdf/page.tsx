"use client";

import { useState, useRef, useCallback } from 'react';
import ToolPageLayout from '@/components/layout/ToolPageLayout';
import Button from '@/components/common/Button';
import { FiUpload } from 'react-icons/fi';
import { imagesToPdf, pdfToBase64, downloadPdf } from '@/utils/pdfUtils';
import dynamic from 'next/dynamic';
import FileUploadSection from '@/components/JpgToPdf/FileUploadSection';
import ImageGrid from '@/components/JpgToPdf/ImageGrid';
import PdfPreview from '@/components/JpgToPdf/PdfPreview';

const ImageEditModal = dynamic(() => import('@/components/ImageEditor/ImageEditModal'), {
  ssr: false
});

export default function JpgToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pdfResult, setPdfResult] = useState<Uint8Array | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const draggedItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    draggedItemRef.current = index;
    e.dataTransfer.effectAllowed = 'move';
    // Add a subtle scale effect when dragging
    e.currentTarget.classList.add('opacity-50', 'scale-105');
    // Set a ghost drag image (optional)
    const dragImage = document.createElement('img');
    dragImage.src = URL.createObjectURL(files[index]);
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragOverItemRef.current = index;
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50', 'scale-105');
    setDraggedIndex(null);
    setDragOverIndex(null);

    if (draggedItemRef.current === null || dragOverItemRef.current === null) return;

    const newFiles = [...files];
    const draggedItem = newFiles[draggedItemRef.current];
    newFiles.splice(draggedItemRef.current, 1);
    newFiles.splice(dragOverItemRef.current, 0, draggedItem);

    setFiles(newFiles);
    draggedItemRef.current = null;
    dragOverItemRef.current = null;
  }, [files]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only reset dragOverIndex if we're leaving the grid item (not its children)
    if (e.currentTarget === e.target) {
      setDragOverIndex(null);
    }
  }, []);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const handleSaveEdit = async (editedImageBlob: Blob) => {
    if (selectedImageIndex === null) return;
    
    const newFiles = [...files];
    newFiles[selectedImageIndex] = new File([editedImageBlob], files[selectedImageIndex].name, {
      type: 'image/jpeg'
    });
    setFiles(newFiles);
    setIsModalOpen(false);
  };

  const handleFilesAdded = (newFiles: File[]) => {
    // Filter only JPG/JPEG files
    const imageFiles = newFiles.filter(
      (file) =>
        file.type.startsWith('image/')
    );
    
    setFiles(imageFiles);
    // Reset results when new files are added
    setPdfResult(null);
    setPdfPreviewUrl(null);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      // Convert images to PDF
      const pdfBytes = await imagesToPdf(files);
      setPdfResult(pdfBytes);

      // Create a preview URL
      const base64Pdf = await pdfToBase64(pdfBytes);
      setPdfPreviewUrl(base64Pdf);
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      alert('An error occurred while converting images to PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!pdfResult) return;
    downloadPdf(pdfResult, 'converted-images.pdf');
  };

  const handleDeleteFile = (indexToDelete: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      newFiles.splice(indexToDelete, 1);
      return newFiles;
    });
  };

  return (
    <ToolPageLayout
      title="JPG to PDF Converter - Convert JPG Images to PDF Online"
      description="Convert JPG images to PDF documents online for free. Easily combine multiple JPG files into a single PDF with our free online converter tool."
      keywords="jpg to pdf, convert jpg to pdf, jpg to pdf converter, image to pdf, free jpg to pdf, online jpg to pdf, combine jpg to pdf"
      heading="JPG to PDF Converter"
      subheading="Convert your JPG images to PDF documents online for free. No installation or registration required."
      onDownload={handleDownload}
      showDownloadButton={!!pdfResult}
      isProcessing={isProcessing}
      hasResult={!!pdfResult}
    >
      <div className="space-y-8">
        <FileUploadSection onFilesAdded={handleFilesAdded} />

        {files.length > 0 && (
          <ImageGrid
            files={files}
            draggedIndex={draggedIndex}
            dragOverIndex={dragOverIndex}
            orientation={orientation}
            onOrientationChange={setOrientation}
            onImageClick={handleImageClick}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            onDragLeave={handleDragLeave}
            onDeleteFile={handleDeleteFile}
          />
        )}

        {/* Convert Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleConvert}
            disabled={files.length === 0 || isProcessing}
            icon={isProcessing ? undefined : FiUpload}
            variant="primary"
            size="lg"
          >
            {isProcessing ? 'Converting...' : 'Convert to PDF'}
          </Button>
        </div>

        {pdfPreviewUrl && (
          <PdfPreview
            pdfPreviewUrl={pdfPreviewUrl}
            onDownload={handleDownload}
          />
        )}

        {/* Instructions */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold mb-4">How to Convert JPG to PDF</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Upload one or more JPG images using the file uploader above.</li>
            <li>Arrange the images in the desired order by dragging and dropping.</li>
            <li>Select the orientation (portrait or landscape) for your PDF.</li>
            <li>Click the "Convert to PDF" button to process your images.</li>
            <li>Preview the generated PDF and download it to your device.</li>
          </ol>
        </div>

        {/* SEO Content */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-gray-600">
          <h2 className="text-xl font-semibold mb-4">About JPG to PDF Conversion</h2>
          <p className="mb-4">
            Converting JPG images to PDF format offers numerous advantages. PDFs are universally compatible across devices and operating systems, making them ideal for sharing and archiving documents. By converting your JPG images to PDF, you can:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Combine multiple images into a single, organized document</li>
            <li>Reduce file size while maintaining image quality</li>
            <li>Create professional-looking documents from your images</li>
            <li>Ensure your images can be viewed on any device without special software</li>
            <li>Protect your images from being easily edited by others</li>
          </ul>
          <p>
            Our free online JPG to PDF converter tool makes this process simple and efficient. With no software to install and no registration required, you can convert your JPG images to PDF in seconds, right from your web browser.
          </p>
        </div>

        {/* Add modal component */}
        {isModalOpen && selectedImageIndex !== null && (
          <ImageEditModal
            image={files[selectedImageIndex]}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </ToolPageLayout>
  );
} 
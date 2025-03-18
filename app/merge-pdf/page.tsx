"use client";

import { useState } from 'react';
import ToolPageLayout from '@/components/layout/ToolPageLayout';
import FileDropzone from '@/components/common/FileDropzone';
import Button from '@/components/common/Button';
import PdfPreviewModal from '@/components/common/PdfPreviewModal';
import { FiUpload, FiDownload, FiMove, FiEye } from 'react-icons/fi';
import { mergePdfs, pdfToBase64, downloadPdf } from '@/utils/pdfUtils';

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedPdf, setMergedPdf] = useState<Uint8Array | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const handleFilesAdded = (newFiles: File[]) => {
    // Filter only PDF files
    const pdfFiles = newFiles.filter((file) => file.type === 'application/pdf');
    setFiles(pdfFiles);
    // Reset results when new files are added
    setMergedPdf(null);
    setPdfPreviewUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please upload at least 2 PDF files to merge.');
      return;
    }

    setIsProcessing(true);
    try {
      // Merge PDFs
      const pdfBytes = await mergePdfs(files);
      setMergedPdf(pdfBytes);

      // Create a preview URL
      const base64Pdf = await pdfToBase64(pdfBytes);
      setPdfPreviewUrl(base64Pdf);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('An error occurred while merging PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdf) return;
    downloadPdf(mergedPdf, 'merged-document.pdf');
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Set drag image transparent in modern browsers
    if (e.dataTransfer.setDragImage) {
      const dragEl = document.createElement('div');
      dragEl.style.position = 'absolute';
      dragEl.style.top = '-9999px';
      document.body.appendChild(dragEl);
      e.dataTransfer.setDragImage(dragEl, 0, 0);
      setTimeout(() => document.body.removeChild(dragEl), 0);
    }
    // Set data to enable drag
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newFiles = [...files];
    const draggedItem = newFiles[draggedIndex];
    
    // Remove item from its original position
    newFiles.splice(draggedIndex, 1);
    // Insert at new position
    newFiles.splice(index, 0, draggedItem);
    
    setFiles(newFiles);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleFileClick = (file: File) => {
    setSelectedPdfFile(file);
    setIsPdfModalOpen(true);
  };

  const closeModal = () => {
    setIsPdfModalOpen(false);
  };

  return (
    <ToolPageLayout
      title="Merge PDF - Combine PDF Files Online for Free"
      description="Merge multiple PDF files into one document online for free. Easily combine PDFs in the order you want with our free online PDF merger tool."
      keywords="merge pdf, combine pdf, join pdf, pdf merger, free pdf merger, online pdf merger, merge pdf files"
      heading="Merge PDF Files"
      subheading="Combine multiple PDF documents into a single file online for free. No installation or registration required."
      onDownload={handleDownload}
      showDownloadButton={!!mergedPdf}
      isProcessing={isProcessing}
      hasResult={!!mergedPdf}
    >
      <div className="space-y-8">
        {/* File Upload Section */}
        <div>
          <h2 className="mb-4 text-xl font-semibold">Upload PDF Files</h2>
          <FileDropzone
            accept={{
              'application/pdf': ['.pdf'],
            }}
            maxFiles={20}
            maxSize={20971520} // 20MB
            onFilesAdded={handleFilesAdded}
            title="Drag & Drop PDF Files Here"
            subtitle="Or click to browse your files"
            showPreview={false}
          />
        </div>

        {/* PDF Files Preview & Reordering */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Arrange PDF Files</h2>
              <p className="text-sm text-gray-600">
                <FiMove className="inline mr-1" /> Drag and drop to reorder files
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  onDrop={(e) => handleDrop(e, index)}
                  onClick={() => handleFileClick(file)}
                  className={`
                    relative p-4 rounded-lg border-2 bg-white 
                    transition-all duration-200 ease-in-out cursor-pointer
                    ${draggedIndex === index ? 'opacity-50 scale-105 shadow-xl z-50 border-gray-300' : 'border-gray-200'}
                    ${dragOverIndex === index ? 'border-blue-500' : ''}
                    ${dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}
                    hover:shadow-md hover:border-gray-300
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-medium text-blue-700 bg-blue-100 rounded-full">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB • PDF
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* PDF Icon and Preview Indicator */}
                  <div className="relative flex justify-center mt-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-16 h-16 text-gray-400"
                    >
                      <path d="M5 3a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h14v14H5V5zm2 2a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h8a1 1 0 110 2H8a1 1 0 01-1-1zm0 4a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                    </svg>
                    
                    {/* Preview icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center transition-opacity opacity-0 hover:opacity-100">
                      <div className="p-2 text-white bg-blue-500 rounded-full">
                        <FiEye className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Drop indicator overlay */}
                  {dragOverIndex === index && draggedIndex !== index && (
                    <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-lg pointer-events-none"/>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merge Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleMerge}
            disabled={files.length < 2 || isProcessing}
            icon={isProcessing ? undefined : FiUpload}
            variant="primary"
            size="lg"
          >
            {isProcessing ? 'Merging...' : 'Merge PDFs'}
          </Button>
        </div>

        {/* PDF Preview */}
        {pdfPreviewUrl && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">Preview</h2>
            <div className="p-4 border border-gray-200 rounded-lg">
              {pdfPreviewUrl ? (
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full border-0 h-96"
                  title="PDF Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-96 bg-gray-50">
                  <p className="text-gray-500">Loading preview...</p>
                </div>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleDownload}
                icon={FiDownload}
                variant="primary"
              >
                Download Merged PDF
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="pt-8 mt-8 border-t border-gray-200">
          <h2 className="mb-4 text-xl font-semibold">How to Merge PDF Files</h2>
          <ol className="pl-5 space-y-2 list-decimal">
            <li>Upload two or more PDF files using the file uploader above.</li>
            <li>Arrange the PDF files in the desired order by dragging and dropping.</li>
            <li>Click the &quot;Merge PDFs&quot; button to combine your files.</li>
            <li>Preview the merged PDF and download it to your device.</li>
          </ol>
        </div>

        {/* SEO Content */}
        <div className="pt-8 mt-8 text-gray-600 border-t border-gray-200">
          <h2 className="mb-4 text-xl font-semibold">About PDF Merging</h2>
          <p className="mb-4">
            Merging PDF files is a common need for many professionals and students. Whether you&apos;re combining multiple reports, consolidating research papers, or creating a comprehensive document from various sources, our PDF merger tool makes the process simple and efficient.
          </p>
          <p className="mb-4">
            Benefits of merging PDF files include:
          </p>
          <ul className="pl-5 mb-4 space-y-2 list-disc">
            <li>Creating a single, organized document from multiple files</li>
            <li>Simplifying document sharing by sending one file instead of many</li>
            <li>Maintaining the original formatting and layout of each document</li>
            <li>Reducing the number of attachments in emails</li>
            <li>Creating comprehensive reports or presentations</li>
          </ul>
          <p>
            Our free online PDF merger tool processes your files directly in your browser, ensuring your documents remain private and secure. No files are uploaded to our servers, and no registration is required to use this service.
          </p>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {selectedPdfFile && (
        <PdfPreviewModal
          file={selectedPdfFile}
          isOpen={isPdfModalOpen}
          onClose={closeModal}
        />
      )}
    </ToolPageLayout>
  );
} 
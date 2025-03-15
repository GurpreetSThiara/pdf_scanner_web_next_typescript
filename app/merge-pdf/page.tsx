"use client";

import { useState } from 'react';
import ToolPageLayout from '@/components/layout/ToolPageLayout';
import FileDropzone from '@/components/common/FileDropzone';
import Button from '@/components/common/Button';
import { FiUpload, FiDownload, FiMove } from 'react-icons/fi';
import { mergePdfs, pdfToBase64, downloadPdf } from '@/utils/pdfUtils';

export default function MergePdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedPdf, setMergedPdf] = useState<Uint8Array | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFiles(items);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
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
          <h2 className="text-xl font-semibold mb-4">Upload PDF Files</h2>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Arrange PDF Files</h2>
              <p className="text-sm text-gray-600">
                <FiMove className="inline mr-1" /> Drag and drop to reorder files
              </p>
            </div>

            {/* <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pdfs">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {files.map((file, index) => (
                      <Draggable key={`${file.name}-${index}`} draggableId={`${file.name}-${index}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center">
                              <div className="bg-blue-100 text-blue-700 font-medium rounded-full w-6 h-6 flex items-center justify-center mr-3">
                                {index + 1}
                              </div>
                              <div className="truncate max-w-md">
                                <p className="font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 ml-2"
                              aria-label={`Remove ${file.name}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext> */}
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
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            <div className="border border-gray-200 rounded-lg p-4">
              <iframe
                src={pdfPreviewUrl}
                className="w-full h-96 border-0"
                title="PDF Preview"
              />
            </div>
            <div className="mt-4 flex justify-center">
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
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold mb-4">How to Merge PDF Files</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Upload two or more PDF files using the file uploader above.</li>
            <li>Arrange the PDF files in the desired order by dragging and dropping.</li>
            <li>Click the "Merge PDFs" button to combine your files.</li>
            <li>Preview the merged PDF and download it to your device.</li>
          </ol>
        </div>

        {/* SEO Content */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-gray-600">
          <h2 className="text-xl font-semibold mb-4">About PDF Merging</h2>
          <p className="mb-4">
            Merging PDF files is a common need for many professionals and students. Whether you're combining multiple reports, consolidating research papers, or creating a comprehensive document from various sources, our PDF merger tool makes the process simple and efficient.
          </p>
          <p className="mb-4">
            Benefits of merging PDF files include:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
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
    </ToolPageLayout>
  );
} 
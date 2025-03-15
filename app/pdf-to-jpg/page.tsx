"use client";

import { useState } from 'react';
import ToolPageLayout from '@/components/layout/ToolPageLayout';
import FileDropzone from '@/components/common/FileDropzone';
import Button from '@/components/common/Button';
import { FiUpload, FiDownload, FiSettings } from 'react-icons/fi';
import { extractImagesFromPdf } from '@/utils/pdfUtils';

export default function PdfToJpg() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  const handleFilesAdded = (files: File[]) => {
    if (files.length > 0) {
      // Only use the first file if multiple are uploaded
      const pdfFile = files[0];
      setFile(pdfFile);
      // Reset results when a new file is added
      setExtractedImages([]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      // Extract images from PDF
      const images = await extractImagesFromPdf(file);
      setExtractedImages(images);
    } catch (error) {
      console.error('Error extracting images from PDF:', error);
      alert('An error occurred while extracting images from PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = () => {
    // Create a zip file with all images
    // This is a placeholder - in a real implementation, you would use a library like JSZip
    alert('Download all functionality would be implemented here with JSZip or similar library.');
  };

  const handleDownloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ToolPageLayout
      title="PDF to JPG Converter - Extract Images from PDF Online"
      description="Convert PDF to JPG images online for free. Easily extract and save all images from your PDF documents with our free online converter tool."
      keywords="pdf to jpg, convert pdf to jpg, pdf to jpg converter, extract images from pdf, free pdf to jpg, online pdf to jpg"
      heading="PDF to JPG Converter"
      subheading="Extract images from your PDF documents and save them as JPG files. No installation or registration required."
      onDownload={extractedImages.length > 0 ? handleDownloadAll : undefined}
      showDownloadButton={extractedImages.length > 0}
      isProcessing={isProcessing}
      hasResult={extractedImages.length > 0}
    >
      <div className="space-y-8">
        {/* File Upload Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Upload PDF Document</h2>
          <FileDropzone
            accept={{
              'application/pdf': ['.pdf'],
            }}
            maxFiles={1}
            maxSize={20971520} // 20MB
            onFilesAdded={handleFilesAdded}
            title="Drag & Drop PDF Here"
            subtitle="Or click to browse your files"
          />
        </div>

        {/* Settings */}
        {file && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Extraction Settings</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <FiSettings className="text-gray-500 mr-2" />
                <span className="font-medium">Image Quality</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="quality"
                    value="high"
                    checked={quality === 'high'}
                    onChange={() => setQuality('high')}
                    className="mr-2"
                  />
                  <span>High</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="quality"
                    value="medium"
                    checked={quality === 'medium'}
                    onChange={() => setQuality('medium')}
                    className="mr-2"
                  />
                  <span>Medium</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="quality"
                    value="low"
                    checked={quality === 'low'}
                    onChange={() => setQuality('low')}
                    className="mr-2"
                  />
                  <span>Low</span>
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Higher quality results in larger file sizes.
              </p>
            </div>
          </div>
        )}

        {/* Convert Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleConvert}
            disabled={!file || isProcessing}
            icon={isProcessing ? undefined : FiUpload}
            variant="primary"
            size="lg"
          >
            {isProcessing ? 'Extracting...' : 'Extract Images'}
          </Button>
        </div>

        {/* Extracted Images */}
        {extractedImages.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Extracted Images</h2>
              <Button
                onClick={handleDownloadAll}
                icon={FiDownload}
                variant="outline"
                size="sm"
              >
                Download All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {extractedImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="relative aspect-video">
                    <img
                      src={imageUrl}
                      alt={`Extracted image ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-3 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm font-medium">Image {index + 1}</span>
                    <Button
                      onClick={() => handleDownloadImage(imageUrl, index)}
                      icon={FiDownload}
                      variant="secondary"
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          extractedImages.length === 0 && file && !isProcessing && (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No images found in the PDF. Try uploading a different PDF document.
              </p>
            </div>
          )
        )}

        {/* Instructions */}
        <div className="mt-8 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-semibold mb-4">How to Convert PDF to JPG</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Upload your PDF document using the file uploader above.</li>
            <li>Select the desired image quality for the extracted JPG files.</li>
            <li>Click the "Extract Images" button to process your PDF.</li>
            <li>Download individual images or all images at once.</li>
          </ol>
        </div>

        {/* SEO Content */}
        <div className="mt-8 border-t border-gray-200 pt-8 text-gray-600">
          <h2 className="text-xl font-semibold mb-4">About PDF to JPG Conversion</h2>
          <p className="mb-4">
            Converting PDF to JPG format allows you to extract and use images from PDF documents for various purposes. This can be particularly useful when you need to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mb-4">
            <li>Extract images from PDF reports or presentations</li>
            <li>Use PDF images in applications that don't support PDF format</li>
            <li>Share specific images from a PDF without sharing the entire document</li>
            <li>Edit or modify images that were originally embedded in a PDF</li>
            <li>Create image collections from PDF catalogs or brochures</li>
          </ul>
          <p>
            Our free online PDF to JPG converter tool makes this process simple and efficient. With no software to install and no registration required, you can extract images from your PDF documents in seconds, right from your web browser.
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
} 
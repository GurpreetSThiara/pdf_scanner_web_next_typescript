"use client";

import React from 'react';
import PageSEO from '@/components/common/PageSEO';
import { FiShare2, FiDownload } from 'react-icons/fi';
import Button from '@/components/common/Button';

interface ToolPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  keywords: string;
  heading: string;
  subheading: string;
  onShare?: () => void;
  onDownload?: () => void;
  showDownloadButton?: boolean;
  showShareButton?: boolean;
  isProcessing?: boolean;
  hasResult?: boolean;
}

const ToolPageLayout = ({
  children,
  title,
  description,
  keywords,
  heading,
  subheading,
  onShare,
  onDownload,
  showDownloadButton = false,
  showShareButton = false,
  isProcessing = false,
  hasResult = false,
}: ToolPageLayoutProps) => {
  return (
    <>
      <PageSEO
        title={title}
        description={description}
        keywords={keywords}
      />
      
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{heading}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{subheading}</p>
          </div>
          
          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
            {children}
          </div>
          
          {/* Action Buttons */}
          {(showDownloadButton || showShareButton) && (
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {showDownloadButton && (
                <Button
                  onClick={onDownload}
                  disabled={isProcessing || !hasResult}
                  icon={FiDownload}
                  variant="primary"
                  size="lg"
                >
                  {isProcessing ? 'Processing...' : 'Download Result'}
                </Button>
              )}
              
              {showShareButton && (
                <Button
                  onClick={onShare}
                  disabled={isProcessing || !hasResult}
                  icon={FiShare2}
                  variant="outline"
                  size="lg"
                >
                  Share
                </Button>
              )}
            </div>
          )}
          
          {/* Related Tools */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-6">Related Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/jpg-to-pdf"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-2">JPG to PDF</h3>
                <p className="text-sm text-gray-600">
                  Convert JPG images to PDF documents with ease.
                </p>
              </a>
              <a
                href="/pdf-to-jpg"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-2">PDF to JPG</h3>
                <p className="text-sm text-gray-600">
                  Extract JPG images from PDF documents.
                </p>
              </a>
              <a
                href="/merge-pdf"
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold mb-2">Merge PDF</h3>
                <p className="text-sm text-gray-600">
                  Combine multiple PDF files into a single document.
                </p>
              </a>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Is this service completely free?</h3>
                <p className="text-gray-600">
                  Yes, all our PDF and image conversion tools are completely free to use with no hidden costs or limitations.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">Are my files secure?</h3>
                <p className="text-gray-600">
                  Absolutely. All file processing happens directly in your browser. Your files are never uploaded to our servers.
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-2">What is the maximum file size?</h3>
                <p className="text-gray-600">
                  Since all processing happens in your browser, the file size limit depends on your device's memory. Generally, files up to 100MB should work fine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToolPageLayout; 
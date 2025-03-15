"use client";

import Image from 'next/image';
import { FiCheckCircle, FiDownload, FiAlertTriangle } from 'react-icons/fi';

interface ResultsSectionProps {
  resultUrl: string;
  originalSize: number;
  processedSize: number;
  compressionRate: number;
  outputFormat: string;
}

export default function ResultsSection({
  resultUrl,
  originalSize,
  processedSize,
  compressionRate,
  outputFormat,
}: ResultsSectionProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Determine if the file size increased or decreased
  const sizeIncreased = compressionRate < 0;
  // Use absolute value for display purposes
  const displayRate = Math.abs(compressionRate);
  
  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <div className={sizeIncreased ? "p-3 bg-yellow-50 border-b flex items-center" : "p-3 bg-green-50 border-b flex items-center"}>
        {sizeIncreased ? (
          <FiAlertTriangle className="text-yellow-500 mr-2" />
        ) : (
          <FiCheckCircle className="text-green-500 mr-2" />
        )}
        <h4 className={sizeIncreased ? "font-medium text-yellow-800" : "font-medium text-green-800"}>
          {sizeIncreased ? 'Processing Complete (File Size Increased)' : 'Processing Complete'}
        </h4>
      </div>
      
      <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
        <Image
          src={resultUrl}
          alt="Processed image result"
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      
      <div className="p-4 bg-gray-50">
        <h5 className="font-medium mb-3">Results Summary</h5>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Original Size</p>
            <p className="font-medium">{formatFileSize(originalSize)}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">New Size</p>
            <p className="font-medium">{formatFileSize(processedSize)}</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">{sizeIncreased ? 'Increase' : 'Reduction'}</p>
            <p className={sizeIncreased ? "font-medium text-yellow-600" : "font-medium text-green-600"}>
              {displayRate}%
            </p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Format</p>
            <p className="font-medium">{outputFormat.toUpperCase()}</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center">
            <div className="flex-1">
              {sizeIncreased ? (
                <div className="bg-yellow-100 p-3 rounded-md text-sm text-yellow-800">
                  <p>
                    <FiAlertTriangle className="inline mr-1" /> 
                    The processed image is larger than the original. This can happen with certain image types and settings.
                    Try different compression settings or output formats for better results.
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(compressionRate, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {compressionRate}% size reduction
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
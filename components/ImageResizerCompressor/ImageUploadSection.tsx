"use client";

import { useState, useRef } from 'react';
import { FiUpload, FiFile, FiInfo } from 'react-icons/fi';
import Button from '@/components/common/Button';

interface ImageUploadSectionProps {
  onFileChange: (file: File | null) => void;
  hasImage: boolean;
}

export default function ImageUploadSection({ onFileChange, hasImage }: ImageUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAppleFormat, setIsAppleFormat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Check if it's an Apple format
    const isHeicHeif = file.type === 'image/heic' || 
                      file.type === 'image/heif' || 
                      file.name.toLowerCase().endsWith('.heic') || 
                      file.name.toLowerCase().endsWith('.heif');
    
    setIsAppleFormat(isHeicHeif);

    if (isValidImageFile(file)) {
      onFileChange(file);
    } else {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WebP, BMP, HEIC, HEIF)');
    }
  };

  const isValidImageFile = (file: File): boolean => {
    const validTypes = [
      'image/jpeg', 
      'image/png', 
      'image/gif', 
      'image/webp', 
      'image/bmp',
      'image/heic',
      'image/heif'
    ];
    
    // Also check file extension for HEIC/HEIF since some browsers don't recognize the MIME type
    if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
      return true;
    }
    
    return validTypes.includes(file.type);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Upload Image</h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        } transition-colors cursor-pointer`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
        role="button"
        tabIndex={0}
        aria-label="Upload image by clicking or dragging and dropping"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleButtonClick();
          }
        }}
      >
        <input
          type="file"
          id="image-upload"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/jpeg,image/png,image/gif,image/webp,image/bmp,image/heic,image/heif,.heic,.heif"
          className="hidden"
          aria-label="Upload image file"
          title="Upload image file"
        />
        
        <div className="flex flex-col items-center justify-center py-4">
          <FiUpload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-700 font-medium mb-1">
            {hasImage ? 'Replace image' : 'Drag & drop your image here'}
          </p>
          <p className="text-gray-500 text-sm mb-3">
            or click to browse files
          </p>
          <p className="text-xs text-gray-500">
            Supports: JPEG, PNG, GIF, WebP, BMP, HEIC, HEIF (Apple Photos)
          </p>
        </div>
      </div>
      
      {isAppleFormat && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md flex items-start">
          <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Apple HEIC/HEIF format detected</p>
            <p>This format will be automatically converted for compatibility. The conversion may take a moment.</p>
          </div>
        </div>
      )}
    </div>
  );
} 
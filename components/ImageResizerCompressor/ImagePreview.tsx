"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { isBrowser } from '@/utils/browserUtils';

interface ImagePreviewProps {
  imageUrl: string;
  altText: string;
  title: string;
  fileSize: number;
}

export default function ImagePreview({ imageUrl, altText, title, fileSize }: ImagePreviewProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !imageUrl || !isBrowser()) return;

    const img = new Image();
    img.onload = () => {
      setDimensions({
        width: img.width,
        height: img.height
      });
    };
    img.src = imageUrl;
  }, [imageUrl, isMounted]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isMounted) {
    return null; // or a loading state
  }

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <div className="p-3 bg-gray-50 border-b">
        <h4 className="font-medium">{title}</h4>
      </div>
      
      <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={altText}
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      
      <div className="p-3 bg-gray-50 text-sm text-gray-600 flex flex-wrap gap-x-4">
        {dimensions && (
          <div>
            <span className="font-medium">Dimensions:</span> {dimensions.width} × {dimensions.height}px
          </div>
        )}
        <div>
          <span className="font-medium">Size:</span> {formatFileSize(fileSize)}
        </div>
      </div>
    </div>
  );
} 
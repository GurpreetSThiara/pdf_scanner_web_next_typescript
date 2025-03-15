'use client';
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

interface PdfPreviewProps {
  onDrop: (acceptedFiles: File[]) => void;
  isProcessing: boolean;
}

export default function PdfPreview({ onDrop, isProcessing }: PdfPreviewProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
    >
      <input {...getInputProps()} />
      <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-xl text-gray-600 mb-2">
        {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF file here'}
      </p>
      <p className="text-sm text-gray-500">
        or click to select a file
      </p>
      {isProcessing && (
        <p className="mt-4 text-blue-500">Extracting images...</p>
      )}
    </div>
  );
} 
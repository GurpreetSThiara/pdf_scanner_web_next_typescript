'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface PdfUploaderProps {
  onUpload: (file: File) => void;
}

export default function PdfUploader({ onUpload }: PdfUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

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
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the PDF file here...</p>
      ) : (
        <p>Drag and drop a PDF file here, or click to select one</p>
      )}
    </div>
  );
} 
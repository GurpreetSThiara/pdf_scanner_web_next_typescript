"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

interface FileDropzoneProps {
  accept: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onFilesAdded: (files: File[]) => void;
  title: string;
  subtitle: string;
  showPreview?: boolean;
}

const FileDropzone = ({
  accept,
  maxFiles = 10,
  maxSize = 10485760, // 10MB
  onFilesAdded,
  title,
  subtitle,
  showPreview = true,
}: FileDropzoneProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
      setFiles(newFiles);
      onFilesAdded(newFiles);
    },
    [files, maxFiles, onFilesAdded]
  );

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onFilesAdded(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        <p className="mt-2 text-xs text-gray-500">
          Max file size: {formatFileSize(maxSize)}
        </p>
      </div>

      {showPreview && files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700">Selected Files</h4>
          <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-md">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between py-3 pl-3 pr-4 text-sm"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <FiFile className="flex-shrink-0 h-5 w-5 text-gray-400" />
                  <span className="ml-2 flex-1 truncate">{file.name}</span>
                  <span className="ml-2 flex-shrink-0 text-gray-400">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="ml-4 flex-shrink-0 text-red-500 hover:text-red-700"
                  aria-label={`Remove file ${file.name}`}
                >
                  <FiX className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileDropzone; 
"use client";

import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiSettings, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type SplitMethod = 'range' | 'interval' | 'specific' | 'bookmarks' | 'size';

interface PDFFile {
  file: File;
  name: string;
  size: number;
  pages: number;
  thumbnails: string[];
}

export default function PDFSplitter() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('range');
  const [pageRange, setPageRange] = useState('');
  const [interval, setInterval] = useState(1);
  const [specificPages, setSpecificPages] = useState('');
  const [targetSize, setTargetSize] = useState(5); // In MB
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'jpg' | 'png'>('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError('');
    const newFiles: PDFFile[] = [];

    for (const file of acceptedFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const numPages = pdf.numPages;
        
        // Generate thumbnails for first few pages
        const thumbnails: string[] = [];
        for (let i = 1; i <= Math.min(3, numPages); i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;
            
            thumbnails.push(canvas.toDataURL());
          }
        }

        newFiles.push({
          file,
          name: file.name,
          size: file.size,
          pages: numPages,
          thumbnails
        });
      } catch (err) {
        setError('Error loading PDF file. Please make sure it\'s a valid PDF.');
        console.error(err);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  // Split PDF based on selected method
  const handleSplit = async () => {
    setIsProcessing(true);
    setError('');

    try {
      for (const pdfFile of files) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();

        let pagesToExtract: number[] = [];

        // Determine pages to extract based on split method
        switch (splitMethod) {
          case 'range':
            pagesToExtract = parsePageRange(pageRange, totalPages);
            break;
          case 'interval':
            for (let i = 0; i < totalPages; i += interval) {
              pagesToExtract.push(i + 1);
            }
            break;
          case 'specific':
            pagesToExtract = specificPages.split(',').map(p => parseInt(p.trim())).filter(p => p > 0 && p <= totalPages);
            break;
          // Add other methods as needed
        }

        if (pagesToExtract.length === 0) {
          throw new Error('No valid pages selected for extraction');
        }

        // Create new PDF with selected pages
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdfDoc, pagesToExtract.map(p => p - 1));
        pages.forEach(page => newPdf.addPage(page));

        // Save the new PDF
        const newPdfBytes = await newPdf.save();
        const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `split_${pdfFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Error splitting PDF. Please check your settings and try again.');
      console.error(err);
    }

    setIsProcessing(false);
  };

  // Helper function to parse page ranges like "1-3,5,7-9"
  const parsePageRange = (range: string, totalPages: number): number[] => {
    const pages = new Set<number>();
    
    range.split(',').forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        for (let i = start; i <= end && i <= totalPages; i++) {
          pages.add(i);
        }
      } else {
        const pageNum = parseInt(part);
        if (pageNum > 0 && pageNum <= totalPages) {
          pages.add(pageNum);
        }
      }
    });

    return Array.from(pages).sort((a, b) => a - b);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-600">
          Drag & drop PDF files here, or click to select files
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supports multiple files up to 100MB each
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-4">
          {files.map((file, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4">
              <div className="flex-shrink-0">
                <FiFile className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-medium">{file.name}</h3>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                    title={`Remove ${file.name}`}
                    aria-label={`Remove ${file.name}`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)}MB • {file.pages} pages
                </p>
                {/* Thumbnails */}
                <div className="flex space-x-2 mt-2">
                  {file.thumbnails.map((thumb, i) => (
                    <img
                      key={i}
                      src={thumb}
                      alt={`Page ${i + 1}`}
                      className="h-20 border rounded shadow-sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Split Options */}
      {files.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-medium mb-4">Split Options</h3>
          
          {/* Split Method Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split Method
            </label>
            <select
              value={splitMethod}
              onChange={(e) => setSplitMethod(e.target.value as SplitMethod)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              title="Select split method"
              aria-label="Select split method"
            >
              <option value="range">Page Range</option>
              <option value="interval">Fixed Intervals</option>
              <option value="specific">Specific Pages</option>
              <option value="bookmarks">By Bookmarks</option>
              <option value="size">By File Size</option>
            </select>
          </div>

          {/* Method-specific inputs */}
          {splitMethod === 'range' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Range (e.g., 1-3,5,7-9)
              </label>
              <input
                type="text"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="1-3,5,7-9"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {splitMethod === 'interval' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split every N pages
              </label>
              <input
                type="number"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value))}
                min="1"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                title="Enter number of pages per split"
                placeholder="Enter number of pages"
              />
            </div>
          )}

          {splitMethod === 'specific' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Pages (comma-separated)
              </label>
              <input
                type="text"
                value={specificPages}
                onChange={(e) => setSpecificPages(e.target.value)}
                placeholder="1,3,5,7"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {splitMethod === 'size' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target File Size (MB)
              </label>
              <input
                type="number"
                value={targetSize}
                onChange={(e) => setTargetSize(parseInt(e.target.value))}
                min="1"
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                title="Enter target file size in MB"
                placeholder="Enter size in MB"
              />
            </div>
          )}

          {/* Output Format */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Output Format
            </label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as 'pdf' | 'jpg' | 'png')}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              title="Select output format"
              aria-label="Select output format"
            >
              <option value="pdf">PDF</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
            </select>
          </div>

          {/* Split Button */}
          <button
            onClick={handleSplit}
            disabled={isProcessing}
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <FiDownload className="mr-2" />
                Split PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
} 
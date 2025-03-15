"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
//import { NextSeo } from 'next-seo';
import Dropzone from 'react-dropzone';
import { FiUpload, FiImage, FiSettings, FiDownload, FiCrop, FiRotateCw, FiZoomIn } from 'react-icons/fi';
import imageCompression from 'browser-image-compression';

interface ImageSettings {
  width: number;
  height: number;
  rotate: number;
  flip: { horizontal: boolean; vertical: boolean };
  brightness: number;
  contrast: number;
  saturation: number;
  quality: number;
  maintainAspectRatio: boolean;
}

const supportedFormats = [
  { value: 'jpg', label: 'JPEG/JPG', icon: '📸' },
  { value: 'png', label: 'PNG', icon: '🖼️' },
  { value: 'webp', label: 'WebP', icon: '🌐' },
  { value: 'gif', label: 'GIF', icon: '🎭' },
  { value: 'bmp', label: 'BMP', icon: '🎨' },
  { value: 'tiff', label: 'TIFF', icon: '📷' },
  { value: 'ico', label: 'ICO', icon: '🎯' },
  { value: 'avif', label: 'AVIF', icon: '📱' },
  { value: 'heic', label: 'HEIC', icon: '📲' }
];

const mimeTypes: { [key: string]: string } = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
  'gif': 'image/gif',
  'bmp': 'image/bmp',
  'tiff': 'image/tiff',
  'ico': 'image/x-icon',
  'avif': 'image/avif',
  'heic': 'image/heic'
};

// Expand conversion types with more metadata and all possible combinations
const conversionTypes = {
  'jpg-to-png': {
    title: 'Convert JPG to PNG - Free Online Image Converter',
    description: 'Convert JPG images to PNG format online. Free, fast, and secure conversion with high quality output. No upload needed - conversion happens in your browser.',
    keywords: 'jpg to png, jpeg to png, convert jpg to png, image converter, free converter',
    fromFormat: 'JPG',
    toFormat: 'PNG',
    benefits: [
      'Lossless conversion',
      'Preserve transparency',
      'Maintain image quality',
      'Instant conversion'
    ],
    features: [
      'Preserve image quality',
      'Support transparency',
      'No file size limit',
      'Instant conversion'
    ],
    icon: '🖼️',
    popular: true
  },
  'png-to-jpg': {
    title: 'Convert PNG to JPG - Free Online Image Converter',
    description: 'Convert PNG images to JPG format online. Optimize file size while maintaining quality. Free browser-based conversion tool.',
    keywords: 'png to jpg, png to jpeg, convert png to jpg, image converter, free converter',
    fromFormat: 'PNG',
    toFormat: 'JPG',
    benefits: [
      'Reduce file size',
      'Optimize for web',
      'Maintain quality',
      'Fast conversion'
    ],
    features: [
      'Reduce file size',
      'Optimize for web',
      'Maintain quality',
      'Fast conversion'
    ],
    icon: '🖼️',
    popular: true
  },
  // Add more conversion types...
  'webp-to-jpg': {
    title: 'Convert WebP to JPG - Free Online Converter',
    description: 'Convert WebP images to JPG format online. Get better compatibility with all devices and browsers.',
    keywords: 'webp to jpg, convert webp, webp converter, image converter',
    fromFormat: 'WebP',
    toFormat: 'JPG',
    benefits: [
      'Better compatibility',
      'Smaller file size',
      'Fast processing',
      'High quality'
    ],
    features: [
      'Better compatibility',
      'Smaller file size',
      'Fast processing',
      'High quality'
    ],
    icon: '🌐',
    popular: true
  },
  // ... add more combinations
  'default': {
    title: 'Free Online Image Converter - Convert Between 9+ Image Formats',
    description: 'Convert images between JPG, PNG, WebP, GIF, BMP, TIFF, ICO, AVIF, and HEIC formats. Free, fast, and secure browser-based conversion.',
    keywords: 'image converter, convert images, jpg, png, webp, gif, bmp, tiff, ico, avif, heic',
    benefits: [
      'Support for 9+ formats',
      'Batch conversion',
      'No upload needed',
      'Free to use'
    ],
    features: [
      'Support for 9+ formats',
      'Batch conversion',
      'No upload needed',
      'Free to use'
    ],
    icon: '📸',
    popular: true
  }
} as const;

// Generate all possible conversion combinations
const generateConversionTiles = () => {
  const formats = [
    { id: 'jpg', name: 'JPG', icon: '📸' },
    { id: 'png', name: 'PNG', icon: '🖼️' },
    { id: 'webp', name: 'WebP', icon: '🌐' },
    { id: 'gif', name: 'GIF', icon: '🎭' },
    { id: 'bmp', name: 'BMP', icon: '🎨' },
    { id: 'tiff', name: 'TIFF', icon: '📷' },
    { id: 'ico', name: 'ICO', icon: '🎯' },
    { id: 'avif', name: 'AVIF', icon: '📱' },
    { id: 'heic', name: 'HEIC', icon: '📲' }
  ];
  
  const tiles = [];
  
  for (const from of formats) {
    for (const to of formats) {
      if (from.id !== to.id) {
        const conversionId = `${from.id}-to-${to.id}`;
        tiles.push({
          id: conversionId,
          from: from,
          to: to,
          isPopular: conversionTypes[conversionId as keyof typeof conversionTypes]?.popular || false
        });
      }
    }
  }
  return tiles;
};

// Add a ConversionTiles component after the main converter UI
const ConversionTiles = ({ currentConversion }: { currentConversion: string }) => {
  return (
    <div className="mt-16 border-t pt-12">
      <h2 className="text-2xl font-semibold mb-6">Other Conversion Options</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {generateConversionTiles()
          .filter(tile => tile.id !== currentConversion)
          .map((tile) => (
            <a
              key={tile.id}
              href={`/image-converter?type=${tile.id}`}
              className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1">
                  <span className="text-lg">{tile.from.icon}</span>
                  <span className="font-medium text-sm text-gray-600">{tile.from.name}</span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-sm text-gray-600">{tile.to.name}</span>
                  <span className="text-lg">{tile.to.icon}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Convert {tile.from.name} to {tile.to.name}
              </p>
            </a>
          ))}
      </div>
    </div>
  );
};

// Create a separate client component for the converter content
function ImageConverterContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  
  // Get conversion type from URL and ensure it's valid
  const conversionType = type || 'default';
  
  // Set initial target format based on URL
  const getInitialTargetFormat = () => {
    if (conversionType && conversionType.includes('-to-')) {
      return conversionType.split('-to-')[1];
    }
    return 'png';
  };

  const [targetFormat, setTargetFormat] = useState<string>(getInitialTargetFormat());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'edit' | 'convert'>('upload');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [settings, setSettings] = useState<ImageSettings>({
    width: 0,
    height: 0,
    rotate: 0,
    flip: { horizontal: false, vertical: false },
    brightness: 100,
    contrast: 100,
    saturation: 100,
    quality: 90,
    maintainAspectRatio: true
  });

  // Update SEO metadata based on conversion type
  const seoData = typeof conversionType === 'string' ? 
    conversionTypes[conversionType as keyof typeof conversionTypes] || conversionTypes.default :
    conversionTypes.default;

  // Add browser check state
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add cleanup for any object URLs
  // useEffect(() => {
  //   return () => {
  //     // Cleanup any object URLs when component unmounts
  //     if (previewUrl) URL.revokeObjectURL(previewUrl);
  //     if (resultUrl) URL.revokeObjectURL(resultUrl);
  //   };
  // }, [previewUrl, resultUrl]);

  // Prevent rendering until client-side
  // if (!isMounted) {
  //   return null; // or a loading state
  // }

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      setMessage({ text: 'Please select a valid image file', type: 'error' });
      return;
    }

    if (acceptedFiles.length > 1) {
      setBatchFiles(acceptedFiles);
      setCurrentStep('convert');
    } else {
      handleFileSelect(acceptedFiles[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select a valid image file', type: 'error' });
      return;
    }

    // Reset any previous error messages
    setMessage(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
      setPreview(reader.result as string);
        
      // Set initial dimensions
      const img = new Image();
      img.onload = () => {
        setSettings(prev => ({
          ...prev,
          width: img.width,
          height: img.height
        }));
          // Move to edit step after image is fully loaded
          setCurrentStep('edit');
      };
      img.src = reader.result as string;
      }
    };
    reader.onerror = () => {
      setMessage({ text: 'Error reading the image file', type: 'error' });
    };
    reader.readAsDataURL(file);
  };

  const applyImageEffects = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement) => {
    // Save the current context state
    ctx.save();

    // Apply rotation if needed
    if (settings.rotate) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((settings.rotate * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Apply flips if needed
    if (settings.flip.horizontal || settings.flip.vertical) {
      ctx.scale(
        settings.flip.horizontal ? -1 : 1,
        settings.flip.vertical ? -1 : 1
      );
    }

    // Set image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Apply filters
    ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;

    // Draw the image
    ctx.drawImage(img, 0, 0, settings.width, settings.height);

    // Restore the context state
    ctx.restore();
  };

  const convertImage = async () => {
    if (!selectedFile) {
      setMessage({ text: 'Please select an image first', type: 'error' });
      return;
    }

    setConverting(true);
    setMessage(null);

    try {
      // Compression options
      const options = {
        maxSizeMB: 10,
        maxWidthOrHeight: Math.max(settings.width, settings.height),
        useWebWorker: true,
        fileType: `image/${targetFormat}`,
        initialQuality: settings.quality / 100,
      };

      // First compress and convert the image
      const compressedFile = await imageCompression(selectedFile, options);

      // Create a URL for the compressed image
      const imageUrl = URL.createObjectURL(compressedFile);

      // Load the compressed image to apply effects
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Apply effects using canvas
      const canvas = document.createElement('canvas');
      canvas.width = settings.width;
      canvas.height = settings.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Apply effects
      ctx.save();
      
      // Center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((settings.rotate * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Apply flips
      ctx.scale(
        settings.flip.horizontal ? -1 : 1,
        settings.flip.vertical ? -1 : 1
      );

      // Apply filters
      ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`;

      // Draw image
      ctx.drawImage(img, 0, 0, settings.width, settings.height);
      ctx.restore();

      // Get the final image as blob
      const finalBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          `image/${targetFormat}`,
          settings.quality / 100
        );
      });

      // Clean up
      URL.revokeObjectURL(imageUrl);

      // Download the image
      const downloadUrl = URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const originalName = selectedFile.name.split('.')[0];
      link.download = `${originalName}-converted.${targetFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setMessage({ text: 'Image converted successfully!', type: 'success' });
    } catch (error) {
      console.error('Conversion error:', error);
      setMessage({ 
        text: 'Error converting image. Please try a different format or image.',
        type: 'error'
      });
    } finally {
      setConverting(false);
    }
  };

  const convertBatch = async () => {
    if (batchFiles.length === 0) {
      setMessage({ text: 'No files selected for batch conversion', type: 'error' });
      return;
    }

    setConverting(true);
    setMessage(null);

    try {
      // Create a zip file
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Compression options
      const options = {
        maxSizeMB: 10,
        useWebWorker: true,
        fileType: `image/${targetFormat}`,
        initialQuality: settings.quality / 100,
      };

      // Convert each file
      for (const file of batchFiles) {
        try {
          const compressedFile = await imageCompression(file, options);
          const fileName = `${file.name.split('.')[0]}.${targetFormat}`;
          zip.file(fileName, compressedFile);
        } catch (error) {
          console.error(`Error converting ${file.name}:`, error);
        }
      }

      // Generate and download zip
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `converted-images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage({ text: 'Batch conversion completed!', type: 'success' });
    } catch (error) {
      console.error('Batch conversion error:', error);
      setMessage({ 
        text: 'Error processing batch conversion',
        type: 'error'
      });
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <NextSeo {...seoData} /> */}

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          {conversionType !== 'default' 
            ? `Convert ${conversionType.split('-to-')[0].toUpperCase()} to ${conversionType.split('-to-')[1].toUpperCase()}`
            : 'Professional Image Converter'}
        </h1>
        
        {/* Conversion Type Tiles */}
        {conversionType === 'default' && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Choose Conversion Type</h2>
            
            {/* Popular Conversions */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Popular Conversions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generateConversionTiles()
                  .filter(tile => tile.isPopular)
                  .map((tile) => (
                    <a
                      key={tile.id}
                      href={`/image-converter?type=${tile.id}`}
                      className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-102 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{tile.from.icon}</span>
                          <span className="font-medium text-gray-600">{tile.from.name}</span>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-600">{tile.to.name}</span>
                          <span className="text-2xl">{tile.to.icon}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Convert {tile.from.name} images to {tile.to.name} format with our free online converter.
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Popular</span>
                          <span className="ml-2">Free & Secure</span>
                        </div>
                      </div>
                    </a>
                  ))}
              </div>
            </div>

            {/* All Conversions */}
            <div>
              <h3 className="text-lg font-medium mb-4">All Conversion Types</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {generateConversionTiles()
                  .filter(tile => !tile.isPopular)
                  .map((tile) => (
                    <a
                      key={tile.id}
                      href={`/image-converter?type=${tile.id}`}
                      className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-lg">{tile.from.icon}</span>
                          <span className="font-medium text-sm text-gray-600">{tile.from.name}</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <div className="flex items-center space-x-1">
                          <span className="font-medium text-sm text-gray-600">{tile.to.name}</span>
                          <span className="text-lg">{tile.to.icon}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Convert {tile.from.name} to {tile.to.name}
                      </p>
                    </a>
                  ))}
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Quick Format Guide</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {supportedFormats.map((format) => (
                  <div key={format.value} className="flex items-center space-x-2">
                    <span className="text-xl">{format.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{format.label}</p>
                      <p className="text-xs text-gray-500">{format.value.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Conversion Steps */}
        {conversionType !== 'default' && (
        <div className="flex justify-center mb-8">
          {['upload', 'edit', 'convert'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                rounded-full h-10 w-10 flex items-center justify-center
                ${currentStep === step ? 'bg-blue-600 text-white' : 'bg-gray-200'}
              `}>
                {index + 1}
              </div>
              {index < 2 && <div className="w-20 h-1 bg-gray-200" />}
            </div>
          ))}
        </div>
        )}
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {message && (
            <div className={`p-4 rounded-md mb-6 ${
              message.type === 'error' 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}>
              {message.text}
            </div>
          )}

          {currentStep === 'upload' && (
            <Dropzone onDrop={handleDrop} accept={{'image/*': []}}>
              {({getRootProps, getInputProps}) => (
                <div {...getRootProps()} className="p-12 text-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500">
                  <input {...getInputProps()} />
                  <FiUpload className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Drag & drop images here, or click to select files
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Supports single or multiple files
                  </p>
                </div>
              )}
            </Dropzone>
          )}

          {currentStep === 'edit' && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Preview</h3>
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="h-auto max-w-full rounded-md"
                      style={{
                        filter: `brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%)`,
                        transform: `rotate(${settings.rotate}deg) scale(${settings.flip.horizontal ? -1 : 1}, ${settings.flip.vertical ? -1 : 1})`
                      }}
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-semibold">Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Output Format</label>
                      <select
                        value={targetFormat}
                        onChange={(e) => setTargetFormat(e.target.value)}
                        className="w-full p-2 bg-white border rounded-md"
                      >
                        {supportedFormats.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-sm font-medium">Width</label>
                        <input
                          type="number"
                          value={settings.width}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            width: Number(e.target.value),
                            height: settings.maintainAspectRatio 
                              ? (Number(e.target.value) * prev.height) / prev.width 
                              : prev.height
                          }))}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium">Height</label>
                        <input
                          type="number"
                          value={settings.height}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            height: Number(e.target.value),
                            width: settings.maintainAspectRatio 
                              ? (Number(e.target.value) * prev.width) / prev.height 
                              : prev.width
                          }))}
                          className="w-full p-2 border rounded-md"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
                    </button>

                    {showAdvanced && (
                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1 text-sm font-medium">
                            Quality: {settings.quality}%
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={settings.quality}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              quality: Number(e.target.value)
                            }))}
                            className="w-full"
                          />
                        </div>

                        {['brightness', 'contrast', 'saturation'].map((adjustment) => (
                          <div key={adjustment}>
                            <label className="block mb-1 text-sm font-medium">
                              {adjustment.charAt(0).toUpperCase() + adjustment.slice(1)}: {settings[adjustment as keyof ImageSettings]}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="200"
                              value={settings[adjustment as keyof ImageSettings]}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                [adjustment]: Number(e.target.value)
                              }))}
                              className="w-full"
                            />
                          </div>
                        ))}

                        <div>
                          <label className="block mb-1 text-sm font-medium">Rotation</label>
                          <div className="flex gap-2">
                            {[0, 90, 180, 270].map((deg) => (
                              <button
                                key={deg}
                                onClick={() => setSettings(prev => ({ ...prev, rotate: deg }))}
                                className={`p-2 border rounded ${
                                  settings.rotate === deg ? 'bg-blue-600 text-white' : ''
                                }`}
                              >
                                {deg}°
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => setSettings(prev => ({
                              ...prev,
                              flip: {
                                ...prev.flip,
                                horizontal: !prev.flip.horizontal
                              }
                            }))}
                            className={`p-2 border rounded ${
                              settings.flip.horizontal ? 'bg-blue-600 text-white' : ''
                            }`}
                          >
                            Flip Horizontal
                          </button>
                          <button
                            onClick={() => setSettings(prev => ({
                              ...prev,
                              flip: {
                                ...prev.flip,
                                vertical: !prev.flip.vertical
                              }
                            }))}
                            className={`p-2 border rounded ${
                              settings.flip.vertical ? 'bg-blue-600 text-white' : ''
                            }`}
                          >
                            Flip Vertical
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setCurrentStep('upload')}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('convert')}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {currentStep === 'convert' && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="mb-4 text-lg font-semibold">Convert & Download</h3>
              
              {batchFiles.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    {batchFiles.length} files selected for batch conversion
                  </p>
                  <button
                    onClick={convertBatch}
                    disabled={converting}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium
                      ${converting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {converting ? 'Converting...' : 'Convert All & Download ZIP'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={convertImage}
                  disabled={converting}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium
                    ${converting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {converting ? 'Converting...' : 'Convert & Download'}
                </button>
              )}

              <div className="mt-4">
                <button
                  onClick={() => setCurrentStep('edit')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Back to Edit
                </button>
              </div>
            </div>
          )}

          {/* SEO Content */}
          <div className="prose max-w-none mt-12">
            <h2 className="text-2xl font-bold mb-6">
              {conversionType !== 'default' 
                ? `Convert ${conversionType.split('-to-')[0].toUpperCase()} to ${conversionType.split('-to-')[1].toUpperCase()}`
                : 'About Our Image Converter'}
            </h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <p className="text-gray-700 mb-6">
                {conversionType !== 'default'
                  ? `Convert your ${conversionType.split('-to-')[0].toUpperCase()} images to ${conversionType.split('-to-')[1].toUpperCase()} format quickly and easily. Our tool provides high-quality conversion right in your browser - no need to upload files to our servers!`
                  : 'Convert your images between multiple formats quickly and easily. Our tool supports all major image formats including JPG, PNG, WebP, GIF, BMP, TIFF, ICO, AVIF, and HEIC.'}
              </p>

              <h3 className="text-xl font-bold mb-4">Key Benefits:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(conversionType !== 'default' 
                  ? conversionTypes[conversionType as keyof typeof conversionTypes]?.benefits 
                  : conversionTypes.default.benefits
                )?.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <section className="mb-12">
              <h3 className="text-xl font-bold mb-6">Frequently Asked Questions</h3>
              <div className="space-y-6">
                {conversionType !== 'default' ? (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">How do I convert {conversionType.split('-to-')[0].toUpperCase()} to {conversionType.split('-to-')[1].toUpperCase()}?</h4>
                      <p className="text-gray-700">Simply upload your {conversionType.split('-to-')[0].toUpperCase()} file, adjust any settings if needed, and click convert. Your {conversionType.split('-to-')[1].toUpperCase()} file will be ready to download instantly.</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Is it safe to convert {conversionType.split('-to-')[0].toUpperCase()} to {conversionType.split('-to-')[1].toUpperCase()} online?</h4>
                      <p className="text-gray-700">Yes, our converter processes everything in your browser. Your files never leave your device, ensuring complete privacy and security.</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <h4 className="font-semibold mb-2">What image formats are supported?</h4>
                    <p className="text-gray-700">Our converter supports all major image formats including JPG, PNG, WebP, GIF, BMP, TIFF, ICO, AVIF, and HEIC.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Add ConversionTiles for specific conversion routes */}
        {conversionType !== 'default' && (
          <ConversionTiles currentConversion={conversionType} />
        )}
      </div>
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

// Update the main page component
export default function ImageConverter() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading converter...</p>
        </div>
      </div>
    }>
      <ImageConverterContent />
    </Suspense>
  );
} 
"use client"

import React, { useState, useEffect } from "react";
import { createWorker, Worker, RecognizeResult } from 'tesseract.js';

// Types for our state and data
interface ProcessingSettings {
  contrast: number;
  brightness: number;
  threshold: number;
}

interface ConfidenceWord {
  text: string;
  confidence: number;
}

interface ConfidenceData {
  text: string;
  words: ConfidenceWord[];
  confidence: number;
}

interface LoggerMessage {
  status: string;
  progress: number;
}

// Create a singleton worker pattern
let workerInstance: Worker | null = null;
let workerLanguage: string = 'eng';

export const getWorker = async (language = 'eng', logger: ((m: LoggerMessage) => void) | null = null) => {
  // If language changes or worker doesn't exist, (re)initialize
  if (!workerInstance || workerLanguage !== language) {
    // Terminate existing worker if language changed
    if (workerInstance && workerLanguage !== language) {
      await workerInstance.terminate();
      workerInstance = null;
    }
    
    workerInstance = await createWorker({
      logger: (m) => {
        console.log(m);
        if (logger) logger(m);
      }
    });
    
    await workerInstance.load();
    await workerInstance.loadLanguage(language);
    await workerInstance.initialize(language);
    workerLanguage = language;
  }
  return workerInstance;
};

export const terminateWorker = async () => {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
};

export const ExtractText = async (
  image: string | File,
  language = 'eng',
  progressCallback: ((m: LoggerMessage) => void) | null = null
): Promise<RecognizeResult['data']> => {
  const worker = await getWorker(language, progressCallback);
  const result = await worker.recognize(image);
  return result.data;
};

const optimizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if too large
        const MAX_SIZE = 1200;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = height * (MAX_SIZE / width);
            width = MAX_SIZE;
          } else {
            width = width * (MAX_SIZE / height);
            height = MAX_SIZE;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  });
};

// Available languages for OCR
const AVAILABLE_LANGUAGES = [
  { code: 'eng', name: 'English' },
  { code: 'spa', name: 'Spanish' },
  { code: 'fra', name: 'French' },
  { code: 'deu', name: 'German' },
  { code: 'ita', name: 'Italian' },
  { code: 'por', name: 'Portuguese' },
  { code: 'chi_sim', name: 'Chinese (Simplified)' },
  { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' },
  { code: 'rus', name: 'Russian' },
  { code: 'ara', name: 'Arabic' },
  { code: 'hin', name: 'Hindi' }
];

// Image preprocessing options
const IMAGE_FILTERS = [
  { id: 'original', name: 'Original' },
  { id: 'grayscale', name: 'Grayscale' },
  { id: 'highContrast', name: 'High Contrast' },
  { id: 'threshold', name: 'Threshold' }
];

// Rename component for better SEO
const ImageToTextConverter: React.FC = () => {
  // Main state with proper types
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // New state for improved features
  const [progress, setProgress] = useState<number>(0);
  const [language, setLanguage] = useState<string>('eng');
  const [showConfidence, setShowConfidence] = useState<boolean>(false);
  const [confidenceData, setConfidenceData] = useState<ConfidenceData | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('original');
  const [processingSettings, setProcessingSettings] = useState<ProcessingSettings>({
    contrast: 100,
    brightness: 100,
    threshold: 128
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      terminateWorker();
    };
  }, []);

  const handleImageUpload = async (file: File) => {
    if (file) {
      setIsLoading(true);
      try {
        const fileURL = URL.createObjectURL(file);
        setOriginalImage(fileURL);
        
        const optimizedImage = await optimizeImage(file);
        setImage(optimizedImage);
        
        setSelectedFilter('original');
        setProcessingSettings({
          contrast: 100,
          brightness: 100,
          threshold: 128
        });
      } catch (error) {
        console.error("Error processing image:", error);
      } finally {
        setIsLoading(false);
        setText("");
        setConfidenceData(null);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const applyImageFilter = (filter: string) => {
    if (!originalImage) return;
    setSelectedFilter(filter);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw the original image
      ctx.drawImage(img, 0, 0);
      
      // Apply selected filter
      if (filter !== 'original') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Apply different filters based on selection
        const { contrast, brightness, threshold } = processingSettings;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          if (filter === 'grayscale') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const adjusted = applyBrightnessContrast(gray, brightness, contrast);
            data[i] = data[i + 1] = data[i + 2] = adjusted;
          } 
          else if (filter === 'highContrast') {
            data[i] = applyBrightnessContrast(r, brightness, contrast * 1.5);
            data[i + 1] = applyBrightnessContrast(g, brightness, contrast * 1.5);
            data[i + 2] = applyBrightnessContrast(b, brightness, contrast * 1.5);
          } 
          else if (filter === 'threshold') {
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            const value = gray < threshold ? 0 : 255;
            data[i] = data[i + 1] = data[i + 2] = value;
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      setImage(canvas.toDataURL('image/jpeg'));
    };
    
    img.src = originalImage;
  };
  
  const applyBrightnessContrast = (value: number, brightness: number, contrast: number): number => {
    // Normalize brightness (0-200) to (-100-100)
    const brightnessNormalized = brightness - 100;
    // Apply brightness
    let result = value + brightnessNormalized;
    
    // Normalize contrast (0-200) to (0-2)
    const contrastFactor = contrast / 100;
    // Apply contrast
    result = ((result - 128) * contrastFactor) + 128;
    
    // Clamp to valid range
    return Math.max(0, Math.min(255, result));
  };
  
  const handleSettingChange = (setting: keyof ProcessingSettings, value: number) => {
    setProcessingSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    // Re-apply the filter with new settings
    applyImageFilter(selectedFilter);
  };

  const handleExtractText = async () => {
    if (!image) return;
    
    setIsLoading(true);
    setProgress(0);
    try {
      const result = await ExtractText(
        image, 
        language, 
        (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      );
      
      setText(result.text);
      
      if (showConfidence) {
        setConfidenceData(result);
      } else {
        setConfidenceData(null);
      }
    } catch (error) {
      console.error("Error extracting text:", error);
      setText("Error extracting text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced confidence visualization with proper types
  const renderTextWithConfidence = () => {
    if (!confidenceData || !confidenceData.words) return null;
    
    return (
      <div className="confidence-text space-y-4">
        <div className="confidence-legend flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-2"></div>
            <span>Low Confidence</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
            <span>Medium Confidence</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 mr-2"></div>
            <span>High Confidence</span>
          </div>
        </div>
        
        <div className="text-content">
          {confidenceData.words.map((word, index) => {
            const confidence = word.confidence;
            let backgroundColor;
            
            if (confidence < 60) {
              backgroundColor = 'rgb(239, 68, 68)'; // red-500
            } else if (confidence < 85) {
              backgroundColor = 'rgb(234, 179, 8)'; // yellow-500
            } else {
              backgroundColor = 'rgb(34, 197, 94)'; // green-500
            }
            
            return (
              <span 
                key={index} 
                style={{ 
                  backgroundColor,
                  padding: '1px 4px',
                  margin: '0 1px',
                  borderRadius: '4px',
                  color: confidence < 85 ? 'white' : 'black',
                  cursor: 'help'
                }}
                title={`Confidence: ${confidence.toFixed(1)}%`}
              >
                {word.text}{' '}
              </span>
            );
          })}
        </div>
        
        <div className="confidence-stats grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium text-gray-700">Average Confidence</h4>
            <p className="text-2xl font-bold text-blue-600">
              {confidenceData.confidence.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="font-medium text-gray-700">Words Analyzed</h4>
            <p className="text-2xl font-bold text-blue-600">
              {confidenceData.words.length}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-800 md:text-4xl">
          Free <strong className="text-blue-600">Image to Text</strong> Converter & <strong className="text-blue-600">OCR Scanner</strong>
        </h1>
        <p className="text-lg text-gray-600">
          Extract text from <strong>images</strong>, <strong>pictures</strong>, and <strong>scanned PDFs</strong> with our advanced{' '}
          <strong>optical character recognition</strong> technology.
        </p>
      </header>

      <section className="features-section bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Transform Your <strong>Pictures to Text</strong> Instantly
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="feature-card p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">
              Advanced Text Recognition
            </h3>
            <p className="text-gray-600">
              Our <strong>OCR scanner</strong> supports multiple formats including{' '}
              <strong>PNG</strong>, <strong>JPG</strong>, and <strong>PDF</strong>.
            </p>
          </div>
          <div className="feature-card p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">
              Multi-Language Support
            </h3>
            <p className="text-gray-600">
              Extract text from images in {AVAILABLE_LANGUAGES.length} different languages.
            </p>
          </div>
        </div>
      </section>
      
      <section className="upload-section" aria-label="Image Upload Area">
        <div 
          className={`p-8 border-2 border-dashed rounded-lg transition-all duration-200 ${
            isDragging 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 bg-gray-50"
          } flex flex-col items-center justify-center`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden" 
            id="fileInput"
            aria-label="Upload image for text extraction"
          />
          
          {!image ? (
            <div className="text-center space-y-4">
              <div className="text-gray-400">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                Upload Image to Extract Text
              </h3>
              <p className="text-gray-600 max-w-md">
                <strong>Scan & OCR</strong> your images instantly. Support for{' '}
                <strong>text recognition</strong> in multiple languages.
              </p>
              <label 
                htmlFor="fileInput" 
                className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium inline-block"
              >
                Select an Image to Convert
              </label>
              <p className="text-gray-500">
                Or drag and drop your <strong>image</strong>, <strong>picture</strong>, or <strong>scanned document</strong>
              </p>
            </div>
          ) : (
            <div className="w-full">
              <div className="relative">
                <img 
                  src={image} 
                  alt="Uploaded" 
                  className="max-h-64 mx-auto object-contain rounded-md shadow-md" 
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="flex justify-center mt-4">
                <label 
                  htmlFor="fileInput" 
                  className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 mr-2 text-sm font-medium"
                >
                  Change Image
                </label>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {image && (
        <section className="image-processing bg-white p-6 rounded-lg shadow-sm space-y-6">
          <header className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Image Processing Options
            </h2>
            <button 
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-blue-600 text-sm flex items-center"
              aria-expanded={showAdvancedOptions}
              type="button"
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
              <svg className={`w-4 h-4 ml-1 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </header>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                id="language-select"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select OCR language"
              >
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="filter-select" className="block text-sm font-medium text-gray-700 mb-1">
                Filter
              </label>
              <select
                id="filter-select"
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={selectedFilter}
                onChange={(e) => applyImageFilter(e.target.value)}
                aria-label="Select image filter"
              >
                {IMAGE_FILTERS.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {showAdvancedOptions && (
            <div className="advanced-options space-y-4">
              <h3 className="text-lg font-medium text-gray-800">
                Advanced Image Enhancement
              </h3>
              <p className="text-gray-600">
                Optimize your <strong>text recognition</strong> results with these settings
              </p>
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="brightness-range" className="text-sm font-medium text-gray-700">Brightness</label>
                  <span className="text-sm text-gray-500">{processingSettings.brightness}%</span>
                </div>
                <input 
                  id="brightness-range"
                  type="range" 
                  min="0" 
                  max="200" 
                  value={processingSettings.brightness} 
                  onChange={(e) => handleSettingChange('brightness', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Adjust brightness"
                />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <label htmlFor="contrast-range" className="text-sm font-medium text-gray-700">Contrast</label>
                  <span className="text-sm text-gray-500">{processingSettings.contrast}%</span>
                </div>
                <input 
                  id="contrast-range"
                  type="range" 
                  min="0" 
                  max="200" 
                  value={processingSettings.contrast} 
                  onChange={(e) => handleSettingChange('contrast', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Adjust contrast"
                />
              </div>
              
              {selectedFilter === 'threshold' && (
                <div>
                  <div className="flex justify-between mb-1">
                    <label htmlFor="threshold-range" className="text-sm font-medium text-gray-700">Threshold</label>
                    <span className="text-sm text-gray-500">{processingSettings.threshold}</span>
                  </div>
                  <input 
                    id="threshold-range"
                    type="range" 
                    min="0" 
                    max="255" 
                    value={processingSettings.threshold} 
                    onChange={(e) => handleSettingChange('threshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    aria-label="Adjust threshold"
                  />
                </div>
              )}
              
              <div className="flex items-center mt-3">
                <input
                  id="showConfidence"
                  type="checkbox"
                  checked={showConfidence}
                  onChange={() => setShowConfidence(!showConfidence)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="showConfidence" className="ml-2 block text-sm text-gray-700">
                  Show confidence scores
                </label>
              </div>
            </div>
          )}
        </section>
      )}

      <div className="flex justify-center">
        <button 
          onClick={handleExtractText} 
          disabled={!image || isLoading}
          className={`px-6 py-3 rounded-lg font-medium flex items-center ${
            !image 
              ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {progress > 0 ? `Processing ${progress}%` : 'Processing...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Extract Text from Image
            </>
          )}
        </button>
      </div>

      {(text || confidenceData) && (
        <section className="results-section mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Extracted Text Results
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            {showConfidence && confidenceData ? (
              <>
                <h3 className="text-lg font-medium text-gray-800">
                  Text Recognition Confidence Analysis
                </h3>
                {renderTextWithConfidence()}
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium text-gray-800">
                  Extracted Text Content
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-gray-700 font-mono text-sm">{text}</pre>
                </div>
              </>
            )}
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                <strong>Optical Character Recognition</strong> completed successfully
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(text)}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                </svg>
                Copy Extracted Text
              </button>
            </div>
          </div>
        </section>
      )}

      <footer className="text-center text-sm text-gray-500 mt-8">
        <p>
          Our <strong>text scanner</strong> uses advanced{' '}
          <strong>optical character recognition (OCR)</strong> to{' '}
          <strong>extract text from images</strong> with high accuracy.
        </p>
      </footer>
    </div>
  );
};

export default ImageToTextConverter;
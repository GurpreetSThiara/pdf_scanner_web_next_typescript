"use client";

import { FiInfo } from 'react-icons/fi';

interface CompressOptionsProps {
  compressionType: 'lossy' | 'lossless';
  setCompressionType: (type: 'lossy' | 'lossless') => void;
  compressionQuality: number;
  setCompressionQuality: (quality: number) => void;
  outputFormat: 'jpeg' | 'png' | 'webp';
  setOutputFormat: (format: 'jpeg' | 'png' | 'webp') => void;
}

export default function CompressOptions({
  compressionType,
  setCompressionType,
  compressionQuality,
  setCompressionQuality,
  outputFormat,
  setOutputFormat,
}: CompressOptionsProps) {
  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompressionQuality(parseInt(e.target.value, 10));
  };

  // When compression type changes, adjust the output format for best results
  const handleCompressionTypeChange = (type: 'lossy' | 'lossless') => {
    setCompressionType(type);
    
    // If switching to lossless and current format is JPEG, switch to PNG
    if (type === 'lossless' && outputFormat === 'jpeg') {
      setOutputFormat('png');
    }
    
    // If switching to lossy and current format is PNG, consider switching to JPEG
    if (type === 'lossy' && outputFormat === 'png') {
      setOutputFormat('jpeg');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            Compression Type
          </label>
          <div className="flex flex-col space-y-2">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="compressionType"
                value="lossy"
                checked={compressionType === 'lossy'}
                onChange={() => handleCompressionTypeChange('lossy')}
                className="mr-2"
              />
              <span>Lossy (smaller files, some quality loss)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="compressionType"
                value="lossless"
                checked={compressionType === 'lossless'}
                onChange={() => handleCompressionTypeChange('lossless')}
                className="mr-2"
              />
              <span>Lossless (larger files, no quality loss)</span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="outputFormat" className="text-sm font-medium text-gray-700 block mb-2">
            Output Format
          </label>
          <select
            id="outputFormat"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select output format"
          >
            <option value="jpeg" disabled={compressionType === 'lossless'}>
              JPEG (best for photos, lossy)
            </option>
            <option value="png">PNG (best for graphics, supports transparency)</option>
            <option value="webp">WebP (modern format, smaller size)</option>
          </select>
          {compressionType === 'lossless' && outputFormat === 'jpeg' && (
            <p className="mt-1 text-xs text-yellow-600">
              Note: JPEG doesn't support lossless compression. Consider using PNG or WebP for lossless compression.
            </p>
          )}
        </div>

        {compressionType === 'lossy' && (
          <div>
            <div className="flex justify-between mb-1">
              <label htmlFor="quality" className="text-sm font-medium text-gray-700">
                Quality ({compressionQuality}%)
              </label>
              <div className="flex items-center text-xs text-gray-500">
                <span>Smaller</span>
                <span className="mx-2">|</span>
                <span>Better</span>
              </div>
            </div>
            <input
              id="quality"
              type="range"
              min="1"
              max="100"
              value={compressionQuality}
              onChange={handleQualityChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>10%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Recommended: 70-80% for photos, 80-90% for graphics with text
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
        <p className="font-medium mb-1 flex items-center">
          <FiInfo className="mr-1" /> Compression Tips:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>For photos:</strong> Use JPEG with lossy compression (70-80% quality)</li>
          <li><strong>For graphics/logos:</strong> Use PNG with lossless compression</li>
          <li><strong>For transparency:</strong> Use PNG or WebP (JPEG doesn't support transparency)</li>
          <li><strong>For best compression:</strong> WebP usually provides the smallest file size</li>
          <li><strong>For maximum compatibility:</strong> JPEG and PNG are supported by all browsers</li>
          <li><strong>For Apple HEIC/HEIF images:</strong> These will be automatically converted to JPEG or your selected format</li>
        </ul>
      </div>
    </div>
  );
} 
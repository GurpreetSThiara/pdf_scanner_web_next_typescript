"use client";

import { useState, useEffect } from 'react';
import { FiLock, FiUnlock, FiInfo } from 'react-icons/fi';

interface ResizeOptionsProps {
  width: number | null;
  height: number | null;
  setWidth: (width: number | null) => void;
  setHeight: (height: number | null) => void;
  maintainAspectRatio: boolean;
  setMaintainAspectRatio: (maintain: boolean) => void;
  scalePercentage: number;
  setScalePercentage: (percentage: number) => void;
  resizeMethod: 'dimensions' | 'percentage';
  setResizeMethod: (method: 'dimensions' | 'percentage') => void;
}

export default function ResizeOptions({
  width,
  height,
  setWidth,
  setHeight,
  maintainAspectRatio,
  setMaintainAspectRatio,
  scalePercentage,
  setScalePercentage,
  resizeMethod,
  setResizeMethod,
}: ResizeOptionsProps) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{width: number | null, height: number | null}>({
    width: null,
    height: null
  });

  // Store original dimensions when they first come in
  useEffect(() => {
    if (width && height && !originalDimensions.width && !originalDimensions.height) {
      setOriginalDimensions({ width, height });
      setAspectRatio(width / height);
    }
  }, [width, height, originalDimensions]);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = e.target.value ? parseInt(e.target.value, 10) : null;
    setWidth(newWidth);
    
    if (maintainAspectRatio && aspectRatio && newWidth) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = e.target.value ? parseInt(e.target.value, 10) : null;
    setHeight(newHeight);
    
    if (maintainAspectRatio && aspectRatio && newHeight) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = parseInt(e.target.value, 10);
    setScalePercentage(newPercentage);
    
    // Update width and height based on percentage if original dimensions are available
    if (originalDimensions.width && originalDimensions.height) {
      const newWidth = Math.round(originalDimensions.width * (newPercentage / 100));
      const newHeight = Math.round(originalDimensions.height * (newPercentage / 100));
      setWidth(newWidth);
      setHeight(newHeight);
    }
  };

  const toggleAspectRatio = () => {
    if (!maintainAspectRatio && width && height) {
      setAspectRatio(width / height);
    }
    setMaintainAspectRatio(!maintainAspectRatio);
  };

  // Calculate estimated file size reduction based on dimensions
  const calculateSizeReduction = (): string => {
    if (!originalDimensions.width || !originalDimensions.height || !width || !height) {
      return "Unknown";
    }
    
    const originalArea = originalDimensions.width * originalDimensions.height;
    const newArea = width * height;
    const reduction = Math.round((1 - (newArea / originalArea)) * 100);
    
    if (reduction <= 0) {
      return "No reduction (enlarging)";
    }
    
    return `~${reduction}% smaller`;
  };

  // Common dimensions presets
  const dimensionPresets = [
    { name: "HD (1280×720)", width: 1280, height: 720 },
    { name: "Full HD (1920×1080)", width: 1920, height: 1080 },
    { name: "4K (3840×2160)", width: 3840, height: 2160 },
    { name: "Instagram (1080×1080)", width: 1080, height: 1080 },
    { name: "Twitter (1200×675)", width: 1200, height: 675 },
    { name: "Facebook (1200×630)", width: 1200, height: 630 },
  ];

  // Percentage presets
  const percentagePresets = [25, 50, 75, 100];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex mb-4 space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="resizeMethod"
              checked={resizeMethod === 'dimensions'}
              onChange={() => setResizeMethod('dimensions')}
              className="mr-2"
            />
            <span>Specific dimensions</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="resizeMethod"
              checked={resizeMethod === 'percentage'}
              onChange={() => setResizeMethod('percentage')}
              className="mr-2"
            />
            <span>Scale by percentage</span>
          </label>
        </div>

        {resizeMethod === 'dimensions' ? (
          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="width" className="mb-1 text-sm font-medium text-gray-700">
                Width (px)
              </label>
              <div className="flex">
                <input
                  id="width"
                  type="number"
                  value={width || ''}
                  onChange={handleWidthChange}
                  placeholder="Width in pixels"
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="height" className="mb-1 text-sm font-medium text-gray-700">
                Height (px)
              </label>
              <div className="flex">
                <input
                  id="height"
                  type="number"
                  value={height || ''}
                  onChange={handleHeightChange}
                  placeholder="Height in pixels"
                  min="1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleAspectRatio}
                className={`flex items-center text-sm font-medium ${
                  maintainAspectRatio ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                {maintainAspectRatio ? (
                  <>
                    <FiLock className="mr-1" /> Maintain aspect ratio
                  </>
                ) : (
                  <>
                    <FiUnlock className="mr-1" /> Free proportions
                  </>
                )}
              </button>
              
              {width && height && originalDimensions.width && originalDimensions.height && (
                <span className="text-xs text-gray-500">
                  {calculateSizeReduction()}
                </span>
              )}
            </div>
            
            {/* Common dimension presets */}
            <div className="mt-2">
              <p className="mb-2 text-xs text-gray-500">Common dimensions:</p>
              <div className="flex flex-wrap gap-2">
                {dimensionPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      if (maintainAspectRatio && aspectRatio) {
                        // Adjust dimensions to maintain aspect ratio
                        const currentAspect = aspectRatio;
                        const presetAspect = preset.width / preset.height;
                        
                        if (currentAspect > presetAspect) {
                          // Width constrained
                          setWidth(preset.width);
                          setHeight(Math.round(preset.width / currentAspect));
                        } else {
                          // Height constrained
                          setHeight(preset.height);
                          setWidth(Math.round(preset.height * currentAspect));
                        }
                      } else {
                        setWidth(preset.width);
                        setHeight(preset.height);
                      }
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="percentage" className="mb-1 text-sm font-medium text-gray-700">
                Scale (%)
              </label>
              <div className="flex items-center">
                <input
                  id="percentage"
                  type="range"
                  min="1"
                  max="200"
                  value={scalePercentage}
                  onChange={handlePercentageChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="w-12 ml-3 text-center">{scalePercentage}%</span>
              </div>
              
              {/* Percentage presets */}
              <div className="flex flex-wrap gap-2 mt-2">
                {percentagePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setScalePercentage(preset)}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {preset}%
                  </button>
                ))}
              </div>
              
              {width && height && originalDimensions.width && originalDimensions.height && (
                <p className="mt-2 text-xs text-gray-500">
                  New dimensions: {width} × {height}px
                  {scalePercentage < 100 && ` (${calculateSizeReduction()})`}
                  {scalePercentage > 100 && " (enlarging)"}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 text-sm text-blue-800 rounded-md bg-blue-50">
        <p className="flex items-center mb-1 font-medium">
          <FiInfo className="mr-1" /> Resizing Tips:
        </p>
        <ul className="pl-5 space-y-1 list-disc">
          <li>For web images, 1200px width is usually sufficient</li>
          <li>Maintain aspect ratio to prevent distortion</li>
          <li>Scaling down improves quality and reduces file size</li>
          <li>Scaling up beyond 100% may result in pixelation</li>
          <li>Social media platforms have specific recommended dimensions</li>
        </ul>
      </div>
    </div>
  );
} 
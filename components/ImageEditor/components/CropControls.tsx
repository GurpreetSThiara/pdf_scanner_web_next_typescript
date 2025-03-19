import { useState, useEffect } from 'react';
import { FiCrop, FiRotateCw, FiMaximize2, FiCheck, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { EditorState, AspectRatio } from '../types';

interface CropControlsProps {
  editorState: EditorState;
  onChange: (updates: Partial<EditorState>) => void;
  handleApplyCrop?: () => void;
  cropZoom?: number;
  onZoomChange?: (zoom: number) => void;
}

export function CropControls({ 
  editorState, 
  onChange, 
  handleApplyCrop,
  cropZoom = 1,
  onZoomChange
}: CropControlsProps) {
  const aspectRatios: { label: string; value: AspectRatio }[] = [
    { label: 'Free', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:2', value: '3:2' },
  ];

  const handleZoomChange = (newZoom: number) => {
    if (onZoomChange) {
      onZoomChange(newZoom);
    }
  };

  // The actual applying and canceling is handled by the useImageEditor hook
  // The crops are controlled by the active tab state in the parent component
  
  return (
    <div className="p-6 space-y-6">
      {/* Aspect Ratio Controls */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-2">
          {aspectRatios.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => onChange({ aspectRatio: value })}
              className={`px-3 py-2 rounded text-sm ${
                editorState.aspectRatio === value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              aria-label={`Set aspect ratio to ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom Control */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Zoom</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoomChange(Math.max(1, cropZoom - 0.1))}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600"
            aria-label="Zoom out"
          >
            <FiZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={cropZoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            aria-label="Zoom level"
          />
          <button
            onClick={() => handleZoomChange(Math.min(3, cropZoom + 0.1))}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600"
            aria-label="Zoom in"
          >
            <FiZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rotation Controls for Crop */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Rotate Crop</label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ rotation: (editorState.rotation - 90) % 360 })}
            className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            aria-label="Rotate left 90 degrees"
          >
            <FiRotateCw className="w-4 h-4 rotate-[-90deg] mx-auto" />
          </button>
          <button
            onClick={() => onChange({ rotation: (editorState.rotation + 90) % 360 })}
            className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            aria-label="Rotate right 90 degrees"
          >
            <FiRotateCw className="w-4 h-4 rotate-90 mx-auto" />
          </button>
        </div>
      </div>
      
      <div className="pt-3 space-y-3 border-t border-gray-700">
        <p className="text-sm text-gray-400">
          Select a region of the image to crop by dragging the handles of the crop box.
          Adjust aspect ratio, zoom, and rotation as needed before applying.
        </p>
      </div>

      {/* Actions - The actual logic for these buttons is in the parent component */}
      <div className="flex gap-2">
        <button
          className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 flex items-center justify-center gap-2"
          aria-label="Cancel crop"
          onClick={() => onChange({ aspectRatio: 'free' })} 
        >
          <FiX className="w-4 h-4" />
          Cancel
        </button>
        <button
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
          aria-label="Apply crop"
          onClick={handleApplyCrop}
        >
          <FiCheck className="w-4 h-4" />
          Apply
        </button>
      </div>
    </div>
  );
} 
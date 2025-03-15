import { useState, useEffect } from 'react';
import { FiCrop, FiRotateCw, FiMaximize2, FiCheck, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import { EditorState, AspectRatio } from '../types';

interface CropControlsProps {
  editorState: EditorState;
  onChange: (updates: Partial<EditorState>) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export function CropControls({ editorState, onChange, onApplyCrop, onCancelCrop, zoom, onZoomChange }: CropControlsProps) {
  const aspectRatios: { label: string; value: AspectRatio }[] = [
    { label: 'Free', value: 'free' },
    { label: '1:1', value: '1:1' },
    { label: '4:3', value: '4:3' },
    { label: '16:9', value: '16:9' },
    { label: '3:2', value: '3:2' },
  ];

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
            onClick={() => onZoomChange(Math.max(1, zoom - 0.1))}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            <FiZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <button
            onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600"
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
          >
            <FiRotateCw className="w-4 h-4 rotate-[-90deg] mx-auto" />
          </button>
          <button
            onClick={() => onChange({ rotation: (editorState.rotation + 90) % 360 })}
            className="flex-1 px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            <FiRotateCw className="w-4 h-4 rotate-90 mx-auto" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onCancelCrop}
          className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 flex items-center justify-center gap-2"
        >
          <FiX className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={onApplyCrop}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <FiCheck className="w-4 h-4" />
          Apply
        </button>
      </div>
    </div>
  );
} 
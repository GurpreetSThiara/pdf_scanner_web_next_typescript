import React, { useState } from 'react';
import { EditorState, DrawingOptions } from '../types';
import { 
  FiEdit3, 
  FiMinus, 
  FiSquare, 
  FiCircle, 
  FiArrowRight, 
  FiType, 
  FiTrash2,
  FiEyeOff,
  FiEye
} from 'react-icons/fi';
import { HexColorPicker } from 'react-colorful';

interface DrawControlsProps {
  editorState: EditorState;
  onChange: (updates: Partial<EditorState>) => void;
}

type DrawingTool = 'brush' | 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'eraser';

interface ToolOption {
  id: DrawingTool;
  icon: React.ElementType;
  label: string;
}

export function DrawControls({ editorState, onChange }: DrawControlsProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const tools: ToolOption[] = [
    { id: 'brush', icon: FiEdit3, label: 'Brush' },
    { id: 'line', icon: FiMinus, label: 'Line' },
    { id: 'rectangle', icon: FiSquare, label: 'Rectangle' },
    { id: 'circle', icon: FiCircle, label: 'Circle' },
    { id: 'arrow', icon: FiArrowRight, label: 'Arrow' },
    { id: 'text', icon: FiType, label: 'Text' },
    { id: 'eraser', icon: FiTrash2, label: 'Eraser' },
  ];

  const handleToolChange = (tool: DrawingTool) => {
    const newOptions: Partial<DrawingOptions> = { mode: tool };
    
    // If switching to eraser, set color to white
    if (tool === 'eraser') {
      newOptions.color = '#FFFFFF';
    }
    
    onChange({
      drawing: {
        ...editorState.drawing,
        enabled: true,
        currentOptions: {
          ...editorState.drawing.currentOptions,
          ...newOptions
        }
      }
    });
  };

  const handleBrushSizeChange = (size: number) => {
    onChange({
      drawing: {
        ...editorState.drawing,
        currentOptions: {
          ...editorState.drawing.currentOptions,
          brushSize: size
        }
      }
    });
  };

  const handleOpacityChange = (opacity: number) => {
    onChange({
      drawing: {
        ...editorState.drawing,
        currentOptions: {
          ...editorState.drawing.currentOptions,
          opacity
        }
      }
    });
  };

  const handleColorChange = (color: string) => {
    onChange({
      drawing: {
        ...editorState.drawing,
        currentOptions: {
          ...editorState.drawing.currentOptions,
          color
        }
      }
    });
  };

  const handleToggleDrawing = () => {
    onChange({
      drawing: {
        ...editorState.drawing,
        enabled: !editorState.drawing.enabled
      }
    });
  };

  const handleClearDrawings = () => {
    onChange({
      drawing: {
        ...editorState.drawing,
        paths: []
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Drawing Tools</h3>
          <button
            onClick={handleToggleDrawing}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            aria-label={editorState.drawing.enabled ? "Hide drawings" : "Show drawings"}
          >
            {editorState.drawing.enabled ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-sm text-gray-400">Draw directly on your image</p>
      </div>

      {/* Drawing Tools */}
      <div className="grid grid-cols-4 gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-colors
                ${editorState.drawing.currentOptions.mode === tool.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              aria-label={tool.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Brush Size Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Brush Size</label>
          <span className="text-sm text-gray-400">{editorState.drawing.currentOptions.brushSize}px</span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={editorState.drawing.currentOptions.brushSize}
          onChange={(e) => handleBrushSizeChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          aria-label="Brush Size"
        />
      </div>

      {/* Opacity Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Opacity</label>
          <span className="text-sm text-gray-400">{editorState.drawing.currentOptions.opacity}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={100}
          value={editorState.drawing.currentOptions.opacity}
          onChange={(e) => handleOpacityChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          aria-label="Opacity"
        />
      </div>

      {/* Color Picker */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Color</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-10 h-10 rounded-lg border-2 border-white overflow-hidden"
            style={{ backgroundColor: editorState.drawing.currentOptions.color }}
            aria-label="Select color"
          />
          <div className="grid grid-cols-6 gap-2 flex-1">
            {['#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#0000FF', '#9900FF', 
              '#FF00FF', '#FFFFFF', '#000000', '#888888', '#CCCCCC', '#663300'].map(color => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-6 h-6 rounded-full border border-gray-600"
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
        {showColorPicker && (
          <div className="mt-3 p-3 bg-gray-800 rounded-lg">
            <HexColorPicker 
              color={editorState.drawing.currentOptions.color} 
              onChange={handleColorChange}
              className="w-full" 
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-gray-700">
        <button
          onClick={handleClearDrawings}
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FiTrash2 className="w-4 h-4" />
          Clear All Drawings
        </button>
      </div>
    </div>
  );
} 
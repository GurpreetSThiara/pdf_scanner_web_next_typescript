import { FiRotateCw, FiMove, FiMaximize, FiMinimize, FiGitCommit, FiGrid, FiSquare, FiScissors, FiEye, FiEyeOff, FiTrash2 } from 'react-icons/fi';
import { EditorState } from '../types';
import { useState } from 'react';

interface TransformControlsProps {
  editorState: EditorState;
  onChange: (updates: Partial<EditorState>) => void;
}

export function TransformControls({ editorState, onChange }: TransformControlsProps) {
  const [clippingExpanded, setClippingExpanded] = useState(false);

  const handleRotationStep = (step: number) => {
    const newRotation = (editorState.rotation + step) % 360;
    onChange({ rotation: newRotation });
  };

  const toggleClipping = () => {
    onChange({
      clipping: {
        ...editorState.clipping,
        enabled: !editorState.clipping.enabled
      }
    });
  };

  const clearClippingPaths = () => {
    onChange({
      clipping: {
        ...editorState.clipping,
        paths: [],
        currentPath: null
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Rotation Control */}
      <div className="space-y-3">
        <label className="flex items-center justify-between text-sm font-medium text-gray-300">
          <div className="flex items-center gap-2">
            <FiRotateCw className="w-4 h-4" />
            Rotation
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRotationStep(-90)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              -90°
            </button>
            <button
              onClick={() => handleRotationStep(90)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              +90°
            </button>
          </div>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={-180}
            max={180}
            value={editorState.rotation}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer
                     accent-blue-500 hover:accent-blue-600 transition-all"
            aria-label="Rotation value"
          />
          <input
            type="number"
            min={-180}
            max={180}
            value={editorState.rotation}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="w-16 bg-gray-700 text-gray-300 rounded px-2 py-1 text-sm"
            aria-label="Rotation value"
          />
        </div>
      </div>

      {/* Scale Controls */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <FiMaximize className="w-4 h-4" />
          Scale
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-400">X: {editorState.scale.x}x</span>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={editorState.scale.x}
              onChange={(e) => onChange({ 
                scale: { ...editorState.scale, x: Number(e.target.value) }
              })}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              aria-label="Scale X value"
            />
          </div>
          <div>
            <span className="text-sm text-gray-400">Y: {editorState.scale.y}x</span>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={editorState.scale.y}
              onChange={(e) => onChange({ 
                scale: { ...editorState.scale, y: Number(e.target.value) }
              })}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              aria-label="Scale Y value"
            />
          </div>
        </div>
      </div>

      {/* Skew Controls */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <FiGitCommit className="w-4 h-4" />
          Skew
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-400">X: {editorState.skew.x}°</span>
            <input
              type="range"
              min={-45}
              max={45}
              value={editorState.skew.x}
              onChange={(e) => onChange({ 
                skew: { ...editorState.skew, x: Number(e.target.value) }
              })}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              aria-label="Skew X value"
            />
          </div>
          <div>
            <span className="text-sm text-gray-400">Y: {editorState.skew.y}°</span>
            <input
              type="range"
              min={-45}
              max={45}
              value={editorState.skew.y}
              onChange={(e) => onChange({ 
                skew: { ...editorState.skew, y: Number(e.target.value) }
              })}
              className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              aria-label="Skew Y value"
            />
          </div>
        </div>
      </div>

      {/* Flip Controls */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <FiMove className="w-4 h-4" />
          Flip
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => onChange({ 
              flip: { 
                ...editorState.flip, 
                horizontal: !editorState.flip.horizontal 
              }
            })}
            className={`px-4 py-2 rounded ${
              editorState.flip.horizontal 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Horizontal
          </button>
          <button
            onClick={() => onChange({ 
              flip: { 
                ...editorState.flip, 
                vertical: !editorState.flip.vertical 
              }
            })}
            className={`px-4 py-2 rounded ${
              editorState.flip.vertical 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            Vertical
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => onChange({
          rotation: 0,
          scale: { x: 1, y: 1 },
          skew: { x: 0, y: 0 },
          flip: { horizontal: false, vertical: false },
          perspective: {
            topLeft: { x: 0, y: 0 },
            topRight: { x: 0, y: 0 },
            bottomLeft: { x: 0, y: 0 },
            bottomRight: { x: 0, y: 0 }
          }
        })}
        className="w-full px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
      >
        Reset Transforms
      </button>

      {/* Background Controls */}
      <div className="space-y-3">
        <label className="flex items-center justify-between text-sm font-medium text-gray-300">
          <div className="flex items-center gap-2">
            <FiSquare className="w-4 h-4" />
            Background
          </div>
        </label>
        
        <div className="space-y-2">
          {/* Background Type */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onChange({
                background: { ...editorState.background, type: 'none', padding: 0 }
              })}
              className={`px-3 py-1 rounded text-sm ${
                editorState.background.type === 'none'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              None
            </button>
            <button
              onClick={() => onChange({
                background: { ...editorState.background, type: 'transparent' }
              })}
              className={`px-3 py-1 rounded text-sm ${
                editorState.background.type === 'transparent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Transparent
            </button>
            <button
              onClick={() => onChange({
                background: { ...editorState.background, type: 'checkerboard' }
              })}
              className={`px-3 py-1 rounded text-sm ${
                editorState.background.type === 'checkerboard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Checkerboard
            </button>
            <button
              onClick={() => onChange({
                background: { ...editorState.background, type: 'color' }
              })}
              className={`px-3 py-1 rounded text-sm ${
                editorState.background.type === 'color'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              Color
            </button>
          </div>

          {/* Color Picker (shown only when type is 'color') */}
          {editorState.background.type === 'color' && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={editorState.background.color}
                onChange={(e) => onChange({
                  background: { ...editorState.background, color: e.target.value }
                })}
                className="w-8 h-8 rounded cursor-pointer"
                aria-label="Background color"
              />
              <span className="text-sm text-gray-400">
                {editorState.background.color}
              </span>
            </div>
          )}

          {/* Padding Control (hidden when type is 'none') */}
          {editorState.background.type !== 'none' && (
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Padding</span>
                <span className="text-sm text-gray-400">{editorState.background.padding}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                value={editorState.background.padding}
                onChange={(e) => onChange({
                  background: { ...editorState.background, padding: Number(e.target.value) }
                })}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                aria-label="Background padding"
              />
            </div>
          )}
        </div>
      </div>

      {/* Clipping Path Section */}
      <div className="space-y-3 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setClippingExpanded(!clippingExpanded)} 
            className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white w-full justify-between"
            aria-label={clippingExpanded ? "Collapse clipping section" : "Expand clipping section"}
          >
            <div className="flex items-center gap-2">
              <FiScissors className="w-4 h-4" />
              Clipping Path
            </div>
            <svg 
              className={`w-4 h-4 transition-transform ${clippingExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {clippingExpanded && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-400">
              Create custom clipping shapes by drawing a path around your image. 
              Anything outside the path will be transparent.
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleClipping}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors
                  ${editorState.clipping.enabled 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                aria-label={editorState.clipping.enabled ? "Disable clipping" : "Enable clipping"}
              >
                {editorState.clipping.enabled ? (
                  <>
                    <FiEye className="w-4 h-4" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <FiEyeOff className="w-4 h-4" />
                    <span>Disabled</span>
                  </>
                )}
              </button>
              
              <button
                onClick={clearClippingPaths}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-700 text-gray-300 
                         rounded-md hover:bg-gray-600 transition-colors"
                disabled={editorState.clipping.paths.length === 0}
                aria-label="Clear all clipping paths"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Clear Paths</span>
              </button>
            </div>
            
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm text-white mb-2">How to create a clipping path:</p>
              <ol className="text-xs text-gray-400 list-decimal pl-4 space-y-1">
                <li>Enable clipping mode</li>
                <li>Click on the image to create points</li>
                <li>To close the path, click on the first point</li>
                <li>To cancel the current path, press ESC key</li>
              </ol>
            </div>
            
            {editorState.clipping.paths.length > 0 && (
              <div className="text-sm text-gray-400">
                Active paths: {editorState.clipping.paths.length}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
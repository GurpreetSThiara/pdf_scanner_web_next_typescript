import { FiRotateCw, FiMove, FiMaximize, FiMinimize, FiGitCommit, FiGrid, FiSquare } from 'react-icons/fi';
import { EditorState } from '../types';

interface TransformControlsProps {
  editorState: EditorState;
  onChange: (updates: Partial<EditorState>) => void;
}

export function TransformControls({ editorState, onChange }: TransformControlsProps) {
  const handleRotationStep = (step: number) => {
    const newRotation = (editorState.rotation + step) % 360;
    onChange({ rotation: newRotation });
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
          />
          <input
            type="number"
            min={-180}
            max={180}
            value={editorState.rotation}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
            className="w-16 bg-gray-700 text-gray-300 rounded px-2 py-1 text-sm"
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
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
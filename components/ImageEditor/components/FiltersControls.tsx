import React from 'react';
import { EditorState, FilterType } from '../types';
import { FiSliders } from 'react-icons/fi';

interface FiltersControlsProps {
  editorState: EditorState;
  onChange: (updates: Partial<EditorState>) => void;
}

const FILTERS: Array<{ id: FilterType; label: string; thumbnail: string }> = [
  { id: 'none', label: 'None', thumbnail: '🔄' },
  { id: 'grayscale', label: 'Grayscale', thumbnail: '⚪' },
  { id: 'sepia', label: 'Sepia', thumbnail: '🟤' },
  { id: 'vintage', label: 'Vintage', thumbnail: '📜' },
  { id: 'retro', label: 'Retro', thumbnail: '📷' },
  { id: 'vivid', label: 'Vivid', thumbnail: '🌈' },
  { id: 'cool', label: 'Cool', thumbnail: '❄️' },
  { id: 'warm', label: 'Warm', thumbnail: '🔥' },
  { id: 'haze', label: 'Haze', thumbnail: '🌫️' },
  { id: 'nightvision', label: 'Night Vision', thumbnail: '🌃' },
  { id: 'dramatic', label: 'Dramatic', thumbnail: '🎭' },
  { id: 'clarendon', label: 'Clarendon', thumbnail: '🌆' },
  { id: 'noir', label: 'Noir', thumbnail: '🕶️' },
  { id: 'chrome', label: 'Chrome', thumbnail: '🔍' },
  { id: 'fade', label: 'Fade', thumbnail: '🌫️' },
  { id: 'gingham', label: 'Gingham', thumbnail: '🧶' },
  { id: 'lofi', label: 'Lo-Fi', thumbnail: '📻' },
  { id: 'toaster', label: 'Toaster', thumbnail: '🍞' },
  { id: 'valencia', label: 'Valencia', thumbnail: '🍊' },
  { id: 'xpro2', label: 'X-Pro II', thumbnail: '📸' }
];

export function FiltersControls({ editorState, onChange }: FiltersControlsProps) {
  const handleFilterChange = (filter: FilterType) => {
    onChange({ filter });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white">Filters</h3>
        <p className="text-sm text-gray-400">Choose a filter to apply to your image</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterChange(filter.id)}
            className={`aspect-square p-2 relative rounded-lg overflow-hidden border-2 transition-all flex flex-col items-center justify-center
              ${editorState.filter === filter.id 
                ? 'border-blue-500 bg-blue-500/20' 
                : 'border-gray-700 hover:border-gray-500 bg-gray-800'
              }`}
          >
            <span className="text-2xl mb-1">{filter.thumbnail}</span>
            <span className="text-xs font-medium">{filter.label}</span>
          </button>
        ))}
      </div>

      {editorState.filter !== 'none' && (
        <div className="space-y-3 pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <FiSliders className="w-4 h-4" />
              Filter Intensity
            </label>
            <span className="text-sm text-gray-400">{editorState.filterIntensity}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={200}
            value={editorState.filterIntensity}
            onChange={(e) => onChange({ filterIntensity: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            aria-label="Filter Intensity"
          />
        </div>
      )}

      <button
        onClick={() => onChange({ filter: 'none', filterIntensity: 100 })}
        className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 
                 flex items-center justify-center gap-2 font-medium transition-colors"
      >
        Reset Filters
      </button>
    </div>
  );
} 
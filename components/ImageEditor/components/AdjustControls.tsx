import { FiSun, FiSliders, FiDroplet, FiZap, FiMoon, FiSunrise, FiThermometer, FiFeather } from 'react-icons/fi';
import { EditorState } from '../types';

interface AdjustControlsProps {
  editorState: EditorState;
  onChange: (updates: Partial<EditorState>) => void;
}

export function AdjustControls({ editorState, onChange }: AdjustControlsProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <Slider
          label="Exposure"
          value={editorState.exposure}
          onChange={(value) => onChange({ exposure: value })}
          min={0}
          max={200}
          icon={<FiZap className="w-4 h-4" />}
        />
        <Slider
          label="Brightness"
          value={editorState.brightness}
          onChange={(value) => onChange({ brightness: value })}
          min={0}
          max={200}
          icon={<FiSun className="w-4 h-4" />}
        />
        <Slider
          label="Contrast"
          value={editorState.contrast}
          onChange={(value) => onChange({ contrast: value })}
          min={0}
          max={200}
          icon={<FiSliders className="w-4 h-4" />}
        />
        <Slider
          label="Highlights"
          value={editorState.highlights}
          onChange={(value) => onChange({ highlights: value })}
          min={0}
          max={200}
          icon={<FiSunrise className="w-4 h-4" />}
        />
        <Slider
          label="Shadows"
          value={editorState.shadows}
          onChange={(value) => onChange({ shadows: value })}
          min={0}
          max={200}
          icon={<FiMoon className="w-4 h-4" />}
        />
        <Slider
          label="Temperature"
          value={editorState.temperature}
          onChange={(value) => onChange({ temperature: value })}
          min={0}
          max={200}
          icon={<FiThermometer className="w-4 h-4" />}
        />
        <Slider
          label="Saturation"
          value={editorState.saturation}
          onChange={(value) => onChange({ saturation: value })}
          min={0}
          max={200}
          icon={<FiDroplet className="w-4 h-4" />}
        />
        <Slider
          label="Sharpness"
          value={editorState.sharpness}
          onChange={(value) => onChange({ sharpness: value })}
          min={0}
          max={200}
          icon={<FiFeather className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  icon?: React.ReactNode;
}

const Slider = ({ label, value, onChange, min = 0, max = 200, icon }: SliderProps) => {
  // Ensure value is always within bounds and defined
  const safeValue = Math.min(Math.max(value ?? 100, min), max);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          {icon}
          {label}
        </label>
        <span className="text-sm text-gray-400">{safeValue}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={safeValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer
                 accent-blue-500 hover:accent-blue-600 transition-all"
      />
    </div>
  );
}; 
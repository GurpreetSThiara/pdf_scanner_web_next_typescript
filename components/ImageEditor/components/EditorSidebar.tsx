import { FiSave, FiSliders, FiMove, FiCrop, FiFilter, FiEdit } from 'react-icons/fi';
import { EditorState, EditorTab } from '../types';
import { AdjustControls } from './AdjustControls';
import { TransformControls } from './TransformControls';
import { CropControls } from './CropControls';
import { FiltersControls } from './FiltersControls';
import { DrawControls } from './DrawControls';

interface EditorSidebarProps {
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  editorState: EditorState;
  onSave: () => void;
  isProcessing: boolean;
  onChange: (updates: Partial<EditorState>) => void;
  extraProps?: Record<string, any>;
}

export function EditorSidebar({
  activeTab,
  setActiveTab,
  editorState,
  onSave,
  isProcessing,
  onChange,
  extraProps = {}
}: EditorSidebarProps) {
  const tabs = [
    { id: 'adjust', icon: FiSliders, label: 'Adjust' },
    { id: 'filters', icon: FiFilter, label: 'Filters' },
    { id: 'transform', icon: FiMove, label: 'Transform' },
    { id: 'draw', icon: FiEdit, label: 'Draw' },
    { id: 'crop', icon: FiCrop, label: 'Crop' }
  ] as const;

  return (
    <div className="w-[320px] bg-gray-900 flex flex-col border-l border-gray-800">
      {/* Tabs */}
      <div className="p-4">
        <div className="flex flex-wrap bg-gray-800 rounded-lg p-1 gap-1">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as EditorTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors min-w-[60px]
                ${activeTab === id 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto border-t border-gray-800">
        {activeTab === 'adjust' && (
          <AdjustControls editorState={editorState} onChange={onChange} />
        )}
        {activeTab === 'transform' && (
          <TransformControls editorState={editorState} onChange={onChange} />
        )}
        {activeTab === 'crop' && (
          <CropControls 
            editorState={editorState} 
            onChange={onChange} 
            handleApplyCrop={extraProps.handleApplyCrop}
            cropZoom={extraProps.cropZoom}
            onZoomChange={extraProps.onZoomChange}
          />
        )}
        {activeTab === 'filters' && (
          <FiltersControls editorState={editorState} onChange={onChange} />
        )}
        {activeTab === 'draw' && (
          <DrawControls editorState={editorState} onChange={onChange} />
        )}
      </div>

      {/* Action Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onSave}
          disabled={isProcessing}
          className="w-full py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                   flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
                   font-medium transition-colors"
        >
          <FiSave className="w-5 h-5" />
          {isProcessing ? 'Processing...' : 'Apply Changes & Save'}
        </button>
      </div>
    </div>
  );
} 
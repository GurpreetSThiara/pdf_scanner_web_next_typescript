import { useState } from 'react';
import { EditorCanvas } from './components/EditorCanvas';
import { EditorSidebar } from './components/EditorSidebar';
import { useImageEditor } from './hooks/useImageEditor';
import { ImageEditModalProps } from './types';
import { FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

const EDIT_HISTORY_KEY = 'image-editor-history';

export default function ImageEditModal({ image, onClose, onSave }: ImageEditModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'transform' | 'crop'>('adjust');
  const editor = useImageEditor(image);

  const handleSaveClick = async () => {
    const blob = await editor.handleSave();
    if (blob) {
      onSave(blob);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div 
        className={`bg-gray-900 rounded-xl overflow-hidden flex flex-col
          ${isFullscreen ? 'w-full h-full rounded-none' : 'w-[95%] h-[90vh] max-w-7xl mx-4'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-xl font-medium text-white">Image Editor</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Area */}
          <div className="flex-1 bg-gray-950 flex items-center justify-center p-4">
            hjhgjhg
            <EditorCanvas {...editor} />
          </div>

          {/* Controls */}
          <EditorSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            editorState={editor.editorState}
            onChange={editor.onChange}
            onSave={handleSaveClick}
            isProcessing={false}
          />
        </div>
      </div>
    </div>
  );
} 
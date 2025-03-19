import { useState, useEffect, useMemo } from 'react';
import { EditorCanvas } from './components/EditorCanvas';
import { EditorSidebar } from './components/EditorSidebar';
import { useImageEditor } from './hooks/useImageEditor';
import { ImageEditModalProps } from './types';
import { FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';

export default function ImageEditModal({ image, onClose, onSave }: ImageEditModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveWithBackground, setSaveWithBackground] = useState(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'transform' | 'crop' | 'filters' | 'draw'>('adjust');
  const [cropZoom, setCropZoom] = useState(1);
  const editor = useImageEditor(image);

  // Determine the appropriate cursor style based on the active tool
  const cursorStyle = useMemo(() => {
    if (activeTab === 'draw' && editor.editorState.drawing.enabled) {
      const mode = editor.editorState.drawing.currentOptions.mode;
      
      switch (mode) {
        case 'brush':
          return 'crosshair';
        case 'eraser':
          return 'url("data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22%3E%3Ccircle cx=%2212%22 cy=%2212%22 r=%225%22/%3E%3C/svg%3E") 12 12, auto';
        case 'text':
          return 'text';
        case 'line':
        case 'arrow':
          return 'crosshair';
        case 'rectangle':
        case 'circle':
          return 'crosshair';
        default:
          return 'default';
      }
    } else if (activeTab === 'transform' && editor.editorState.clipping.enabled) {
      return 'crosshair';
    } else if (activeTab === 'crop') {
      return 'default'; // react-easy-crop manages its own cursors
    }
    
    return 'default';
  }, [activeTab, editor.editorState.drawing, editor.editorState.clipping]);

  // Enable crop mode when user switches to crop tab
  useEffect(() => {
    if (activeTab === 'crop' && !editor.cropMode) {
      editor.startCrop();
    } else if (activeTab !== 'crop' && editor.cropMode) {
      editor.cancelCrop();
    }
  }, [activeTab, editor]);

  const handleSaveClick = async () => {
    const blob = await editor.handleSave();
    if (blob) {
      onSave(blob);
    }
  };

  const handleApplyCrop = () => {
    editor.applyCrop();
    setActiveTab('adjust'); // Switch back to adjust tab after applying crop
  };

  const handleCropZoomChange = (zoom: number) => {
    setCropZoom(zoom);
  };

  // Handle canvas mouse interactions for drawing and clipping
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editor.cropMode) {
      const canvas = editor.canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      
      // Calculate position relative to canvas center (since we're drawing from center in useImageEditor)
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // First get click position relative to the canvas element
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Then convert to canvas coordinate system
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // Calculate x,y relative to canvas center
      const x = (clickX * scaleX) - (canvasWidth / 2);
      const y = (clickY * scaleY) - (canvasHeight / 2);
      
      if (activeTab === 'draw' && editor.editorState.drawing.enabled) {
        editor.startDrawing({ x, y });
      } else if (activeTab === 'transform' && editor.editorState.clipping.enabled) {
        editor.startClippingPath({ x, y });
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editor.cropMode) {
      const canvas = editor.canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      
      // Calculate position relative to canvas center (since we're drawing from center in useImageEditor)
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // First get cursor position relative to the canvas element
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Then convert to canvas coordinate system
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      // Calculate x,y relative to canvas center
      const x = (clickX * scaleX) - (canvasWidth / 2);
      const y = (clickY * scaleY) - (canvasHeight / 2);
      
      if (activeTab === 'draw' && editor.editorState.drawing.enabled) {
        editor.continueDrawing({ x, y });
      } else if (activeTab === 'transform' && editor.editorState.clipping.enabled) {
        editor.continueClippingPath({ x, y });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (!editor.cropMode) {
      if (activeTab === 'draw' && editor.editorState.drawing.enabled) {
        editor.endDrawing();
      } else if (activeTab === 'transform' && editor.editorState.clipping.enabled) {
        editor.closeClippingPath();
      }
    }
  };

  // Create custom props to pass to CropControls, including apply function
  const cropControlsProps = activeTab === 'crop' ? {
    handleApplyCrop,
    cropZoom,
    onZoomChange: handleCropZoomChange
  } : {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div 
        className={`bg-gray-900 rounded-xl overflow-hidden flex flex-col
          ${isFullscreen ? 'w-full h-full rounded-none' : 'w-[95%] h-[90vh] max-w-7xl mx-4'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h3 className="text-xl font-medium text-white">Image Editor</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Save with Background</label>
              <input
                type="checkbox"
                checked={saveWithBackground}
                onChange={(e) => setSaveWithBackground(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-700 bg-gray-800 focus:ring-blue-500"
                aria-label="Toggle background save"
                id="background-save"
              />
            </div>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <FiMinimize2 className="w-5 h-5" /> : <FiMaximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close editor"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Area */}
          <div 
            className="flex-1 bg-gray-950 flex items-center justify-center p-4"
            style={{ cursor: cursorStyle }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            <EditorCanvas 
              {...editor} 
              cropArea={editor.cropArea}
              updateCropArea={editor.updateCropArea}
              onCropComplete={editor.onCropComplete}
              cropZoom={cropZoom}
            />
          </div>

          {/* Controls */}
          <EditorSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            editorState={editor.editorState}
            onChange={editor.onChange}
            onSave={handleSaveClick}
            isProcessing={false}
            extraProps={cropControlsProps}
          />
        </div>
      </div>
    </div>
  );
} 
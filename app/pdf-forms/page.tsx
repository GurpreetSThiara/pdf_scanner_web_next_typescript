"use client";

import React from 'react';
import { FiDownload, FiEye, FiPlus, FiRefreshCw, FiRotateCcw, FiGrid } from 'react-icons/fi';
import { useFormBuilder } from './hooks/useFormBuilder';
import ElementToolbar from './components/ElementToolbar';
import FormCanvas from './components/FormCanvas';
import PropertiesPanel from './components/PropertiesPanel';
import ToolPageLayout from '@/components/layout/ToolPageLayout';
import Button from '@/components/common/Button';
import { ElementType } from './types/form-builder';

export default function PDFFormsPage() {
  // Use the form builder hook to manage the form state
  const {
    form,
    editorState,
    addPage,
    removePage,
    updatePage,
    setActivePageId,
    addElement,
    updateElement,
    removeElement,
    selectElement,
    deselectAllElements,
    setHoveredElementId,
    setEditorMode,
    setZoomLevel,
    toggleGrid,
    toggleSnapToGrid,
    undo,
    redo,
    saveSnapshot
  } = useFormBuilder();

  // Keep track of loading state
  const [isLoading, setIsLoading] = React.useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = React.useState<string | null>(null);

  // Get the active page
  const activePage = form.pages.find(page => page.id === editorState.activePageId) || form.pages[0];
  
  // Get selected elements
  const selectedElements = activePage?.elements.filter(element => 
    editorState.selectedElementIds.includes(element.id)
  ) || [];

  // Handle adding a new element
  const handleAddElement = (type: ElementType, x?: number, y?: number) => {
    if (typeof x === 'number' && typeof y === 'number') {
      addElement(type, x, y);
    } else {
      addElement(type);
    }
  };

  // Handle updating an element
  const handleUpdateElement = (elementId: string, updates: Record<string, unknown>) => {
    updateElement(elementId, updates);
  };

  // Handle form title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update form name (we'd ideally have a dedicated method in the hook)
    const updatedForm = { ...form, name: e.target.value };
    // This is just a temporary solution since our hook doesn't expose a way to directly update form metadata
    localStorage.setItem('pdf-form-builder-form', JSON.stringify(updatedForm));
  };

  // Generate PDF preview
  const handlePreview = async () => {
    setIsLoading(true);
    try {
      // Since we don't have direct access to generatePreview, we'll implement a basic simulation
      // In a real implementation, you would call the actual PDF generation code here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate generation time
      setPdfPreviewUrl('pdf-preview-url');
      // Optionally set editor mode to preview
      setEditorMode('preview');
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Download PDF
  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Since we don't have direct access to downloadFormPdf, we'll implement a basic simulation
      // In a real implementation, you would call the actual PDF download code here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate generation time
      // Create a dummy download
      const dataStr = `data:application/pdf;charset=utf-8,${encodeURIComponent('Dummy PDF Content')}`;
      const link = document.createElement('a');
      link.href = dataStr;
      link.download = `${form.name}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render the zoom controls
  const renderZoomControls = () => (
    <div className="flex items-center space-x-2">
      <Button
        onClick={() => setZoomLevel(Math.max(0.1, (editorState.zoomLevel || 1) - 0.1))}
        variant="outline"
        size="sm"
        aria-label="Zoom out"
        disabled={isLoading || (editorState.zoomLevel || 1) <= 0.2}
      >
        -
      </Button>
      <span className="text-sm font-medium">
        {Math.round((editorState.zoomLevel || 1) * 100)}%
      </span>
      <Button
        onClick={() => setZoomLevel(Math.min(2, (editorState.zoomLevel || 1) + 0.1))}
        variant="outline"
        size="sm"
        aria-label="Zoom in"
        disabled={isLoading || (editorState.zoomLevel || 1) >= 2}
      >
        +
      </Button>
    </div>
  );

  // Render the page tabs
  const renderPageTabs = () => (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {form.pages.map((page) => (
        <div
          key={page.id}
          className={`px-3 py-1 rounded cursor-pointer transition-colors text-sm whitespace-nowrap flex items-center ${
            page.id === editorState.activePageId
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          onClick={() => setActivePageId(page.id)}
        >
          {page.name}
          {form.pages.length > 1 && (
            <button
              className="ml-2 text-gray-500 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                removePage(page.id);
              }}
              aria-label={`Remove ${page.name}`}
            >
              &times;
            </button>
          )}
        </div>
      ))}
      <Button 
        onClick={addPage} 
        variant="outline" 
        size="sm" 
        icon={FiPlus}
        aria-label="Add page"
      >
        Add Page
      </Button>
    </div>
  );

  return (
    <ToolPageLayout
      title="Advanced PDF Form Builder - Create Professional PDF Forms"
      description="Create custom PDF forms with precise control over layout and styling. Design forms with a wide range of field types, interactive elements, and complex layouts."
      keywords="pdf form builder, pdf creator, form designer, interactive pdf, professional forms, drag and drop"
      heading="Advanced PDF Form Builder"
      subheading="Design professional forms with drag-and-drop simplicity and pixel-perfect control"
    >
      <div className="flex flex-col h-screen bg-gray-50">
        {/* Top toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                className="border-b border-gray-300 bg-transparent text-xl font-semibold px-2 py-1 focus:outline-none focus:border-blue-500"
                value={form.name}
                onChange={handleTitleChange}
                placeholder="Form Title"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={undo}
                variant="outline"
                size="sm"
                icon={FiRotateCcw}
                aria-label="Undo"
                disabled={isLoading}
              >
                Undo
              </Button>
              <Button
                onClick={redo}
                variant="outline"
                size="sm"
                icon={FiRefreshCw}
                aria-label="Redo"
                disabled={isLoading}
              >
                Redo
              </Button>
              <Button
                onClick={toggleGrid}
                variant={editorState.showGrid ? "secondary" : "outline"}
                size="sm"
                icon={FiGrid}
                aria-label="Toggle Grid"
                disabled={isLoading}
              >
                Grid
              </Button>
              <Button
                onClick={toggleSnapToGrid}
                variant={editorState.snapToGrid ? "secondary" : "outline"}
                size="sm"
                aria-label="Toggle Snap to Grid"
                disabled={isLoading}
              >
                Snap
              </Button>
              {renderZoomControls()}
              <Button
                onClick={handlePreview}
                variant="outline"
                size="sm"
                icon={FiEye}
                disabled={isLoading || form.pages.length === 0}
              >
                Preview
              </Button>
              <Button
                onClick={handleDownload}
                variant="primary"
                size="sm"
                icon={FiDownload}
                disabled={isLoading || form.pages.length === 0}
              >
                {isLoading ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
          </div>
          {/* Page tabs */}
          <div className="mt-2 py-1">{renderPageTabs()}</div>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar - Element toolbox */}
          <ElementToolbar onAddElement={handleAddElement} />

          {/* Main canvas area */}
          <div className="flex-1 overflow-hidden">
            {activePage ? (
              <FormCanvas
                page={activePage}
                selectedElementIds={editorState.selectedElementIds}
                hoveredElementId={editorState.hoveredElementId}
                zoomLevel={editorState.zoomLevel || 1}
                showGrid={editorState.showGrid}
                gridSize={editorState.gridSize}
                snapToGrid={editorState.snapToGrid}
                onSelectElement={selectElement}
                onDeselectAll={deselectAllElements}
                onHoverElement={setHoveredElementId}
                onUpdateElement={handleUpdateElement}
                onAddElement={handleAddElement}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-xl font-medium text-gray-700">No pages available</h3>
                  <p className="text-gray-500 mb-4">Create a new page to get started</p>
                  <Button onClick={addPage} variant="primary" icon={FiPlus}>
                    Add Page
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar - Properties panel */}
          <PropertiesPanel
            activePage={activePage}
            selectedElements={selectedElements}
            onUpdateElement={handleUpdateElement}
            onRemoveElement={removeElement}
            onDuplicateElement={(elementId) => {
              // Since our hook doesn't have a direct duplicate function,
              // We'll implement a basic version here
              const element = selectedElements.find(el => el.id === elementId);
              if (element) {
                const newElement = addElement(element.type, element.x + 20, element.y + 20);
                // Copy over properties
                handleUpdateElement(newElement.id, {
                  width: element.width,
                  height: element.height,
                  properties: { ...element.properties }
                });
              }
            }}
            onUpdatePage={updatePage}
          />
        </div>
      </div>
    </ToolPageLayout>
  );
}

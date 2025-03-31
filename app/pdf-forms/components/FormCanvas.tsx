'use client';

import React, { useRef, useEffect, useState } from 'react';
import { FormPage, FormElement } from '../types/form-builder';
import ElementRenderer from './ElementRenderer';

interface FormCanvasProps {
  page: FormPage;
  selectedElementIds: string[];
  hoveredElementId: string | null;
  zoomLevel: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  onSelectElement: (id: string, appendToSelection?: boolean) => void;
  onDeselectAll: () => void;
  onHoverElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<FormElement>) => void;
  onAddElement: (type: string, x?: number, y?: number) => void;
}

const FormCanvas: React.FC<FormCanvasProps> = ({
  page,
  selectedElementIds,
  hoveredElementId,
  zoomLevel,
  showGrid,
  gridSize,
  snapToGrid,
  onSelectElement,
  onDeselectAll,
  onHoverElement,
  onUpdateElement,
  onAddElement,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedElementIds, setDraggedElementIds] = useState<string[]>([]);
  const [dragOffsets, setDragOffsets] = useState<Record<string, { x: number; y: number }>>({});

  // Handle click on the canvas background to deselect all elements
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onDeselectAll();
    }
  };

  // Handle element drag start
  const handleDragStart = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    
    // If the element is not in the selection, select it unless shift key is pressed
    if (!selectedElementIds.includes(elementId)) {
      onSelectElement(elementId, e.shiftKey);
    }
    
    // Set up dragging state
    setDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDraggedElementIds(selectedElementIds.includes(elementId) ? selectedElementIds : [elementId]);
    
    // Calculate offsets for all dragged elements
    const offsets: Record<string, { x: number; y: number }> = {};
    const draggedElements = page.elements.filter(el => 
      selectedElementIds.includes(elementId) ? selectedElementIds.includes(el.id) : el.id === elementId
    );
    
    draggedElements.forEach(el => {
      offsets[el.id] = { x: el.x, y: el.y };
    });
    
    setDragOffsets(offsets);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;
    
    // Calculate the delta movement
    const deltaX = (e.clientX - dragStart.x) / zoomLevel;
    const deltaY = (e.clientY - dragStart.y) / zoomLevel;
    
    // Update each dragged element's position
    draggedElementIds.forEach(id => {
      const element = page.elements.find(el => el.id === id);
      if (!element) return;
      
      const originalX = dragOffsets[id]?.x || element.x;
      const originalY = dragOffsets[id]?.y || element.y;
      
      let newX = originalX + deltaX;
      let newY = originalY + deltaY;
      
      // Apply grid snapping if enabled
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      // Ensure elements stay within the page boundaries
      newX = Math.max(0, Math.min(newX, page.width - element.width));
      newY = Math.max(0, Math.min(newY, page.height - element.height));
      
      onUpdateElement(id, { x: newX, y: newY });
    });
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      setDraggedElementIds([]);
      setDragOffsets({});
    }
  };

  // Add global event listeners for dragging
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, draggedElementIds, dragOffsets, dragStart, zoomLevel, snapToGrid, gridSize]);

  // Allow dropping elements onto the canvas
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('element-type');
    if (!elementType) return;
    
    // Get the position relative to the canvas, adjusted for zoom and scroll
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const x = ((e.clientX - canvasRect.left) / zoomLevel);
    const y = ((e.clientY - canvasRect.top) / zoomLevel);
    
    // Snap to grid if enabled
    const snappedX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
    const snappedY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;
    
    onAddElement(elementType, snappedX, snappedY);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Render grid pattern if enabled
  const renderGrid = () => {
    if (!showGrid) return null;
    
    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: `${gridSize * zoomLevel}px ${gridSize * zoomLevel}px`,
          backgroundImage: 'radial-gradient(circle, #0000001a 1px, transparent 1px)',
        }}
      />
    );
  };

  return (
    <div className="flex-1 relative overflow-auto bg-gray-100">
      <div
        className="relative"
        style={{
          width: `${page.width * zoomLevel}px`,
          height: `${page.height * zoomLevel}px`,
        }}
      >
        {/* Canvas background */}
        <div
          ref={canvasRef}
          className="absolute inset-0 bg-white shadow-md mx-auto my-8"
          style={{
            width: `${page.width * zoomLevel}px`,
            height: `${page.height * zoomLevel}px`,
            transformOrigin: '0 0',
            transform: `scale(${zoomLevel})`,
          }}
          onClick={handleCanvasClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Grid pattern */}
          {renderGrid()}
          
          {/* Render form elements */}
          {page.elements.map((element) => (
            <div
              key={element.id}
              onMouseDown={(e) => handleDragStart(e, element.id)}
              onMouseEnter={() => onHoverElement(element.id)}
              onMouseLeave={() => onHoverElement(null)}
            >
              <ElementRenderer
                element={element}
                isSelected={selectedElementIds.includes(element.id)}
                isHovered={hoveredElementId === element.id}
                onSelect={onSelectElement}
                onUpdate={(updates) => onUpdateElement(element.id, updates)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormCanvas; 
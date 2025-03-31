'use client';

import React from 'react';
import { FormElement } from '../types/form-builder';
import { elementPreviewMap } from './elements/ElementPreviews';

interface ElementRendererProps {
  element: FormElement;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string, appendToSelection?: boolean) => void;
  onUpdate?: (updates: Partial<FormElement>) => void;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  isSelected,
  isHovered,
  onSelect,
  onUpdate,
}) => {
  // Get the appropriate preview component for this element type
  const PreviewComponent = elementPreviewMap[element.type];

  // If we don't have a preview component for this type, render a fallback
  if (!PreviewComponent) {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${element.x}px`,
          top: `${element.y}px`,
          width: `${element.width}px`,
          height: `${element.height}px`,
          border: '1px dashed #ff0000',
          backgroundColor: '#ffeeee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          color: '#ff0000',
        }}
      >
        Unknown element type: {element.type}
      </div>
    );
  }

  // Render the appropriate preview component
  return (
    <PreviewComponent
      element={element}
      isSelected={isSelected}
      isHovered={isHovered}
      onSelect={onSelect}
      onUpdate={onUpdate}
    />
  );
};

export default ElementRenderer; 
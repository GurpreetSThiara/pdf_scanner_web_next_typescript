'use client';

import React from 'react';
import { ElementType, FormElement } from '../../types/form-builder';

interface ElementPreviewProps {
  element: FormElement;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string, appendToSelection?: boolean) => void;
  onUpdate?: (updates: Partial<FormElement>) => void;
}

// Base wrapper for all element previews with common functionality
export const ElementPreviewWrapper: React.FC<ElementPreviewProps & { children: React.ReactNode }> = ({
  element,
  isSelected,
  isHovered,
  onSelect,
  children
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id, e.shiftKey);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        border: isSelected ? '2px solid #3b82f6' : isHovered ? '2px solid #93c5fd' : '1px dashed #e5e7eb',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'white',
        boxShadow: isSelected ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
      }}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

// Text Field Preview
export const TextFieldPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      {element.properties.showLabel && (
        <div className="text-sm font-medium px-2 pt-2 pb-1 text-gray-700">
          {element.properties.label}
          {element.properties.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="px-2 pb-2">
        <input
          type="text"
          className="w-full p-2 border rounded text-sm"
          placeholder={element.properties.placeholder || "Text input"}
          disabled
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </ElementPreviewWrapper>
  );
};

// Email Field Preview
export const EmailFieldPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      {element.properties.showLabel && (
        <div className="text-sm font-medium px-2 pt-2 pb-1 text-gray-700">
          {element.properties.label}
          {element.properties.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="px-2 pb-2">
        <input
          type="email"
          className="w-full p-2 border rounded text-sm"
          placeholder={element.properties.placeholder || "Email input"}
          disabled
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </ElementPreviewWrapper>
  );
};

// Number Field Preview
export const NumberFieldPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      {element.properties.showLabel && (
        <div className="text-sm font-medium px-2 pt-2 pb-1 text-gray-700">
          {element.properties.label}
          {element.properties.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="px-2 pb-2">
        <input
          type="number"
          className="w-full p-2 border rounded text-sm"
          placeholder={element.properties.placeholder || "Number input"}
          disabled
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </ElementPreviewWrapper>
  );
};

// Textarea Preview
export const TextareaPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      {element.properties.showLabel && (
        <div className="text-sm font-medium px-2 pt-2 pb-1 text-gray-700">
          {element.properties.label}
          {element.properties.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="px-2 pb-2">
        <textarea
          className="w-full p-2 border rounded text-sm"
          placeholder={element.properties.placeholder || "Multi-line text input"}
          disabled
          onClick={(e) => e.stopPropagation()}
          rows={3}
        />
      </div>
    </ElementPreviewWrapper>
  );
};

// Checkbox Preview
export const CheckboxPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      <div className="flex items-center p-2">
        <input
          type="checkbox"
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          disabled
          onClick={(e) => e.stopPropagation()}
        />
        <label className="ml-2 text-sm text-gray-700">
          {element.properties.label}
          {element.properties.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
    </ElementPreviewWrapper>
  );
};

// Radio Button Group Preview
export const RadioGroupPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  const options = element.properties.options || ["Option 1", "Option 2", "Option 3"];
  
  return (
    <ElementPreviewWrapper {...props}>
      {element.properties.showLabel && (
        <div className="text-sm font-medium px-2 pt-2 pb-1 text-gray-700">
          {element.properties.label}
          {element.properties.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="px-2 pb-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center mb-1">
            <input
              type="radio"
              className="h-4 w-4 text-blue-600 border-gray-300"
              disabled
              onClick={(e) => e.stopPropagation()}
              name={`radio-group-${element.id}`}
            />
            <label className="ml-2 text-sm text-gray-700">{option}</label>
          </div>
        ))}
      </div>
    </ElementPreviewWrapper>
  );
};

// Dropdown Preview
export const DropdownPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      {element.properties.showLabel && (
        <div className="text-sm font-medium px-2 pt-2 pb-1 text-gray-700">
          {element.properties.label}
          {element.properties.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="px-2 pb-2">
        <select
          className="w-full p-2 border rounded text-sm bg-white"
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          <option>Select an option...</option>
          {(element.properties.options || ["Option 1", "Option 2", "Option 3"]).map((option, index) => (
            <option key={index}>{option}</option>
          ))}
        </select>
      </div>
    </ElementPreviewWrapper>
  );
};

// Date Field Preview
export const DateFieldPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      {element.properties.showLabel && (
        <div className="text-sm font-medium px-2 pt-2 pb-1 text-gray-700">
          {element.properties.label}
          {element.properties.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="px-2 pb-2">
        <input
          type="date"
          className="w-full p-2 border rounded text-sm"
          disabled
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </ElementPreviewWrapper>
  );
};

// Heading Preview
export const HeadingPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      <div className="p-2">
        <h3 style={{
          fontSize: `${element.properties.fontSize || 18}px`,
          fontWeight: element.properties.fontWeight || 'bold',
          color: element.properties.color || '#000000',
        }}>
          {element.properties.text || "Heading"}
        </h3>
      </div>
    </ElementPreviewWrapper>
  );
};

// Text Block Preview
export const TextBlockPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      <div className="p-2">
        <p style={{
          fontSize: `${element.properties.fontSize || 14}px`,
          fontWeight: element.properties.fontWeight || 'normal',
          color: element.properties.color || '#444444',
        }}>
          {element.properties.text || "This is a paragraph of text that can be used to provide instructions or information in your form."}
        </p>
      </div>
    </ElementPreviewWrapper>
  );
};

// Divider Preview
export const DividerPreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      <div className="flex items-center justify-center h-full">
        <hr style={{
          width: '100%',
          height: `${element.properties.thickness || 1}px`,
          backgroundColor: element.properties.color || '#cccccc',
          border: 'none',
        }} />
      </div>
    </ElementPreviewWrapper>
  );
};

// Image Preview
export const ImagePreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        {element.properties.src ? (
          <img 
            src={element.properties.src} 
            alt={element.properties.alt || "Image"} 
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="text-gray-500 text-sm">Image Placeholder</div>
        )}
      </div>
    </ElementPreviewWrapper>
  );
};

// Signature Field Preview
export const SignaturePreview: React.FC<ElementPreviewProps> = (props) => {
  const { element } = props;
  
  return (
    <ElementPreviewWrapper {...props}>
      {element.properties.showLabel && (
        <div className="text-sm font-medium px-2 pt-2 pb-1 text-gray-700">
          {element.properties.label || "Signature"}
          {element.properties.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="px-2 pb-2 h-24 border-2 border-dashed border-gray-300 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Click to sign</span>
      </div>
    </ElementPreviewWrapper>
  );
};

// Create a map of element type to preview component
export const elementPreviewMap: Record<ElementType, React.FC<ElementPreviewProps>> = {
  'text': TextFieldPreview,
  'email': EmailFieldPreview,
  'number': NumberFieldPreview,
  'textarea': TextareaPreview,
  'checkbox': CheckboxPreview,
  'radio': RadioGroupPreview,
  'dropdown': DropdownPreview,
  'date': DateFieldPreview,
  'heading': HeadingPreview,
  'text-block': TextBlockPreview,
  'divider': DividerPreview,
  'image': ImagePreview,
  'signature': SignaturePreview
}; 
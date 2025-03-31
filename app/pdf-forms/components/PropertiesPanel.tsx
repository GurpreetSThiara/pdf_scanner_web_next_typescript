'use client';

import React from 'react';
import { FiTrash2, FiCopy } from 'react-icons/fi';
import { ElementType, FormElement, FormPage } from '../types/form-builder';

interface PropertiesPanelProps {
  activePage: FormPage | null;
  selectedElements: FormElement[];
  onUpdateElement: (elementId: string, updates: Partial<FormElement>) => void;
  onRemoveElement: (elementId: string) => void;
  onDuplicateElement: (elementId: string) => void;
  onUpdatePage: (pageId: string, updates: Partial<FormPage>) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  activePage,
  selectedElements,
  onUpdateElement,
  onRemoveElement,
  onDuplicateElement,
  onUpdatePage,
}) => {
  if (!activePage) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4">
        <h3 className="font-medium mb-4">Properties</h3>
        <p className="text-gray-500 text-sm">No page selected</p>
      </div>
    );
  }

  // If no elements are selected, show page properties
  if (selectedElements.length === 0) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-medium mb-4">Page Properties</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={activePage.name}
              onChange={(e) => onUpdatePage(activePage.id, { name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="flex items-center">
              <input
                type="color"
                className="h-8 w-8 mr-2 border border-gray-300 rounded"
                value={activePage.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdatePage(activePage.id, { backgroundColor: e.target.value })}
              />
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={activePage.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdatePage(activePage.id, { backgroundColor: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={activePage.width}
                onChange={(e) => onUpdatePage(activePage.id, { width: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={activePage.height}
                onChange={(e) => onUpdatePage(activePage.id, { height: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If multiple elements are selected, show multi-selection properties
  if (selectedElements.length > 1) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-medium mb-4">Multiple Elements</h3>
        <p className="text-gray-500 text-sm mb-4">{selectedElements.length} elements selected</p>
        
        <div className="mb-4">
          <button
            className="w-full py-2 px-4 mb-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              selectedElements.forEach(element => onRemoveElement(element.id));
            }}
          >
            <FiTrash2 className="inline-block mr-2" />
            Delete All Selected
          </button>
        </div>
        
        <h4 className="font-medium text-sm border-t border-gray-200 pt-4 mb-2">Common Properties</h4>
        
        {/* Position/Size Adjustments */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Width (px)
            </label>
            <input
              type="number"
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value=""
              onChange={(e) => {
                const width = Number(e.target.value);
                selectedElements.forEach(element => 
                  onUpdateElement(element.id, { width })
                );
              }}
              placeholder="Mixed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Height (px)
            </label>
            <input
              type="number"
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value=""
              onChange={(e) => {
                const height = Number(e.target.value);
                selectedElements.forEach(element => 
                  onUpdateElement(element.id, { height })
                );
              }}
              placeholder="Mixed"
            />
          </div>
        </div>
      </div>
    );
  }

  // Single element selected, show its properties
  const element = selectedElements[0];

  // Get element-specific properties editor
  const PropertiesEditor = getPropertiesEditorForType(element.type);

  return (
    <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-medium mb-4">{getElementTypeName(element.type)} Properties</h3>
      
      <div className="mb-4 flex space-x-2">
        <button
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => onDuplicateElement(element.id)}
        >
          <FiCopy className="inline-block mr-2" />
          Duplicate
        </button>
        <button
          className="flex-1 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={() => onRemoveElement(element.id)}
        >
          <FiTrash2 className="inline-block mr-2" />
          Delete
        </button>
      </div>
      
      {/* Common properties for all elements */}
      <div className="mb-4 space-y-3">
        <h4 className="font-medium text-sm border-t border-gray-200 pt-4 mb-2">Position & Size</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              X Position (px)
            </label>
            <input
              type="number"
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={element.x}
              onChange={(e) => onUpdateElement(element.id, { x: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Y Position (px)
            </label>
            <input
              type="number"
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={element.y}
              onChange={(e) => onUpdateElement(element.id, { y: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Width (px)
            </label>
            <input
              type="number"
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={element.width}
              onChange={(e) => onUpdateElement(element.id, { width: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Height (px)
            </label>
            <input
              type="number"
              className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={element.height}
              onChange={(e) => onUpdateElement(element.id, { height: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
      
      {/* Element-specific properties */}
      {PropertiesEditor && (
        <PropertiesEditor 
          element={element} 
          onUpdate={(updates) => onUpdateElement(element.id, updates)} 
        />
      )}
    </div>
  );
};

// Helper function to convert element type to readable name
function getElementTypeName(type: ElementType): string {
  const names: Record<ElementType, string> = {
    'text': 'Text Field',
    'email': 'Email Field',
    'number': 'Number Field',
    'textarea': 'Text Area',
    'checkbox': 'Checkbox',
    'radio': 'Radio Group',
    'dropdown': 'Dropdown',
    'date': 'Date Field',
    'heading': 'Heading',
    'text-block': 'Text Block',
    'divider': 'Divider',
    'image': 'Image',
    'signature': 'Signature Field'
  };
  
  return names[type] || 'Element';
}

// Element-specific property editors
interface PropertyEditorProps {
  element: FormElement;
  onUpdate: (updates: Partial<FormElement>) => void;
}

// Text Field Properties
const TextFieldProperties: React.FC<PropertyEditorProps> = ({ element, onUpdate }) => {
  const updateProperties = (properties: Record<string, any>) => {
    onUpdate({ properties: { ...element.properties, ...properties } });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm border-t border-gray-200 pt-4 mb-2">Field Properties</h4>
      
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
        <input
          type="text"
          className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={element.properties.label || ''}
          onChange={(e) => updateProperties({ label: e.target.value })}
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="showLabel"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={element.properties.showLabel || false}
          onChange={(e) => updateProperties({ showLabel: e.target.checked })}
        />
        <label htmlFor="showLabel" className="ml-2 block text-sm text-gray-700">
          Show Label
        </label>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
        <input
          type="text"
          className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={element.properties.placeholder || ''}
          onChange={(e) => updateProperties({ placeholder: e.target.value })}
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="required"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={element.properties.required || false}
          onChange={(e) => updateProperties({ required: e.target.checked })}
        />
        <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
          Required Field
        </label>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Max Length</label>
        <input
          type="number"
          className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={element.properties.maxLength || ''}
          onChange={(e) => updateProperties({ maxLength: e.target.value ? Number(e.target.value) : undefined })}
        />
      </div>
    </div>
  );
};

// Number Field Properties
const NumberFieldProperties: React.FC<PropertyEditorProps> = ({ element, onUpdate }) => {
  const updateProperties = (properties: Record<string, any>) => {
    onUpdate({ properties: { ...element.properties, ...properties } });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm border-t border-gray-200 pt-4 mb-2">Field Properties</h4>
      
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
        <input
          type="text"
          className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={element.properties.label || ''}
          onChange={(e) => updateProperties({ label: e.target.value })}
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="showLabel"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={element.properties.showLabel || false}
          onChange={(e) => updateProperties({ showLabel: e.target.checked })}
        />
        <label htmlFor="showLabel" className="ml-2 block text-sm text-gray-700">
          Show Label
        </label>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
        <input
          type="text"
          className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={element.properties.placeholder || ''}
          onChange={(e) => updateProperties({ placeholder: e.target.value })}
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="required"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          checked={element.properties.required || false}
          onChange={(e) => updateProperties({ required: e.target.checked })}
        />
        <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
          Required Field
        </label>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Min Value</label>
          <input
            type="number"
            className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={element.properties.minValue || ''}
            onChange={(e) => updateProperties({ minValue: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Max Value</label>
          <input
            type="number"
            className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={element.properties.maxValue || ''}
            onChange={(e) => updateProperties({ maxValue: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>
    </div>
  );
};

// Heading Properties
const HeadingProperties: React.FC<PropertyEditorProps> = ({ element, onUpdate }) => {
  const updateProperties = (properties: Record<string, any>) => {
    onUpdate({ properties: { ...element.properties, ...properties } });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm border-t border-gray-200 pt-4 mb-2">Heading Properties</h4>
      
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Text</label>
        <input
          type="text"
          className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={element.properties.text || ''}
          onChange={(e) => updateProperties({ text: e.target.value })}
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Font Size (px)</label>
        <input
          type="number"
          className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={element.properties.fontSize || 18}
          onChange={(e) => updateProperties({ fontSize: Number(e.target.value) })}
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Font Weight</label>
        <select
          className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={element.properties.fontWeight || 'bold'}
          onChange={(e) => updateProperties({ fontWeight: e.target.value })}
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="light">Light</option>
        </select>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
        <div className="flex items-center">
          <input
            type="color"
            className="h-8 w-8 mr-2 border border-gray-300 rounded"
            value={element.properties.color || '#000000'}
            onChange={(e) => updateProperties({ color: e.target.value })}
          />
          <input
            type="text"
            className="flex-1 px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={element.properties.color || '#000000'}
            onChange={(e) => updateProperties({ color: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

// Map of element types to their property editors
function getPropertiesEditorForType(type: ElementType): React.FC<PropertyEditorProps> | null {
  const editors: Partial<Record<ElementType, React.FC<PropertyEditorProps>>> = {
    'text': TextFieldProperties,
    'email': TextFieldProperties,
    'number': NumberFieldProperties,
    'heading': HeadingProperties,
    // Add more editors for other element types as needed
  };
  
  return editors[type] || null;
}

export default PropertiesPanel; 
'use client';

import React from 'react';
import { FormElementType } from '../types';

// Import icons
import {
  FiType,
  FiHash,
  FiMail,
  FiCalendar,
  FiCheckSquare,
  FiCircle,
  FiList,
  FiAlignLeft,
  FiFileText,
  FiEdit,
  FiImage,
  FiMinus,
  FiBold,
  FiBox,
  FiPenTool,
  FiFile,
  FiGrid,
  FiCheckCircle,
  FiMenu,
  FiChevronsRight
} from 'react-icons/fi';

interface ElementToolbarProps {
  onAddElement: (type: FormElementType) => void;
}

// Define element categories for better organization
const elementCategories = [
  {
    name: 'Basic Inputs',
    elements: [
      { type: 'text', label: 'Text', icon: <FiType /> },
      { type: 'number', label: 'Number', icon: <FiHash /> },
      { type: 'email', label: 'Email', icon: <FiMail /> },
      { type: 'date', label: 'Date', icon: <FiCalendar /> },
      { type: 'checkbox', label: 'Checkbox', icon: <FiCheckSquare /> },
      { type: 'radio', label: 'Radio', icon: <FiCircle /> },
      { type: 'select', label: 'Dropdown', icon: <FiList /> },
      { type: 'textarea', label: 'Text Area', icon: <FiAlignLeft /> },
    ],
  },
  {
    name: 'Advanced Inputs',
    elements: [
      { type: 'signature', label: 'Signature', icon: <FiPenTool /> },
      { type: 'file', label: 'File Upload', icon: <FiFile /> },
      { type: 'table', label: 'Table', icon: <FiGrid /> },
    ],
  },
  {
    name: 'Layout Elements',
    elements: [
      { type: 'heading', label: 'Heading', icon: <FiBold /> },
      { type: 'subheading', label: 'Subheading', icon: <FiFileText /> },
      { type: 'paragraph', label: 'Paragraph', icon: <FiEdit /> },
      { type: 'divider', label: 'Divider', icon: <FiMinus /> },
      { type: 'spacer', label: 'Spacer', icon: <FiBox /> },
      { type: 'image', label: 'Image', icon: <FiImage /> },
    ],
  },
  {
    name: 'Lists',
    elements: [
      { type: 'bulletList', label: 'Bullet List', icon: <FiCheckCircle /> },
      { type: 'numberList', label: 'Number List', icon: <FiMenu /> },
    ],
  },
];

const ElementToolbar: React.FC<ElementToolbarProps> = ({ onAddElement }) => {
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>('Basic Inputs');

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const handleDragStart = (e: React.DragEvent, elementType: FormElementType) => {
    e.dataTransfer.setData('element-type', elementType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="bg-white border-r border-gray-200 w-64 h-full overflow-auto p-2">
      <h2 className="text-lg font-semibold mb-4 px-2">Elements</h2>
      
      {elementCategories.map((category) => (
        <div key={category.name} className="mb-2">
          <button
            className="flex items-center justify-between w-full p-2 text-left rounded hover:bg-gray-100"
            onClick={() => toggleCategory(category.name)}
          >
            <span className="font-medium">{category.name}</span>
            <FiChevronsRight
              className={`transition-transform duration-200 ${
                expandedCategory === category.name ? 'transform rotate-90' : ''
              }`}
            />
          </button>
          
          {expandedCategory === category.name && (
            <div className="grid grid-cols-2 gap-2 p-2">
              {category.elements.map((element) => (
                <button
                  key={element.type}
                  className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => onAddElement(element.type as FormElementType)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, element.type as FormElementType)}
                  title={element.label}
                >
                  <span className="text-xl mb-1">{element.icon}</span>
                  <span className="text-xs">{element.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ElementToolbar; 
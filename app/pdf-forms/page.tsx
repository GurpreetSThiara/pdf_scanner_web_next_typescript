"use client";

import { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import ToolPageLayout from '@/components/layout/ToolPageLayout';
import Button from '@/components/common/Button';
import { FiPlus, FiTrash, FiDownload, FiEye, FiSave } from 'react-icons/fi';

// Field types supported in our form builder
type FieldType = 'text' | 'checkbox' | 'dropdown';

// Design template interface
interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  titleFont: string;
  labelFont: string;
  colors: {
    title: [number, number, number]; // RGB values
    label: [number, number, number];
    border: [number, number, number];
    background?: [number, number, number];
  };
  spacing: {
    titleMargin: number;
    fieldSpacing: number;
    labelSpacing: number;
  };
}

// Available design templates
const designTemplates: DesignTemplate[] = [
  {
    id: 'modern',
    name: 'Modern Clean',
    description: 'A clean, modern design with ample spacing and blue accents',
    titleFont: 'Helvetica-Bold',
    labelFont: 'Helvetica',
    colors: {
      title: [0, 0.4, 0.8], // Blue
      label: [0.2, 0.2, 0.2], // Dark gray
      border: [0.8, 0.8, 0.8], // Light gray
    },
    spacing: {
      titleMargin: 40,
      fieldSpacing: 45,
      labelSpacing: 8,
    },
  },
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional business form layout with dark accents',
    titleFont: 'Times-Bold',
    labelFont: 'Times-Roman',
    colors: {
      title: [0.1, 0.1, 0.1], // Near black
      label: [0.2, 0.2, 0.2], // Dark gray
      border: [0.6, 0.6, 0.6], // Medium gray
    },
    spacing: {
      titleMargin: 35,
      fieldSpacing: 40,
      labelSpacing: 6,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal Light',
    description: 'Minimalist design with subtle gray tones',
    titleFont: 'Helvetica-Light',
    labelFont: 'Helvetica-Light',
    colors: {
      title: [0.3, 0.3, 0.3], // Medium gray
      label: [0.4, 0.4, 0.4], // Light gray
      border: [0.85, 0.85, 0.85], // Very light gray
    },
    spacing: {
      titleMargin: 30,
      fieldSpacing: 50,
      labelSpacing: 10,
    },
  },
  {
    id: 'bold',
    name: 'Bold & Dynamic',
    description: 'High contrast design with bold elements',
    titleFont: 'Helvetica-Bold',
    labelFont: 'Helvetica-Bold',
    colors: {
      title: [0.1, 0.1, 0.1], // Near black
      label: [0.2, 0.2, 0.2], // Dark gray
      border: [0, 0, 0], // Black
    },
    spacing: {
      titleMargin: 45,
      fieldSpacing: 55,
      labelSpacing: 12,
    },
  },
];

// Field configuration interface
interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: string[]; // For dropdown fields
  value: string | boolean | string[];
  placeholder?: string;
}

export default function PDFFormsPage() {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formTitle, setFormTitle] = useState<string>('My PDF Form');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');

  // Load saved form state from localStorage
  useEffect(() => {
    const savedForm = localStorage.getItem('pdf-form-builder');
    if (savedForm) {
      try {
        const { fields, title, template } = JSON.parse(savedForm);
        setFormFields(fields);
        setFormTitle(title);
        setSelectedTemplate(template);
      } catch (error) {
        console.error('Error loading saved form:', error);
      }
    }
  }, []);

  // Save form state to localStorage
  useEffect(() => {
    if (formFields.length > 0 || formTitle !== 'My PDF Form') {
      localStorage.setItem(
        'pdf-form-builder',
        JSON.stringify({
          fields: formFields,
          title: formTitle,
          template: selectedTemplate,
        })
      );
    }
  }, [formFields, formTitle, selectedTemplate]);

  // Add a new field to the form
  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type,
      label: type === 'text' ? 'Text Field' : type === 'checkbox' ? 'Checkbox Option' : 'Dropdown Field',
      required: false,
      value: type === 'checkbox' ? false : type === 'dropdown' ? [] : '',
      options: type === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      placeholder: type === 'text' ? 'Enter text here...' : undefined,
    };

    setFormFields([...formFields, newField]);
  };

  // Remove a field from the form
  const removeField = (id: string) => {
    setFormFields(formFields.filter((field) => field.id !== id));
  };

  // Update a field's properties
  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id === id) {
          return { ...field, ...updates };
        }
        return field;
      })
    );
  };

  // Add an option to a dropdown field
  const addOption = (fieldId: string) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id === fieldId && field.type === 'dropdown') {
          const options = field.options || [];
          return {
            ...field,
            options: [...options, `Option ${options.length + 1}`],
          };
        }
        return field;
      })
    );
  };

  // Remove an option from a dropdown field
  const removeOption = (fieldId: string, optionIndex: number) => {
    setFormFields(
      formFields.map((field) => {
        if (field.id === fieldId && field.type === 'dropdown') {
          const options = [...(field.options || [])];
          options.splice(optionIndex, 1);
          return {
            ...field,
            options,
          };
        }
        return field;
      })
    );
  };

  // Generate PDF with form fields
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      
      // Get selected template
      const template = designTemplates.find(t => t.id === selectedTemplate) || designTemplates[0];
      
      // Embed fonts based on template
      const titleFont = await pdfDoc.embedFont(StandardFonts[template.titleFont as keyof typeof StandardFonts]);
      const labelFont = await pdfDoc.embedFont(StandardFonts[template.labelFont as keyof typeof StandardFonts]);

      // Draw the form title
      page.drawText(formTitle, {
        x: 50,
        y: 750,
        size: 24,
        font: titleFont,
        color: rgb(...template.colors.title),
      });

      // Draw form fields
      let yPosition = 750 - template.spacing.titleMargin;
      const xLabelPosition = 50;
      const xFieldPosition = 200;
      const fieldHeight = 30;

      formFields.forEach((field) => {
        // Draw field label
        page.drawText(`${field.label}${field.required ? ' *' : ''}:`, {
          x: xLabelPosition,
          y: yPosition,
          size: 11,
          font: labelFont,
          color: rgb(...template.colors.label),
        });

        // Create interactive form fields
        if (field.type === 'text') {
          const textField = pdfDoc.getForm().createTextField(`${field.id}`);
          textField.setText(field.value as string);
          textField.addToPage(page, {
            x: xFieldPosition,
            y: yPosition - 15,
            width: 350,
            height: fieldHeight,
            borderWidth: 1,
            borderColor: rgb(...template.colors.border),
          });
        } else if (field.type === 'checkbox') {
          const checkBox = pdfDoc.getForm().createCheckBox(`${field.id}`);
          if (field.value === true) {
            checkBox.check();
          }
          checkBox.addToPage(page, {
            x: xFieldPosition,
            y: yPosition - 10,
            width: 20,
            height: 20,
            borderWidth: 1,
            borderColor: rgb(...template.colors.border),
          });
        } else if (field.type === 'dropdown') {
          const dropdown = pdfDoc.getForm().createDropdown(`${field.id}`);
          dropdown.addOptions(field.options || []);
          dropdown.addToPage(page, {
            x: xFieldPosition,
            y: yPosition - 15,
            width: 350,
            height: fieldHeight,
            borderWidth: 1,
            borderColor: rgb(...template.colors.border),
          });
          if (field.value && Array.isArray(field.value) && field.value.length > 0) {
            dropdown.select(field.value[0]);
          }
        }

        yPosition -= template.spacing.fieldSpacing;
      });

      // Finalize the PDF
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const dataUrl = URL.createObjectURL(pdfBlob);
      setPdfDataUrl(dataUrl);

      if (isPreviewMode) {
        window.open(dataUrl, '_blank');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle preview button click
  const handlePreview = async () => {
    setIsPreviewMode(true);
    await generatePDF();
    setIsPreviewMode(false);
  };

  // Handle download button click
  const handleDownload = async () => {
    if (!pdfDataUrl) {
      await generatePDF();
    }
    
    if (pdfDataUrl) {
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = `${formTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Render field editor based on type
  const renderFieldEditor = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={field.label}
                  onChange={(e) => updateField(field.id, { label: e.target.value })}
                  aria-label="Field Label"
                  title="Field Label"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={field.placeholder || ''}
                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  aria-label="Placeholder Text"
                  title="Placeholder Text"
                />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded mr-2"
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                id={`required-${field.id}`}
              />
              <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
                Required field
              </label>
            </div>
            <div className="flex justify-end mt-2">
              <Button 
                onClick={() => removeField(field.id)} 
                variant="danger" 
                size="sm" 
                icon={FiTrash}
              >
                Remove
              </Button>
            </div>
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Checkbox Label</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                aria-label="Checkbox Label"
                title="Checkbox Label"
              />
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded mr-2"
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                id={`required-${field.id}`}
              />
              <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
                Required field
              </label>
            </div>
            <div className="flex justify-end mt-2">
              <Button 
                onClick={() => removeField(field.id)} 
                variant="danger" 
                size="sm" 
                icon={FiTrash}
              >
                Remove
              </Button>
            </div>
          </div>
        );
      
      case 'dropdown':
        return (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Dropdown Label</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={field.label}
                onChange={(e) => updateField(field.id, { label: e.target.value })}
                aria-label="Dropdown Label"
                title="Dropdown Label"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
              <ul className="space-y-2">
                {field.options?.map((option, index) => (
                  <li key={index} className="flex items-center">
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[index] = e.target.value;
                        updateField(field.id, { options: newOptions });
                      }}
                      aria-label={`Option ${index + 1}`}
                      title={`Option ${index + 1}`}
                    />
                    <Button
                      onClick={() => removeOption(field.id, index)}
                      variant="danger"
                      size="sm"
                      icon={FiTrash}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => addOption(field.id)}
                variant="secondary"
                size="sm"
                icon={FiPlus}
                className="mt-2"
              >
                Add Option
              </Button>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-600 rounded mr-2"
                checked={field.required}
                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                id={`required-${field.id}`}
              />
              <label htmlFor={`required-${field.id}`} className="text-sm text-gray-700">
                Required field
              </label>
            </div>
            <div className="flex justify-end mt-2">
              <Button 
                onClick={() => removeField(field.id)} 
                variant="danger" 
                size="sm" 
                icon={FiTrash}
              >
                Remove
              </Button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Render design template selector
  const renderTemplateSelector = () => {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Form Design</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {designTemplates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedTemplate === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <h3 className="font-medium mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600">{template.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render form preview with selected template styles
  const renderFormPreview = () => {
    const template = designTemplates.find(t => t.id === selectedTemplate) || designTemplates[0];
    const titleColor = `rgb(${template.colors.title.map(c => Math.round(c * 255)).join(', ')})`;
    const labelColor = `rgb(${template.colors.label.map(c => Math.round(c * 255)).join(', ')})`;
    const borderColor = `rgb(${template.colors.border.map(c => Math.round(c * 255)).join(', ')})`;

    return (
      <div className={`p-6 border rounded-lg bg-gray-50 mb-8`} style={{ borderColor }}>
        <h2 
          className="text-2xl font-semibold mb-6" 
          style={{ 
            color: titleColor,
            fontFamily: template.titleFont === 'Times-Bold' ? 'serif' : 'sans-serif',
            marginBottom: template.spacing.titleMargin + 'px'
          }}
        >
          {formTitle}
        </h2>
        
        {formFields.length === 0 ? (
          <p className="text-gray-500 italic">No fields added yet. Use the field controls below to add form fields.</p>
        ) : (
          <div className="space-y-6">
            {formFields.map((field) => (
              <div 
                key={field.id} 
                className="mb-4"
                style={{ marginBottom: template.spacing.fieldSpacing + 'px' }}
              >
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ 
                    color: labelColor,
                    fontFamily: template.labelFont === 'Times-Roman' ? 'serif' : 'sans-serif',
                    marginBottom: template.spacing.labelSpacing + 'px'
                  }}
                >
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    style={{ borderColor }}
                    placeholder={field.placeholder}
                    value={field.value as string}
                    onChange={(e) => updateField(field.id, { value: e.target.value })}
                  />
                )}
                
                {field.type === 'checkbox' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded"
                      style={{ borderColor }}
                      checked={field.value as boolean}
                      onChange={(e) => updateField(field.id, { value: e.target.checked })}
                      id={`preview-${field.id}`}
                    />
                    <label 
                      htmlFor={`preview-${field.id}`} 
                      className="ml-2"
                      style={{ color: labelColor }}
                    >
                      {field.label}
                    </label>
                  </div>
                )}
                
                {field.type === 'dropdown' && (
                  <select
                    className="w-full p-2 border rounded"
                    style={{ borderColor }}
                    value={Array.isArray(field.value) && field.value.length > 0 ? field.value[0] : ''}
                    onChange={(e) => updateField(field.id, { value: [e.target.value] })}
                    aria-label={field.label}
                    title={field.label}
                  >
                    <option value="">-- Select an option --</option>
                    {field.options?.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ToolPageLayout
      title="PDF Form Builder - Create Fillable PDF Forms Online"
      description="Create custom PDF forms with fillable fields easily. Generate professional PDFs with text fields, checkboxes, and dropdown menus."
      keywords="pdf form builder, fillable pdf, create pdf form, interactive pdf, form creator"
      heading="PDF Form Builder"
      subheading="Create custom PDF forms with fillable fields that can be shared and completed digitally."
    >
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Form Settings</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Enter form title"
          />
        </div>
      </div>

      {renderTemplateSelector()}

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Form Preview</h2>
        {renderFormPreview()}
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-medium mb-4">Form Fields</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={() => addField('text')} icon={FiPlus}>Add Text Field</Button>
          <Button onClick={() => addField('checkbox')} icon={FiPlus}>Add Checkbox</Button>
          <Button onClick={() => addField('dropdown')} icon={FiPlus}>Add Dropdown</Button>
        </div>

        {formFields.map((field) => (
          <div key={field.id}>{renderFieldEditor(field)}</div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <Button
          onClick={handlePreview}
          icon={FiEye}
          disabled={formFields.length === 0 || isGenerating}
          variant="outline"
          size="lg"
        >
          {isGenerating && isPreviewMode ? 'Generating Preview...' : 'Preview PDF'}
        </Button>
        
        <Button
          onClick={handleDownload}
          icon={FiDownload}
          disabled={formFields.length === 0 || isGenerating}
          variant="primary"
          size="lg"
        >
          {isGenerating && !isPreviewMode ? 'Generating PDF...' : 'Download PDF'}
        </Button>
        
        <Button
          onClick={() => localStorage.setItem('pdf-form-builder', JSON.stringify({
            fields: formFields,
            title: formTitle,
            template: selectedTemplate,
          }))}
          icon={FiSave}
          variant="secondary"
          size="lg"
        >
          Save Form
        </Button>
      </div>
    </ToolPageLayout>
  );
}

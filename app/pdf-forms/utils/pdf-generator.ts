import { jsPDF } from 'jspdf';
import { Form, FormElement } from '../types/form-builder';

// Function to generate PDF from form data
export async function generatePDF(form: Form): Promise<string> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt', // Points - standard PDF unit
    format: 'a4' // Default to A4 size
  });

  // Process each page
  form.pages.forEach((page, pageIndex) => {
    // Add a new page for all pages except the first one
    if (pageIndex > 0) {
      doc.addPage();
    }
    
    // Set background color if specified
    if (page.backgroundColor) {
      doc.setFillColor(page.backgroundColor);
      doc.rect(0, 0, page.width, page.height, 'F');
    }
    
    // Render each element on the page
    page.elements.forEach((element) => {
      renderElement(doc, element);
    });
  });

  // Return the PDF as a data URL
  return doc.output('datauristring');
}

// Function to render a specific element on the PDF
function renderElement(doc: jsPDF, element: FormElement): void {
  // Set position - convert from pixels to points if needed
  const x = element.x;
  const y = element.y;
  
  switch (element.type) {
    case 'text-field':
    case 'email-field':
    case 'number-field':
      renderTextField(doc, element, x, y);
      break;
    
    case 'text-area':
      renderTextArea(doc, element, x, y);
      break;
    
    case 'checkbox':
      renderCheckbox(doc, element, x, y);
      break;
    
    case 'radio-button':
      renderRadioButton(doc, element, x, y);
      break;
    
    case 'dropdown':
      renderDropdown(doc, element, x, y);
      break;
    
    case 'date-field':
      renderDateField(doc, element, x, y);
      break;
    
    case 'heading':
      renderHeading(doc, element, x, y);
      break;
    
    case 'text-block':
      renderTextBlock(doc, element, x, y);
      break;
    
    case 'divider':
      renderDivider(doc, element, x, y);
      break;
    
    case 'image':
      renderImage(doc, element, x, y);
      break;
    
    case 'signature-field':
      renderSignatureField(doc, element, x, y);
      break;
    
    default:
      // Unknown element type - do nothing
      break;
  }
}

// Helper functions for rendering specific element types

function renderTextField(doc: jsPDF, element: FormElement, x: number, y: number): void {
  // Draw label if present
  if (element.label) {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(element.label, x, y - 5);
  }
  
  // Draw input field border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(x, y, element.width, element.height);
  
  // Draw placeholder or value if present
  if (element.placeholder || element.value) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(element.value?.toString() || element.placeholder || '', x + 5, y + (element.height / 2) + 3);
  }
}

function renderTextArea(doc: jsPDF, element: FormElement, x: number, y: number): void {
  // Draw label if present
  if (element.label) {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(element.label, x, y - 5);
  }
  
  // Draw textarea border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(x, y, element.width, element.height);
  
  // Draw placeholder or value if present
  if (element.placeholder || element.value) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const text = element.value?.toString() || element.placeholder || '';
    doc.text(text, x + 5, y + 15);
  }
}

function renderCheckbox(doc: jsPDF, element: FormElement, x: number, y: number): void {
  // Draw label
  if (element.label) {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(element.label, x + 20, y + 10);
  }
  
  // Draw checkbox
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.rect(x, y, 12, 12);
  
  // Draw check mark if checked
  if (element.checked) {
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(1);
    doc.line(x + 2, y + 6, x + 5, y + 9);
    doc.line(x + 5, y + 9, x + 10, y + 3);
  }
}

function renderRadioButton(doc: jsPDF, element: FormElement, x: number, y: number): void {
  // Draw label
  if (element.label) {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(element.label, x, y - 5);
  }
  
  // Draw each option
  const options = element.options || [];
  options.forEach((option, index) => {
    const optionY = y + (index * 20);
    
    // Draw radio circle
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.circle(x + 6, optionY + 6, 6);
    
    // Draw filled circle if selected
    if (element.value === option.value) {
      doc.setFillColor(50, 50, 50);
      doc.circle(x + 6, optionY + 6, 3, 'F');
    }
    
    // Draw option text
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(option.label, x + 20, optionY + 9);
  });
}

function renderDropdown(doc: jsPDF, element: FormElement, x: number, y: number): void {
  // Draw label if present
  if (element.label) {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(element.label, x, y - 5);
  }
  
  // Draw dropdown border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(x, y, element.width, element.height);
  
  // Draw selected value or placeholder
  let displayText = element.placeholder || 'Select an option';
  if (element.value && element.options) {
    const selectedOption = element.options.find(opt => opt.value === element.value);
    if (selectedOption) {
      displayText = selectedOption.label;
    }
  }
  
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(displayText, x + 5, y + (element.height / 2) + 3);
  
  // Draw dropdown arrow
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  const arrowX = x + element.width - 15;
  const arrowY = y + (element.height / 2);
  doc.line(arrowX, arrowY - 3, arrowX + 6, arrowY - 3);
  doc.line(arrowX, arrowY + 3, arrowX + 6, arrowY + 3);
  doc.line(arrowX, arrowY - 3, arrowX + 3, arrowY);
  doc.line(arrowX + 6, arrowY - 3, arrowX + 3, arrowY);
  doc.line(arrowX, arrowY + 3, arrowX + 3, arrowY);
  doc.line(arrowX + 6, arrowY + 3, arrowX + 3, arrowY);
}

function renderDateField(doc: jsPDF, element: FormElement, x: number, y: number): void {
  // Draw label if present
  if (element.label) {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(element.label, x, y - 5);
  }
  
  // Draw date field border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(x, y, element.width, element.height);
  
  // Draw date value or placeholder
  const displayText = element.value || element.placeholder || 'MM/DD/YYYY';
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(displayText.toString(), x + 5, y + (element.height / 2) + 3);
  
  // Draw calendar icon
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  const iconX = x + element.width - 20;
  const iconY = y + (element.height / 2) - 6;
  doc.rect(iconX, iconY, 12, 12);
  doc.line(iconX + 3, iconY, iconX + 3, iconY + 2);
  doc.line(iconX + 6, iconY, iconX + 6, iconY + 2);
  doc.line(iconX + 9, iconY, iconX + 9, iconY + 2);
  doc.line(iconX, iconY + 4, iconX + 12, iconY + 4);
}

function renderHeading(doc: jsPDF, element: FormElement, x: number, y: number): void {
  if (!element.text) return;
  
  // Set font size based on heading level
  let fontSize = 16; // default
  switch (element.headingLevel) {
    case 'h1': fontSize = 24; break;
    case 'h2': fontSize = 20; break;
    case 'h3': fontSize = 16; break;
    case 'h4': fontSize = 14; break;
    case 'h5': fontSize = 12; break;
    case 'h6': fontSize = 10; break;
  }
  
  doc.setFontSize(fontSize);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text(element.text, x, y + (fontSize / 2));
  doc.setFont(undefined, 'normal');
}

function renderTextBlock(doc: jsPDF, element: FormElement, x: number, y: number): void {
  if (!element.text) return;
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Split text into lines to fit within width
  const textLines = doc.splitTextToSize(element.text, element.width);
  doc.text(textLines, x, y + 10);
}

function renderDivider(doc: jsPDF, element: FormElement, x: number, y: number): void {
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(element.thickness || 1);
  
  if (element.dividerStyle === 'dashed') {
    // Draw dashed line
    const dashLength = 5;
    const gapLength = 3;
    let currentX = x;
    
    while (currentX < x + element.width) {
      const endX = Math.min(currentX + dashLength, x + element.width);
      doc.line(currentX, y, endX, y);
      currentX = endX + gapLength;
    }
  } else if (element.dividerStyle === 'dotted') {
    // Draw dotted line
    const dotGap = 4;
    let currentX = x;
    
    while (currentX <= x + element.width) {
      doc.circle(currentX, y, 0.5, 'F');
      currentX += dotGap;
    }
  } else {
    // Draw solid line
    doc.line(x, y, x + element.width, y);
  }
}

function renderImage(doc: jsPDF, element: FormElement, x: number, y: number): void {
  if (!element.imageUrl) return;
  
  try {
    // For simplicity, we're assuming the image is already in base64 format
    // In a real app, you might need to fetch and convert the image
    const imageFormat = element.imageUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    const imageData = element.imageUrl.split(',')[1];
    
    doc.addImage(
      imageData,
      imageFormat,
      x,
      y,
      element.width,
      element.height
    );
  } catch (error) {
    console.error('Error rendering image in PDF:', error);
  }
}

function renderSignatureField(doc: jsPDF, element: FormElement, x: number, y: number): void {
  // Draw label if present
  if (element.label) {
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(element.label, x, y - 5);
  }
  
  // Draw signature box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(x, y, element.width, element.height);
  
  // Draw signature line
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.5);
  doc.line(x + 10, y + element.height - 10, x + element.width - 10, y + element.height - 10);
  
  // If there's a signature image, render it
  if (element.signatureData) {
    try {
      doc.addImage(
        element.signatureData,
        'PNG',
        x + 5,
        y + 5,
        element.width - 10,
        element.height - 20
      );
    } catch (error) {
      console.error('Error rendering signature in PDF:', error);
    }
  } else {
    // Draw "Sign here" text
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Sign here', x + 10, y + element.height - 15);
  }
}

// Export a function to download the PDF
export function downloadPDF(dataUrl: string, fileName: string = 'form.pdf'): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

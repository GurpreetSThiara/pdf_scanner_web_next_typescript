export type FormElementType =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'checkbox'
  | 'radio'
  | 'select'
  | 'textarea'
  | 'heading'
  | 'subheading'
  | 'paragraph'
  | 'image'
  | 'divider'
  | 'spacer'
  | 'signature'
  | 'file'
  | 'table'
  | 'bulletList'
  | 'numberList';

export interface Validation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface FormElementStyles {
  width: number | string;
  height: number | string;
  x: number;
  y: number;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | number;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  color?: string;
  backgroundColor?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: number;
  padding?: number | string;
  opacity?: number;
  zIndex?: number;
  rotation?: number;
}

export interface FormElement {
  id: string;
  type: FormElementType;
  label?: string;
  placeholder?: string;
  description?: string;
  value: any;
  options?: string[];
  validation?: Validation;
  styles: FormElementStyles;
  properties?: Record<string, any>;
  isLocked?: boolean;
  isHidden?: boolean;
  isRequired?: boolean;
  parentId?: string;  // For grouping elements
  childIds?: string[]; // For containers like tables
}

export interface FormPage {
  id: string;
  name: string;
  elements: FormElement[];
  width: number;
  height: number;
  backgroundColor: string;
  backgroundImage?: string;
  margins?: { top: number; right: number; bottom: number; left: number };
}

export interface PdfForm {
  id: string;
  name: string;
  description?: string;
  pages: FormPage[];
  createdAt: Date;
  updatedAt: Date;
  isTemplate?: boolean;
  metadata?: Record<string, any>;
  settings?: {
    pdfTitle?: string;
    pdfAuthor?: string;
    pdfSubject?: string;
    pdfKeywords?: string[];
    formSubmissionUrl?: string;
    autoSave?: boolean;
    allowMultipleSubmissions?: boolean;
    showPageNumbers?: boolean;
    pageNumberFormat?: string;
    protectionPassword?: string;
    protectionFlags?: string[];
  };
}

export interface HistoryState {
  past: PdfForm[];
  present: PdfForm;
  future: PdfForm[];
}

export interface DraggedElement {
  type: FormElementType;
  initialPosition: { x: number; y: number };
}

export type EditorMode = 'design' | 'preview' | 'data';

export interface EditorState {
  mode: EditorMode;
  activePageId: string;
  selectedElementIds: string[];
  hoveredElementId: string | null;
  zoomLevel: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  clipboard: FormElement[] | null;
} 
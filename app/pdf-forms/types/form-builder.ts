// Element types supported in the form builder
export type ElementType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'dropdown'
  | 'date'
  | 'heading'
  | 'text-block'
  | 'divider'
  | 'image'
  | 'signature';

// Editor modes
export type EditorMode = 'design' | 'preview';

// Form element interface
export interface FormElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  properties: {
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    required?: boolean;
    value?: string | number | boolean | string[] | null;
    options?: string[];
    text?: string;
    fontSize?: number;
    fontWeight?: 'normal' | 'bold' | 'light';
    color?: string;
    backgroundColor?: string;
    thickness?: number;
    src?: string;
    alt?: string;
    maxLength?: number;
    minValue?: number;
    maxValue?: number;
    pattern?: string;
    readonly?: boolean;
  };
  // Interactive form field properties for PDF generation
  formField?: {
    name: string;
    fieldType: string;
    defaultValue?: string | boolean;
  };
}

// Form page interface
export interface FormPage {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: FormElement[];
  backgroundColor?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Form interface
export interface Form {
  id: string;
  name: string;
  description?: string;
  pages: FormPage[];
  metadata: {
    author?: string;
    createdAt: string;
    updatedAt: string;
    version: string;
    keywords?: string[];
  };
  settings: {
    showPageNumbers?: boolean;
    pageNumberFormat?: 'Page X of Y' | 'X/Y' | 'X';
    fontFamily?: string;
    enableProtection?: boolean;
    protectionOptions?: {
      printing?: boolean;
      modifying?: boolean;
      copying?: boolean;
      annotating?: boolean;
      fillingForms?: boolean;
      contentAccessibility?: boolean;
      documentAssembly?: boolean;
    };
  };
}

// Editor state interface
export interface EditorState {
  activePageId: string;
  selectedElementIds: string[];
  hoveredElementId: string | null;
  editorMode: EditorMode;
  zoomLevel: number;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  history: {
    past: Form[];
    future: Form[];
  };
}

// Form builder hook interfaces
export interface FormBuilderAction {
  type: string;
  payload?: any;
}

export interface FormBuilderHook {
  form: Form;
  editorState: EditorState;
  
  // Form actions
  initForm: (form?: Form) => void;
  addPage: () => void;
  removePage: (pageId: string) => void;
  updatePage: (pageId: string, updates: Partial<FormPage>) => void;
  
  // Element actions
  addElement: (pageId: string, type: ElementType, x?: number, y?: number) => void;
  removeElement: (pageId: string, elementId: string) => void;
  updateElement: (pageId: string, elementId: string, updates: Partial<FormElement>) => void;
  duplicateElement: (pageId: string, elementId: string) => void;
  
  // Selection actions
  setActivePageId: (pageId: string) => void;
  selectElement: (elementId: string, appendToSelection?: boolean) => void;
  deselectAllElements: () => void;
  setHoveredElementId: (elementId: string | null) => void;
  
  // Editor actions
  setEditorMode: (mode: EditorMode) => void;
  setZoomLevel: (level: number) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  saveSnapshot: () => void;
} 
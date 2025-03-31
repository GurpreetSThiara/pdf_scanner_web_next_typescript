import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Form, 
  FormPage, 
  FormElement, 
  EditorState, 
  ElementType, 
  EditorMode,
  FormBuilderHook
} from '../types/form-builder';
import { generatePDF, downloadPDF } from '../utils/pdf-generator';

// Default values for new form elements
const DEFAULT_ELEMENT_WIDTH = 200;
const DEFAULT_ELEMENT_HEIGHT = 40;
const DEFAULT_FORM_WIDTH = 595; // A4 width in points
const DEFAULT_FORM_HEIGHT = 842; // A4 height in points

// Create a new form with default settings
const createNewForm = (): Form => ({
  id: uuidv4(),
  name: 'Untitled Form',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pages: [createNewPage()],
  settings: {
    submissionEmail: '',
    allowAnonymous: true,
    showProgressBar: true,
    theme: 'light',
  }
});

// Create a new page with default settings
const createNewPage = (): FormPage => ({
  id: uuidv4(),
  name: 'Page 1',
  width: DEFAULT_FORM_WIDTH,
  height: DEFAULT_FORM_HEIGHT,
  elements: [],
  backgroundColor: '#ffffff',
});

// Custom hook for form builder functionality
export const useFormBuilder = (): FormBuilderHook => {
  // Main form state
  const [form, setForm] = useState<Form>(createNewForm());
  
  // Editor state
  const [editorState, setEditorState] = useState<EditorState>({
    activePageId: form.pages[0].id,
    selectedElementIds: [],
    hoveredElementId: null,
    editorMode: 'design',
    history: [],
    historyIndex: -1,
    zoom: 1,
    showGrid: true,
    snapToGrid: true,
    gridSize: 10,
  });

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // PDF preview state
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  // Get the active page
  const getActivePage = useCallback((): FormPage => {
    return form.pages.find(page => page.id === editorState.activePageId) || form.pages[0];
  }, [form.pages, editorState.activePageId]);

  // Get selected elements
  const getSelectedElements = useCallback((): FormElement[] => {
    const activePage = getActivePage();
    return activePage.elements.filter(element => 
      editorState.selectedElementIds.includes(element.id)
    );
  }, [getActivePage, editorState.selectedElementIds]);

  // Add a new element to the active page
  const addElement = useCallback((type: ElementType, x: number = 50, y: number = 50): FormElement => {
    const newElement: FormElement = {
      id: uuidv4(),
      type,
      x,
      y,
      width: DEFAULT_ELEMENT_WIDTH,
      height: DEFAULT_ELEMENT_HEIGHT,
      label: `New ${type.replace('-', ' ')}`,
      required: false,
      disabled: false,
    };

    // Add specific properties based on element type
    switch (type) {
      case 'text-field':
      case 'email-field':
      case 'number-field':
      case 'date-field':
        newElement.placeholder = `Enter ${type.replace('-field', '')}...`;
        break;
      
      case 'text-area':
        newElement.placeholder = 'Enter text...';
        newElement.height = 100;
        break;
      
      case 'checkbox':
        newElement.checked = false;
        break;
      
      case 'radio-button':
        newElement.options = [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ];
        newElement.value = 'option1';
        newElement.height = 80;
        break;
      
      case 'dropdown':
        newElement.options = [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' },
        ];
        newElement.placeholder = 'Select an option';
        break;
      
      case 'heading':
        newElement.text = 'Heading';
        newElement.headingLevel = 'h2';
        newElement.height = 30;
        break;
      
      case 'text-block':
        newElement.text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nunc.';
        newElement.height = 80;
        break;
      
      case 'divider':
        newElement.width = 400;
        newElement.height = 1;
        newElement.thickness = 1;
        newElement.dividerStyle = 'solid';
        break;
      
      case 'image':
        newElement.imageUrl = '';
        newElement.width = 200;
        newElement.height = 150;
        newElement.altText = 'Image description';
        break;
      
      case 'signature-field':
        newElement.width = 300;
        newElement.height = 100;
        break;
    }

    // Update the form with the new element
    setForm(prevForm => {
      const updatedPages = prevForm.pages.map(page => {
        if (page.id === editorState.activePageId) {
          return {
            ...page,
            elements: [...page.elements, newElement]
          };
        }
        return page;
      });

      return {
        ...prevForm,
        pages: updatedPages,
        updatedAt: new Date().toISOString()
      };
    });

    // Select the new element
    setEditorState(prev => ({
      ...prev,
      selectedElementIds: [newElement.id]
    }));

    // Save a history snapshot
    saveHistorySnapshot();

    return newElement;
  }, [editorState.activePageId]);

  // Update an element's properties
  const updateElement = useCallback((elementId: string, updates: Record<string, unknown>): void => {
    setForm(prevForm => {
      const updatedPages = prevForm.pages.map(page => {
        const elementIndex = page.elements.findIndex(el => el.id === elementId);
        
        if (elementIndex !== -1) {
          const updatedElements = [...page.elements];
          updatedElements[elementIndex] = {
            ...updatedElements[elementIndex],
            ...updates
          };
          
          return {
            ...page,
            elements: updatedElements
          };
        }
        
        return page;
      });

      return {
        ...prevForm,
        pages: updatedPages,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // Update multiple elements at once
  const updateElements = useCallback((elementIds: string[], updates: Record<string, unknown>): void => {
    setForm(prevForm => {
      const updatedPages = prevForm.pages.map(page => {
        const updatedElements = page.elements.map(element => {
          if (elementIds.includes(element.id)) {
            return {
              ...element,
              ...updates
            };
          }
          return element;
        });
        
        return {
          ...page,
          elements: updatedElements
        };
      });

      return {
        ...prevForm,
        pages: updatedPages,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // Remove an element from the active page
  const removeElement = useCallback((elementId: string): void => {
    setForm(prevForm => {
      const updatedPages = prevForm.pages.map(page => {
        if (page.id === editorState.activePageId) {
          return {
            ...page,
            elements: page.elements.filter(el => el.id !== elementId)
          };
        }
        return page;
      });

      return {
        ...prevForm,
        pages: updatedPages,
        updatedAt: new Date().toISOString()
      };
    });

    // Update selected elements if the removed element was selected
    setEditorState(prev => ({
      ...prev,
      selectedElementIds: prev.selectedElementIds.filter(id => id !== elementId)
    }));

    // Save a history snapshot
    saveHistorySnapshot();
  }, [editorState.activePageId]);

  // Remove multiple elements at once
  const removeElements = useCallback((elementIds: string[]): void => {
    setForm(prevForm => {
      const updatedPages = prevForm.pages.map(page => {
        return {
          ...page,
          elements: page.elements.filter(el => !elementIds.includes(el.id))
        };
      });

      return {
        ...prevForm,
        pages: updatedPages,
        updatedAt: new Date().toISOString()
      };
    });

    // Update selected elements
    setEditorState(prev => ({
      ...prev,
      selectedElementIds: prev.selectedElementIds.filter(id => !elementIds.includes(id))
    }));

    // Save a history snapshot
    saveHistorySnapshot();
  }, []);

  // Add a new page to the form
  const addPage = useCallback((): void => {
    const newPage = createNewPage();
    newPage.name = `Page ${form.pages.length + 1}`;
    
    setForm(prevForm => ({
      ...prevForm,
      pages: [...prevForm.pages, newPage],
      updatedAt: new Date().toISOString()
    }));

    // Set the new page as active
    setEditorState(prev => ({
      ...prev,
      activePageId: newPage.id,
      selectedElementIds: []
    }));

    // Save a history snapshot
    saveHistorySnapshot();
  }, [form.pages.length]);

  // Remove a page from the form
  const removePage = useCallback((pageId: string): void => {
    // Prevent removing the last page
    if (form.pages.length <= 1) {
      return;
    }

    setForm(prevForm => {
      const updatedPages = prevForm.pages.filter(page => page.id !== pageId);
      
      return {
        ...prevForm,
        pages: updatedPages,
        updatedAt: new Date().toISOString()
      };
    });

    // If the active page is removed, set the first page as active
    if (editorState.activePageId === pageId) {
      const newActivePageId = form.pages.find(page => page.id !== pageId)?.id;
      
      if (newActivePageId) {
        setEditorState(prev => ({
          ...prev,
          activePageId: newActivePageId,
          selectedElementIds: []
        }));
      }
    }

    // Save a history snapshot
    saveHistorySnapshot();
  }, [form.pages, editorState.activePageId]);

  // Update a page's properties
  const updatePage = useCallback((pageId: string, updates: Partial<FormPage>): void => {
    setForm(prevForm => {
      const updatedPages = prevForm.pages.map(page => {
        if (page.id === pageId) {
          return {
            ...page,
            ...updates
          };
        }
        return page;
      });

      return {
        ...prevForm,
        pages: updatedPages,
        updatedAt: new Date().toISOString()
      };
    });
  }, []);

  // Set the active page
  const setActivePage = useCallback((pageId: string): void => {
    setEditorState(prev => ({
      ...prev,
      activePageId: pageId,
      selectedElementIds: []
    }));
  }, []);

  // Select an element
  const selectElement = useCallback((elementId: string, isMultiSelect: boolean = false): void => {
    setEditorState(prev => {
      if (isMultiSelect) {
        // Toggle selection if already selected, otherwise add to selection
        const newSelectedIds = prev.selectedElementIds.includes(elementId)
          ? prev.selectedElementIds.filter(id => id !== elementId)
          : [...prev.selectedElementIds, elementId];
        
        return {
          ...prev,
          selectedElementIds: newSelectedIds
        };
      } else {
        // Replace current selection with just this element
        return {
          ...prev,
          selectedElementIds: [elementId]
        };
      }
    });
  }, []);

  // Select multiple elements
  const selectElements = useCallback((elementIds: string[]): void => {
    setEditorState(prev => ({
      ...prev,
      selectedElementIds: elementIds
    }));
  }, []);

  // Clear element selection
  const clearSelection = useCallback((): void => {
    setEditorState(prev => ({
      ...prev,
      selectedElementIds: []
    }));
  }, []);

  // Set hovered element
  const setHoveredElement = useCallback((elementId: string | null): void => {
    setEditorState(prev => ({
      ...prev,
      hoveredElementId: elementId
    }));
  }, []);

  // Set editor mode (design or preview)
  const setEditorMode = useCallback((mode: EditorMode): void => {
    setEditorState(prev => ({
      ...prev,
      editorMode: mode
    }));
  }, []);

  // Handle undo/redo
  const historyRef = useRef<Form[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // Save a snapshot of the current form state to history
  const saveHistorySnapshot = useCallback((): void => {
    // Remove any future history if we're not at the end
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    }

    // Add current state to history
    historyRef.current.push(JSON.parse(JSON.stringify(form)));
    historyIndexRef.current = historyRef.current.length - 1;

    // Limit history size
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  }, [form]);

  // Undo the last action
  const undo = useCallback((): void => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const previousState = historyRef.current[historyIndexRef.current];
      setForm(previousState);
    }
  }, []);

  // Redo a previously undone action
  const redo = useCallback((): void => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const nextState = historyRef.current[historyIndexRef.current];
      setForm(nextState);
    }
  }, []);

  // Initialize a new form
  const initForm = useCallback((newForm?: Form): void => {
    const formToUse = newForm || createNewForm();
    setForm(formToUse);
    
    setEditorState({
      activePageId: formToUse.pages[0].id,
      selectedElementIds: [],
      hoveredElementId: null,
      editorMode: 'design',
      history: [],
      historyIndex: -1,
      zoom: 1,
      showGrid: true,
      snapToGrid: true,
      gridSize: 10,
    });

    // Reset history
    historyRef.current = [JSON.parse(JSON.stringify(formToUse))];
    historyIndexRef.current = 0;
    
    setPdfPreviewUrl(null);
  }, []);

  // Set zoom level
  const setZoom = useCallback((zoom: number): void => {
    setEditorState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(2, zoom))
    }));
  }, []);

  // Toggle grid visibility
  const toggleGrid = useCallback((): void => {
    setEditorState(prev => ({
      ...prev,
      showGrid: !prev.showGrid
    }));
  }, []);

  // Toggle snap to grid
  const toggleSnapToGrid = useCallback((): void => {
    setEditorState(prev => ({
      ...prev,
      snapToGrid: !prev.snapToGrid
    }));
  }, []);

  // Generate PDF preview
  const generatePreview = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const pdfUrl = await generatePDF(form);
      setPdfPreviewUrl(pdfUrl);
      setEditorState(prev => ({
        ...prev,
        editorMode: 'preview'
      }));
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  }, [form]);

  // Download the PDF
  const downloadFormPdf = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (pdfPreviewUrl) {
        // Use existing preview if available
        downloadPDF(pdfPreviewUrl, `${form.name}.pdf`);
      } else {
        // Generate new PDF and download
        const pdfUrl = await generatePDF(form);
        downloadPDF(pdfUrl, `${form.name}.pdf`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setIsLoading(false);
    }
  }, [form, pdfPreviewUrl]);

  // Export form as JSON
  const exportForm = useCallback((): void => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(form, null, 2)
    )}`;
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `${form.name}.json`;
    link.click();
  }, [form]);

  // Import form from JSON
  const importForm = useCallback((jsonForm: Form): void => {
    try {
      initForm(jsonForm);
    } catch (error) {
      console.error('Error importing form:', error);
    }
  }, [initForm]);

  return {
    // State
    form,
    editorState,
    isLoading,
    pdfPreviewUrl,
    
    // Page operations
    getActivePage,
    addPage,
    removePage,
    updatePage,
    setActivePage,
    
    // Element operations
    getSelectedElements,
    addElement,
    updateElement,
    updateElements,
    removeElement,
    removeElements,
    
    // Selection operations
    selectElement,
    selectElements,
    clearSelection,
    setHoveredElement,
    
    // Editor operations
    setEditorMode,
    setZoom,
    toggleGrid,
    toggleSnapToGrid,
    
    // History operations
    saveSnapshot: saveHistorySnapshot,
    undo,
    redo,
    
    // Form operations
    initForm,
    generatePreview,
    downloadFormPdf,
    exportForm,
    importForm
  };
};

export default useFormBuilder; 
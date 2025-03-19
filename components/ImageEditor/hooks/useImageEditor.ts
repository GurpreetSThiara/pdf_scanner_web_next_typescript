import { useState, useRef, useEffect, useCallback } from 'react';
import { EditorState, AspectRatio, CropArea } from '../types';
import { Area } from 'react-easy-crop';

const EDIT_HISTORY_KEY = 'image-editor-history';

export function useImageEditor(image: File | Blob) {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageData = useRef<ImageData | null>(null);
  const originalImageUrl = useRef<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  // Initialize state with default values - ensure values are never undefined
  const defaultEditorState: EditorState = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0,
    scale: { x: 1, y: 1 },
    isFlippedX: false,
    isFlippedY: false,
    aspectRatio: 'free' as AspectRatio,
    exposure: 100,
    highlights: 100,
    shadows: 100,
    temperature: 100,
    sharpness: 100,
    skew: { x: 0, y: 0 },
    perspective: {
      topLeft: { x: 0, y: 0 },
      topRight: { x: 0, y: 0 },
      bottomLeft: { x: 0, y: 0 },
      bottomRight: { x: 0, y: 0 }
    },
    flip: { horizontal: false, vertical: false },
    position: { x: 0, y: 0 },
    background: {
      enabled: true,
      color: '#FFFFFF',
      type: 'color',
      padding: 0
    },
    filter: 'none',
    filterIntensity: 100,
    drawing: {
      enabled: false,
      paths: [],
      currentOptions: {
        mode: 'brush',
        brushSize: 5,
        color: '#FF0000',
        opacity: 100
      }
    },
    clipping: {
      enabled: false,
      paths: [],
      currentPath: null
    }
  };

  const [editorState, setEditorState] = useState<EditorState>(defaultEditorState);

  // Load image and check for saved state
  useEffect(() => {
    const loadImage = async () => {

      if (!(image instanceof Blob || image instanceof File)) {
        console.error('Invalid image:', image);
        return;
      }
  
      // Create URL for the image
      const url = URL.createObjectURL(image);
      originalImageUrl.current = url;

      // Check for saved state
      const savedHistory = localStorage.getItem(EDIT_HISTORY_KEY);
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        const savedState = history[url];
        if (savedState) {
          setEditorState(savedState.editorState);
        } else {
          setEditorState(defaultEditorState);
        }
      }

      // Load image
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setImageObj(img);
        
        // Store original image data
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          originalImageData.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }
      };
    };

    loadImage();

    return () => {
      if (originalImageUrl.current) {
        URL.revokeObjectURL(originalImageUrl.current);
      }
    };
  }, [image]);

  const applyEdits = useCallback(() => {
    if (!canvasRef.current || !imageObj || !originalImageData.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions based on image size and background settings
    const width = imageObj.width;
    const height = imageObj.height;
    
    // Calculate canvas size to maintain aspect ratio
    let canvasWidth, canvasHeight;
    const maxWidth = 1200; // Maximum canvas width
    const maxHeight = 800; // Maximum canvas height
    
    const scale = Math.min(
      maxWidth / width,
      maxHeight / height,
      1 // Don't scale up images that are smaller
    );
    
    if (editorState.background.type === 'none') {
      canvasWidth = width * scale;
      canvasHeight = height * scale;
    } else {
      // Add padding for background modes
      const diagonal = Math.sqrt(Math.pow(width * scale, 2) + Math.pow(height * scale, 2));
      const padding = (editorState.background.padding / 100) * diagonal;
      canvasWidth = canvasHeight = diagonal + (padding * 2);
    }

    // Set canvas size
    canvasRef.current.width = canvasWidth;
    canvasRef.current.height = canvasHeight;

    // Clear the canvas and apply background
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (editorState.background.type !== 'none') {
      if (editorState.background.type === 'checkerboard') {
        drawCheckerboard(ctx, canvasWidth, canvasHeight);
      } else if (editorState.background.type === 'color') {
        ctx.fillStyle = editorState.background.color;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }

    // Calculate the centered position for the image
    const imageX = (canvasWidth - (width * scale)) / 2;
    const imageY = (canvasHeight - (height * scale)) / 2;

    // Apply transformations from the center of the image
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);
    ctx.rotate((editorState.rotation * Math.PI) / 180);
    
    // Use flip properties from current state
    const scaleX = editorState.flip.horizontal ? -scale : scale;
    const scaleY = editorState.flip.vertical ? -scale : scale;
    
    ctx.scale(scaleX, scaleY);
    
    // Apply skew and perspective transforms if needed
    if (editorState.skew.x !== 0 || editorState.skew.y !== 0) {
      const skewX = Math.tan((editorState.skew.x * Math.PI) / 180);
      const skewY = Math.tan((editorState.skew.y * Math.PI) / 180);
      ctx.transform(1, skewY, skewX, 1, 0, 0);
    }

    // Create a temporary canvas for image processing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // Draw original image to temp canvas
      tempCtx.drawImage(imageObj, 0, 0, width, height);
      
      // Apply filter only to the image on the temp canvas
      if (editorState.filter !== 'none') {
        const imageData = tempCtx.getImageData(0, 0, width, height);
        applyFilterEffect(imageData, editorState.filter, editorState.filterIntensity / 100);
        tempCtx.putImageData(imageData, 0, 0);
      }
      
      // Draw the processed image to the main canvas
      ctx.drawImage(tempCanvas, -width / 2, -height / 2, width, height);
    } else {
      // Fallback if tempCtx creation fails
      ctx.drawImage(imageObj, -width / 2, -height / 2, width, height);
    }

    // If drawing is enabled, draw paths
    if (editorState.drawing.enabled && editorState.drawing.paths.length > 0) {
      drawPaths(ctx, editorState.drawing.paths);
    }

    // If clipping is enabled, apply clipping paths
    if (editorState.clipping.enabled && editorState.clipping.paths.length > 0) {
      applyClippingPaths(ctx, editorState.clipping.paths);
    }

    ctx.restore();
  }, [canvasRef, imageObj, editorState]);

  useEffect(() => {
    applyEdits();
  }, [applyEdits]);

  const onChange = useCallback((updates: Partial<EditorState>) => {
    setEditorState(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  /**
   * Handles saving the edited image with all applied changes.
   * This function is called when the user clicks the "Apply Changes & Save" button in the EditorSidebar.
   * There's only one save button that should be used (in the sidebar), despite function names that might
   * suggest otherwise - the parent component passes its own onSave callback that gets triggered after
   * this function succeeds.
   */
  const handleSave = async () => {
    if (!canvasRef.current || !imageObj) return null;
    
    // If in crop mode, apply the crop first
    if (cropMode && croppedAreaPixels) {
      applyCrop();
      return null; // Return null as the crop will trigger a re-render with new image
    }

    // Create a temporary canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    // Get original image dimensions
    const originalWidth = imageObj.naturalWidth || imageObj.width;
    const originalHeight = imageObj.naturalHeight || imageObj.height;
    
    // Calculate final dimensions to include background if needed
    let canvasWidth, canvasHeight;
    
    if (true ||editorState.background.type === 'none') {
      canvasWidth = originalWidth;
      canvasHeight = originalHeight;
    } else {
      // Add padding for background modes, similar to applyEdits function
      const diagonal = Math.sqrt(Math.pow(originalWidth, 2) + Math.pow(originalHeight, 2));
      const padding = (editorState.background.padding / 100) * diagonal;
      canvasWidth = canvasHeight = diagonal + (padding * 2);
    }
    
    // Set canvas size
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;

    // Clear the canvas and apply background
    tempCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    if (editorState.background.type !== 'none' && editorState.background.enabled) {
      if (editorState.background.type === 'checkerboard') {
        drawCheckerboard(tempCtx, canvasWidth, canvasHeight);
      } else if (editorState.background.type === 'color') {
        tempCtx.fillStyle = editorState.background.color;
        tempCtx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }
    
    // Save the current state
    tempCtx.save();

    // Apply transformations relative to the center of the canvas
    tempCtx.translate(canvasWidth / 2, canvasHeight / 2);
    tempCtx.rotate((editorState.rotation * Math.PI) / 180);
    
    // Apply flips
    const scaleX = editorState.flip.horizontal ? -1 : 1;
    const scaleY = editorState.flip.vertical ? -1 : 1;
    tempCtx.scale(scaleX, scaleY);

    // Apply skew if any
    if (editorState.skew.x !== 0 || editorState.skew.y !== 0) {
      const skewX = Math.tan((editorState.skew.x * Math.PI) / 180);
      const skewY = Math.tan((editorState.skew.y * Math.PI) / 180);
      tempCtx.transform(1, skewY, skewX, 1, 0, 0);
    }

    // Draw the image centered
    tempCtx.drawImage(
      imageObj,
      -originalWidth / 2,
      -originalHeight / 2,
      originalWidth,
      originalHeight
    );

    // If there are any filters applied
    if (editorState.filter !== 'none') {
      // Create a temporary canvas for filter application
      const filterCanvas = document.createElement('canvas');
      filterCanvas.width = originalWidth;
      filterCanvas.height = originalHeight;
      const filterCtx = filterCanvas.getContext('2d');
      
      if (filterCtx) {
        // Draw the image
        filterCtx.drawImage(imageObj, 0, 0, originalWidth, originalHeight);
        
        // Apply filter
        const imageData = filterCtx.getImageData(0, 0, originalWidth, originalHeight);
        applyFilterEffect(imageData, editorState.filter, editorState.filterIntensity / 100);
        filterCtx.putImageData(imageData, 0, 0);
        
        // Draw the filtered image back to the main canvas
        tempCtx.drawImage(filterCanvas, -originalWidth / 2, -originalHeight / 2);
      }
    }

    // If there are any drawings, apply them
    if (editorState.drawing.enabled && editorState.drawing.paths.length > 0) {
      drawPaths(tempCtx, editorState.drawing.paths);
    }

    // If there are any clipping paths, apply them
    if (editorState.clipping.enabled && editorState.clipping.paths.length > 0) {
      applyClippingPaths(tempCtx, editorState.clipping.paths);
    }

    // Restore the context state
    tempCtx.restore();

    // Convert to blob with maximum quality
    return new Promise<Blob | null>((resolve) => {
      tempCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1.0);
    });
  };

  const startCrop = () => {
    setCropMode(true);
  };

  const cancelCrop = () => {
    setCropMode(false);
    setCropArea(null);
    setCroppedAreaPixels(null);
  };

  const updateCropArea = (updates: Partial<CropArea>) => {
    setCropArea(prev => prev ? { ...prev, ...updates } : null);
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    console.log('Crop complete:', { croppedArea, croppedAreaPixels });
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const applyCrop = () => {
    console.log('Applying crop:', { imageObj, croppedAreaPixels });
    if (!imageObj || !croppedAreaPixels) return;
    
    // Create a temporary canvas to crop the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set the canvas size to the cropped area
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    
    // Draw the cropped portion
    ctx.drawImage(
      imageObj,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    
    // Create a new image from the cropped canvas
    const croppedImage = new Image();
    croppedImage.onload = () => {
      console.log('Cropped image loaded successfully');
      setImageObj(croppedImage);
      
      // Reset crop mode and related state
      setCropMode(false);
      setCropArea(null);
      setCroppedAreaPixels(null);
    };
    croppedImage.src = canvas.toDataURL();
  };

  // Add drawing support
  const startDrawing = (point: { x: number, y: number }) => {
    if (!editorState.drawing.enabled) return;
    
    // Create a new path with the current drawing options
    const newPath = {
      points: [point],
      options: { ...editorState.drawing.currentOptions }
    };
    
    setEditorState(prev => ({
      ...prev,
      drawing: {
        ...prev.drawing,
        paths: [...prev.drawing.paths, newPath]
      }
    }));
  };

  const continueDrawing = (point: { x: number, y: number }) => {
    if (!editorState.drawing.enabled || editorState.drawing.paths.length === 0) return;
    
    // Add point to the current path
    setEditorState(prev => {
      const paths = [...prev.drawing.paths];
      const lastPathIndex = paths.length - 1;
      
      paths[lastPathIndex] = {
        ...paths[lastPathIndex],
        points: [...paths[lastPathIndex].points, point]
      };
      
      return {
        ...prev,
        drawing: {
          ...prev.drawing,
          paths
        }
      };
    });
  };

  const endDrawing = () => {
    // Just finish the current drawing operation
    // The path is already in the state
  };

  // Add clipping path support
  const startClippingPath = (point: { x: number, y: number }) => {
    if (!editorState.clipping.enabled) return;
    
    // Create a new clipping path
    const newPath = {
      points: [point],
      isClosed: false
    };
    
    setEditorState(prev => ({
      ...prev,
      clipping: {
        ...prev.clipping,
        currentPath: newPath
      }
    }));
  };

  const continueClippingPath = (point: { x: number, y: number }) => {
    if (!editorState.clipping.enabled || !editorState.clipping.currentPath) return;
    
    // Add point to the current clipping path
    setEditorState(prev => ({
      ...prev,
      clipping: {
        ...prev.clipping,
        currentPath: {
          ...prev.clipping.currentPath!,
          points: [...prev.clipping.currentPath!.points, point]
        }
      }
    }));
  };

  const closeClippingPath = () => {
    if (!editorState.clipping.enabled || !editorState.clipping.currentPath) return;
    
    // Close the path and add it to the paths array
    setEditorState(prev => {
      const closedPath = {
        ...prev.clipping.currentPath!,
        isClosed: true
      };
      
      return {
        ...prev,
        clipping: {
          ...prev.clipping,
          paths: [...prev.clipping.paths, closedPath],
          currentPath: null
        }
      };
    });
  };

  // Helper functions for applying filters
  function applyFilterEffect(imageData: ImageData, filterType: string, intensity: number) {
    const data = imageData.data;
    
    switch (filterType) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i] * (1 - intensity) + avg * intensity;
          data[i + 1] = data[i + 1] * (1 - intensity) + avg * intensity;
          data[i + 2] = data[i + 2] * (1 - intensity) + avg * intensity;
        }
        break;
        
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, (r * (1 - intensity) + (r * 0.393 + g * 0.769 + b * 0.189) * intensity));
          data[i + 1] = Math.min(255, (g * (1 - intensity) + (r * 0.349 + g * 0.686 + b * 0.168) * intensity));
          data[i + 2] = Math.min(255, (b * (1 - intensity) + (r * 0.272 + g * 0.534 + b * 0.131) * intensity));
        }
        break;
        
      case 'vintage':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, r * (1 - intensity) + (r * 0.9 + g * 0.05 + b * 0.05) * intensity);
          data[i + 1] = Math.min(255, g * (1 - intensity) + (r * 0.07 + g * 0.9 + b * 0.03) * intensity);
          data[i + 2] = Math.min(255, b * (1 - intensity) + (r * 0.15 + g * 0.1 + b * 0.75) * intensity);
        }
        break;
        
      case 'warm':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] + 30 * intensity);
          data[i + 1] = Math.min(255, data[i + 1] + 15 * intensity);
          data[i + 2] = Math.max(0, data[i + 2] - 20 * intensity);
        }
        break;
        
      case 'cool':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, data[i] - 20 * intensity);
          data[i + 1] = Math.min(255, data[i + 1] + 10 * intensity);
          data[i + 2] = Math.min(255, data[i + 2] + 30 * intensity);
        }
        break;
      
      case 'vivid':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Enhance saturation and contrast for vivid effect
          const avg = (r + g + b) / 3;
          data[i] = Math.min(255, r * (1 - intensity) + (avg + (r - avg) * 1.5) * intensity);
          data[i + 1] = Math.min(255, g * (1 - intensity) + (avg + (g - avg) * 1.5) * intensity);
          data[i + 2] = Math.min(255, b * (1 - intensity) + (avg + (b - avg) * 1.5) * intensity);
        }
        break;
        
      case 'nightvision':
        for (let i = 0; i < data.length; i += 4) {
          // Convert to green-tinted night vision effect
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = Math.min(255, data[i] * (1 - intensity) + (avg * 0.1) * intensity);
          data[i + 1] = Math.min(255, data[i + 1] * (1 - intensity) + (avg * 1.2) * intensity);
          data[i + 2] = Math.min(255, data[i + 2] * (1 - intensity) + (avg * 0.1) * intensity);
        }
        break;
        
      case 'dramatic':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // High contrast, slightly desaturated look
          const avg = (r + g + b) / 3;
          const newR = avg + (r - avg) * 1.5;
          const newG = avg + (g - avg) * 1.5;
          const newB = avg + (b - avg) * 1.5;
          
          data[i] = Math.min(255, r * (1 - intensity) + newR * intensity);
          data[i + 1] = Math.min(255, g * (1 - intensity) + newG * intensity);
          data[i + 2] = Math.min(255, b * (1 - intensity) + newB * intensity);
        }
        break;
        
      case 'noir':
        for (let i = 0; i < data.length; i += 4) {
          // High contrast black and white
          const avg = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
          const monoValue = avg < 128 ? avg * 0.5 : avg * 1.2;
          
          data[i] = data[i] * (1 - intensity) + monoValue * intensity;
          data[i + 1] = data[i + 1] * (1 - intensity) + monoValue * intensity;
          data[i + 2] = data[i + 2] * (1 - intensity) + monoValue * intensity;
        }
        break;
        
      case 'fade':
        for (let i = 0; i < data.length; i += 4) {
          // Faded, low contrast look
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, r * (1 - intensity) + (r * 0.9 + 20) * intensity);
          data[i + 1] = Math.min(255, g * (1 - intensity) + (g * 0.9 + 20) * intensity);
          data[i + 2] = Math.min(255, b * (1 - intensity) + (b * 0.9 + 20) * intensity);
        }
        break;
        
      case 'chrome':
        for (let i = 0; i < data.length; i += 4) {
          // Metallic, high contrast look
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const monoR = (r * 0.8) + (g * 0.1) + (b * 0.1);
          const monoG = (r * 0.1) + (g * 0.8) + (b * 0.1);
          const monoB = (r * 0.1) + (g * 0.1) + (b * 0.8);
          
          data[i] = Math.min(255, r * (1 - intensity) + monoR * intensity);
          data[i + 1] = Math.min(255, g * (1 - intensity) + monoG * intensity);
          data[i + 2] = Math.min(255, b * (1 - intensity) + monoB * intensity);
        }
        break;
        
      case 'lofi':
        for (let i = 0; i < data.length; i += 4) {
          // Reduced color palette, slightly saturated
          const r = Math.round(data[i] / 32) * 32;
          const g = Math.round(data[i + 1] / 32) * 32;
          const b = Math.round(data[i + 2] / 32) * 32;
          
          data[i] = data[i] * (1 - intensity) + r * intensity;
          data[i + 1] = data[i + 1] * (1 - intensity) + g * intensity;
          data[i + 2] = data[i + 2] * (1 - intensity) + b * intensity;
        }
        break;
        
      case 'retro':
        for (let i = 0; i < data.length; i += 4) {
          // Retro film effect
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          data[i] = Math.min(255, r * (1 - intensity) + (r * 0.9 + g * 0.1 + b * 0.1 + 15) * intensity);
          data[i + 1] = Math.min(255, g * (1 - intensity) + (r * 0.05 + g * 0.9 + b * 0.05 + 10) * intensity);
          data[i + 2] = Math.min(255, b * (1 - intensity) + (r * 0.1 + g * 0.1 + b * 0.8 + 5) * intensity);
        }
        break;
        
      default:
        break;
    }
  }

  function drawPaths(ctx: CanvasRenderingContext2D, paths: any[]) {
    // Add clipping to ensure drawing stays within image boundaries
    ctx.save();
    
    // Create a clipping path that matches the image dimensions
    const width = imageObj?.width || 0;
    const height = imageObj?.height || 0;
    
    // Only proceed if we have valid dimensions
    if (width > 0 && height > 0) {
      // Create a rectangle for clipping that matches the image size
      ctx.beginPath();
      ctx.rect(-width / 2, -height / 2, width, height);
      ctx.clip();
    }
    
    // Now draw all paths - they will be constrained to the image area
    paths.forEach(path => {
      const { points, options } = path;
      if (!points || points.length === 0) return;
      
      ctx.save();
      
      // Set common drawing styles
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Handle eraser separately as it uses a different composite operation
      if (options.mode === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = Math.max(options.brushSize * 2, 10); // Make eraser larger for better visibility
        ctx.strokeStyle = 'rgba(255,255,255,1)'; // White color for erasing
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        ctx.restore();
        return; // Skip the rest of the drawing code for eraser
      }
      
      // Set drawing styles based on options for non-eraser tools
      ctx.lineWidth = options.brushSize;
      ctx.strokeStyle = options.color;
      ctx.fillStyle = options.color;
      ctx.globalAlpha = options.opacity / 100;
      
      // Draw based on mode
      switch (options.mode) {
        case 'brush':
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
          break;
          
        case 'line':
          if (points.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
            ctx.stroke();
          }
          break;
          
        case 'rectangle':
          if (points.length >= 2) {
            const startX = points[0].x;
            const startY = points[0].y;
            const endX = points[points.length - 1].x;
            const endY = points[points.length - 1].y;
            
            const width = endX - startX;
            const height = endY - startY;
            
            ctx.beginPath();
            ctx.rect(startX, startY, width, height);
            ctx.stroke();
          }
          break;
          
        case 'circle':
          if (points.length >= 2) {
            const startX = points[0].x;
            const startY = points[0].y;
            const endX = points[points.length - 1].x;
            const endY = points[points.length - 1].y;
            
            const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
          break;
          
        case 'arrow':
          if (points.length >= 2) {
            const startX = points[0].x;
            const startY = points[0].y;
            const endX = points[points.length - 1].x;
            const endY = points[points.length - 1].y;
            
            const headlen = 15; // arrow head length
            const angle = Math.atan2(endY - startY, endX - startX);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
          }
          break;
          
        case 'text':
          if (points.length > 0) {
            const fontSize = options.fontSize || 20;
            const fontFamily = options.fontFamily || 'Arial, sans-serif';
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillText('Sample Text', points[0].x, points[0].y);
          }
          break;
          
        default:
          break;
      }
      
      ctx.restore();
    });
    
    // Restore the context to remove the clipping path
    ctx.restore();
  }

  function applyClippingPaths(ctx: CanvasRenderingContext2D, paths: any[]) {
    if (paths.length === 0) return;
    
    // First, draw the clipping paths visually for user feedback
    ctx.save();
    
    // Draw all paths with a visible style
    paths.forEach(path => {
      const { points, isClosed } = path;
      if (!points || points.length < 3) return;
      
      // Set styles for visible path
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]); // Dashed line for better visibility
      
      // Draw the path
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      // Close the path visually if needed
      if (isClosed) {
        ctx.closePath();
      }
      
      // Stroke the path to make it visible
      ctx.stroke();
      
      // Also draw control points at each vertex
      const pointRadius = 4;
      ctx.fillStyle = 'rgba(0, 120, 255, 0.8)';
      points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
      });
    });
    
    ctx.restore();
    
    // Now apply the actual clipping
    ctx.save();
    
    // Start a new path for clipping
    ctx.beginPath();
    
    let validClippingPathFound = false;
    
    paths.forEach(path => {
      const { points, isClosed } = path;
      if (!points || points.length < 3 || !isClosed) return;
      
      validClippingPathFound = true;
      
      // Draw the path for clipping
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      // Close the path
      ctx.closePath();
    });
    
    // Only apply the clip if we have at least one valid closed path
    if (validClippingPathFound) {
      ctx.clip();
    }
    
    // Continue drawing the image - the clip will be reset by the restore() call in applyEdits
  }

  // Helper function to draw checkerboard pattern
  const drawCheckerboard = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const squareSize = 8;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#e5e5e5';
    for (let i = 0; i < width; i += squareSize * 2) {
      for (let j = 0; j < height; j += squareSize * 2) {
        ctx.fillRect(i, j, squareSize, squareSize);
        ctx.fillRect(i + squareSize, j + squareSize, squareSize, squareSize);
      }
    }
  };

  // Return the necessary state and functions
  return {
    imageObj,
    editorState,
    onChange,
    canvasRef,
    handleSave,
    originalImageData: originalImageData.current,
    cropMode,
    cropArea,
    updateCropArea,
    onCropComplete,
    startCrop,
    cancelCrop,
    applyCrop,
    // Drawing functions
    startDrawing,
    continueDrawing,
    endDrawing,
    // Clipping functions
    startClippingPath,
    continueClippingPath,
    closeClippingPath
  };
}

// Helper functions for color conversions and effects
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r * 255, g * 255, b * 255];
}

function getSurroundingPixels(data: Uint8ClampedArray, i: number, width: number) {
  // Simple implementation - get adjacent pixels
  const pixels = [];
  const positions = [
    i - (width * 4), // top
    i + (width * 4), // bottom
    i - 4, // left
    i + 4, // right
  ];

  for (const pos of positions) {
    if (pos >= 0 && pos < data.length) {
      pixels.push([data[pos], data[pos + 1], data[pos + 2]]);
    }
  }
  return pixels;
}

function applySharpness(center: number[], surrounding: number[][], amount: number): [number, number, number] {
  return center.map((centerChannel, i) => {
    const avgSurrounding = surrounding.reduce((sum, pixel) => sum + pixel[i], 0) / surrounding.length;
    return centerChannel + (centerChannel - avgSurrounding) * amount;
  }) as [number, number, number];
}

// Add a helper function to get transform matrix
function getTransformMatrix(
  rotation: number,
  scale: { x: number; y: number },
  skew: { x: number; y: number }
): DOMMatrix {
  const matrix = new DOMMatrix();
  matrix.translateSelf(0, 0);
  matrix.rotateSelf(rotation);
  matrix.scaleSelf(scale.x, scale.y);
  matrix.skewXSelf(skew.x);
  matrix.skewYSelf(skew.y);
  return matrix;
} 
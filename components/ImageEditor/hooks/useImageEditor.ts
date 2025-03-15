import { useState, useRef, useEffect, useCallback } from 'react';
import { EditorState, AspectRatio } from '../types';
// import { Area } from 'react-easy-crop';

const EDIT_HISTORY_KEY = 'image-editor-history';

export function useImageEditor(image: File | Blob) {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageData = useRef<ImageData | null>(null);
  const originalImageUrl = useRef<string | null>(null);
  const [cropMode, setCropMode] = useState(false);
  // const [cropArea, setCropArea] = useState<CropArea | null>(null);
  // const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
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

    // Calculate dimensions based on background type
    const width = imageObj.width;
    const height = imageObj.height;
    
    let canvasWidth, canvasHeight;
    
    if (editorState.background.type === 'none') {
      // Use exact image dimensions for 'none' type
      canvasWidth = width;
      canvasHeight = height;
    } else {
      // Calculate with padding for other types
      const diagonal = Math.sqrt(width * width + height * height);
      const padding = (editorState.background.padding / 100) * diagonal;
      canvasWidth = canvasHeight = diagonal + (padding * 2);
    }

    // Set canvas size
    canvasRef.current.width = canvasWidth;
    canvasRef.current.height = canvasHeight;

    // Clear the canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Apply background only if not 'none' type
    if (editorState.background.type !== 'none') {
      if (editorState.background.type === 'checkerboard') {
        drawCheckerboard(ctx, canvasWidth, canvasHeight);
      } else if (editorState.background.type === 'color') {
        ctx.fillStyle = editorState.background.color;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
    }

    // Move to center of canvas
    ctx.save();
    ctx.translate(canvasWidth / 2, canvasHeight / 2);

    // Apply transformations in order
    // 1. Rotation
    ctx.rotate((editorState.rotation * Math.PI) / 180);

    // 2. Scale
    ctx.scale(
      editorState.scale.x * (editorState.flip.horizontal ? -1 : 1),
      editorState.scale.y * (editorState.flip.vertical ? -1 : 1)
    );

    // 3. Skew
    const skewX = Math.tan((editorState.skew.x * Math.PI) / 180);
    const skewY = Math.tan((editorState.skew.y * Math.PI) / 180);
    ctx.transform(1, skewY, skewX, 1, 0, 0);

    // Create a temporary canvas for the original image with adjustments
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (tempCtx) {
      // Draw original image
      tempCtx.putImageData(originalImageData.current, 0, 0);

      // Apply pixel-level adjustments
      const imageData = tempCtx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Convert to HSL for better color manipulation
        const [h, s, l] = rgbToHsl(r, g, b);

        // Apply exposure
        let adjustedL = l * (1 + (editorState.exposure - 100) / 100);

        // Apply highlights and shadows
        if (l > 0.5) {
          adjustedL += (editorState.highlights - 100) / 100 * (l - 0.5);
        } else {
          adjustedL += (editorState.shadows - 100) / 100 * (0.5 - l);
        }

        // Apply temperature (warm/cool)
        let tempR = r;
        let tempB = b;
        if ((editorState.temperature - 100) > 0) {
          tempR += ((editorState.temperature - 100) / 100) * 255;
          tempB -= ((editorState.temperature - 100) / 100) * 255;
        } else {
          tempR -= Math.abs((editorState.temperature - 100) / 100) * 255;
          tempB += Math.abs((editorState.temperature - 100) / 100) * 255;
        }

        // Convert back to RGB
        let [adjustedR, adjustedG, adjustedB] = hslToRgb(h, s, adjustedL);

        // Apply brightness
        adjustedR += (editorState.brightness - 100) / 100 * 255;
        adjustedG += (editorState.brightness - 100) / 100 * 255;
        adjustedB += (editorState.brightness - 100) / 100 * 255;

        // Apply temperature
        adjustedR = Math.min(255, Math.max(0, adjustedR + (tempR - r)));
        adjustedB = Math.min(255, Math.max(0, adjustedB + (tempB - b)));

        // Apply sharpness (simple implementation)
        if ((editorState.sharpness - 100) > 0) {
          const centerPixel = [adjustedR, adjustedG, adjustedB];
          const surroundingPixels = getSurroundingPixels(data, i, width);
          [adjustedR, adjustedG, adjustedB] = applySharpness(centerPixel, surroundingPixels, (editorState.sharpness - 100) / 100);
        }

        data[i] = Math.min(255, Math.max(0, adjustedR));
        data[i + 1] = Math.min(255, Math.max(0, adjustedG));
        data[i + 2] = Math.min(255, Math.max(0, adjustedB));
      }

      tempCtx.putImageData(imageData, 0, 0);

      // Draw the adjusted image onto the main canvas with transformations
      ctx.drawImage(
        tempCanvas,
        -width / 2,  // Center the image
        -height / 2,
        width,
        height
      );
    }

    // Restore the context state
    ctx.restore();

    // // Draw crop overlay if in crop mode
    // if (cropMode && cropArea) {
    //   ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    //   ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
    //   // Clear the crop area
    //   ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      
    //   // Draw crop handles
    //   drawCropHandles(ctx, cropArea);
    // }
  }, [editorState, imageObj, ]);

  useEffect(() => {
    applyEdits();
  }, [applyEdits]);

  // Save state when changes are made
  const handleChange = useCallback((updates: Partial<EditorState>) => {
    setEditorState(prev => {
      const newState = { ...prev, ...updates };
      
      // Save to localStorage
      if (originalImageUrl.current) {
        const savedHistory = localStorage.getItem(EDIT_HISTORY_KEY);
        const history = savedHistory ? JSON.parse(savedHistory) : {};
        
        history[originalImageUrl.current] = {
          editorState: newState,
          timestamp: Date.now()
        };
        
        localStorage.setItem(EDIT_HISTORY_KEY, JSON.stringify(history));
      }
      
      return newState;
    });
  }, []);

  const handleSave = async () => {
    if (!canvasRef.current || !imageObj) return null;

    return new Promise<Blob>((resolve) => {
      // Create a temporary canvas with only the image dimensions
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return;

      // Get the actual image bounds after transformations
      const bounds = getTransformedImageBounds(imageObj, editorState);
      
      // Set the temp canvas size to the actual image bounds
      tempCanvas.width = bounds.width;
      tempCanvas.height = bounds.height;

      // Draw only the image portion (no background)
      ctx.drawImage(
        canvasRef.current,
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
        0,
        0,
        bounds.width,
        bounds.height
      );

      // Convert to blob with original image type
      tempCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, image.type);
    });
  };

  // Helper function to calculate transformed image bounds
  const getTransformedImageBounds = (img: HTMLImageElement, state: EditorState) => {
    const width = img.width;
    const height = img.height;

    // Calculate scaled dimensions
    const scaledWidth = width * state.scale.x;
    const scaledHeight = height * state.scale.y;

    // Calculate rotated dimensions
    const radians = (state.rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));
    
    const rotatedWidth = scaledWidth * cos + scaledHeight * sin;
    const rotatedHeight = scaledWidth * sin + scaledHeight * cos;

    // Get the canvas center point
    const canvasWidth = canvasRef.current?.width || width;
    const canvasHeight = canvasRef.current?.height || height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    return {
      x: centerX - rotatedWidth / 2,
      y: centerY - rotatedHeight / 2,
      width: rotatedWidth,
      height: rotatedHeight
    };
  };

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

  // Add crop handling functions
  const startCrop = () => {
    setCropMode(true);
    // Initialize crop area to full image
    // if (imageObj) {
    //   setCropArea({
    //     x: 0,
    //     y: 0,
    //     width: imageObj.width,
    //     height: imageObj.height
    //   });
    // }
  };

  // const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
  //   setCroppedAreaPixels(croppedAreaPixels);
  // }, []);

  // const applyCrop = useCallback(async () => {
  //   if ( !canvasRef.current || !imageObj) return;

  //   try {
  //     const canvas = document.createElement('canvas');
  //     const ctx = canvas.getContext('2d');
  //     if (!ctx) return;

  //     // Set proper canvas dimensions
  //     canvas.width = croppedAreaPixels.width;
  //     canvas.height = croppedAreaPixels.height;

  //     // Draw the cropped image
  //     ctx.drawImage(
  //       imageObj,
  //       croppedAreaPixels.x,
  //       croppedAreaPixels.y,
  //       croppedAreaPixels.width,
  //       croppedAreaPixels.height,
  //       0,
  //       0,
  //       croppedAreaPixels.width,
  //       croppedAreaPixels.height
  //     );

  //     // Get the cropped image data
  //     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  //     originalImageData.current = imageData;

  //     // Reset crop mode
  //     setCropMode(false);
  //     setCropArea(null);
  //     setCroppedAreaPixels(null);

  //     // Reset transformations
  //     setEditorState(prev => ({
  //       ...prev,
  //       rotation: 0,
  //       scale: { x: 1, y: 1 }
  //     }));

  //   } catch (e) {
  //     console.error('Error applying crop:', e);
  //   }
  // }, [croppedAreaPixels, imageObj]);

  // const cancelCrop = () => {
  //   setCropMode(false);
  //   setCropArea(null);
  //   setCroppedAreaPixels(null);
  // };

  // const updateCropArea = (updates: Partial<CropArea>) => {
  //   setCropArea(prev => prev ? { ...prev, ...updates } : null);
  // };

  return {
    imageObj,
    editorState,
    onChange: handleChange,
    canvasRef,
    handleSave,
    originalImageData: originalImageData.current,
    cropMode,
   // cropArea,
    //startCrop,
    // onCropComplete,
    // applyCrop,
    // cancelCrop,
    // updateCropArea
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
import { useRef, useEffect, useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { EditorState, CropArea } from '../types';

interface EditorCanvasProps {
  imageObj: HTMLImageElement | null;
  editorState: EditorState;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  cropMode: boolean;
  cropArea: CropArea | null;
  updateCropArea: (updates: Partial<CropArea>) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
}

export function EditorCanvas({
  imageObj, 
  editorState, 
  canvasRef, 
  cropMode,
  cropArea,
  updateCropArea,
  onCropComplete
}: EditorCanvasProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

// //  In crop mode, render the Cropper component
//   if (cropMode && imageObj) {
//     return (
//       <div className="relative w-full h-full">
//         <Cropper
//           image={imageObj.src}
//           crop={crop}
//           zoom={zoom}
//           aspect={getAspectRatio(editorState.aspectRatio)}
//           onCropChange={onCropChange}
//           onZoomChange={onZoomChange}
//           onCropComplete={onCropComplete}
//           objectFit="contain"
//           showGrid={true}
//           classes={{
//             containerClassName: 'w-full h-full bg-gray-950',
//             mediaClassName: 'max-w-full max-h-full',
//             cropAreaClassName: 'border-2 border-white'
//           }}
//           style={{
//             cropAreaStyle: {
//               border: '2px solid white',
//               color: 'rgba(255, 255, 255, 0.6)',
//             },
//             containerStyle: {
//               width: '100%',
//               height: '100%',
//               position: 'relative'
//             },
//             mediaStyle: {
//               maxWidth: '100%',
//               maxHeight: '100%',
//             }
//           }}
//         />
//       </div>
//     );
//   }

  // In normal mode, just render the canvas which is managed by useImageEditor
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-950">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
      />
    </div>
  );
}

function getAspectRatio(ratio: string): number {
  switch (ratio) {
    case '1:1': return 1;
    case '4:3': return 4/3;
    case '16:9': return 16/9;
    case '3:2': return 3/2;
    default: return undefined; // Free aspect ratio
  }
}

function applyFilters(imageData: ImageData, editorState: EditorState) {
  const data = imageData.data;
  const brightness = editorState.brightness / 100;
  const contrast = Math.pow(editorState.contrast / 100, 2);
  const saturation = editorState.saturation / 100;

  for (let i = 0; i < data.length; i += 4) {
    // Apply brightness
    let r = data[i] * brightness;
    let g = data[i + 1] * brightness;
    let b = data[i + 2] * brightness;

    // Apply contrast
    r = ((r / 255 - 0.5) * contrast + 0.5) * 255;
    g = ((g / 255 - 0.5) * contrast + 0.5) * 255;
    b = ((b / 255 - 0.5) * contrast + 0.5) * 255;

    // Apply saturation
    const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
    r = Math.max(0, Math.min(255, gray + saturation * (r - gray)));
    g = Math.max(0, Math.min(255, gray + saturation * (g - gray)));
    b = Math.max(0, Math.min(255, gray + saturation * (b - gray)));

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

// Filter implementation
function applyImageFilter(ctx: CanvasRenderingContext2D, image: HTMLImageElement, filterType: string, intensity: number) {
  const { width, height } = image;
  
  // Draw the original image
  ctx.drawImage(image, 0, 0);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  // Apply the filter based on type
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
      
    // For brevity, other filters would follow similar pattern
    // but with different color transformations
      
    default:
      break;
  }
  
  // Put the modified data back
  ctx.putImageData(imageData, 0, 0);
}

// Drawing functionality
function drawPaths(ctx: CanvasRenderingContext2D, paths: any[]) {
  paths.forEach(path => {
    const { points, options } = path;
    if (!points || points.length === 0) return;
    
    ctx.save();
    
    // Set drawing styles based on options
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
        if (points.length > 0 && options.fontSize) {
          ctx.font = `${options.fontSize}px ${options.fontFamily || 'sans-serif'}`;
          ctx.fillText('Sample Text', points[0].x, points[0].y);
        }
        break;
        
      case 'eraser':
        // For eraser we use destination-out composite operation
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();
        break;
        
      default:
        break;
    }
    
    ctx.restore();
  });
}

// Clipping functionality
function applyClippingPaths(ctx: CanvasRenderingContext2D, paths: any[]) {
  if (paths.length === 0) return;
  
  // Start a new path for clipping
  ctx.beginPath();
  
  paths.forEach(path => {
    const { points, isClosed } = path;
    if (!points || points.length < 3) return;
    
    // Draw the path
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    // Close the path if needed
    if (isClosed) {
      ctx.closePath();
    }
  });
  
  // Apply the clip
  ctx.clip();
} 
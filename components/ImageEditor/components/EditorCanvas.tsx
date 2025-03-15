import { useRef, useEffect, useState, useCallback } from 'react';
//import Cropper from 'react-easy-crop';
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
  // cropArea,
  // updateCropArea,
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

  if (cropMode && imageObj) {
    return (
      <div className="relative w-full h-full">
        {/* <Cropper
          image={imageObj.src}
          crop={crop}
          zoom={zoom}
          aspect={getAspectRatio(editorState.aspectRatio)}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
          objectFit="contain"
          showGrid={true}
          classes={{
            containerClassName: 'w-full h-full bg-gray-950',
            mediaClassName: 'max-w-full max-h-full',
            cropAreaClassName: 'border-2 border-white'
          }}
        /> */}
      </div>
    );
  }

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
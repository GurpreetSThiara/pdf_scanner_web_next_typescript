export interface ImageEditModalProps {
  image: File;
  onClose: () => void;
  onSave: (editedImage: Blob) => void;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AspectRatio = '1:1' | '4:3' | '16:9' | '3:2' | 'free';
export type EditorTab = 'adjust' | 'transform' | 'crop' | 'filters' | 'draw';

export interface ImageEditHistory {
  originalImageUrl: string;  // URL to original image
  editorState: EditorState;
  timestamp: number;
}

export interface DrawingOptions {
  mode: 'brush' | 'line' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'eraser';
  brushSize: number;
  color: string;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
}

export type FilterType = 
  'none' | 'grayscale' | 'sepia' | 'vintage' | 'retro' | 'vivid' | 'cool' | 'warm' | 
  'haze' | 'nightvision' | 'dramatic' | 'clarendon' | 'noir' | 'chrome' | 'fade' | 
  'gingham' | 'lofi' | 'toaster' | 'valencia' | 'xpro2';

export interface ClippingPath {
  points: Array<{x: number, y: number}>;
  isClosed: boolean;
}

export interface EditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
  scale: { x: number; y: number };
  skew: { x: number; y: number };
  perspective: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
  flip: { horizontal: boolean; vertical: boolean };
  position: { x: number; y: number };
  isFlippedX: boolean;
  isFlippedY: boolean;
  aspectRatio: AspectRatio;
  exposure: number;
  highlights: number;
  shadows: number;
  temperature: number;
  sharpness: number;
  background: {
    enabled: boolean;
    color: string;
    type: 'none' | 'color' | 'transparent' | 'checkerboard';
    padding: number; // percentage of padding around transformed image
  };
  filter: FilterType;
  filterIntensity: number;
  drawing: {
    enabled: boolean;
    paths: Array<{
      points: Array<{x: number, y: number, pressure?: number}>;
      options: DrawingOptions;
    }>;
    currentOptions: DrawingOptions;
  };
  clipping: {
    enabled: boolean;
    paths: ClippingPath[];
    currentPath: ClippingPath | null;
  };
} 
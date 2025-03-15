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
export type EditorTab = 'adjust' | 'transform' | 'crop';

export interface ImageEditHistory {
  originalImageUrl: string;  // URL to original image
  editorState: EditorState;
  timestamp: number;
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
} 
import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FiX, FiRotateCw, FiRotateCcw, FiCheck,
  FiCrop, FiMaximize2, FiSave, FiMove,
  FiZoomIn, FiZoomOut, FiSun, FiSliders,
  FiImage, FiRefreshCw
} from 'react-icons/fi';

interface ImageEditModalProps {
  image: File;
  onClose: () => void;
  onSave: (editedImage: Blob) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AspectRatio = '1:1' | '4:3' | '16:9' | '3:2' | 'free';

export default function ImageEditModal({ image, onClose, onSave }: ImageEditModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cropRef = useRef<HTMLDivElement>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sharpness, setSharpness] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFlippedX, setIsFlippedX] = useState(false);
  const [isFlippedY, setIsFlippedY] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'adjust' | 'transform' | 'crop'>('adjust');
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('free');
  const cropStartPos = useRef<{ x: number; y: number } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalValues, setOriginalValues] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0,
    isFlippedX: false,
    isFlippedY: false
  });

  useEffect(() => {
    const img = new Image();
    img.src = URL.createObjectURL(image);
    img.onload = () => {
      setImageObj(img);
      setOriginalImage(img);
      initCanvas(img);
      setOriginalValues({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        rotation: 0,
        isFlippedX: false,
        isFlippedY: false
      });
    };
    return () => URL.revokeObjectURL(img.src);
  }, [image]);

  const initCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Initial render
    renderImage();
  }, []);

  const renderImage = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageObj) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Set the origin to center for transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply flips
    ctx.scale(isFlippedX ? -1 : 1, isFlippedY ? -1 : 1);

    // Draw image centered
    ctx.drawImage(
      imageObj,
      -imageObj.width / 2,
      -imageObj.height / 2,
      imageObj.width,
      imageObj.height
    );

    // Restore context state
    ctx.restore();

    // Apply filters
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyFilters(imageData);
    ctx.putImageData(imageData, 0, 0);

    // Draw crop overlay
    if (isCropping && cropArea) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
    }
  }, [imageObj, rotation, isFlippedX, isFlippedY, brightness, contrast, saturation]);

  // Update canvas when parameters change
  useEffect(() => {
    renderImage();
  }, [renderImage]);

  const applyFilters = (imageData: ImageData) => {
    const data = imageData.data;
    const brightnessF = brightness / 100;
    const contrastF = (contrast / 100) ** 2;
    const saturationF = saturation / 100;

    for (let i = 0; i < data.length; i += 4) {
      // Get RGB values
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Apply brightness
      r *= brightnessF;
      g *= brightnessF;
      b *= brightnessF;

      // Apply contrast
      r = ((r / 255 - 0.5) * contrastF + 0.5) * 255;
      g = ((g / 255 - 0.5) * contrastF + 0.5) * 255;
      b = ((b / 255 - 0.5) * contrastF + 0.5) * 255;

      // Apply saturation
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      r = gray + saturationF * (r - gray);
      g = gray + saturationF * (g - gray);
      b = gray + saturationF * (b - gray);

      // Clamp values
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
  };

  const startCrop = () => {
    setIsCropping(true);
    if (canvasRef.current && imageObj) {
      const canvas = canvasRef.current;
      const ratio = getAspectRatioValues(aspectRatio);
      
      let width = canvas.width * 0.8;
      let height = ratio ? width / ratio : canvas.height * 0.8;
      
      setCropArea({
        x: (canvas.width - width) / 2,
        y: (canvas.height - height) / 2,
        width,
        height
      });
    }
  };

  const getAspectRatioValues = (ratio: AspectRatio): number | null => {
    switch (ratio) {
      case '1:1': return 1;
      case '4:3': return 4/3;
      case '16:9': return 16/9;
      case '3:2': return 3/2;
      case 'free': return null;
      default: return null;
    }
  };

  const applyCrop = async () => {
    if (!cropArea || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropArea.width;
    croppedCanvas.height = cropArea.height;
    const croppedCtx = croppedCanvas.getContext('2d');
    if (!croppedCtx) return;

    croppedCtx.drawImage(
      canvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );

    const newImage = new Image();
    newImage.src = croppedCanvas.toDataURL();
    await new Promise(resolve => newImage.onload = resolve);

    setImageObj(newImage);
    setIsCropping(false);
    setCropArea(null);
    renderImage();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/jpeg', 0.95);
      });
      
      onSave(blob);
    } catch (error) {
      console.error('Error saving image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (originalImage) {
      setImageObj(originalImage);
      setBrightness(originalValues.brightness);
      setContrast(originalValues.contrast);
      setSaturation(originalValues.saturation);
      setRotation(originalValues.rotation);
      setIsFlippedX(originalValues.isFlippedX);
      setIsFlippedY(originalValues.isFlippedY);
      setIsCropping(false);
      setCropArea(null);
    }
  };

  const handleCropMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCropping || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    cropStartPos.current = { x, y };
    setIsDraggingCrop(true);
    
    // Initialize crop area
    setCropArea({
      x,
      y,
      width: 0,
      height: 0
    });
  };

  const handleCropMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCrop || !cropStartPos.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;
    
    let width = currentX - cropStartPos.current.x;
    let height = currentY - cropStartPos.current.y;

    // Maintain aspect ratio if needed
    if (aspectRatio !== 'free') {
      const ratio = getAspectRatioValues(aspectRatio) || 1;
      height = width / ratio;
    }

    setCropArea({
      x: cropStartPos.current.x,
      y: cropStartPos.current.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
    cropStartPos.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">Edit Ima fge</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas Container */}
          <div className="flex-1 relative bg-gray-50 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full m-auto"
              onMouseDown={isCropping ? handleCropMouseDown : undefined}
              onMouseMove={isCropping ? handleCropMouseMove : undefined}
              onMouseUp={isCropping ? handleCropMouseUp : undefined}
              onMouseLeave={isCropping ? handleCropMouseUp : undefined}
              style={{ cursor: isCropping ? 'crosshair' : 'default' }}
            />
          </div>

          {/* Controls Sidebar */}
          <div className="w-80 border-l flex flex-col bg-white">
            {/* Tabs */}
            <div className="p-4 border-b flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('adjust')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 
                    ${activeTab === 'adjust' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <FiSliders className="w-5 h-5" />
                  Adjust
                </button>
                <button
                  onClick={() => setActiveTab('transform')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2
                    ${activeTab === 'transform' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <FiMove className="w-5 h-5" />
                  Transform
                </button>
                <button
                  onClick={() => setActiveTab('crop')}
                  className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2
                    ${activeTab === 'crop' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <FiCrop className="w-5 h-5" />
                  Crop
                </button>
              </div>
              <button
                onClick={handleReset}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Reset All Changes"
              >
                <FiRefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* Controls Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeTab === 'adjust' && (
                <>
                  <div className="space-y-4">
                    {/* Brightness Control */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Brightness: {brightness}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Contrast Control */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Contrast: {contrast}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Saturation Control */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Saturation: {saturation}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    {/* Sharpness Control */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Sharpness: {sharpness}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sharpness}
                        onChange={(e) => setSharpness(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'transform' && (
                <>
                  {/* Rotation Controls */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium mb-2">Rotation & Flip</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setRotation(r => (r - 90) % 360)}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        <FiRotateCcw className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => setRotation(r => (r + 90) % 360)}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        <FiRotateCw className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => setIsFlippedX(!isFlippedX)}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        <FiRefreshCw className="w-5 h-5 mx-auto transform rotate-90" />
                      </button>
                      <button
                        onClick={() => setIsFlippedY(!isFlippedY)}
                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        <FiRefreshCw className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'crop' && (
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['free', '1:1', '4:3', '16:9', '3:2'] as AspectRatio[]).map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio)}
                          className={`p-2 rounded ${
                            aspectRatio === ratio 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsCropping(true)}
                      className={`flex-1 p-2 rounded-lg ${
                        isCropping 
                          ? 'bg-gray-200 text-gray-700' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                      disabled={isCropping}
                    >
                      {isCropping ? 'Drawing Crop' : 'Start Crop'}
                    </button>
                    {isCropping && (
                      <>
                        <button
                          onClick={() => {
                            setIsCropping(false);
                            setCropArea(null);
                          }}
                          className="flex-1 p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={applyCrop}
                          className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          disabled={!cropArea || !cropArea.width || !cropArea.height}
                        >
                          Apply
                        </button>
                      </>
                    )}
                  </div>
                  
                  {isCropping && (
                    <p className="text-sm text-gray-600">
                      Click and drag on the image to select crop area
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t">
              <button
                onClick={handleSave}
                disabled={isProcessing}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                         flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="w-5 h-5" />
                {isProcessing ? 'Processing...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for color conversion
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

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
} 
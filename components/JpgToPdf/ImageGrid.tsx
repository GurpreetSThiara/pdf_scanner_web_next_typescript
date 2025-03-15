import { FiMove } from 'react-icons/fi';
import ImageGridItem from './ImageGridItem';

interface ImageGridProps {
  files: File[];
  draggedIndex: number | null;
  dragOverIndex: number | null;
  orientation: 'portrait' | 'landscape';
  onOrientationChange: (orientation: 'portrait' | 'landscape') => void;
  onImageClick: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDeleteFile: (index: number) => void;
}

export default function ImageGrid({
  files,
  draggedIndex,
  dragOverIndex,
  orientation,
  onOrientationChange,
  onImageClick,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragEnd,
  onDragLeave,
  onDeleteFile,
}: ImageGridProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Arrange Images</h2>
        <div className="flex items-center space-x-2">
          <label htmlFor="orientation" className="text-sm text-gray-600">Orientation:</label>
          <select
            id="orientation"
            value={orientation}
            onChange={(e) => onOrientationChange(e.target.value as 'portrait' | 'landscape')}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            aria-label="Select PDF orientation"
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        <FiMove className="inline mr-1" /> Drag and drop to reorder images
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file, index) => (
          <ImageGridItem
            key={`${file.name}-${index}`}
            file={file}
            index={index}
            draggedIndex={draggedIndex}
            dragOverIndex={dragOverIndex}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragEnd={onDragEnd}
            onDragLeave={onDragLeave}
            onClick={() => onImageClick(index)}
            onDelete={() => onDeleteFile(index)}
          />
        ))}
      </div>
    </div>
  );
} 
import Image from 'next/image';
import { useState } from 'react';
import ConfirmationModal from '../common/ConfirmationModal';

interface ImageGridItemProps {
  file: File;
  index: number;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onClick: () => void;
  onDelete?: () => void;
}

export default function ImageGridItem({
  file,
  index,
  draggedIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragEnd,
  onDragLeave,
  onClick,
  onDelete,
}: ImageGridItemProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, index)}
        onDragOver={onDragOver}
        onDragEnter={() => onDragEnter(index)}
        onDragEnd={onDragEnd}
        onDragLeave={onDragLeave}
        onClick={onClick}
        className={`
          relative border-2 rounded-lg overflow-hidden cursor-pointer
          transition-all duration-200 ease-in-out
          ${draggedIndex === index ? 'opacity-50 scale-105 shadow-xl z-50' : ''}
          ${dragOverIndex === index ? 'border-blue-500 scale-102.5' : 'border-gray-200'}
          ${dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-blue-300 ring-opacity-50' : ''}
          hover:shadow-lg hover:border-gray-300
          group
        `}
      >
        <div className="aspect-square relative w-full">
          <Image
            src={URL.createObjectURL(file)}
            alt={`Preview ${index + 1}`}
            fill
            sizes="(max-width: 640px) 50vw,
                   (max-width: 768px) 33vw,
                   (max-width: 1024px) 25vw,
                   16vw"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            priority={index < 4} // Load first 4 images immediately
          />
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
            {index + 1}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p className="text-white text-xs truncate">
              {file.name}
            </p>
          </div>
          {dragOverIndex === index && draggedIndex !== index && (
            <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg" />
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="absolute top-2 right-2 p-2.5 rounded-full bg-red-500/90 hover:bg-red-600 
                       text-white opacity-0 group-hover:opacity-100 sm:opacity-0 
                       transition-opacity duration-200 z-10 touch-none"
              aria-label="Delete image"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => onDelete?.()}
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
      />
    </>
  );
} 
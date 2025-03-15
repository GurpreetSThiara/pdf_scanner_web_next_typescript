import Image from 'next/image';
import React from 'react';

interface ExtractedImagesProps {
  images: string[];  // Now using data URLs instead of Blobs
  onImageSelect: (imageUrl: string) => void;
  onReset: () => void;
}

export default function ExtractedImages({ images, onImageSelect, onReset }: ExtractedImagesProps) {
  console.log(images[0]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="relative group aspect-square border rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => onImageSelect(imageUrl)}
          >
             <img key={index} src={URL.createObjectURL(imageUrl)} alt={`Image ${index}`} width={300} height={200} />
            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Upload Another PDF
        </button>
      </div>
    </div>
  );
} 
'use client';
import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { NextSeo } from 'next-seo';
// import ImageEditModal from '@/components/ImageEditor/ImageEditModal';
import PdfPreview from '@/components/PdfEditor/PdfPreview';
import ImageGrid from '@/components/JpgToPdf/ImageGrid';
// import { convertPdfToImages } from '@/services/pdfService';

const SEO_DESCRIPTION = 'Free online PDF editor that allows you to edit, rearrange, and customize PDF pages as images. Convert PDF to editable images, modify them, and create a new PDF. No registration required.';
const SEO_KEYWORDS = 'pdf editor, pdf to image, image to pdf, pdf page editor, online pdf editor, free pdf editor, pdf manipulation, pdf tools';

export default function PdfEditorPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // try {
    //   setIsProcessing(true);
    //   setPdfFile(file);
    //   const imageBlobs = await convertPdfToImages(file);
    //   const imageFiles = imageBlobs.map((blob, index) => 
    //     new File([blob], `page-${index + 1}.png`, { type: 'image/png' })
    //   );
    //   setImages(imageFiles);
    // } catch (error) {
    //   console.error('Error processing PDF:', error);
    // } finally {
    //   setIsProcessing(false);
    // }
  };

  const handleImageClick = (index: number) => {
    setSelectedImage(images[index]);
    setIsEditModalOpen(true);
  };

  const handleDeleteFile = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (draggedIndex !== null && dragOverIndex !== null) {
      const newImages = [...images];
      const [draggedImage] = newImages.splice(draggedIndex, 1);
      newImages.splice(dragOverIndex, 0, draggedImage);
      setImages(newImages);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveEditedImage = async (editedImageBlob: Blob) => {
    if (!pdfFile || !selectedImage) return;
    
    try {
      // Create a new File from the edited blob
      const editedFile = new File([editedImageBlob], selectedImage.name, {
        type: 'image/png'
      });

      // Update the images array by replacing the edited image
      setImages(prevImages => 
        prevImages.map(image => 
          image === selectedImage ? editedFile : image
        )
      );
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving edited image:', error);
    }
  };

  const handleAddImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files).map((file, index) => 
      new File([file], `additional-${Date.now()}-${index}${getExtension(file.type)}`, { 
        type: file.type 
      })
    );
    
    setImages(prev => [...prev, ...newFiles]);
  };

  const getExtension = (mimeType: string) => {
    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
      case 'image/bmp':
        return '.bmp';
      case 'image/tiff':
        return '.tiff';
      case 'image/svg+xml':
        return '.svg';
      default:
        // Extract extension from mime type or fallback to jpg
        const ext = mimeType.split('/')[1];
        return ext ? `.${ext}` : '.jpg';
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      
      // Add each image to a new page
      for (const file of images) {
        // Convert any image format to PNG using canvas
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
        
        // Set canvas size to match original image
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Convert to PNG for embedding
        const pngData = await new Promise<Uint8Array>((resolve) => {
          canvas.toBlob(async (blob) => {
            if (!blob) {
              throw new Error('Failed to convert image to PNG');
            }
            const arrayBuffer = await blob.arrayBuffer();
            resolve(new Uint8Array(arrayBuffer));
          }, 'image/png', 1.0);
        });
        
        URL.revokeObjectURL(img.src);
        
        try {
          // Create a page with the same dimensions as the image
          const page = pdfDoc.addPage([img.width, img.height]);
          const image = await pdfDoc.embedPng(pngData);
          
          // Draw image at full size
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: img.width,
            height: img.height
          });
        } catch (embedError) {
          console.error('Error embedding image:', embedError);
          // Try as JPEG if PNG fails
          const page = pdfDoc.addPage([img.width, img.height]);
          const image = await pdfDoc.embedJpg(pngData);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: img.width,
            height: img.height
          });
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'edited-document.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating PDF:', error);
    }
  };

  return (
    <>
      <NextSeo
        title="PDF Image Editor - Edit PDF Pages as Images | Free Online Tool"
        description={SEO_DESCRIPTION}
        canonical="https://yourdomain.com/pdf-editor"
        openGraph={{
          url: 'https://yourdomain.com/pdf-editor',
          title: 'PDF Image Editor - Edit PDF Pages as Images',
          description: SEO_DESCRIPTION,
          images: [
            {
              url: 'https://yourdomain.com/og-image-pdf-editor.jpg',
              width: 1200,
              height: 630,
              alt: 'PDF Image Editor Interface',
            }
          ],
          siteName: 'Your Site Name',
        }}
        twitter={{
          handle: '@yourhandle',
          site: '@yoursite',
          cardType: 'summary_large_image',
        }}
        additionalMetaTags={[
          {
            name: 'keywords',
            content: SEO_KEYWORDS
          },
          {
            name: 'application-name',
            content: 'PDF Image Editor'
          }
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-4">PDF Image Editor</h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Edit your PDF files by converting pages to images. Modify, rearrange, or enhance individual pages, 
            then combine them back into a PDF. Free and easy to use!
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Features:</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Convert PDF pages to editable images
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Edit individual pages with built-in image editor
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Rearrange pages with drag and drop
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Add new images to your PDF
              </li>
            </ul>
          </div>

          {images.length === 0 ? (
            <PdfPreview onDrop={onDrop} isProcessing={isProcessing} />
          ) : (
            <div>
              <ImageGrid
                files={images}
                draggedIndex={draggedIndex}
                dragOverIndex={dragOverIndex}
                orientation={orientation}
                onOrientationChange={setOrientation}
                onImageClick={handleImageClick}
                onDragStart={handleDragStart}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={handleDragEnter}
                onDragEnd={handleDragEnd}
                onDragLeave={(e) => e.preventDefault()}
                onDeleteFile={handleDeleteFile}
              />
              <div className="flex justify-between mt-4">
                <div className="space-x-4">
                  <label 
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                  >
                    Add Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAddImages}
                      className="hidden"
                    />
                  </label>
                  <button
                    onClick={() => {
                      setPdfFile(null);
                      setImages([]);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Upload Another PDF
                  </button>
                </div>
                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Download PDF
                </button>
              </div>
            </div>
          )}

          {/* {isEditModalOpen && (
            <ImageEditModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              image={selectedImage}
              onSave={handleSaveEditedImage}
            />
          )} */}

          <div className="mt-12 prose prose-sm max-w-none">
            <h2 className="text-xl font-semibold mb-4">How to Use:</h2>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Drop your PDF file in the upload area or click to select a file</li>
              <li>Wait for the PDF pages to be converted to images</li>
              <li>Click on any image to edit it using our built-in editor</li>
              <li>Drag and drop images to rearrange pages</li>
              <li>Add more images if needed using the "Add Images" button</li>
              <li>Click "Download PDF" to save your edited document</li>
            </ol>

            <h2 className="text-xl font-semibold mt-8 mb-4">Privacy & Security</h2>
            <p className="text-gray-700">
              Your files are processed entirely in your browser. We don't store or transmit your documents 
              to any server, ensuring complete privacy and security of your data.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 
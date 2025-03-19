import ImageInput from '@/components/ImageToText/ImageInput'
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Image to Text Converter | OCR Scanner & Text Extractor',
  description: 'Convert image to text instantly with our free OCR scanner. Extract text from images, pictures, PDFs & scanned documents. Support for multiple languages with high accuracy text recognition.',
  keywords: 'image to text, pic to text, text from image, optical character reader, text recognition ocr, ocr scanner, picture to text converter, scan and ocr, text scanner, copy text from image, image text to text converter, scanned pdf to editable pdf',
  openGraph: {
    title: 'Free Image to Text Converter | Extract Text from Images Instantly',
    description: 'Convert any image, picture, or scanned document to editable text. Free online OCR scanner with support for multiple languages and high accuracy text recognition.',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Image to Text Converter - Extract Text from Images',
      },
    ],
    siteName: 'Image to Text Converter',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image to Text Converter | OCR Scanner Online',
    description: 'Convert images to editable text instantly. Extract text from pictures, PDFs & scanned documents with our free OCR scanner.',
  },
  alternates: {
    canonical: 'https://your-domain.com/image-to-text'
  }
}

const ImageToText = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Image to Text Converter
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Extract text from images, pictures, and scanned PDFs instantly. Free online OCR scanner with support for multiple languages.
          </p>
        </div>
        
        <ImageInput />
        
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How Our Image to Text Converter Works</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">1. Upload Your Image</h3>
              <p className="mt-2 text-gray-600">Simply drag and drop or select any image, picture, or scanned PDF. We support PNG, JPG, GIF, and PDF formats.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">2. Advanced OCR Processing</h3>
              <p className="mt-2 text-gray-600">Our optical character recognition (OCR) technology accurately extracts text from your images with real-time confidence scoring.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">3. Copy & Edit Text</h3>
              <p className="mt-2 text-gray-600">Get editable text instantly. Copy, edit, or save the extracted text with confidence scores for each word.</p>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Our Image to Text Converter?</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Free & Easy to Use</h3>
              <p className="mt-2 text-gray-600">No registration required. Just upload your image and get text instantly.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Multiple Formats</h3>
              <p className="mt-2 text-gray-600">Convert text from images, pictures, scanned PDFs, and documents.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">High Accuracy</h3>
              <p className="mt-2 text-gray-600">Advanced OCR technology ensures precise text recognition with confidence scoring.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Multi-Language Support</h3>
              <p className="mt-2 text-gray-600">Extract text in multiple languages from any image or document.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageToText
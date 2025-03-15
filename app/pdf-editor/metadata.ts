import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Image Editor - Edit PDF Pages as Images | Free Online Tool',
  description: 'Free online PDF editor that allows you to edit, rearrange, and customize PDF pages as images. Convert PDF to editable images, modify them, and create a new PDF. No registration required.',
  keywords: 'pdf editor, pdf to image, image to pdf, pdf page editor, online pdf editor, free pdf editor, pdf manipulation, pdf tools',
  openGraph: {
    title: 'PDF Image Editor - Edit PDF Pages as Images',
    description: 'Free online PDF editor that allows you to edit, rearrange, and customize PDF pages as images.',
    url: 'https://yourdomain.com/pdf-editor',
    siteName: 'Your Site Name',
    images: [
      {
        url: 'https://yourdomain.com/og-image-pdf-editor.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PDF Image Editor - Edit PDF Pages as Images',
    description: 'Free online PDF editor that allows you to edit, rearrange, and customize PDF pages as images.',
    creator: '@yourhandle',
    images: ['https://yourdomain.com/og-image-pdf-editor.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}; 
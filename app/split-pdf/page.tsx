import { Metadata } from 'next'
import PDFSplitter from '../../components/PDFSplitter/PDFSplitter'
import { FiFileText, FiGrid, FiCopy, FiBookmark, FiHardDrive, FiEye, FiEdit, FiLayers, FiLock } from 'react-icons/fi'

export const metadata: Metadata = {
  title: 'Split PDF Files Online | Free PDF Splitter Tool',
  description: 'Free online PDF splitter tool. Split PDF by page range, extract pages, split by size or bookmarks. No registration required, instant download, 100% secure.',
  keywords: [
    'pdf splitter',
    'split pdf',
    'pdf tools',
    'extract pdf pages',
    'pdf editor',
    'online pdf splitter',
    'pdf manipulation',
    'document management',
    'pdf to jpg',
    'pdf to png',
    'free pdf tools',
    'split pdf online',
    'pdf page extractor',
    'pdf separator',
    'batch pdf processing'
  ].join(', '),
  alternates: {
    canonical: 'https://yourwebsite.com/split-pdf'
  },
  openGraph: {
    title: 'Split PDF Files Online | Free PDF Splitter Tool',
    description: 'Split PDF files by page range, fixed intervals, bookmarks, or file size. Free online PDF splitter with preview and batch processing.',
    type: 'website',
    locale: 'en_US',
    url: 'https://yourwebsite.com/split-pdf',
    siteName: 'PDF Scanner Web',
    images: [
      {
        url: '/og-image-pdf-splitter.jpg',
        width: 1200,
        height: 630,
        alt: 'PDF Splitter Tool Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online PDF Splitter Tool',
    description: 'Split PDF files by page range, fixed intervals, bookmarks, or file size. Free online PDF splitter with preview and batch processing.',
    site: '@yourwebsite',
    creator: '@yourwebsite'
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    bing: 'your-bing-verification-code'
  }
}

// JSON-LD Structured Data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'PDF Splitter Online',
  applicationCategory: 'WebApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD'
  },
  description: 'Free online PDF splitter tool. Split PDF by page range, extract pages, split by size or bookmarks.',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250'
  }
}

export default function SplitPDFPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <main className="min-h-screen bg-gray-50">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900">
              Split PDF Files Online - Free PDF Splitter Tool
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Easily split, extract, and manage PDF pages with our powerful PDF splitting tool. 
              100% free, secure, and no registration required.
            </p>
            {/* Breadcrumbs for SEO */}
            <nav className="flex justify-center mt-4 text-sm text-gray-500" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li><a href="/" className="hover:text-blue-600">Home</a></li>
                <li><span className="mx-2">/</span></li>
                <li><a href="/tools" className="hover:text-blue-600">PDF Tools</a></li>
                <li><span className="mx-2">/</span></li>
                <li className="text-blue-600">Split PDF</li>
              </ol>
            </nav>
          </section>

          {/* Features Grid with Schema.org markup */}
          <section className="mb-12" aria-labelledby="features-heading">
            <h2 id="features-heading" className="sr-only">PDF Splitter Features</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article 
                  key={feature.title}
                  className="p-6 transition-shadow bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md"
                  itemScope
                  itemType="https://schema.org/ItemList"
                >
                  <feature.Icon className="w-8 h-8 mb-4 text-blue-500" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900" itemProp="name">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600" itemProp="description">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Main PDF Splitter Component */}
          <section className="p-6 mb-12 bg-white shadow-lg rounded-xl" aria-label="PDF Splitter Tool">
            <PDFSplitter />
          </section>

          {/* FAQ Section with Schema.org markup */}
          <section className="mt-16" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="mb-8 text-3xl font-bold text-center text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="grid max-w-4xl gap-6 mx-auto" itemScope itemType="https://schema.org/FAQPage">
              {faqs.map((faq) => (
                <div 
                  key={faq.question} 
                  className="p-6 bg-white rounded-lg shadow-sm"
                  itemScope 
                  itemProp="mainEntity" 
                  itemType="https://schema.org/Question"
                >
                  <h3 className="mb-2 text-lg font-semibold text-gray-900" itemProp="name">
                    {faq.question}
                  </h3>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <p className="text-gray-600" itemProp="text">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Additional Content for SEO */}
          <section className="max-w-4xl mx-auto mt-16 prose prose-blue">
            <h2>Why Choose Our PDF Splitter Tool?</h2>
            <p>
              Our free online PDF splitter tool provides a secure and efficient way to split PDF documents.
              Whether you need to extract specific pages, split by intervals, or divide based on file size,
              our tool handles it all with ease. No registration required, and your files are processed
              entirely in your browser for maximum security.
            </p>
            
            <h3>Key Benefits:</h3>
            <ul>
              <li>100% Free - No hidden costs or premium features</li>
              <li>Secure Processing - Files never leave your browser</li>
              <li>No Registration - Start splitting PDFs instantly</li>
              <li>Multiple Split Methods - Flexible options for all needs</li>
              <li>Batch Processing - Handle multiple PDFs at once</li>
              <li>Preview Feature - See pages before splitting</li>
              <li>Multiple Output Formats - Save as PDF, JPG, or PNG</li>
            </ul>

            <h3>How to Split a PDF File:</h3>
            <ol>
              <li>Upload your PDF file using drag & drop or file selection</li>
              <li>Choose your preferred splitting method</li>
              <li>Preview the pages and adjust settings as needed</li>
              <li>Click "Split PDF" and download your files</li>
            </ol>
          </section>
        </div>
      </main>
    </>
  )
}

const features = [
  {
    title: 'Split by Page Range',
    description: 'Select specific page ranges to extract into new PDF files',
    Icon: FiFileText
  },
  {
    title: 'Fixed Intervals',
    description: 'Automatically split your PDF after every X number of pages',
    Icon: FiGrid
  },
  {
    title: 'Extract Pages',
    description: 'Choose individual pages to extract into separate files',
    Icon: FiCopy
  },
  {
    title: 'Bookmark-based Split',
    description: 'Split PDFs based on bookmark hierarchy and sections',
    Icon: FiBookmark
  },
  {
    title: 'Size-based Split',
    description: 'Divide large PDFs into smaller files of specific sizes',
    Icon: FiHardDrive
  },
  {
    title: 'Preview & Batch',
    description: 'Preview pages before splitting and process multiple PDFs',
    Icon: FiEye
  },
  {
    title: 'Custom Naming',
    description: 'Set custom names for output files or use auto-generation',
    Icon: FiEdit
  },
  {
    title: 'Multiple Formats',
    description: 'Save split files as PDFs, images (JPG, PNG), or other formats',
    Icon: FiLayers
  },
  {
    title: 'Secure Processing',
    description: 'All processing happens in your browser for maximum privacy',
    Icon: FiLock
  }
]

const faqs = [
  {
    question: 'How do I split a PDF file into multiple parts?',
    answer: 'Upload your PDF, choose your preferred splitting method (page range, intervals, or specific pages), preview the results, and download your split PDFs. The process is completely free and secure.'
  },
  {
    question: 'Can I split multiple PDF files at once?',
    answer: 'Yes! Our batch processing feature allows you to split multiple PDF files simultaneously, saving you time and effort.'
  },
  {
    question: 'Is there a file size limit for splitting PDFs?',
    answer: 'We support PDFs up to 100MB in size. For larger files, you can use our size-based splitting feature to break them down into smaller, manageable parts.'
  },
  {
    question: 'Are my PDF files secure when using this tool?',
    answer: 'Absolutely! All processing happens directly in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security.'
  },
  {
    question: 'What output formats are supported?',
    answer: 'You can save split files as PDFs, JPG images, PNG images, or combine them into new PDFs. Each format maintains the original quality of your document.'
  }
]

import { Metadata } from 'next'
import Link from 'next/link'
import { FiFileText, FiScissors, FiImage, FiRotateCw, FiLock, FiDownload, FiSearch, FiEdit } from 'react-icons/fi'

export const metadata: Metadata = {
  title: 'PDF Tools - Free Online PDF Editor & Converter | PDF Scanner Web',
  description: 'Access our complete suite of free online PDF tools. Edit, split, compress, convert PDFs and more. No registration required, 100% secure browser-based processing.',
  keywords: [
    'pdf tools',
    'online pdf editor',
    'pdf converter',
    'pdf splitter',
    'pdf compressor',
    'pdf to image',
    'image to pdf',
    'pdf scanner',
    'ocr pdf',
    'free pdf tools',
    'secure pdf editor',
    'browser pdf tools',
    'pdf manipulation',
    'document processing'
  ].join(', '),
  alternates: {
    canonical: 'https://yourwebsite.com/tools'
  },
  openGraph: {
    title: 'PDF Tools - Free Online PDF Editor & Converter',
    description: 'Complete suite of free online PDF tools. Edit, split, compress, and convert PDFs securely in your browser.',
    type: 'website',
    url: 'https://yourwebsite.com/tools',
    siteName: 'PDF Scanner Web',
    images: [
      {
        url: '/og-image-tools.jpg',
        width: 1200,
        height: 630,
        alt: 'PDF Tools Suite',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online PDF Tools Suite',
    description: 'Complete collection of free online PDF tools for all your document needs.',
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
  }
}

const tools = [
    {
      title: 'Split PDF',
      description: 'Split PDF files into multiple documents or extract specific pages',
      href: '/split-pdf',
      icon: FiScissors,
      features: [
        'Split by page range or intervals',
        'Extract specific pages',
        'Split by bookmarks',
        'Batch processing support',
        'Preview before splitting'
      ]
    },
    {
      title: 'PDF to Image',
      description: 'Convert PDF pages to high-quality images in various formats',
      href: '/pdf-to-image',
      icon: FiImage,
      features: [
        'Convert to JPG, PNG, or TIFF',
        'Adjust image quality',
        'Batch conversion',
        'Custom DPI settings',
        'Preview conversion'
      ]
    },
    {
      title: 'Image to PDF',
      description: 'Convert images to PDF documents with customizable settings',
      href: '/image-to-pdf',
      icon: FiFileText,
      features: [
        'Support for multiple image formats',
        'Maintain image quality',
        'Custom page sizes',
        'Batch conversion',
        'Page orientation options'
      ]
    },
    {
      title: 'Rotate PDF',
      description: 'Rotate PDF pages individually or the entire document',
      href: '/rotate-pdf',
      icon: FiRotateCw,
      features: [
        'Rotate individual pages',
        'Batch rotation',
        'Preview changes',
        'Save rotation permanently',
        'Multiple angle options'
      ]
    },
    {
      title: 'PDF Scanner',
      description: 'Scan documents and convert them to searchable PDFs',
      href: '/pdf-scanner',
      icon: FiSearch,
      features: [
        'OCR technology',
        'Multiple language support',
        'Adjustable scan quality',
        'Auto-enhancement',
        'Batch scanning'
      ]
    },
    {
      title: 'PDF Editor',
      description: 'Edit PDF content, add text, images, and annotations',
      href: '/pdf-editor',
      icon: FiEdit,
      features: [
        'Text editing',
        'Add images',
        'Annotations',
        'Form filling',
        'Page management'
      ]
    }
  ]
  

// JSON-LD Structured Data
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'PDF Tools Suite',
  description: 'Complete collection of free online PDF tools',
  numberOfItems: 8,
  itemListElement: tools.map((tool, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: tool.title,
    description: tool.description,
    url: `https://yourwebsite.com${tool.href}`
  }))
}

export default function ToolsPage() {
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
              Free Online PDF Tools
            </h1>
            <p className="max-w-3xl mx-auto text-xl text-gray-600">
              Complete suite of powerful PDF tools to edit, convert, and manage your documents.
              100% free, secure browser-based processing with no registration required.
            </p>
            {/* Breadcrumbs */}
            <nav className="flex justify-center mt-4 text-sm text-gray-500" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li><Link href="/" className="hover:text-blue-600">Home</Link></li>
                <li><span className="mx-2">/</span></li>
                <li className="text-blue-600">PDF Tools</li>
              </ol>
            </nav>
          </section>

          {/* Tools Grid */}
          <section className="mb-16" aria-labelledby="tools-heading">
            <h2 id="tools-heading" className="sr-only">Available PDF Tools</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="relative flex flex-col p-6 transition-all bg-white border border-gray-200 rounded-lg group hover:shadow-lg"
                >
                  <div className="flex items-center mb-4 space-x-3">
                    <div className="p-3 text-white bg-blue-500 rounded-lg">
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{tool.title}</h3>
                  </div>
                  <p className="mb-4 text-gray-600">{tool.description}</p>
                  <ul className="mb-8 ml-6 space-y-2 text-sm text-gray-500 list-disc">
                    {tool.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <div className="flex items-center mt-auto text-blue-600 group-hover:text-blue-700">
                    <span>Try Now</span>
                    <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12 bg-white rounded-lg shadow-sm">
            <div className="px-6">
              <h2 className="mb-8 text-3xl font-bold text-center text-gray-900">Why Choose Our PDF Tools?</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
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
        </div>
      </main>
    </>
  )
}


const benefits = [
  {
    title: '100% Secure',
    description: 'All processing happens in your browser. Your files never leave your device.',
    icon: FiLock
  },
  {
    title: 'No Registration',
    description: 'Start using our tools immediately without creating an account.',
    icon: FiDownload
  },
  {
    title: 'Free Forever',
    description: 'All our tools are completely free with no hidden costs or premium features.',
    icon: FiFileText
  }
]

const faqs = [
  {
    question: 'Are these PDF tools really free?',
    answer: 'Yes! All our PDF tools are completely free to use with no hidden costs or premium features. We believe in providing accessible tools for everyone.'
  },
  {
    question: 'How secure are my documents?',
    answer: 'Your security is our top priority. All processing happens directly in your browser, and your files are never uploaded to our servers. This ensures complete privacy and security of your documents.'
  },
  {
    question: 'Is there a file size limit?',
    answer: 'Most of our tools support files up to 100MB. For larger files, you can use our split tool to break them into smaller parts first.'
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No registration is required! You can start using our tools immediately without creating an account or providing any personal information.'
  },
  {
    question: 'What formats are supported?',
    answer: 'Our tools support a wide range of formats including PDF, JPG, PNG, TIFF, and more. Each tool specifies its supported formats in its description.'
  }
] 
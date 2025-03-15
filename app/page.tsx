import Link from "next/link";
import { FiFileText, FiImage, FiCopy, FiScissors, FiLayers, FiEdit, FiMaximize } from "react-icons/fi";

export default function Home() {
  const featuredTools = [
    {
      id: "jpg-to-pdf",
      name: "JPG to PDF",
      description: "Convert JPG images to PDF documents with ease.",
      icon: FiFileText,
      path: "/jpg-to-pdf",
    },
    {
      id: "pdf-to-jpg",
      name: "PDF to JPG",
      description: "Extract JPG images from PDF documents.",
      icon: FiImage,
      path: "/pdf-to-jpg",
    },
    {
      id: "merge-pdf",
      name: "Merge PDF",
      description: "Combine multiple PDF files into a single document.",
      icon: FiCopy,
      path: "/merge-pdf",
    },
    {
      id: "split-pdf",
      name: "Split PDF",
      description: "Divide a PDF into multiple separate documents.",
      icon: FiScissors,
      path: "/split-pdf",
    },
    {
      id: "rearrange-pdf-pages",
      name: "Rearrange PDF Pages",
      description: "Change the order of pages in your PDF document.",
      icon: FiLayers,
      path: "/rearrange-pdf-pages",
    },
    {
      id: "pdf-editor",
      name: "PDF Editor",
      description: "Add text, annotations, and highlights to your PDF.",
      icon: FiEdit,
      path: "/pdf-editor",
    },
    {
      id: "image-resizer-compressor",
      name: "Image Resizer & Compressor",
      description: "Resize, compress, and optimize your images easily.",
      icon: FiMaximize,
      path: "/image-resizer-compressor",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 text-white bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center md:flex-row">
            <div className="mb-10 md:w-1/2 md:mb-0">
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                Free PDF & Image Conversion Tools
              </h1>
              <p className="mb-8 text-xl text-blue-100">
                Convert, merge, split, and edit PDF files and images online.
                No installation or registration required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/jpg-to-pdf"
                  className="px-6 py-3 font-medium text-blue-700 transition-colors bg-white rounded-lg hover:bg-blue-50"
                >
                  Convert JPG to PDF
                </Link>
                <Link
                  href="/merge-pdf"
                  className="px-6 py-3 font-medium text-white transition-colors bg-transparent border-2 border-white rounded-lg hover:bg-white hover:text-blue-700"
                >
                  Merge PDF Files
                </Link>
              </div>
            </div>
            <div className="flex justify-center md:w-1/2">
              <div className="relative w-full max-w-md">
                <div className="absolute w-64 h-64 transform bg-blue-500 rounded-lg -top-6 -left-6 rotate-6 opacity-30"></div>
                <div className="absolute w-64 h-64 transform bg-indigo-500 rounded-lg -bottom-6 -right-6 -rotate-6 opacity-30"></div>
                <div className="relative p-6 bg-white rounded-lg shadow-xl">
                  <div className="p-4 mb-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 mr-2 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 mr-2 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-center h-40">
                      <FiFileText className="w-20 h-20 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="w-3/4 h-8 bg-gray-200 rounded"></div>
                    <div className="w-1/5 h-8 bg-blue-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center">
            Our PDF & Image Tools
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                className="p-6 transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg"
              >
                <div className="flex items-start">
                  <div className="p-3 mr-4 bg-blue-100 rounded-lg">
                    <tool.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold">{tool.name}</h3>
                    <p className="text-gray-600">{tool.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Upload Files</h3>
              <p className="text-gray-600">
                Select and upload your PDF or image files from your device.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Process Files</h3>
              <p className="text-gray-600">
                Our tools will automatically process your files according to your needs.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">Download Result</h3>
              <p className="text-gray-600">
                Download your converted or edited files instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-3xl font-bold text-center">
            Why Choose Our Tools
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="mb-2 text-xl font-semibold">100% Free</h3>
              <p className="text-gray-600">
                All our tools are completely free to use with no hidden costs.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="mb-2 text-xl font-semibold">No Registration</h3>
              <p className="text-gray-600">
                No need to create an account or provide personal information.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="mb-2 text-xl font-semibold">Secure Processing</h3>
              <p className="text-gray-600">
                All file processing happens in your browser. Files never leave your device.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="mb-2 text-xl font-semibold">High Quality</h3>
              <p className="text-gray-600">
                Our tools maintain the highest possible quality for your files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white bg-blue-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Convert Your Files?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl">
            Try our free PDF and image conversion tools now. No registration required.
          </p>
          <Link
            href="/jpg-to-pdf"
            className="inline-block px-8 py-3 text-lg font-medium text-blue-700 transition-colors bg-white rounded-lg hover:bg-blue-50"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

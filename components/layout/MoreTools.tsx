"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FaBars as Menu, FaTimes as X, FaChevronDown as ChevronDown, FaChevronUp as ChevronUp, FaFileAlt as FileText, FaImages as Images, FaBookOpen as BookOpen, FaQuestionCircle as HelpCircle } from "react-icons/fa";
import { FiLayers as Layers } from "react-icons/fi";


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [moreToolsOpen, setMoreToolsOpen] = useState(false)
  const [mobileMoreToolsOpen, setMobileMoreToolsOpen] = useState(false)
  const pathname = usePathname()

  const moreToolsRef = useRef(null)
  const moreToolsButtonRef = useRef(null)

  const routes = [
    { name: "Home", path: "/" },
    { name: "PDF Editor", path: "/pdf-editor" },
    { name: "JPG to PDF", path: "/jpg-to-pdf" },
    { name: "PNG to PDF", path: "/png-to-pdf" },
    { name: "Merge PDF", path: "/merge-pdf" },
  ]

  const moreTools = {
    editing: [
      { name: "PDF Editor", path: "/pdf-editor", description: "Edit text, images and more in your PDFs" },
      { name: "Rearrange Pages", path: "/rearrange-pdf-pages", description: "Change the order of your PDF pages" },
      { name: "Split PDF", path: "/split-pdf", description: "Divide your PDF into separate documents" },
      { name: "Merge PDF", path: "/merge-pdf", description: "Combine multiple PDFs into one file" },
      { name: "Combine PDF", path: "/combine-pdf", description: "Join PDFs with advanced options" },
    ],
    conversion: [
      { name: "JPG to PDF", path: "/jpg-to-pdf", description: "Convert JPG images to PDF format" },
      { name: "PDF to JPG", path: "/pdf-to-jpg", description: "Extract JPG images from PDF files" },
      { name: "PNG to PDF", path: "/png-to-pdf", description: "Convert PNG images to PDF format" },
      { name: "Image to PDF", path: "/convert-image-to-pdf", description: "Convert any image to PDF" },
      { name: "PDF to Image", path: "/convert-pdf-to-image", description: "Convert PDF pages to images" },
    ],
    resources: [
      { name: "Blog", path: "/blog", description: "Tips and tutorials for working with PDFs" },
      { name: "Tutorials", path: "/tutorials", description: "Step-by-step guides for our tools" },
      { name: "FAQ", path: "/faq", description: "Answers to common questions" },
      { name: "Help Center", path: "/help", description: "Get support for our tools" },
    ],
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        moreToolsRef.current &&
        !moreToolsRef.current.contains(event.target) &&
        moreToolsButtonRef.current &&
        !moreToolsButtonRef.current.contains(event.target)
      ) {
        setMoreToolsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [moreToolsRef])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isMenuOpen])

  // Close dropdown when route changes
  useEffect(() => {
    setMoreToolsOpen(false)
    setIsMenuOpen(false)
  }, [pathname])

  // Handle escape key to close dropdowns
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setMoreToolsOpen(false)
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("keydown", handleEsc)
    return () => {
      window.removeEventListener("keydown", handleEsc)
    }
  }, [])

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <span className="font-bold text-xl text-blue-600">PDF Tools</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:ml-8 md:flex md:space-x-2 lg:space-x-4">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    pathname === route.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                >
                  {route.name}
                </Link>
              ))}
              <div className="relative" ref={moreToolsRef}>
                <button
                  ref={moreToolsButtonRef}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    moreToolsOpen ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                  onClick={() => setMoreToolsOpen(!moreToolsOpen)}
                  aria-expanded={moreToolsOpen}
                  aria-haspopup="true"
                >
                  More Tools
                  {moreToolsOpen ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                </button>

                {/* Desktop Dropdown Panel */}
                {moreToolsOpen && (
                  <>
                    <div
                      className="fixed inset-0 bg-black bg-opacity-25 z-10"
                      aria-hidden="true"
                      onClick={() => setMoreToolsOpen(false)}
                    ></div>
                    <div
                      className="absolute right-0 mt-2 w-screen max-w-7xl transform -translate-x-1/2 left-1/2 bg-white rounded-lg shadow-xl z-20 overflow-hidden transition-all duration-200 ease-out"
                      style={{ maxHeight: "calc(100vh - 80px)" }}
                    >
                      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                          {/* PDF Editing Section */}
                          <div className="space-y-5">
                            <div className="flex items-center space-x-2 text-blue-700">
                              <FileText className="h-5 w-5" />
                              <h3 className="font-semibold text-lg">PDF Editing</h3>
                            </div>
                            <ul className="space-y-3">
                              {moreTools.editing.map((tool) => (
                                <li key={tool.path}>
                                  <Link href={tool.path} className="group block">
                                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {tool.name}
                                    </div>
                                    <div className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                                      {tool.description}
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Conversion Tools Section */}
                          <div className="space-y-5">
                            <div className="flex items-center space-x-2 text-blue-700">
                              <Images className="h-5 w-5" />
                              <h3 className="font-semibold text-lg">Conversion Tools</h3>
                            </div>
                            <ul className="space-y-3">
                              {moreTools.conversion.map((tool) => (
                                <li key={tool.path}>
                                  <Link href={tool.path} className="group block">
                                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {tool.name}
                                    </div>
                                    <div className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                                      {tool.description}
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Resources Section */}
                          <div className="space-y-5">
                            <div className="flex items-center space-x-2 text-blue-700">
                              <BookOpen className="h-5 w-5" />
                              <h3 className="font-semibold text-lg">Resources</h3>
                            </div>
                            <ul className="space-y-3">
                              {moreTools.resources.map((tool) => (
                                <li key={tool.path}>
                                  <Link href={tool.path} className="group block">
                                    <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {tool.name}
                                    </div>
                                    <div className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                                      {tool.description}
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Featured Tool */}
                          <div className="hidden lg:block">
                            <div className="bg-blue-50 rounded-lg p-6 h-full">
                              <div className="flex items-center space-x-2 text-blue-700 mb-4">
                                <Layers className="h-5 w-5" />
                                <h3 className="font-semibold text-lg">Featured Tool</h3>
                              </div>
                              <div className="aspect-w-16 aspect-h-9 mb-4 bg-white rounded-md overflow-hidden">
                                <img
                                  src="/placeholder.svg?height=200&width=300"
                                  alt="PDF Editor showcase"
                                  className="object-cover object-center"
                                />
                              </div>
                              <h4 className="font-medium text-gray-900 mb-2">PDF Editor Pro</h4>
                              <p className="text-sm text-gray-600 mb-4">
                                Our most powerful PDF editing tool with advanced features for professionals.
                              </p>
                              <Link
                                href="/pdf-editor-pro"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                              >
                                Try it now
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            aria-hidden="true"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Menu panel */}
          <div className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl transition ease-in-out duration-300 transform translate-x-0">
            <div className="px-4 pt-5 pb-2 flex">
              <button
                type="button"
                className="-m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Mobile navigation links */}
            <div className="mt-2 px-4 space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    pathname === route.path
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.name}
                </Link>
              ))}

              {/* Mobile More Tools Accordion */}
              <div className="border-t border-gray-200 pt-2">
                <button
                  className="flex w-full items-center justify-between px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  onClick={() => setMobileMoreToolsOpen(!mobileMoreToolsOpen)}
                  aria-expanded={mobileMoreToolsOpen}
                >
                  <span>More Tools</span>
                  {mobileMoreToolsOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>

                {mobileMoreToolsOpen && (
                  <div className="mt-2 space-y-4 px-2">
                    {/* PDF Editing Section */}
                    <div className="rounded-md bg-gray-50 p-3">
                      <div className="flex items-center space-x-2 text-blue-700 mb-2">
                        <FileText className="h-4 w-4" />
                        <h3 className="font-medium">PDF Editing</h3>
                      </div>
                      <ul className="space-y-2 pl-6">
                        {moreTools.editing.map((tool) => (
                          <li key={tool.path}>
                            <Link
                              href={tool.path}
                              className="block py-1 text-gray-700 hover:text-blue-600"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {tool.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Conversion Tools Section */}
                    <div className="rounded-md bg-gray-50 p-3">
                      <div className="flex items-center space-x-2 text-blue-700 mb-2">
                        <Images className="h-4 w-4" />
                        <h3 className="font-medium">Conversion Tools</h3>
                      </div>
                      <ul className="space-y-2 pl-6">
                        {moreTools.conversion.map((tool) => (
                          <li key={tool.path}>
                            <Link
                              href={tool.path}
                              className="block py-1 text-gray-700 hover:text-blue-600"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {tool.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resources Section */}
                    <div className="rounded-md bg-gray-50 p-3">
                      <div className="flex items-center space-x-2 text-blue-700 mb-2">
                        <BookOpen className="h-4 w-4" />
                        <h3 className="font-medium">Resources</h3>
                      </div>
                      <ul className="space-y-2 pl-6">
                        {moreTools.resources.map((tool) => (
                          <li key={tool.path}>
                            <Link
                              href={tool.path}
                              className="block py-1 text-gray-700 hover:text-blue-600"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {tool.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Help section */}
            <div className="border-t border-gray-200 mt-6 px-4 py-6">
              <Link
                href="/contact"
                className="flex items-center text-blue-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <HelpCircle className="h-5 w-5 mr-2" />
                Need help? Contact us
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header


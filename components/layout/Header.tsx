"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX } from "react-icons/fi";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const routes = [
    { name: "Home", path: "/" },
    { name: "JPG to PDF", path: "/jpg-to-pdf" },
    { name: "PDF to JPG", path: "/pdf-to-jpg" },
    { name: "PNG to PDF", path: "/png-to-pdf" },
    { name: "Merge PDF", path: "/merge-pdf" },
    { name: "Split PDF", path: "/split-pdf" },
    { name: "Rearrange PDF Pages", path: "/rearrange-pdf-pages" },
    { name: "Combine PDF", path: "/combine-pdf" },
    { name: "Image to PDF", path: "/convert-image-to-pdf" },
    { name: "PDF to Image", path: "/convert-pdf-to-image" },
    { name: "PDF Editor", path: "/pdf-editor" },
    { name: "Blog", path: "/blog" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            PDF Tools
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            {routes.slice(0, 5).map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === route.path
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {route.name}
              </Link>
            ))}
            <div className="relative group">
              <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                More Tools
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                {routes.slice(5).map((route) => (
                  <Link
                    key={route.path}
                    href={route.path}
                    className={`block px-4 py-2 text-sm ${
                      pathname === route.path
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {route.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 md:hidden">
            <div className="flex flex-col space-y-2">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === route.path
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.name}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header; 
import Link from "next/link";
import { FiGithub, FiTwitter, FiLinkedin } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">PDF Tools</h3>
            <p className="text-gray-300">
              Free online tools to convert, merge, split, and edit PDF files and images.
            </p>
            <div className="flex mt-4 space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FiGithub className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FiTwitter className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">
                <FiLinkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">PDF Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/jpg-to-pdf" className="text-gray-300 hover:text-white">JPG to PDF</Link>
              </li>
              <li>
                <Link href="/pdf-to-jpg" className="text-gray-300 hover:text-white">PDF to JPG</Link>
              </li>
              <li>
                <Link href="/png-to-pdf" className="text-gray-300 hover:text-white">PNG to PDF</Link>
              </li>
              <li>
                <Link href="/merge-pdf" className="text-gray-300 hover:text-white">Merge PDF</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">More Tools</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/split-pdf" className="text-gray-300 hover:text-white">Split PDF</Link>
              </li>
              <li>
                <Link href="/rearrange-pdf-pages" className="text-gray-300 hover:text-white">Rearrange PDF Pages</Link>
              </li>
              <li>
                <Link href="/convert-image-to-pdf" className="text-gray-300 hover:text-white">Image to PDF</Link>
              </li>
              <li>
                <Link href="/pdf-editor" className="text-gray-300 hover:text-white">PDF Editor</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-300 hover:text-white">Terms of Service</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-300">
          <p>&copy; {currentYear} PDF Tools. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
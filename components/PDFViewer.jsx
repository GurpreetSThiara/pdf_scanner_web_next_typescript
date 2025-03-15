import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import pdfjsWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set worker path - using a local worker file for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function PDFViewer({ pdfFile }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const convertPdfToImages = async () => {
    try {
      setLoading(true);
      setError(null);
      setPages([]);

      let pdfData;
      if (typeof pdfFile === 'string') {
        // If pdfFile is a URL
        const response = await fetch(pdfFile);
        const arrayBuffer = await response.arrayBuffer();
        pdfData = new Uint8Array(arrayBuffer);
      } else {
        // If pdfFile is a File object
        pdfData = new Uint8Array(await pdfFile.arrayBuffer());
      }

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      // Create temporary canvas if not exists
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Process each page
      const pageImages = [];
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        // Get the page
        const page = await pdf.getPage(pageNum);
        
        // Set viewport and canvas size
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Clear canvas and set white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Render the page
        await page.render({
          canvasContext: ctx,
          viewport: viewport,
          background: 'white'
        }).promise;

        // Convert to image
        const imageUrl = canvas.toDataURL('image/jpeg', 1.0);
        pageImages.push(imageUrl);
        
        // Update state to show progress
        setPages([...pageImages]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError('Failed to process PDF. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pdfFile) {
      convertPdfToImages();
    }

    return () => {
      // Cleanup
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setPages([]);
      setError(null);
    };
  }, [pdfFile]);

  if (loading && pages.length === 0) {
    return <div className="loading">Processing PDF...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="pdf-viewer">
      <div className="pdf-pages">
        {pages.map((pageUrl, index) => (
          <div key={index} className="pdf-page">
            <div className="page-container">
              <img
                src={pageUrl}
                alt={`Page ${index + 1}`}
                className="page-image"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
            <div className="page-number">Page {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PDFViewer; 
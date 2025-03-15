import { useState, useEffect } from 'react';
import PDFViewer from './PDFViewer';
import '../styles/PDFEditor.css';

function PDFEditor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    setError(null);
    const file = event.target.files[0];
    
    if (file && file.type === 'application/pdf') {
      setLoading(true);
      // Create a URL for the file
      const fileURL = URL.createObjectURL(file);
      setPdfFile(fileURL);
      setLoading(false);
    } else {
      setError('Please select a valid PDF file');
      setPdfFile(null);
    }
  };

  const handleUploadAnother = () => {
    // Clean up the previous object URL to prevent memory leaks
    if (pdfFile) {
      URL.revokeObjectURL(pdfFile);
    }
    setPdfFile(null);
    setError(null);
  };

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfFile) {
        URL.revokeObjectURL(pdfFile);
      }
    };
  }, [pdfFile]);

  return (
    <div className="pdf-editor-container">
      <h1>PDF Image Editor</h1>
      
      {!pdfFile ? (
        <div className="upload-section">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            id="pdf-upload"
            className="file-input"
          />
          <label htmlFor="pdf-upload" className="file-label">
            Choose PDF File
          </label>
          {error && <p className="error-message">{error}</p>}
        </div>
      ) : (
        <>
          <div className="pdf-container">
            {loading ? (
              <div className="loading">Loading PDF...</div>
            ) : (
              <PDFViewer pdfFile={pdfFile} />
            )}
          </div>
          <button 
            className="upload-button" 
            onClick={handleUploadAnother}
          >
            Upload Another PDF
          </button>
        </>
      )}
    </div>
  );
}

export default PDFEditor; 
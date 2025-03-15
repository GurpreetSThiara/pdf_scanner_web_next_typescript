import Button from '@/components/common/Button';
import { FiDownload } from 'react-icons/fi';

interface PdfPreviewProps {
  pdfPreviewUrl: string;
  onDownload: () => void;
}

export default function PdfPreview({ pdfPreviewUrl, onDownload }: PdfPreviewProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Preview</h2>
      <div className="border border-gray-200 rounded-lg p-4">
        <iframe
          src={pdfPreviewUrl}
          className="w-full h-96 border-0"
          title="PDF Preview"
        />
      </div>
      <div className="mt-4 flex justify-center">
        <Button
          onClick={onDownload}
          icon={FiDownload}
          variant="primary"
        >
          Download PDF
        </Button>
      </div>
    </div>
  );
} 
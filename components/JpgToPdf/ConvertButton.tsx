import Button from '@/components/common/Button';
import { FiUpload } from 'react-icons/fi';

interface ConvertButtonProps {
  disabled: boolean;
  isProcessing: boolean;
  onClick: () => void;
}

export default function ConvertButton({ disabled, isProcessing, onClick }: ConvertButtonProps) {
  return (
    <div className="flex justify-center">
      <Button
        onClick={onClick}
        disabled={disabled}
        icon={isProcessing ? undefined : FiUpload}
        variant="primary"
        size="lg"
      >
        {isProcessing ? 'Converting...' : 'Convert to PDF'}
      </Button>
    </div>
  );
} 
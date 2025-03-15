import { FiX } from 'react-icons/fi';

interface EditorHeaderProps {
  onClose: () => void;
}

export function EditorHeader({ onClose }: EditorHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h3 className="text-xl font-semibold text-gray-800">Edit Image tt</h3>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Close editor"
      >
        <FiX className="w-6 h-6" />
      </button>
    </div>
  );
} 
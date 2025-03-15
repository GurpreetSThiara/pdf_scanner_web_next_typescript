import FileDropzone from '@/components/common/FileDropzone';

interface FileUploadSectionProps {
  onFilesAdded: (files: File[]) => void;
}

export default function FileUploadSection({ onFilesAdded }: FileUploadSectionProps) {
  const handleFilesAdded = (newFiles: File[]) => {
    // Filter only JPG/JPEG files
    const jpgFiles = newFiles.filter(
      (file) => file.type === 'image/jpeg' || file.type === 'image/jpg'
    );
    onFilesAdded(jpgFiles);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Upload JPG Images</h2>
      <FileDropzone
        accept={{
          'image/jpeg': ['.jpg', '.jpeg'],
        }}
        maxFiles={20}
        maxSize={10485760} // 10MB
        onFilesAdded={handleFilesAdded}
        title="Drag & Drop JPG Images Here"
        subtitle="Or click to browse your files"
        showPreview={false}
      />
    </div>
  );
} 
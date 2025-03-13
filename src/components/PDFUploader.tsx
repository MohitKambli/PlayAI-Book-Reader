import React from "react";

interface PDFUploaderProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileChange, loading }) => {
  return (
    <div className="flex justify-center">
      <input
        type="file"
        onChange={onFileChange}
        accept="application/pdf"
        className="border p-2 rounded"
        disabled={loading}
      />
    </div>
  );
};

export default PDFUploader;

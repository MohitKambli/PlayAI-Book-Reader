import React from "react";

interface PDFUploaderProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileChange }) => {
  return (
    <div className="flex justify-center">
      <input
        type="file"
        onChange={onFileChange}
        accept="application/pdf"
        className="border p-2 rounded"
      />
    </div>
  );
};

export default PDFUploader;

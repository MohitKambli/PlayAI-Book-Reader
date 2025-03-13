import React from "react";

interface PDFViewerProps {
  currentPage: number;
  pdfText: string[];
  onNext: () => void;
  onPrev: () => void;
  loading: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ currentPage, pdfText, onNext, onPrev, loading }) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onPrev}
          disabled={currentPage === 0 || loading}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Previous Page
        </button>
        <span className="text-lg">
          Page {currentPage + 1} / {pdfText.length}
        </span>
        <button
          onClick={onNext}
          disabled={currentPage === pdfText.length - 1 || loading}
          className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Next Page
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <p className="text-gray-800">{pdfText[currentPage]}</p>
      </div>
    </div>
  );
};

export default PDFViewer;

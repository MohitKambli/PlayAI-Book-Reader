import { useState, useEffect } from "react";
import { NextPage } from "next";
import { pdfjs } from 'react-pdf';
import { PlayAITextToSpeech } from "../components/PlayAITextToSpeech";

const Home: NextPage = () => {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      await extractTextFromPdf(file);
    }
  };

  const extractTextFromPdf = async (file: File) => {
    const pdf = await pdfjs.getDocument(URL.createObjectURL(file)).promise;
    const numPages = pdf.numPages;
    const textPages: string[] = [];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join(" ");
      textPages.push(text);
    }

    setPdfText(textPages);
  };

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, pdfText.length - 1));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">PlayAI Book Reader</h1>
      <input type="file" onChange={onFileChange} accept="application/pdf" />
      {pdfFile && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <button onClick={handlePrevPage} disabled={currentPage === 0}>
              Previous Page
            </button>
            <span>Page {currentPage + 1}</span>
            <button onClick={handleNextPage} disabled={currentPage === pdfText.length - 1}>
              Next Page
            </button>
          </div>
          <div className="mt-4">
            <p>{pdfText[currentPage]}</p>
          </div>
        </div>
      )}
      <PlayAITextToSpeech text={pdfText[currentPage]} />
    </div>
  );
};

export default Home;

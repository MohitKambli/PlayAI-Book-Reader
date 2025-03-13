import { useState, useEffect, useRef } from "react";
import { NextPage } from "next";
import { pdfjs } from "react-pdf";

const Home: NextPage = () => {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc =
      `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Loading state for the spinner
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setCurrentPage(0);
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

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setAudioUrl(null);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      stopAudio();
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < pdfText.length - 1) {
      stopAudio();
      setCurrentPage((prev) => prev + 1);
    }
  };

  const playTextToSpeech = async () => {
    if (!pdfText[currentPage]) return;

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const userId = process.env.NEXT_PUBLIC_USER_ID;

    if (!apiKey || !userId) {
      console.error("Missing API key or User ID");
      return;
    }

    setLoading(true); // Start loading when we begin the TTS request

    const options = {
      method: "POST",
      headers: {
        AUTHORIZATION: apiKey,
        "X-USER-ID": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        outputFormat: "mp3",
        language: "english",
        model: "PlayDialog",
        text: pdfText[currentPage],
        voice: "s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json",
      }),
    };

    try {
      const response = await fetch("https://api.play.ai/api/v1/tts", options);
      if (!response.ok) throw new Error("Failed to create TTS job");

      const data = await response.json();
      const jobId = data.id;
      if (!jobId) throw new Error("No job ID returned from API");

      let generatedAudioUrl = "";
      while (true) {
        const pollResponse = await fetch(`https://api.play.ai/api/v1/tts/${jobId}`, {
          headers: {
            AUTHORIZATION: apiKey,
            "X-USER-ID": userId,
          },
        });

        if (!pollResponse.ok) throw new Error("Failed to fetch job status");

        const pollData = await pollResponse.json();
        if (pollData.output.status === "COMPLETED") {
          generatedAudioUrl = pollData.output.url;
          break;
        } else if (pollData.output.status === "IN_PROGRESS") {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          console.error("Job failed or unknown status");
          return;
        }
      }

      if (generatedAudioUrl) {
        setAudioUrl(generatedAudioUrl);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setLoading(false); // Stop loading when TTS process is complete
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">PlayAI Book Reader</h1>
      <div className="flex justify-center">
        <input type="file" onChange={onFileChange} accept="application/pdf" className="border p-2 rounded" />
      </div>

      {pdfFile && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Previous Page
            </button>
            <span className="text-lg">
              Page {currentPage + 1} / {pdfText.length}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === pdfText.length - 1}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Next Page
            </button>
          </div>

          <div className="bg-gray-100 p-4 rounded mb-6">
            <p className="text-gray-800">{pdfText[currentPage]}</p>
          </div>

          {!isPlaying ? (
            <>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                onClick={playTextToSpeech}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 1 1 16 0 8 8 0 0 1-16 0z"
                      ></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  "Convert to Speech"
                )}
              </button>
            </>
          ) : (
            <audio ref={audioRef} controls autoPlay onEnded={() => setIsPlaying(false)}>
              <source src={audioUrl ?? ""} type="audio/mp3" />
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;

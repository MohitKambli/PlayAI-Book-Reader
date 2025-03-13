/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { NextPage } from "next";
import { pdfjs } from "react-pdf";
import PDFUploader from "../components/PDFUploader";
import PDFViewer from "../components/PDFViewer";
import AudioPlayer from "../components/AudioPlayer";
import VoiceSelection from "../components/VoiceSelection";

const voices = [
  {
    name: "Angelo",
    value: "s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json",
  },
  {
    name: "Deedee",
    value: "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json",
  },
  {
    name: "Jennifer",
    value: "s3://voice-cloning-zero-shot/801a663f-efd0-4254-98d0-5c175514c3e8/jennifer/manifest.json",
  },
  {
    name: "Briggs",
    value: "s3://voice-cloning-zero-shot/71cdb799-1e03-41c6-8a05-f7cd55134b0b/original/manifest.json",
  },
  {
    name: "Samara",
    value: "s3://voice-cloning-zero-shot/90217770-a480-4a91-b1ea-df00f4d4c29d/original/manifest.json",
  },
];

const Home: NextPage = () => {
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }, []);

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0].value);

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

  const playTextToSpeech = async () => {
    if (!pdfText[currentPage]) return;

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const userId = process.env.NEXT_PUBLIC_USER_ID;

    if (!apiKey || !userId) {
      console.error("Missing API key or User ID");
      return;
    }

    setLoading(true);
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
        voice: selectedVoice,
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
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">PlayAI Book Reader</h1>
      <PDFUploader onFileChange={onFileChange} loading={loading} />
      <VoiceSelection voices={voices} onVoiceChange={setSelectedVoice} loading={loading}/>
      {pdfFile && (
        <>
          <PDFViewer 
            currentPage={currentPage} 
            pdfText={pdfText} 
            onNext={
              () => {
                setCurrentPage((prev) => prev + 1);
                setIsPlaying(false);
              }
            } 
            onPrev={
              () => { 
                setCurrentPage((prev) => prev - 1);
                setIsPlaying(false);
              }
            } 
            loading={loading} />
          <AudioPlayer isPlaying={isPlaying} audioUrl={audioUrl} loading={loading} playTextToSpeech={playTextToSpeech} />
        </>
      )}
    </div>
  );
};

export default Home;

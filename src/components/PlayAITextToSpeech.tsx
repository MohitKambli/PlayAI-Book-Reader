import { useState } from "react";

interface PlayAIProps {
  text: string;
}

export const PlayAITextToSpeech = ({ text }: PlayAIProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const playAudio = async () => {
    if (!text) return;

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const userId = process.env.NEXT_PUBLIC_USER_ID;

    if (!apiKey || !userId) {
      console.error("Missing API key or User ID");
      return;
    }

    if (audioUrl && audio) {
      audio.play();
      setIsPlaying(true);
      return;
    }

    const options = {
      method: "POST",
      headers: {
        AUTHORIZATION: apiKey,
        "X-USER-ID": userId,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        outputFormat: "mp3",
        voiceConditioningSeconds: 20,
        voiceConditioningSeconds2: 20,
        language: "english",
        model: "PlayDialog",
        text: text,
        voice: "s3://voice-cloning-zero-shot/baf1ef41-36b6-428c-9bdf-50ba54682bd8/original/manifest.json",
      }),
    };

    try {
      // Step 1: Send initial request to generate the audio job
      const response = await fetch("https://api.play.ai/api/v1/tts", options);
      if (!response.ok) {
        throw new Error("Failed to create TTS job");
      }

      const data = await response.json();
      console.log("Job Response: ", data);

      const jobId = data.id; // Extract job ID
      if (!jobId) {
        throw new Error("No job ID returned from API");
      }

      // Step 2: Poll for job completion
      const pollingUrl = `https://api.play.ai/api/v1/tts/${jobId}`;
      let generatedAudioUrl = "";
      while (true) {
        const pollResponse = await fetch(pollingUrl, {
          headers: {
            AUTHORIZATION: apiKey,
            "X-USER-ID": userId,
          },
        });

        if (!pollResponse.ok) {
          throw new Error("Failed to fetch job status");
        }

        const pollData = await pollResponse.json();
        console.log("Polling Response: ", pollData);

        const status = pollData.output.status;
        if (status === "COMPLETED") {
          generatedAudioUrl = pollData.output.url;
          console.log(`Job completed. Audio URL: ${generatedAudioUrl}`);
          break;
        } else if (status === "IN_PROGRESS") {
          // console.log("Job is still in progress. Retrying in 5 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        } else {
          console.error(`Job failed or unknown status: ${status}`);
          return;
        }
      }

      // Step 3: Play the audio once it's available
      if (generatedAudioUrl) {
        const newAudio = new Audio(generatedAudioUrl);
        newAudio.play();
        setAudio(newAudio);
        setAudioUrl(generatedAudioUrl);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const pauseAudio = () => {
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const resumeAudio = () => {
    if (audio) {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="mt-4">
      {isPlaying ? (
        <button onClick={pauseAudio}>Pause</button>
      ) : audioUrl ? (
        <button onClick={resumeAudio}>Resume</button>
      ) : (
        <button onClick={playAudio}>Play</button>
      )}
    </div>
  );
};

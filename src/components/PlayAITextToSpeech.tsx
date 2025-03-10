import { useState } from "react";

interface PlayAIProps {
  text: string;
}

export const PlayAITextToSpeech = ({ text }: PlayAIProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const playAudio = async () => {
    if (!text) return;
    console.log(process.env.NEXT_PUBLIC_API_KEY + ", " + process.env.NEXT_PUBLIC_USER_ID);
    const options = {
      method: "POST",
      headers: {
        AUTHORIZATION: process.env.NEXT_PUBLIC_API_KEY,
        "X-USER-ID": process.env.NEXT_PUBLIC_USER_ID,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        outputFormat: "mp3",
        voiceConditioningSeconds: 20,
        voiceConditioningSeconds2: 20,
        language: "english",
        model: "PlayDialog",
        text: text,
        voice: "s3://voice-cloning-zero-shot/e040bd1b-f190-4bdb-83f0-75ef85b18f84/original/manifest.json", // Adjust this as per your needs
      }),
    };

    try {
      const response = await fetch("https://api.play.ai/api/v1/tts/stream", options);
      if (!response.ok) {
        throw new Error("Failed to generate audio");
      }
      const data = await response.json();
      const audioUrl = data.audio_url;
      const newAudio = new Audio(audioUrl);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
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

  return (
    <div className="mt-4">
      {isPlaying ? (
        <button onClick={pauseAudio}>Pause</button>
      ) : (
        <button onClick={playAudio}>Play</button>
      )}
    </div>
  );
};

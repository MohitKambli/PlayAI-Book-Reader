import React, { useRef, useState, useEffect } from "react";
import CircularLoader from "./CircularLoader";

interface AudioPlayerProps {
  isPlaying: boolean;
  audioUrl: string | null;
  loading: boolean;
  playTextToSpeech: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, audioUrl, loading, playTextToSpeech }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(false);

  useEffect(() => {
    if (audioUrl) {
      setIsAudioReady(true);
    }
  }, [audioUrl]);

  const handleConvertClick = () => {
    setIsAudioReady(false);
    playTextToSpeech();
  };

  return (
    <div className="space-y-10">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full flex justify-center items-center relative"
        onClick={handleConvertClick}
        disabled={loading}
      >
        {loading ? <CircularLoader /> : "Convert to Speech"}
      </button>

      {audioUrl && isAudioReady && (
        <audio ref={audioRef} controls autoPlay={isPlaying}>
          <source src={audioUrl} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default AudioPlayer;

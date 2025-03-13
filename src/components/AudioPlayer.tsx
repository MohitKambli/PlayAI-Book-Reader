import React, { useRef } from "react";
import CircularLoader from "./CircularLoader";

interface AudioPlayerProps {
  isPlaying: boolean;
  audioUrl: string | null;
  loading: boolean;
  playTextToSpeech: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, audioUrl, loading, playTextToSpeech }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  return (
    <div>
      {!isPlaying ? (
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full flex justify-center items-center relative"
          onClick={playTextToSpeech}
          disabled={loading}
        >
          {loading ? <CircularLoader /> : "Convert to Speech"}
        </button>
      ) : (
        <audio ref={audioRef} controls autoPlay onEnded={() => {}}>
          <source src={audioUrl ?? ""} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default AudioPlayer;

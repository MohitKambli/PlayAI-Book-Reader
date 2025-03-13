import React from "react";

interface VoiceSelectionProps {
  voices: { name: string; value: string }[];
  onVoiceChange: (selectedVoice: string) => void;
  loading: boolean;
}

const VoiceSelection: React.FC<VoiceSelectionProps> = ({ voices, onVoiceChange, loading }) => {
  return (
    <div className="mb-6">
      <label htmlFor="voice-select" className="block text-lg font-semibold mb-2">
        Select Voice:
      </label>
      <select
        id="voice-select"
        className="w-full p-2 border border-gray-300 rounded-lg"
        onChange={(e) => onVoiceChange(e.target.value)}
        disabled={loading}
      >
        {voices.map((voice) => (
          <option key={voice.value} value={voice.value}>
            {voice.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceSelection;

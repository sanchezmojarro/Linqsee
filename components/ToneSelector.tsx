
import React from 'react';

interface ToneSelectorProps {
  value: string;
  onChange: (tone: string) => void;
}

const tones = [
  { id: 'Professional', icon: 'fa-briefcase', label: 'Profesional' },
  { id: 'Enthusiastic', icon: 'fa-rocket', label: 'Entusiasta' },
  { id: 'Ironic', icon: 'fa-face-laugh-wink', label: 'Irónico' },
  { id: 'Direct', icon: 'fa-bolt', label: 'Directo' },
  { id: 'Empathetic', icon: 'fa-heart', label: 'Empático' }
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {tones.map((tone) => (
        <button
          key={tone.id}
          type="button"
          onClick={() => onChange(tone.id)}
          className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
            value === tone.id 
            ? 'border-blue-600 bg-blue-50 text-blue-700' 
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <i className={`fas ${tone.icon} text-lg mb-2`}></i>
          <span className="text-xs font-semibold">{tone.label}</span>
        </button>
      ))}
    </div>
  );
};

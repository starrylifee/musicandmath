import React from 'react';
import type { InstrumentType } from '../types';

interface InstrumentSelectorProps {
  instrument: InstrumentType;
  onChange: (instrument: InstrumentType) => void;
}

export const InstrumentSelector: React.FC<InstrumentSelectorProps> = ({
  instrument,
  onChange,
}) => {
  const instruments: { value: InstrumentType; label: string; emoji: string }[] = [
    { value: 'piano', label: '피아노', emoji: '🎹' },
    { value: 'xylophone', label: '실로폰', emoji: '🎵' },
    { value: 'drum', label: '드럼', emoji: '🥁' },
    { value: 'synth', label: '신스', emoji: '🎛️' },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-gray-600">악기</span>
      <div className="flex gap-2">
        {instruments.map((inst) => (
          <button
            key={inst.value}
            onClick={() => onChange(inst.value)}
            className={`
              w-12 h-12 rounded-xl flex flex-col items-center justify-center
              transition-all shadow-sm
              ${instrument === inst.value 
                ? 'bg-indigo-500 text-white scale-110 shadow-md' 
                : 'bg-gray-100 hover:bg-gray-200'}
            `}
            title={inst.label}
          >
            <span className="text-xl">{inst.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InstrumentSelector;

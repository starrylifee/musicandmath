import React from 'react';
import type { ComposedNote } from '../types';

interface NoteBlockProps {
  note: ComposedNote;
  isPlaying: boolean;
  isCurrentNote: boolean;
  onClick: () => void;
  showFraction?: boolean;
}

export const NoteBlock: React.FC<NoteBlockProps> = ({
  note,
  isPlaying,
  isCurrentNote,
  onClick,
  showFraction = true,
}) => {
  // 분수에 따른 너비 계산 (16분음표 기준)
  const widthClass = getWidthClass(note.fraction);
  
  return (
    <div
      onClick={() => !isPlaying && onClick()}
      className={`
        ${widthClass} h-16 rounded-xl flex-shrink-0
        flex flex-col items-center justify-center text-white font-bold shadow-md
        transition-all transform
        ${isPlaying ? 'cursor-default' : 'cursor-pointer hover:scale-105 hover:brightness-110'}
        ${note.color}
        ${isCurrentNote ? 'ring-4 ring-yellow-400 scale-110 brightness-125 z-10' : ''}
        ${note.id === 'rest' ? 'opacity-60' : ''}
      `}
    >
      {showFraction && (
        <>
          <span className="text-sm font-bold drop-shadow-md">
            {note.id === 'rest' ? '🤫' : note.label}
          </span>
          {note.id !== 'rest' && (
            <div className="w-full bg-white/20 h-0.5 mt-1" />
          )}
        </>
      )}
    </div>
  );
};

// 분수에 따른 Tailwind 너비 클래스
function getWidthClass(fraction: number): string {
  // 16분음표 기준으로 계산 (1/16 = 1단위)
  const units = Math.round(fraction * 16);
  
  switch (units) {
    case 1: return 'w-8';    // 1/16
    case 2: return 'w-12';   // 1/8
    case 3: return 'w-16';   // 3/16
    case 4: return 'w-20';   // 1/4
    case 6: return 'w-28';   // 3/8
    case 8: return 'w-36';   // 1/2
    case 16: return 'w-full'; // 1 (온음표)
    default: return 'w-20';
  }
}

export default NoteBlock;

import type { FC } from 'react';
import type { NoteType } from '../types';

interface NoteButtonProps {
  note: NoteType;
  onClick: () => void;
  disabled: boolean;
  remainingSpace: number; // 현재 마디의 남은 공간
}

export const NoteButton: FC<NoteButtonProps> = ({
  note,
  onClick,
  disabled,
  remainingSpace,
}) => {
  // 음표 아이콘/심볼
  const getNoteSymbol = (id: string): string => {
    switch (id) {
      case 'rest': return '🤫';
      case 'sixteenth': return '♬';
      case 'eighth': return '♪';
      case 'quarter': return '♩';
      case 'half': return '𝅗𝅥';
      case 'whole': return '𝅝';
      case 'dotted-quarter': return '♩.';
      case 'dotted-eighth': return '♪.';
      default: return '♩';
    }
  };

  // 이 음표가 남은 공간에 맞는지 체크 (부동소수점 오차 허용)
  const fitsInMeasure = note.fraction <= remainingSpace + 0.0001;
  const isDisabled = disabled || !fitsInMeasure;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative h-20 sm:h-24 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-lg
        transition-all active:scale-95 hover:brightness-110 hover:shadow-xl
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100
        ${note.color}
        ${!fitsInMeasure && !disabled ? 'ring-2 ring-red-300 ring-offset-2' : ''}
      `}
      title={!fitsInMeasure ? `남은 공간(${formatFraction(remainingSpace)})보다 큽니다` : ''}
    >
      <span className="text-2xl sm:text-3xl mb-0.5 sm:mb-1">{getNoteSymbol(note.id)}</span>
      <span className="text-base sm:text-lg font-bold">{note.label}</span>
      {note.id !== 'rest' && (
        <span className="text-[10px] sm:text-xs opacity-80 mt-0.5">
          {note.beats >= 1 ? `${note.beats}박` : `${note.beats * 4}/4박`}
        </span>
      )}
      {/* 맞지 않는 경우 표시 */}
      {!fitsInMeasure && !disabled && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
          ✕
        </span>
      )}
    </button>
  );
};

// 소수를 분수 문자열로 변환
function formatFraction(decimal: number): string {
  const fractions: Record<number, string> = {
    0: '0',
    0.0625: '1/16',
    0.125: '1/8',
    0.1875: '3/16',
    0.25: '1/4',
    0.375: '3/8',
    0.5: '1/2',
    0.625: '5/8',
    0.75: '3/4',
    0.875: '7/8',
    1: '1',
  };
  
  for (const [value, str] of Object.entries(fractions)) {
    if (Math.abs(decimal - parseFloat(value)) < 0.001) {
      return str;
    }
  }
  
  return decimal.toFixed(2);
}

export default NoteButton;

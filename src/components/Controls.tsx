import type { FC } from 'react';
import { Play, Square, RotateCcw, Check, Volume2 } from 'lucide-react';

interface ControlsProps {
  isPlaying: boolean;
  hasNotes: boolean;
  isQuizMode: boolean;
  onPlay: () => void;
  onStop: () => void;
  onClear: () => void;
  onCheckAnswer?: () => void;
  onListenAgain?: () => void;
}

export const Controls: FC<ControlsProps> = ({
  isPlaying,
  hasNotes,
  isQuizMode,
  onPlay,
  onStop,
  onClear,
  onCheckAnswer,
  onListenAgain,
}) => {
  return (
    <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
      {/* 재생/정지 버튼 */}
      <button
        onClick={isPlaying ? onStop : onPlay}
        disabled={!hasNotes && !isPlaying}
        className={`
          w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-lg
          active:scale-95 transition-all
          ${isPlaying 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'}
        `}
        title={isPlaying ? '정지' : '재생'}
      >
        {isPlaying ? <Square size={24} fill="white" /> : <Play size={24} fill="white" />}
      </button>

      {/* 지우기 버튼 */}
      <button
        onClick={onClear}
        disabled={isPlaying}
        className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        title="지우기"
      >
        <RotateCcw size={24} />
      </button>

      {/* 퀴즈 모드 전용 버튼들 */}
      {isQuizMode && (
        <>
          {onListenAgain && (
            <button
              onClick={onListenAgain}
              disabled={isPlaying}
              className="px-3 sm:px-6 h-14 sm:h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 font-bold gap-1 sm:gap-2 text-sm sm:text-base transition-all"
            >
              <Volume2 size={20} /> <span className="hidden xs:inline">다시</span> 듣기
            </button>
          )}
          
          {onCheckAnswer && (
            <button
              onClick={onCheckAnswer}
              disabled={isPlaying || !hasNotes}
              className="px-3 sm:px-6 h-14 sm:h-16 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 font-bold text-sm sm:text-lg gap-1 sm:gap-2 transition-all"
            >
              <Check size={20} /> 정답 확인
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Controls;

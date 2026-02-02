import React from 'react';
import { Music } from 'lucide-react';
import type { GameMode } from '../types';

interface HeaderProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-center">
      <h1 className="text-3xl font-bold text-white drop-shadow-md flex items-center justify-center gap-3">
        <Music className="w-8 h-8" />
        리듬 분수 놀이
        <Music className="w-8 h-8" />
      </h1>
      <p className="text-white/80 mt-2 font-medium">
        분수 블록을 모아 리듬을 만들어보세요!
      </p>
      
      <div className="flex justify-center mt-6">
        <div className="bg-white/20 p-1 rounded-full inline-flex backdrop-blur-sm">
          <button
            onClick={() => onModeChange('create')}
            className={`
              px-6 py-2 rounded-full font-bold transition-all
              ${mode === 'create' 
                ? 'bg-white text-purple-600 shadow-md' 
                : 'text-white hover:bg-white/20'}
            `}
          >
            🎨 자유 작곡
          </button>
          <button
            onClick={() => onModeChange('quiz')}
            className={`
              px-6 py-2 rounded-full font-bold transition-all
              ${mode === 'quiz' 
                ? 'bg-white text-purple-600 shadow-md' 
                : 'text-white hover:bg-white/20'}
            `}
          >
            🎯 퀴즈 도전
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

import React from 'react';
import type { Division } from '../types';

interface FractionVisualizerProps {
  division: Division;
  currentFraction: number;
}

export const FractionVisualizer: React.FC<FractionVisualizerProps> = ({
  division,
  currentFraction,
}) => {
  const segments = division;
  const filledSegments = Math.round(currentFraction * division);

  return (
    <div className="bg-gray-100 rounded-xl p-4">
      <div className="text-sm font-medium text-gray-600 mb-2 text-center">
        1마디 = 1 = {division}/{division}
      </div>
      
      {/* 분수 시각화 바 */}
      <div className="flex h-8 rounded-lg overflow-hidden border-2 border-gray-300">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`
              flex-1 border-r border-gray-300 last:border-r-0
              transition-all duration-200
              ${i < filledSegments 
                ? 'bg-gradient-to-b from-indigo-400 to-indigo-600' 
                : 'bg-white'}
            `}
          />
        ))}
      </div>
      
      {/* 분수 레이블 */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>0</span>
        <span>{Math.round(division / 4)}/{division}</span>
        <span>{Math.round(division / 2)}/{division}</span>
        <span>{Math.round(3 * division / 4)}/{division}</span>
        <span>{division}/{division}</span>
      </div>
      
      {/* 현재 값 */}
      <div className="text-center mt-2 font-bold text-indigo-600">
        현재: {filledSegments}/{division} = {(currentFraction * 100).toFixed(0)}%
      </div>
    </div>
  );
};

export default FractionVisualizer;

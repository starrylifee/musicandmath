import type { FC } from 'react';
import { calculateTotalFraction } from '../data/notes';
import type { ComposedNote } from '../types';

interface MeasureDisplayProps {
  measures: ComposedNote[][];
  currentNoteIndex: number;
  isPlaying: boolean;
  onRemoveNote: (measureIndex: number, noteIndex: number) => void;
}

export const MeasureDisplay: FC<MeasureDisplayProps> = ({
  measures,
  currentNoteIndex,
  isPlaying,
  onRemoveNote,
}) => {
  // 전체 음표 인덱스 계산을 위한 오프셋
  let globalIndex = 0;

  return (
    <div className="space-y-4">
      {measures.length === 0 ? (
        <div className="h-20 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center">
          <span className="text-gray-400 text-center px-4">
            아래 버튼을 눌러 분수를 채워보세요<br />
            <span className="text-sm">1마디 = 1 (분수의 합이 1이 되면 다음 줄로!)</span>
          </span>
        </div>
      ) : (
        measures.map((measureNotes, measureIndex) => {
          const startIndex = globalIndex;
          globalIndex += measureNotes.length;
          
          // 이 마디의 분수 합계 계산
          const total = calculateTotalFraction(
            measureNotes.map(n => ({ numerator: n.numerator, denominator: n.denominator }))
          );
          
          const isComplete = Math.abs(total.decimal - 1) < 0.0001;
          const filledFraction = total.decimal;
          
          return (
            <div key={measureIndex} className="relative">
              {/* 마디 번호 */}
              <div className="absolute -left-2 -top-2 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
                {measureIndex + 1}
              </div>
              
              {/* 마디 컨테이너 - 고정 너비 */}
              <div 
                className={`
                  h-20 bg-gray-50 rounded-2xl border-2 
                  ${isComplete ? 'border-green-300 bg-green-50/50' : 'border-dashed border-gray-300'}
                  flex items-center p-2 overflow-hidden
                  transition-all
                `}
              >
                {/* 음표들 - 분수 비율에 맞게 배치 */}
                <div className="flex h-full w-full">
                  {measureNotes.map((note, noteIndex) => (
                    <div
                      key={note.uniqueId}
                      onClick={() => !isPlaying && onRemoveNote(measureIndex, noteIndex)}
                      style={{ width: `${note.fraction * 100}%` }}
                      className={`
                        h-full rounded-xl mx-0.5 flex-shrink-0
                        flex flex-col items-center justify-center text-white font-bold shadow-md
                        transition-all transform
                        ${isPlaying ? 'cursor-default' : 'cursor-pointer hover:brightness-110'}
                        ${note.color}
                        ${startIndex + noteIndex === currentNoteIndex ? 'ring-4 ring-yellow-400 scale-105 brightness-125 z-10' : ''}
                        ${note.id === 'rest' ? 'opacity-60' : ''}
                      `}
                    >
                      <span className="text-sm font-bold drop-shadow-md">
                        {note.id === 'rest' ? '🤫' : note.label}
                      </span>
                    </div>
                  ))}
                  
                  {/* 남은 공간 표시 */}
                  {!isComplete && filledFraction < 1 && (
                    <div 
                      style={{ width: `${(1 - filledFraction) * 100}%` }}
                      className="h-full rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 mx-0.5"
                    >
                      <span className="text-xs">
                        +{formatFraction(1 - filledFraction)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 마디 분수 합계 */}
              <div className="flex justify-end mt-1 pr-2">
                <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-gray-500'}`}>
                  합계: {total.numerator}/{total.denominator}
                  {isComplete && ' ✓'}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// 소수를 분수 문자열로 변환
function formatFraction(decimal: number): string {
  // 일반적인 분수값 매핑
  const fractions: Record<number, string> = {
    0.0625: '1/16',
    0.125: '1/8',
    0.1875: '3/16',
    0.25: '1/4',
    0.3125: '5/16',
    0.375: '3/8',
    0.4375: '7/16',
    0.5: '1/2',
    0.5625: '9/16',
    0.625: '5/8',
    0.6875: '11/16',
    0.75: '3/4',
    0.8125: '13/16',
    0.875: '7/8',
    0.9375: '15/16',
  };
  
  // 가장 가까운 분수 찾기
  for (const [value, str] of Object.entries(fractions)) {
    if (Math.abs(decimal - parseFloat(value)) < 0.001) {
      return str;
    }
  }
  
  return decimal.toFixed(2);
}

export default MeasureDisplay;

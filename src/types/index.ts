// 음표 타입 정의
export interface NoteType {
  id: string;
  label: string;         // 화면에 표시될 분수 라벨
  fraction: number;      // 실제 분수 값 (1/4 = 0.25)
  numerator: number;     // 분자
  denominator: number;   // 분모
  beats: number;         // 박자 수 (4분음표 기준 = 1)
  color: string;         // Tailwind 색상 클래스
  frequency?: number;    // 소리 주파수 (Hz)
}

// 작곡에 추가된 음표 (고유 ID 포함)
export interface ComposedNote extends NoteType {
  uniqueId: number;
}

// 마디 타입
export interface Measure {
  notes: ComposedNote[];
  totalFraction: number;
}

// 분할 단위 타입
export type Division = 4 | 8 | 16;

// 퀴즈 상태
export type QuizStatus = 'idle' | 'correct' | 'wrong';

// 게임 모드
export type GameMode = 'create' | 'quiz';

// 악기 타입
export type InstrumentType = 'piano' | 'xylophone' | 'drum' | 'synth';

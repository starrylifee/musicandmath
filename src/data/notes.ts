import type { NoteType, Division } from '../types';

// 기본 4분할 음표
const BASE_NOTES: NoteType[] = [
  {
    id: 'rest',
    label: '쉼표',
    fraction: 0.25,
    numerator: 1,
    denominator: 4,
    beats: 1,
    color: 'bg-gray-400',
  },
  {
    id: 'quarter',
    label: '1/4',
    fraction: 0.25,
    numerator: 1,
    denominator: 4,
    beats: 1,
    color: 'bg-blue-500',
  },
  {
    id: 'half',
    label: '2/4',
    fraction: 0.5,
    numerator: 2,
    denominator: 4,
    beats: 2,
    color: 'bg-green-500',
  },
  {
    id: 'whole',
    label: '4/4',
    fraction: 1,
    numerator: 4,
    denominator: 4,
    beats: 4,
    color: 'bg-purple-500',
  },
];

// 8분할 추가 음표
const EIGHTH_NOTES: NoteType[] = [
  {
    id: 'eighth',
    label: '1/8',
    fraction: 0.125,
    numerator: 1,
    denominator: 8,
    beats: 0.5,
    color: 'bg-orange-500',
  },
  {
    id: 'dotted-quarter',
    label: '3/8',
    fraction: 0.375,
    numerator: 3,
    denominator: 8,
    beats: 1.5,
    color: 'bg-teal-500',
  },
];

// 16분할 추가 음표
const SIXTEENTH_NOTES: NoteType[] = [
  {
    id: 'sixteenth',
    label: '1/16',
    fraction: 0.0625,
    numerator: 1,
    denominator: 16,
    beats: 0.25,
    color: 'bg-pink-500',
  },
  {
    id: 'dotted-eighth',
    label: '3/16',
    fraction: 0.1875,
    numerator: 3,
    denominator: 16,
    beats: 0.75,
    color: 'bg-cyan-500',
  },
];

// 분할에 따른 음표 목록 가져오기
export const getNotesByDivision = (division: Division): NoteType[] => {
  switch (division) {
    case 4:
      return BASE_NOTES;
    case 8:
      return [...EIGHTH_NOTES, ...BASE_NOTES];
    case 16:
      return [...SIXTEENTH_NOTES, ...EIGHTH_NOTES, ...BASE_NOTES];
    default:
      return BASE_NOTES;
  }
};

// 분수를 문자열로 변환
export const fractionToString = (numerator: number, denominator: number): string => {
  if (numerator === 0) return '쉼표';
  return `${numerator}/${denominator}`;
};

// 분수 약분
export const simplifyFraction = (numerator: number, denominator: number): [number, number] => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(numerator, denominator);
  return [numerator / divisor, denominator / divisor];
};

// 총 분수 합계 계산 (약분된 형태로)
export const calculateTotalFraction = (
  fractions: Array<{ numerator: number; denominator: number }>
): { numerator: number; denominator: number; decimal: number } => {
  if (fractions.length === 0) {
    return { numerator: 0, denominator: 1, decimal: 0 };
  }

  // 통분을 위한 공통 분모 찾기 (LCM)
  const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const commonDenominator = fractions.reduce(
    (acc, f) => lcm(acc, f.denominator),
    fractions[0].denominator
  );

  // 분자 합계
  const totalNumerator = fractions.reduce((acc, f) => {
    return acc + (f.numerator * commonDenominator) / f.denominator;
  }, 0);

  // 약분
  const [simplifiedNum, simplifiedDen] = simplifyFraction(totalNumerator, commonDenominator);

  return {
    numerator: simplifiedNum,
    denominator: simplifiedDen,
    decimal: totalNumerator / commonDenominator,
  };
};

// 음표를 마디로 분리
export const splitIntoMeasures = <T extends { fraction: number }>(
  notes: T[]
): T[][] => {
  const measures: T[][] = [];
  let currentMeasure: T[] = [];
  let currentSum = 0;

  for (const note of notes) {
    // 현재 마디에 추가했을 때 1을 초과하는지 확인
    if (currentSum + note.fraction > 1.0001) { // 부동소수점 오차 허용
      // 현재 마디가 비어있지 않으면 저장
      if (currentMeasure.length > 0) {
        measures.push(currentMeasure);
      }
      currentMeasure = [note];
      currentSum = note.fraction;
    } else {
      currentMeasure.push(note);
      currentSum += note.fraction;
      
      // 정확히 1이 되면 마디 완성
      if (Math.abs(currentSum - 1) < 0.0001) {
        measures.push(currentMeasure);
        currentMeasure = [];
        currentSum = 0;
      }
    }
  }

  // 남은 음표가 있으면 마지막 마디로 추가
  if (currentMeasure.length > 0) {
    measures.push(currentMeasure);
  }

  return measures;
};

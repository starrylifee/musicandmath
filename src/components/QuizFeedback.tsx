import type { FC } from 'react';
import type { QuizStatus } from '../types';

interface QuizFeedbackProps {
  status: QuizStatus;
  onNextQuiz: () => void;
}

export const QuizFeedback: FC<QuizFeedbackProps> = ({
  status,
  onNextQuiz,
}) => {
  if (status === 'idle') return null;

  return (
    <div 
      className={`
        text-center p-4 rounded-xl font-bold text-xl
        animate-bounce
        ${status === 'correct' 
          ? 'text-green-600 bg-green-100 border-2 border-green-200' 
          : 'text-red-500 bg-red-100 border-2 border-red-200'}
      `}
    >
      {status === 'correct' ? (
        <>
          <span>🎉 정답입니다! 참 잘했어요! 🎉</span>
          <button 
            onClick={onNextQuiz}
            className="block mx-auto mt-3 text-sm bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full transition-all"
          >
            다음 문제 →
          </button>
        </>
      ) : (
        <span>🤔 다시 한번 들어볼까요?</span>
      )}
    </div>
  );
};

export default QuizFeedback;

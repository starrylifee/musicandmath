import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Header,
  MeasureDisplay,
  NoteButton,
  Controls,
  DivisionToggle,
  InstrumentSelector,
  FractionVisualizer,
  QuizFeedback,
} from './components';
import { useAudio } from './hooks/useAudio';
import { getNotesByDivision, splitIntoMeasures } from './data/notes';
import type { ComposedNote, Division, GameMode, QuizStatus, InstrumentType, NoteType } from './types';

function App() {
  // 상태 관리
  const [mode, setMode] = useState<GameMode>('create');
  const [division, setDivision] = useState<Division>(4);
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [composition, setComposition] = useState<ComposedNote[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  
  // 퀴즈 관련 상태
  const [quizTarget, setQuizTarget] = useState<ComposedNote[]>([]);
  const [quizStatus, setQuizStatus] = useState<QuizStatus>('idle');
  const [hintCount, setHintCount] = useState(0); // 힌트 사용 횟수 (0, 1, 2)
  const [showAnswer, setShowAnswer] = useState(false); // 정답 보기 상태
  
  // 오디오 훅
  const { playNote, initAudio } = useAudio();
  
  // 타이머 ref
  const timeoutIdsRef = useRef<number[]>([]);

  // 현재 분할에 따른 음표 목록
  const availableNotes = getNotesByDivision(division);
  
  // 마디로 분리된 구성
  const measures = splitIntoMeasures(composition);
  
  // 현재 마디의 분수 합계
  const currentMeasureFraction = measures.length > 0 
    ? measures[measures.length - 1].reduce((sum, note) => sum + note.fraction, 0)
    : 0;

  // 현재 마디의 남은 공간 (마디가 완성되면 새 마디이므로 1)
  const remainingSpace = Math.abs(currentMeasureFraction - 1) < 0.0001 
    ? 1 
    : 1 - currentMeasureFraction;

  // 음표 추가
  const addNote = useCallback((note: NoteType) => {
    initAudio();
    
    const newNote: ComposedNote = {
      ...note,
      uniqueId: Date.now() + Math.random(),
    };
    
    setComposition(prev => [...prev, newNote]);
    
    // 즉각적인 소리 피드백
    playNote(note.id, note.beats, instrument);
  }, [initAudio, playNote, instrument]);

  // 음표 제거
  const removeNote = useCallback((measureIndex: number, noteIndex: number) => {
    const measures = splitIntoMeasures(composition);
    let globalIndex = 0;
    
    for (let i = 0; i < measureIndex; i++) {
      globalIndex += measures[i].length;
    }
    globalIndex += noteIndex;
    
    setComposition(prev => prev.filter((_, i) => i !== globalIndex));
  }, [composition]);

  // 전체 지우기
  const clearComposition = useCallback(() => {
    setComposition([]);
    setQuizStatus('idle');
    setCurrentNoteIndex(-1);
    stopPlayback();
  }, []);

  // 재생 중지
  const stopPlayback = useCallback(() => {
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current = [];
    setIsPlaying(false);
    setCurrentNoteIndex(-1);
  }, []);

  // 시퀀스 재생
  const playSequence = useCallback((notes: ComposedNote[]) => {
    if (notes.length === 0) return;
    
    initAudio();
    stopPlayback();
    setIsPlaying(true);
    
    let accumulatedTime = 0;
    const beatDuration = 500; // 1박 = 500ms
    
    notes.forEach((note, index) => {
      const timeoutId = window.setTimeout(() => {
        setCurrentNoteIndex(index);
        playNote(note.id, note.beats, instrument);
      }, accumulatedTime);
      
      timeoutIdsRef.current.push(timeoutId);
      accumulatedTime += note.beats * beatDuration;
    });
    
    // 재생 완료 후 정리
    const endTimeoutId = window.setTimeout(() => {
      setIsPlaying(false);
      setCurrentNoteIndex(-1);
    }, accumulatedTime + 300);
    
    timeoutIdsRef.current.push(endTimeoutId);
  }, [initAudio, playNote, instrument, stopPlayback]);

  // 내 구성 재생
  const playMyComposition = useCallback(() => {
    playSequence(composition);
  }, [playSequence, composition]);

  // 퀴즈 문제 재생
  const playQuizTarget = useCallback(() => {
    playSequence(quizTarget);
  }, [playSequence, quizTarget]);

  // 퀴즈 생성
  const generateQuiz = useCallback(() => {
    const notes = getNotesByDivision(division);
    // 쉼표를 제외한 음표만 사용
    const playableNotes = notes.filter(n => n.id !== 'rest');
    
    const newQuiz: ComposedNote[] = [];
    let totalFraction = 0;
    
    // 1마디를 채울 때까지 음표 추가
    while (totalFraction < 1) {
      const remaining = 1 - totalFraction;
      // 남은 공간에 맞는 음표 필터링
      const fittingNotes = playableNotes.filter(n => n.fraction <= remaining + 0.001);
      
      if (fittingNotes.length === 0) break;
      
      const randomNote = fittingNotes[Math.floor(Math.random() * fittingNotes.length)];
      newQuiz.push({ ...randomNote, uniqueId: Date.now() + Math.random() });
      totalFraction += randomNote.fraction;
    }
    
    setQuizTarget(newQuiz);
    setComposition([]);
    setQuizStatus('idle');
    setHintCount(0); // 힌트 초기화
    setShowAnswer(false); // 정답 보기 초기화
    
    // 약간의 딜레이 후 자동 재생
    setTimeout(() => {
      playSequence(newQuiz);
    }, 500);
  }, [division, playSequence]);

  // 힌트 사용
  const useHint = useCallback(() => {
    if (hintCount < 2 && hintCount < quizTarget.length) {
      setHintCount(prev => prev + 1);
    }
  }, [hintCount, quizTarget.length]);

  // 힌트로 보여줄 음표들
  const hintNotes = quizTarget.slice(0, hintCount);

  // 정답 확인
  const checkAnswer = useCallback(() => {
    if (composition.length !== quizTarget.length) {
      setQuizStatus('wrong');
      return;
    }
    
    const isCorrect = composition.every(
      (note, index) => note.id === quizTarget[index].id
    );
    
    setQuizStatus(isCorrect ? 'correct' : 'wrong');
  }, [composition, quizTarget]);

  // 모드 변경 시 초기화
  const handleModeChange = useCallback((newMode: GameMode) => {
    stopPlayback();
    setMode(newMode);
    setComposition([]);
    setQuizStatus('idle');
    setHintCount(0);
    setShowAnswer(false);
    
    if (newMode === 'quiz') {
      setTimeout(() => generateQuiz(), 300);
    }
  }, [stopPlayback, generateQuiz]);

  // 분할 변경 시 구성 초기화
  const handleDivisionChange = useCallback((newDivision: Division) => {
    setDivision(newDivision);
    setComposition([]);
    setQuizStatus('idle');
    setHintCount(0);
    setShowAnswer(false);
    
    if (mode === 'quiz') {
      setTimeout(() => generateQuiz(), 300);
    }
  }, [mode, generateQuiz]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      timeoutIdsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 select-none">
      <div className="max-w-3xl mx-auto pb-8">
        <div className="bg-white rounded-b-3xl shadow-2xl overflow-hidden">
          {/* 헤더 */}
          <Header mode={mode} onModeChange={handleModeChange} />
          
          <div className="p-6 space-y-6">
            {/* 설정 영역 */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-8">
              <DivisionToggle division={division} onChange={handleDivisionChange} />
              <InstrumentSelector instrument={instrument} onChange={setInstrument} />
            </div>
            
            {/* 퀴즈 모드 안내 */}
            {mode === 'quiz' && (
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-100">
                <div className="text-lg font-bold text-blue-800 mb-2 text-center">
                  👂 소리를 듣고 같은 리듬을 만들어보세요!
                </div>
                <p className="text-sm text-blue-600 text-center mb-3">
                  문제: {quizTarget.length}개의 음표로 구성된 1마디
                </p>
                
                {/* 힌트 영역 */}
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={useHint}
                    disabled={isPlaying || hintCount >= 2 || hintCount >= quizTarget.length || showAnswer}
                    className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-full font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    💡 힌트 ({2 - hintCount}번 남음)
                  </button>
                  
                  <button
                    onClick={() => setShowAnswer(true)}
                    disabled={isPlaying || showAnswer}
                    className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white rounded-full font-bold text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    👀 정답 보기
                  </button>
                  
                  {/* 힌트 표시 */}
                  {hintCount > 0 && !showAnswer && (
                    <div className="flex items-center gap-2 bg-yellow-100 px-3 py-2 rounded-xl">
                      <span className="text-sm text-yellow-800 font-medium">처음 {hintCount}개:</span>
                      <div className="flex gap-1">
                        {hintNotes.map((note, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-1 rounded-lg text-white text-sm font-bold ${note.color}`}
                          >
                            {note.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 정답 표시 */}
                {showAnswer && (
                  <div className="mt-3 bg-pink-100 p-3 rounded-xl border-2 border-pink-200">
                    <div className="text-sm text-pink-800 font-medium mb-2 text-center">🎵 정답:</div>
                    <div className="flex justify-center gap-1 flex-wrap">
                      {quizTarget.map((note, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-2 rounded-lg text-white text-sm font-bold ${note.color}`}
                        >
                          {note.label}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-pink-600 text-center mt-2">
                      다음 문제를 풀어보세요!
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* 분수 시각화 */}
            <FractionVisualizer 
              division={division} 
              currentFraction={currentMeasureFraction}
            />
            
            {/* 악보 표시 영역 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 font-bold text-lg">
                  🎼 나의 리듬 악보
                </span>
                <span className="text-sm text-gray-500">
                  총 {composition.length}개 음표 / {measures.length}마디
                </span>
              </div>
              
              <MeasureDisplay
                measures={measures}
                currentNoteIndex={currentNoteIndex}
                isPlaying={isPlaying}
                onRemoveNote={removeNote}
              />
            </div>
            
            {/* 컨트롤 버튼 */}
            <Controls
              isPlaying={isPlaying}
              hasNotes={composition.length > 0}
              isQuizMode={mode === 'quiz'}
              onPlay={playMyComposition}
              onStop={stopPlayback}
              onClear={clearComposition}
              onCheckAnswer={mode === 'quiz' ? checkAnswer : undefined}
              onListenAgain={mode === 'quiz' ? playQuizTarget : undefined}
            />
            
            {/* 퀴즈 피드백 */}
            {mode === 'quiz' && (
              <QuizFeedback status={quizStatus} onNextQuiz={generateQuiz} />
            )}
            
            {/* 음표 입력 버튼 */}
            <div>
              <div className="text-gray-600 font-bold mb-3 text-center">
                🎵 음표를 선택하세요
              </div>
              <div className={`grid gap-2 sm:gap-3 ${
                division === 4 ? 'grid-cols-2 sm:grid-cols-4' :
                division === 8 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6' :
                'grid-cols-2 sm:grid-cols-4 md:grid-cols-8'
              }`}>
                {availableNotes.map((note) => (
                  <NoteButton
                    key={note.id}
                    note={note}
                    onClick={() => addNote(note)}
                    disabled={isPlaying}
                    remainingSpace={remainingSpace}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* 도움말 */}
        <div className="mt-6 px-4">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-4 shadow-lg">
            <h3 className="font-bold text-gray-700 mb-2">💡 팁</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 음표 버튼을 누르면 소리가 나고 악보에 추가돼요</li>
              <li>• 악보의 음표를 클릭하면 삭제할 수 있어요</li>
              <li>• 1마디 = 1, 분수의 합이 1이 되면 마디가 완성돼요!</li>
              <li>• 분할 단위를 바꾸면 더 작은 음표도 사용할 수 있어요</li>
            </ul>
          </div>
          
          {/* 추가 학습 아이디어 */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 shadow-lg mt-4">
            <h3 className="font-bold text-purple-700 mb-2">🎓 분수 학습 포인트</h3>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>• 1/4 + 1/4 + 1/4 + 1/4 = 4/4 = 1 (한 마디!)</li>
              <li>• 1/8 + 1/8 = 2/8 = 1/4 (통분 개념)</li>
              <li>• 2/4 = 1/2 (약분 개념)</li>
              <li>• 16분음표 8개 = 8분음표 4개 = 4분음표 2개 = 2분음표 1개</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import { useRef, useCallback, useEffect } from 'react';
import type { InstrumentType } from '../types';

// 음표별 주파수 (C4 스케일 기준)
const NOTE_FREQUENCIES = {
  rest: 0,
  sixteenth: 523.25, // C5
  eighth: 493.88,    // B4
  quarter: 440,      // A4
  half: 392,         // G4
  whole: 349.23,     // F4
};

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // AudioContext 초기화 (사용자 인터랙션 후 호출)
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = 0.5;
    }
    // Resume if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // 피아노 소리 생성
  const playPiano = useCallback((frequency: number, duration: number) => {
    const ctx = audioContextRef.current;
    if (!ctx || frequency === 0) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // ADSR 엔벨로프
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.02); // Attack
    gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);  // Decay
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + duration * 0.7); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration); // Release

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  // 실로폰 소리 생성 (더 밝고 빠른 감쇠)
  const playXylophone = useCallback((frequency: number, duration: number) => {
    const ctx = audioContextRef.current;
    if (!ctx || frequency === 0) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // 실로폰은 사인파 + 약간의 배음
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(frequency * 2, ctx.currentTime); // 한 옥타브 높게

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + Math.min(duration, 0.8));

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  // 드럼/퍼커션 소리
  const playDrum = useCallback((frequency: number, duration: number) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // 쉼표는 짧은 하이햇 같은 소리
    if (frequency === 0) {
      const noise = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 8000;
      
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      noise.start();
      return;
    }

    // 일반 드럼 킥
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + Math.min(duration, 0.5));

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  // 신스 소리
  const playSynth = useCallback((frequency: number, duration: number) => {
    const ctx = audioContextRef.current;
    if (!ctx || frequency === 0) return;

    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator1.type = 'sawtooth';
    oscillator2.type = 'square';
    
    oscillator1.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator2.frequency.setValueAtTime(frequency * 1.005, ctx.currentTime); // 약간 디튠
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + duration * 0.5);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator1.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + duration);
    oscillator2.stop(ctx.currentTime + duration);
  }, []);

  // 쉼표 재생 (무음 또는 틱 소리)
  const playRest = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // 아주 작은 틱 소리
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }, []);

  // 메인 재생 함수
  const playNote = useCallback((
    noteId: string, 
    duration: number, 
    instrument: InstrumentType = 'piano'
  ) => {
    initAudio();
    
    const frequency = NOTE_FREQUENCIES[noteId as keyof typeof NOTE_FREQUENCIES] || 440;
    const durationInSeconds = duration * 0.5; // 박자당 0.5초

    if (noteId === 'rest') {
      playRest();
      return;
    }

    switch (instrument) {
      case 'piano':
        playPiano(frequency, durationInSeconds);
        break;
      case 'xylophone':
        playXylophone(frequency, durationInSeconds);
        break;
      case 'drum':
        playDrum(frequency, durationInSeconds);
        break;
      case 'synth':
        playSynth(frequency, durationInSeconds);
        break;
    }
  }, [initAudio, playPiano, playXylophone, playDrum, playSynth, playRest]);

  // 메트로놈 틱
  const playMetronomeTick = useCallback((isStrong: boolean = false) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    initAudio();

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(isStrong ? 1000 : 800, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(isStrong ? 0.5 : 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }, [initAudio]);

  // 정리
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    initAudio,
    playNote,
    playMetronomeTick,
  };
};

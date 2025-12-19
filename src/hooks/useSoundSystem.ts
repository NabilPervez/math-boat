import { useRef, useCallback, useEffect } from 'react';

// Simple Web Audio API Synthesizer for "Juicy" sounds without assets
export const useSoundSystem = (volume: number = 0.5) => {
    const audioContext = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize AudioContext on first user interaction if possible, or just lazily
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx && !audioContext.current) {
            audioContext.current = new Ctx();
        }
    }, []);

    const playTone = useCallback((freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
        if (!audioContext.current || volume <= 0) return;
        if (audioContext.current.state === 'suspended') audioContext.current.resume();

        const ctx = audioContext.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(volume, ctx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }, [volume]);

    // Specific SFX
    const playCorrect = useCallback((streak: number) => {
        // Rising pitch based on streak!
        // Base C5 (523.25) -> go up pentatonic scale or just semitones
        const baseFreq = 440;
        const pitch = baseFreq * Math.pow(1.05946, Math.min(streak, 12)); // Semitone steps, max 12

        // "Coin" / "Ding" sound
        playTone(pitch, 'sine', 0.1);
        playTone(pitch * 2, 'sine', 0.2, 0.05); // Harmonic
    }, [playTone]);

    const playWrong = useCallback(() => {
        // "Thud" / Error
        playTone(150, 'sawtooth', 0.3);
        playTone(100, 'square', 0.3, 0.1);
    }, [playTone]);

    const playClick = useCallback(() => {
        // Gentle pop
        playTone(800, 'sine', 0.05);
    }, [playTone]);

    const playWin = useCallback(() => {
        // Victory Arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((note, i) => playTone(note, 'triangle', 0.4, i * 0.1));
    }, [playTone]);

    return { playCorrect, playWrong, playClick, playWin };
};

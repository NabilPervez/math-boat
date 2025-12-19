import { useRef, useCallback, useEffect } from 'react';

// Simple Web Audio API Synthesizer for "Juicy" sounds without assets
export const useSoundSystem = (volume: number = 0.5) => {
    const audioContext = useRef<AudioContext | null>(null);
    const ambientSource = useRef<AudioBufferSourceNode | null>(null);
    const ambientGain = useRef<GainNode | null>(null);

    useEffect(() => {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        if (Ctx && !audioContext.current) {
            audioContext.current = new Ctx();
        }

        return () => {
            // Cleanup ambient on unmount
            if (ambientSource.current) {
                try { ambientSource.current.stop(); } catch (e) { }
            }
        }
    }, []);

    const getContext = () => {
        if (audioContext.current?.state === 'suspended') {
            audioContext.current.resume();
        }
        return audioContext.current;
    };

    const createNoiseBuffer = (ctx: AudioContext) => {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    };

    const playAmbient = useCallback((type: string) => {
        const ctx = getContext();
        if (!ctx || volume <= 0) return;

        // Stop existing
        if (ambientSource.current) {
            try { ambientSource.current.stop(); } catch (e) { }
            ambientSource.current = null;
        }

        if (type === 'sunset' || type === 'night') return; // Silence/Crickets? Let's keep silent for now unless requested

        // Procedural Rain / Wind
        const buffer = createNoiseBuffer(ctx);
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const gain = ctx.createGain();
        gain.gain.value = 0.05 * volume; // Low volume for ambient

        const filter = ctx.createBiquadFilter();

        if (type === 'rain' || type === 'storm' || type === 'tornado') {
            // Pink-ish noise lowpass for rain
            filter.type = 'lowpass';
            filter.frequency.value = 800;
        } else if (type === 'snow') {
            // White noise highpass? Or wind.
            // Wind
            filter.type = 'bandpass';
            filter.frequency.value = 400;
            filter.Q.value = 0.5;
            // We'd animate frequency for wind, but static for now
        } else {
            return;
        }

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();

        ambientSource.current = noise;
        ambientGain.current = gain;

    }, [volume]);

    const playThunder = useCallback(() => {
        const ctx = getContext();
        if (!ctx || volume <= 0) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Low rumble
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 1);

        gain.gain.setValueAtTime(0.5 * volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

        // Noise component for crackle? (Skipping for simplicity)

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2);
    }, [volume]);

    // Existing Tone Logic
    const playTone = useCallback((freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
        const ctx = getContext();
        if (!ctx || volume <= 0) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

        gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime + startTime); // Adjust relative volume
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + startTime);
        osc.stop(ctx.currentTime + startTime + duration);
    }, [volume]);

    // Specific SFX
    const playCorrect = useCallback((streak: number) => {
        const baseFreq = 440;
        const pitch = baseFreq * Math.pow(1.05946, Math.min(streak, 12));
        playTone(pitch, 'sine', 0.1);
        playTone(pitch * 2, 'sine', 0.2, 0.05);
    }, [playTone]);

    const playWrong = useCallback(() => {
        playTone(150, 'sawtooth', 0.3);
        playTone(100, 'square', 0.3, 0.1);
    }, [playTone]);

    const playClick = useCallback(() => {
        playTone(800, 'sine', 0.05);
    }, [playTone]);

    const playWin = useCallback(() => {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((note, i) => playTone(note, 'triangle', 0.4, i * 0.1));
    }, [playTone]);

    const stopAmbient = useCallback(() => {
        if (ambientSource.current) {
            try {
                ambientSource.current.stop();
                ambientSource.current = null;
            } catch (e) { }
        }
    }, []);

    return { playCorrect, playWrong, playClick, playWin, playAmbient, stopAmbient, playThunder };
};

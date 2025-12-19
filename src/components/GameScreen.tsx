import { useRef, useEffect, useState } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { usePersistence } from '../hooks/usePersistence';
import { useSoundSystem } from '../hooks/useSoundSystem';
import { Boat } from './Boat';
import { ResultModal } from './ResultModal';
import { MainMenu } from './MainMenu';
import { StoreScreen } from './StoreScreen';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { getLevelName } from '../utils/mathGenerator';

import { WeatherEffects } from './WeatherEffects';

type ScreenState = 'MENU' | 'GAME' | 'STORE';

const THEME_GRADIENTS: Record<string, string> = {
    sunset: 'bg-gradient-to-b from-[#F4AC86] to-[#C85646]',
    rain: 'bg-gradient-to-b from-[#5c6e7a] to-[#2c3e50]',
    forest: 'bg-gradient-to-b from-[#2d4d23] to-[#1a2e15]',
    snow: 'bg-gradient-to-b from-[#e6e9f0] to-[#b0b8c5]',
    night: 'bg-gradient-to-b from-[#0f2027] to-[#203a43]',
    desert: 'bg-gradient-to-b from-[#fce38a] to-[#f38181]',
    candy: 'bg-gradient-to-b from-[#ff9a9e] to-[#fecfef]',
    storm: 'bg-gradient-to-b from-[#373B44] to-[#4286f4]',
    volcano: 'bg-gradient-to-b from-[#430b0b] to-[#791515]',
    tornado: 'bg-gradient-to-b from-[#414345] to-[#232526]',
    space: 'bg-gradient-to-b from-[#000000] to-[#0f0c29]'
};

export const GameScreen = () => {
    const [screen, setScreen] = useState<ScreenState>('MENU');

    // Hooks
    const { state, startGame, submitAnswer, resetGame } = useGameEngine();
    const { progress, updateStreak, addPoints, runTransaction, updateSettings } = usePersistence();
    const { playClick, playCorrect, playWrong, playWin, playAmbient, stopAmbient, playThunder } = useSoundSystem(progress.settings.volume);

    // Ambient Sound Effect
    useEffect(() => {
        playAmbient(progress.settings.selectedTheme);
        return () => stopAmbient();
    }, [progress.settings.selectedTheme, playAmbient, stopAmbient]);

    // Game Logic Effect: Check Win/Loss, Sound, Persistence
    const lastStatus = useRef(state.status);
    const lastCorrectCount = useRef(state.questionsAnsweredCorrectly);
    const lastWrongCount = useRef(state.consecutiveWrong);

    useEffect(() => {
        // Correct Answer Sound
        if (state.questionsAnsweredCorrectly > lastCorrectCount.current) {
            playCorrect(state.questionsAnsweredCorrectly); // Pass streak/count for pitch
        }

        // Wrong Answer Sound Logic
        if (state.consecutiveWrong > lastWrongCount.current) {
            playWrong(); // Wrong Answer
        }

        // Game Over / Win Logic
        if (state.status === 'FINISHED' && lastStatus.current !== 'FINISHED') {
            const isWin = state.questionsAnsweredCorrectly >= 10;
            if (isWin) {
                playWin();
                updateStreak();
                // Calculate Points: 10 per correct answer + 50 bonus for win
                const pointsEarned = (state.questionsAnsweredCorrectly * 10) + 50;
                addPoints(pointsEarned);
            } else {
                // 5 pts per correct answer even on loss
                const pointsEarned = (state.questionsAnsweredCorrectly * 5);
                if (pointsEarned > 0) addPoints(pointsEarned);
            }
        }

        lastStatus.current = state.status;
        lastCorrectCount.current = state.questionsAnsweredCorrectly;
        lastWrongCount.current = state.consecutiveWrong;
    }, [state, playCorrect, playWrong, playWin, updateStreak, addPoints]);


    const handleStart = (difficulty: number) => {
        playClick();
        startGame(difficulty); // Pass difficulty
        setScreen('GAME');
    };

    const handleAnswer = (val: number) => {
        const isCorrect = state.currentQuestion?.correctAnswer === val;
        if (!isCorrect) {
            if (navigator.vibrate) navigator.vibrate(200);
        }
        playClick(); // General interaction

        submitAnswer(val);
    };

    // Stats Calculation for Result Modal
    const getMaxLevel = () => getLevelName(state.currentComplexity);

    const getWeakestArea = () => {
        if (state.consecutiveWrong > 0) return getLevelName(state.currentComplexity);
        return null;
    };

    // Helper to safely get gradient or default
    const themeGradient = THEME_GRADIENTS[progress.settings.selectedTheme] || THEME_GRADIENTS['sunset'];
    const isDarkTheme = ['night', 'space', 'tornado', 'storm', 'rain', 'forest', 'volcano'].includes(progress.settings.selectedTheme);

    const question = state.currentQuestion;

    return (
        <div className={clsx(
            "relative w-full h-full max-w-md mx-auto flex flex-col overflow-hidden transition-all duration-1000",
            themeGradient
        )}>

            {/* Weather Effects Layer */}
            <WeatherEffects type={progress.settings.selectedTheme} onFlash={playThunder} />

            <AnimatePresence mode="wait">

                {/* --- MAIN MENU --- */}
                {screen === 'MENU' && (
                    <motion.div key="menu" className="absolute inset-0 z-40" exit={{ opacity: 0, y: -50 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <MainMenu
                            onStart={handleStart}
                            onStore={() => { playClick(); setScreen('STORE'); }}
                            progress={progress}
                            onUpdateSettings={(s) => { playClick(); updateSettings(s); }}
                        />
                        {/* Decorative Boat in BG */}
                        <div className="absolute bottom-20 left-0 w-full opacity-50 pointer-events-none">
                            <Boat position={50} type={progress.settings.selectedBoat} />
                        </div>
                    </motion.div>
                )}

                {/* --- STORE --- */}
                {screen === 'STORE' && (
                    <motion.div key="store" className="absolute inset-0 z-50" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}>
                        <StoreScreen
                            onClose={() => { playClick(); setScreen('MENU'); }}
                            progress={progress}
                            onPurchase={(constVal, type, id) => { playClick(); return runTransaction(constVal, type, id); }}
                            onSelect={(type, id) => { playClick(); updateSettings(type === 'boat' ? { selectedBoat: id } : { selectedTheme: id }); }}
                        />
                    </motion.div>
                )}

                {/* --- GAME HUD & GAMEPLAY --- */}
                {screen === 'GAME' && (
                    <motion.div key="game" className="flex flex-col h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                        {/* HUD */}
                        <div className="absolute top-4 left-0 w-full px-6 flex justify-between items-start z-30 text-white/90 font-medium">
                            <div className="flex flex-col items-start">
                                <span className="text-3xl font-display font-bold">{state.questionsAnsweredCorrectly}/10</span>
                                <div className="flex items-center gap-1 opacity-80">
                                    <span className="text-xs uppercase tracking-widest">Lvl {state.currentComplexity}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className="relative">
                                    <svg width="40" height="40" viewBox="0 0 36 36" className="transform -rotate-90">
                                        <path className="text-white/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                        <path
                                            className={clsx("transition-all duration-100 ease-linear", state.timer < 10 ? "text-red-400" : "text-white")}
                                            strokeDasharray={`${(state.timer / 30) * 100}, 100`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                        {Math.ceil(state.timer)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Zone */}
                        <div className="relative h-[40%] w-full flex items-center justify-center">
                            {/* Sun/Moon Area - Only show if simple theme */}
                            {(progress.settings.selectedTheme === 'sunset' || progress.settings.selectedTheme === 'desert') && (
                                <div className="absolute top-10 w-48 h-48 bg-gradient-to-b from-[#FFF0D4] to-transparent rounded-full blur-2xl opacity-60" />
                            )}
                            {(progress.settings.selectedTheme === 'night' || progress.settings.selectedTheme === 'space') && (
                                <div className="absolute top-10 w-32 h-32 bg-blue-100 rounded-full blur-xl opacity-20 shadow-[0_0_50px_rgba(255,255,255,0.4)]" />
                            )}

                            <Boat position={state.boatPosition} type={progress.settings.selectedBoat} />
                        </div>

                        {/* Question Zone */}
                        <div className="flex-1 flex flex-col items-center justify-center p-6 z-20">
                            <AnimatePresence mode="wait">
                                {question && (
                                    <motion.div
                                        key={question.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -20, scale: 1.1 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-center"
                                    >
                                        <h2 className={clsx(
                                            "text-6xl font-display font-bold drop-shadow-sm transition-colors",
                                            (isDarkTheme || progress.settings.selectedTheme === 'snow') ? "text-white" : "text-white" // Always white for better contrast usually
                                        )}>
                                            {question.expression.replace('*', '×').replace('/', '÷')}
                                        </h2>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input Zone - 2x2 Grid */}
                        <div className="h-[35%] w-full grid grid-cols-2 gap-3 px-4 pb-6 z-30">
                            {question && question.answers.map((ans, idx) => (
                                <button
                                    key={`${question.id}-${idx}`}
                                    onClick={() => handleAnswer(ans)}
                                    className="bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-lg"
                                >
                                    <span className="text-3xl font-bold text-white shadow-black/10 drop-shadow-md">{ans}</span>
                                </button>
                            ))}
                        </div>

                        {/* Results Modal */}
                        {state.status === 'FINISHED' && (
                            <ResultModal
                                isWin={state.questionsAnsweredCorrectly >= 10}
                                accuracy={Math.round((state.questionsAnsweredCorrectly / (state.history.length || 1)) * 100)}
                                timeTaken={(30 - state.timer).toFixed(1)}
                                maxLevel={getMaxLevel()}
                                mostCommonError={getWeakestArea()}
                                onRestart={() => { playClick(); resetGame(state.currentComplexity); }} // Restart at current/max level
                                onMainMenu={() => { playClick(); setScreen('MENU'); resetGame(1); }} // Reset to 1 for menu safety (or keep?) Default to 1 is fine for menu
                            />
                        )}
                    </motion.div>
                )}

            </AnimatePresence>

        </div>
    );
};

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

type ScreenState = 'MENU' | 'GAME' | 'STORE';

export const GameScreen = () => {
    const [screen, setScreen] = useState<ScreenState>('MENU');

    // Hooks
    const { state, startGame, submitAnswer, resetGame } = useGameEngine();
    const { progress, updateStreak, addPoints, runTransaction, updateSettings } = usePersistence();
    const { playClick, playCorrect, playWrong, playWin } = useSoundSystem(progress.settings.volume);

    // Sync volume context or other global effects if needed

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
        } else if (state.consecutiveWrong === 0 && lastWrongCount.current > 0) {
            // Reset happened (handled by correct, but if we drop level we need to play wrong?)
            // If we drop level due to double wrong, consecutive wrong resets. 
            // We can detect level drop if we tracked it, but let's stick to simple "streak broke" logic or rely on click handler for immediate feedback.
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
        // Determine correctness before submitting for sound (or assume engine handles state fast enough)
        const isCorrect = state.currentQuestion?.correctAnswer === val;
        if (isCorrect) {
            // Play correct handled by effect or here for zero latency?
            // Effect is safer for pitch logic but latency might be 1 frame.
        } else {
            playWrong();
            if (navigator.vibrate) navigator.vibrate(200);
        }
        playClick(); // General interaction

        submitAnswer(val);
    };

    // Stats Calculation for Result Modal
    const getMaxLevel = () => {
        // Iterate history? Or just use current complexity? 
        // Max reached is likely the current complexity if won, or high mark.
        // Let's just blindly use state.currentComplexity for MVP.
        return getLevelName(state.currentComplexity);
    };

    const getWeakestArea = () => {
        // Analyze history
        // We need to know the question type for each history entry. 
        // Current history only has ID. Ideally we'd map back or store type in history.
        // For MVP, we can't easily do "Mixed Operations" vs "Algebra" differentiation if not stored.
        // We will skip strict type analysis and just say "Level X"
        if (state.consecutiveWrong > 0) return getLevelName(state.currentComplexity);
        return null;
    };

    const question = state.currentQuestion;
    // Deterministic shuffle
    const isLeftCorrect = question ? question.id.charCodeAt(0) % 2 === 0 : true;
    const leftAnswer = isLeftCorrect ? question?.correctAnswer : question?.distractor;
    const rightAnswer = !isLeftCorrect ? question?.correctAnswer : question?.distractor;

    return (
        <div className={clsx(
            "relative w-full h-full max-w-md mx-auto flex flex-col overflow-hidden transition-colors duration-1000",
            // Theme Backgrounds
            progress.settings.selectedTheme === 'night' && "bg-[#0f2027]",
            progress.settings.selectedTheme === 'storm' && "bg-[#373B44]",
            // Default handled by CSS (sunset)
        )}>

            {/* Background Overlays for Themes */}
            {progress.settings.selectedTheme === 'night' && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#0f2027] to-[#203a43] -z-10" />
            )}
            {progress.settings.selectedTheme === 'storm' && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#373B44] to-[#4286f4] -z-10" />
            )}

            {/* Stars for Night Mode */}
            {progress.settings.selectedTheme === 'night' && (
                <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] -z-5" />
            )}


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
                            <Boat position={50} />
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
                            {/* Dynamic Sun/Moon based on Theme */}
                            <div className={clsx(
                                "absolute top-10 w-48 h-48 rounded-full blur-2xl opacity-60 transition-colors duration-1000",
                                progress.settings.selectedTheme === 'night' ? "bg-blue-300" : "bg-gradient-to-b from-[#FFF0D4] to-transparent"
                            )} />

                            <Boat position={state.boatPosition} />
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
                                        <h2 className="text-6xl font-display font-bold text-white drop-shadow-sm">
                                            {question.expression.replace('*', '×').replace('/', '÷')}
                                        </h2>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Input Zone */}
                        <div className="h-[30%] w-full grid grid-cols-2 gap-4 px-6 pb-8 z-30">
                            {question && (
                                <>
                                    <button
                                        onClick={() => handleAnswer(leftAnswer!)}
                                        className="bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all rounded-3xl border-2 border-white/30 flex items-center justify-center"
                                    >
                                        <span className="text-4xl font-bold text-white shadow-black/10 drop-shadow-md">{leftAnswer}</span>
                                    </button>
                                    <button
                                        onClick={() => handleAnswer(rightAnswer!)}
                                        className="bg-white/10 backdrop-blur-md hover:bg-white/20 active:scale-95 transition-all rounded-3xl border-2 border-white/30 flex items-center justify-center"
                                    >
                                        <span className="text-4xl font-bold text-white shadow-black/10 drop-shadow-md">{rightAnswer}</span>
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Results Modal */}
                        {state.status === 'FINISHED' && (
                            <ResultModal
                                isWin={state.questionsAnsweredCorrectly >= 10}
                                accuracy={Math.round((state.questionsAnsweredCorrectly / (state.history.length || 1)) * 100)}
                                timeTaken={(30 - state.timer).toFixed(1)}
                                maxLevel={getMaxLevel()}
                                mostCommonError={getWeakestArea()}
                                onRestart={() => { playClick(); resetGame(); }}
                                onMainMenu={() => { playClick(); setScreen('MENU'); resetGame(); }}
                            />
                        )}
                    </motion.div>
                )}

            </AnimatePresence>

        </div>
    );
};

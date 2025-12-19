import { useRef, useEffect } from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import { Boat } from './Boat';
import { ResultModal } from './ResultModal';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export const GameScreen = () => {
    const { state, startGame, submitAnswer, resetGame } = useGameEngine();
    const hasStarted = useRef(false);

    // Auto-start on mount (or we could have a "Start" screen)
    useEffect(() => {
        if (!hasStarted.current) {
            startGame();
            hasStarted.current = true;
        }
    }, [startGame]);

    const handleAnswer = (val: number) => {
        submitAnswer(val);
        // Optional: Add haptics here via navigator.vibrate if available
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    // Prepare answers for display (shuffle correct and distractor)
    // We need to be careful: the state changes immediately on answer, so we might render the NEW question's answers quickly.
    // Ideally, we want to create a stable reference for the current render cycle. 
    // However, since state drives render, we just render what is current.

    const question = state.currentQuestion;

    // Shuffle logic: simplified for now, usually we'd seed or store the order in the question object itself
    // to avoid re-shuffling on re-renders unrelated to question change.
    // A simple way is to use the question ID to determine order (e.g. hash) or just randomize if we don't care about stability during strictly-visual re-renders.
    // For safety, let's just derive it deterministically from ID.
    const isLeftCorrect = question ? question.id.charCodeAt(0) % 2 === 0 : true;

    const leftAnswer = isLeftCorrect ? question?.correctAnswer : question?.distractor;
    const rightAnswer = !isLeftCorrect ? question?.correctAnswer : question?.distractor;


    return (
        <div className="relative w-full h-full max-w-md mx-auto flex flex-col overflow-hidden">

            {/* --- HUD --- */}
            <div className="absolute top-4 left-0 w-full px-6 flex justify-between items-start z-30 text-white/90 font-medium">
                <div className="flex flex-col items-start">
                    <span className="text-3xl font-display font-bold">{state.questionsAnsweredCorrectly}/10</span>
                    <span className="text-xs uppercase tracking-widest opacity-80">Progress</span>
                </div>

                <div className="flex flex-col items-end">
                    <div className="relative">
                        {/* Little timer pie chart or simple text */}
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

            {/* --- Visual Zone (Top 40%) --- */}
            <div className="relative h-[40%] w-full flex items-center justify-center">
                {/* Sun/Sunset Art */}
                <div className="absolute top-10 w-48 h-48 bg-gradient-to-b from-[#FFF0D4] to-transparent rounded-full blur-2xl opacity-60" />
                <div className="absolute top-16 w-32 h-32 bg-[#fffbf2] rounded-full shadow-[0_0_40px_rgba(255,255,255,0.6)]" />

                {/* Ocean/Boat Layer */}
                <Boat position={state.boatPosition} />
            </div>

            {/* --- Question Zone (Middle 30%) --- */}
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

            {/* --- Input Zone (Bottom 30%) --- */}
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

            {/* --- Results Modal --- */}
            {state.status === 'FINISHED' && (
                <ResultModal
                    isWin={state.questionsAnsweredCorrectly >= 10}
                    accuracy={Math.round((state.questionsAnsweredCorrectly / (state.history.length || 1)) * 100)} // Approximate
                    timeTaken={(30 - state.timer).toFixed(1)}
                    onRestart={resetGame}
                />
            )}

        </div>
    );
};

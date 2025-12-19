import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState } from '../types';
import { generateQuestion } from '../utils/mathGenerator';

const INITIAL_STATE: GameState = {
    status: 'IDLE',
    timer: 30,
    boatPosition: 0,
    questionsAnsweredCorrectly: 0,
    consecutiveWrong: 0,
    currentComplexity: 1,
    currentQuestion: null,
    history: [],
};

export const useGameEngine = () => {
    const [state, setState] = useState<GameState>(INITIAL_STATE);
    const timerRef = useRef<number | null>(null);

    const startGame = useCallback((startingDifficulty: number = 1) => {
        // Generate first question
        const firstQuestion = generateQuestion(startingDifficulty);

        setState({
            ...INITIAL_STATE,
            currentComplexity: startingDifficulty,
            status: 'PLAYING',
            currentQuestion: firstQuestion,
        });
    }, []);

    const stopGame = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setState(prev => ({ ...prev, status: 'FINISHED' }));
    }, []);

    // Timer Logic
    useEffect(() => {
        if (state.status === 'PLAYING') {
            timerRef.current = window.setInterval(() => {
                setState((prev) => {
                    if (prev.timer <= 0) {
                        // Time is up. check overtime rule or finish.
                        // Logic: If timer reaches 0:00 while viewing 10th question, allow answer.
                        // For simplicity, we just stop the timer here, and "finish" happens on answer or if we force it.
                        // Actually, simply end logical time. If they are on 10th question (9 answered), they get a chance.

                        if (prev.questionsAnsweredCorrectly < 9) {
                            if (timerRef.current) clearInterval(timerRef.current);
                            return { ...prev, status: 'FINISHED', timer: 0 };
                        }
                        // If they are on the 10th question (9 answered), we let them stay in PLAYING state with 0 timer until answer.
                        return { ...prev, timer: 0 };
                    }
                    return { ...prev, timer: prev.timer - 0.1 }; // 100ms ticks
                });
            }, 100);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [state.status]);


    const submitAnswer = useCallback((answer: number) => {
        setState((prev) => {
            if (!prev.currentQuestion || prev.status === 'FINISHED') return prev;

            const isCorrect = answer === prev.currentQuestion.correctAnswer;
            const newHistory = [
                ...prev.history,
                { questionId: prev.currentQuestion.id, isCorrect, timeTaken: 0 } // simplified time tracking
            ];

            if (isCorrect) {
                // Logic: Correct Answer
                // 1. Complexity + 1 (capped at 10)
                // 2. Reset consecutive wrong
                // 3. Boat advances 10%
                // 4. Check Win Condition (10 correct)

                const newCorrectCount = prev.questionsAnsweredCorrectly + 1;
                const newComplexity = Math.min(10, prev.currentComplexity + 1);
                const newBoatPos = Math.min(100, prev.boatPosition + 10);

                if (newCorrectCount >= 10) {
                    // Win!
                    return {
                        ...prev,
                        status: 'FINISHED',
                        questionsAnsweredCorrectly: newCorrectCount,
                        boatPosition: newBoatPos,
                        currentComplexity: newComplexity,
                        consecutiveWrong: 0,
                        history: newHistory
                    };
                }

                return {
                    ...prev,
                    questionsAnsweredCorrectly: newCorrectCount,
                    boatPosition: newBoatPos,
                    currentComplexity: newComplexity,
                    consecutiveWrong: 0,
                    currentQuestion: generateQuestion(newComplexity),
                    history: newHistory
                };

            } else {
                // Logic: Incorrect Answer
                // 1. Increment consecutive wrong
                // 2. If 2nd consecutive wrong, Complexity - 1 (floored at 1)
                // 3. Boat stationary
                // 4. Handle "Overtime" fail: If timer was 0 and this was last shot, GAME OVER.

                let newComplexity = prev.currentComplexity;
                const newConsecutiveWrong = prev.consecutiveWrong + 1;

                if (newConsecutiveWrong >= 2) {
                    newComplexity = Math.max(1, prev.currentComplexity - 1);
                }

                if (prev.timer <= 0) {
                    // Overtime failure
                    return {
                        ...prev,
                        status: 'FINISHED',
                        consecutiveWrong: newConsecutiveWrong,
                        currentComplexity: newComplexity,
                        history: newHistory
                    };
                }

                return {
                    ...prev,
                    consecutiveWrong: newConsecutiveWrong >= 2 ? 0 : newConsecutiveWrong, // Reset if we dropped level? Logic says "Reset on complexity drop"? PRD: "Reset ConsecutiveWrongAnswers to 0" on drop.
                    currentComplexity: newComplexity,
                    currentQuestion: generateQuestion(newComplexity), // New question immediately
                    history: newHistory
                };
            }
        });
    }, []);

    const resetGame = useCallback((difficulty?: number) => {
        // Clear interval just in case
        if (timerRef.current) clearInterval(timerRef.current);
        startGame(difficulty); // Will default to 1 if undefined, need to handle "current" outside or pass it
    }, [startGame]);

    return { state, startGame, submitAnswer, resetGame, stopGame };
};

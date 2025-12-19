import { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserProgress } from '../hooks/usePersistence';
import { COMPEXITY_NAMES } from '../utils/mathGenerator';

interface MainMenuProps {
    onStart: (difficulty: number) => void;
    onStore: () => void;
    progress: UserProgress;
    onUpdateSettings: (s: Partial<UserProgress['settings']>) => void;
}

export const MainMenu = ({ onStart, onStore, progress, onUpdateSettings }: MainMenuProps) => {
    const [difficulty, setDifficulty] = useState<number>(1);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 space-y-8 relative z-50">

            {/* Header / Logo Area */}
            <motion.div
                className="text-center space-y-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h1 className="text-5xl font-display font-black text-white drop-shadow-md tracking-tight">MathFlow</h1>
                <p className="text-white/80 text-lg font-medium">The Infinite Regatta</p>
            </motion.div>

            {/* Stats Card */}
            <motion.div
                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 w-full flex justify-between border border-white/20 shadow-xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="text-center w-1/2 border-r border-white/10">
                    <div className="text-xs uppercase tracking-widest text-white/60 mb-1">Streak</div>
                    <div className="text-3xl font-bold text-white">🔥 {progress.streak}</div>
                </div>
                <div className="text-center w-1/2">
                    <div className="text-xs uppercase tracking-widest text-white/60 mb-1">Points</div>
                    <div className="text-3xl font-bold text-white">💎 {progress.points}</div>
                </div>
            </motion.div>

            {/* Difficulty Selector */}
            <div className="w-full space-y-4 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center">
                    <p className="text-white/70 text-sm font-bold uppercase tracking-wider">Start Difficulty</p>
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold text-white">{difficulty}</span>
                </div>

                <div className="text-center">
                    <p className="text-xl font-bold text-white mb-2 font-display">{COMPEXITY_NAMES[difficulty]}</p>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={difficulty}
                        onChange={(e) => setDifficulty(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#2a9d8f]"
                    />
                </div>

                <button
                    onClick={() => onStart(difficulty)}
                    className="w-full bg-white text-[#C85646] font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95"
                >
                    Start Game
                </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-4 w-full">
                <button onClick={onStore} className="flex-1 bg-black/20 hover:bg-black/30 text-white font-medium py-3 rounded-xl backdrop-blur-sm transition-colors border border-white/10">
                    Store
                </button>
                <button
                    onClick={() => onUpdateSettings({ volume: progress.settings.volume === 0 ? 0.5 : 0 })}
                    className="w-1/3 bg-black/20 hover:bg-black/30 text-white font-medium py-3 rounded-xl backdrop-blur-sm transition-colors border border-white/10"
                >
                    {progress.settings.volume > 0 ? "🔊 On" : "🔇 Off"}
                </button>
            </div>
        </div>
    );
};

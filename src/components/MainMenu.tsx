import { motion } from 'framer-motion';
import type { UserProgress } from '../hooks/usePersistence';

interface MainMenuProps {
    onStart: (difficulty: number) => void;
    onStore: () => void;
    progress: UserProgress;
    onUpdateSettings: (s: Partial<UserProgress['settings']>) => void;
}

export const MainMenu = ({ onStart, onStore, progress, onUpdateSettings }: MainMenuProps) => {
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
            <div className="w-full space-y-3">
                <p className="text-white/70 text-sm font-bold uppercase tracking-wider text-center">Select Difficulty</p>
                <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => onStart(1)} className="bg-white text-[#C85646] font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform active:scale-95">
                        Start Game
                    </button>
                    {/* Could expand to allow specific level selection if unlocked logic permitted, keeping simple for now */}
                </div>
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

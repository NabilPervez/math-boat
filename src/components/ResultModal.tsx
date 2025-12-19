import { motion } from 'framer-motion';

interface ResultModalProps {
    isWin: boolean;
    accuracy: number;
    timeTaken: string;
    maxLevel: string;
    mostCommonError: string | null;
    onRestart: () => void;
    onMainMenu: () => void;
}

export const ResultModal = ({ isWin, accuracy, timeTaken, maxLevel, mostCommonError, onRestart, onMainMenu }: ResultModalProps) => {
    return (
        <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                className="bg-white text-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl text-center flex flex-col gap-4"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
            >
                <div>
                    <h2 className="text-3xl font-bold font-display text-gray-900">
                        {isWin ? "Voyage Complete!" : "Adrift!"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {isWin ? "You reached the horizon." : "Time ran out."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-100 p-3 rounded-2xl">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Accuracy</div>
                        <div className="text-xl font-bold text-[#C85646]">{accuracy}%</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
                        <div className="text-xl font-bold text-[#F4AC86]">{timeTaken}s</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl col-span-2">
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Max Level</div>
                        <div className="text-lg font-bold text-gray-700">{maxLevel}</div>
                    </div>
                    {mostCommonError && (
                        <div className="bg-red-50 p-3 rounded-2xl col-span-2 border border-red-100">
                            <div className="text-xs text-red-500 uppercase tracking-wide">Needs Practice</div>
                            <div className="text-sm font-bold text-red-700">{mostCommonError}</div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-2">
                    <button
                        onClick={onMainMenu}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors"
                    >
                        Menu
                    </button>
                    <button
                        onClick={onRestart}
                        className="flex-[2] bg-[#2a9d8f] hover:bg-[#218c7e] text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-lg shadow-teal-500/30"
                    >
                        Play Again
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

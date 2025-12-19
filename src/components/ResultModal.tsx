import { motion } from 'framer-motion';

interface ResultModalProps {
    isWin: boolean;
    accuracy: number;
    timeTaken: string;
    onRestart: () => void;
}

export const ResultModal = ({ isWin, accuracy, timeTaken, onRestart }: ResultModalProps) => {
    return (
        <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <motion.div
                className="bg-white text-gray-800 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
            >
                <h2 className="text-3xl font-bold mb-2 font-display text-gray-900">
                    {isWin ? "Voyage Complete!" : "Adrift!"}
                </h2>
                <p className="text-gray-500 mb-6">
                    {isWin ? "You reached the horizon." : "Time ran out."}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-100 p-4 rounded-2xl">
                        <div className="text-sm text-gray-500">Accuracy</div>
                        <div className="text-2xl font-bold text-[#C85646]">{accuracy}%</div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-2xl">
                        <div className="text-sm text-gray-500">Time</div>
                        <div className="text-2xl font-bold text-[#F4AC86]">{timeTaken}s</div>
                    </div>
                </div>

                <button
                    onClick={onRestart}
                    className="w-full bg-[#2a9d8f] hover:bg-[#218c7e] text-white font-bold py-4 rounded-xl text-lg transition-transform active:scale-95 shadow-lg shadow-teal-500/30"
                >
                    Play Again
                </button>
            </motion.div>
        </motion.div>
    );
};

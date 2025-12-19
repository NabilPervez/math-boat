import { motion } from 'framer-motion';

interface BoatProps {
    position: number; // 0 to 100
}

export const Boat = ({ position }: BoatProps) => {
    return (
        <div className="absolute bottom-0 w-full h-32 overflow-visible pointer-events-none">
            {/* Ocean Surface */}
            <div className="absolute bottom-0 w-full h-4 bg-white/20 backdrop-blur-sm z-10" />

            {/* The Boat Container - Animates horizontally */}
            <motion.div
                className="absolute bottom-2 z-20"
                initial={{ left: '0%' }}
                animate={{ left: `${position}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                style={{ x: '-50%' }} // Center the boat on the position point
            >
                {/* Simple SVG Boat */}
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 60 L90 60 L75 90 H25 Z" fill="#C85646" stroke="white" strokeWidth="2" />
                    <path d="M50 10 L50 60 L80 60 Z" fill="white" />
                </svg>
            </motion.div>
        </div>
    );
};

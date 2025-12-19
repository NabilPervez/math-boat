import { motion } from 'framer-motion';

interface BoatProps {
    position: number; // 0 to 100
    type?: string;
}

export const Boat = ({ position, type = 'classic' }: BoatProps) => {

    const renderBoatVisual = () => {
        // Emojis are a quick way to get diverse visuals without massive SVG assets
        // We wrap them in SVG text for consistent scaling or just use div

        switch (type) {
            case 'speed': return <span className="text-[4rem] filter drop-shadow-lg">🚤</span>;
            case 'ship': return <span className="text-[4rem] filter drop-shadow-lg">🏴‍☠️</span>;
            case 'canoe': return <span className="text-[4rem] filter drop-shadow-lg">🛶</span>;
            case 'yacht': return <span className="text-[4rem] filter drop-shadow-lg">🛥️</span>;
            case 'ferry': return <span className="text-[4rem] filter drop-shadow-lg">⛴️</span>;
            case 'rocket': return <span className="text-[4rem] filter drop-shadow-lg">🚀</span>;
            case 'ufo': return <span className="text-[4rem] filter drop-shadow-lg">🛸</span>;
            case 'dragon': return <span className="text-[4rem] filter drop-shadow-lg">🐉</span>; // Dragon boat
            case 'whale': return <span className="text-[4rem] filter drop-shadow-lg">🐋</span>;
            case 'duck': return <span className="text-[4rem] filter drop-shadow-lg">🦆</span>;
            case 'paper': return <span className="text-[4rem] filter drop-shadow-lg">📰</span>; // Close enough? Or 🏳️? Let's use ⛵ (Classic is SVG, so this is distinct) - actually Emoji sailboat is distinct style.
            case 'submarine': return <span className="text-[4rem] filter drop-shadow-lg">️sub</span>; // Wait, there is no sub emoji universally? 🛳️ is ship. Let's use 🛸 for alien or just text.
            // Better to stick to verified emojis. 🛶 🛥️ ⛴️ 🚤 🛳️ 🚢 ⚓ 🏴‍☠️
            case 'cruise': return <span className="text-[4rem] filter drop-shadow-lg">🚢</span>;
            case 'classic':
            default:
                // Keep the original SVG as the "Classic"
                return (
                    <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 60 L90 60 L75 90 H25 Z" fill="#C85646" stroke="white" strokeWidth="2" />
                        <path d="M50 10 L50 60 L80 60 Z" fill="white" />
                    </svg>
                );
        }
    };

    return (
        <div className="absolute bottom-0 w-full h-32 overflow-visible pointer-events-none">
            {/* Ocean Surface */}
            <div className="absolute bottom-0 w-full h-4 bg-white/20 backdrop-blur-sm z-10" />

            {/* The Boat Container - Animates horizontally */}
            <motion.div
                className="absolute bottom-4 z-20 flex items-end justify-center"
                initial={{ left: '0%' }}
                animate={{ left: `${position}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                style={{ x: '-50%' }}
            >
                {renderBoatVisual()}
            </motion.div>
        </div>
    );
};

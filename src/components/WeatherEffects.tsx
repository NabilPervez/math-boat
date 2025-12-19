import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherEffectsProps {
    type: string;
    onFlash?: () => void;
}

export const WeatherEffects = ({ type, onFlash }: WeatherEffectsProps) => {

    // Thunder Flash Logic
    const [flash, setFlash] = useState(false);

    useEffect(() => {
        if (type !== 'storm' && type !== 'tornado') {
            setFlash(false);
            return;
        }

        const loop = setInterval(() => {
            if (Math.random() > 0.7) {
                setFlash(true);
                if (onFlash) onFlash();
                setTimeout(() => setFlash(false), 200); // Quick flash
            }
        }, 5000); // Check every 5s

        return () => clearInterval(loop);
    }, [type, onFlash]);


    if (type === 'sunset') return null; // Clean

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">

            {/* Stars for Night/Space */}
            {(type === 'night' || type === 'space') && (
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50" />
            )}

            {/* Rain */}
            {(type === 'rain' || type === 'storm' || type === 'tornado') && (
                <div className="absolute inset-0 flex">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-[2px] h-20 bg-blue-200/50 absolute"
                            initial={{ top: -100, left: `${Math.random() * 100}%` }}
                            animate={{ top: '120%' }}
                            transition={{
                                duration: 0.5 + Math.random() * 0.5,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Snow */}
            {type === 'snow' && (
                <div className="absolute inset-0">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-white rounded-full absolute blur-[1px]"
                            initial={{ top: -20, left: `${Math.random() * 100}%` }}
                            animate={{ top: '120%', x: Math.random() * 50 - 25 }}
                            transition={{
                                duration: 2 + Math.random() * 3,
                                repeat: Infinity,
                                ease: "linear",
                                delay: Math.random() * 2
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Tornado Funnel (Simplified) */}
            {type === 'tornado' && (
                <motion.div
                    className="absolute bottom-20 right-[-50px] w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-t-[300px] border-t-gray-600/50 blur-md"
                    animate={{ x: [-20, 20, -20], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                />
            )}

            {/* Thunder Flash */}
            <AnimatePresence>
                {flash && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white z-50 mix-blend-overlay"
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

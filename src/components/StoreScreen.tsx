// Motion not used yet but might be later, removing for lint
import type { UserProgress } from '../hooks/usePersistence';

interface StoreScreenProps {
    onClose: () => void;
    progress: UserProgress;
    onPurchase: (cost: number, type: 'boat' | 'theme', id: string) => boolean;
    onSelect: (type: 'boat' | 'theme', id: string) => void;
}

const BOATS = [
    { id: 'classic', name: 'Classic Sloop', cost: 0, icon: '⛵' },
    { id: 'speed', name: 'Speedboat', cost: 500, icon: '🚤' },
    { id: 'ship', name: 'Pirate Ship', cost: 1000, icon: '🏴‍☠️' },
];

const THEMES = [
    { id: 'sunset', name: 'Sunset', cost: 0, color: 'bg-gradient-to-b from-[#F4AC86] to-[#C85646]' },
    { id: 'night', name: 'Midnight', cost: 800, color: 'bg-gradient-to-b from-[#0f2027] to-[#203a43]' },
    { id: 'storm', name: 'Stormy', cost: 1200, color: 'bg-gradient-to-b from-[#373B44] to-[#4286f4]' },
];

export const StoreScreen = ({ onClose, progress, onPurchase, onSelect }: StoreScreenProps) => {

    const handleBuyOrSelect = (item: any, type: 'boat' | 'theme') => {
        const isUnlocked = type === 'boat' ? progress.unlockedBoats.includes(item.id) : progress.unlockedThemes.includes(item.id);
        const isSelected = type === 'boat' ? progress.settings.selectedBoat === item.id : progress.settings.selectedTheme === item.id;

        if (isSelected) return; // Already active

        if (isUnlocked) {
            onSelect(type, item.id);
        } else {
            if (progress.points >= item.cost) {
                const success = onPurchase(item.cost, type, item.id);
                if (success) {
                    // Auto equip on buy? Maybe just unlocked. Let's auto equip for instant gratification
                    onSelect(type, item.id);
                }
            }
        }
    };

    return (
        <div className="flex flex-col w-full h-full p-6 pt-12 relative z-50 bg-black/60 backdrop-blur-xl text-white">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-display font-bold">Shipyard</h2>
                <div className="bg-white/10 px-4 py-2 rounded-full font-bold">💎 {progress.points}</div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar">

                {/* Boats Section */}
                <div>
                    <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4 font-bold">Vessels</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {BOATS.map(boat => {
                            const isUnlocked = progress.unlockedBoats.includes(boat.id);
                            const isSelected = progress.settings.selectedBoat === boat.id;

                            return (
                                <button key={boat.id} onClick={() => handleBuyOrSelect(boat, 'boat')} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'bg-white/20 border-[#2a9d8f]' : 'bg-white/5 border-white/10'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">{boat.icon}</div>
                                        <div className="text-left">
                                            <div className="font-bold">{boat.name}</div>
                                            {!isUnlocked && <div className="text-xs text-yellow-400">💎 {boat.cost}</div>}
                                            {isUnlocked && <div className="text-xs text-green-400">Owned</div>}
                                        </div>
                                    </div>
                                    {isSelected && <div className="bg-[#2a9d8f] text-xs px-2 py-1 rounded">EQUIPPED</div>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Themes Section */}
                <div>
                    <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4 font-bold">Horizons</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {THEMES.map(theme => {
                            const isUnlocked = progress.unlockedThemes.includes(theme.id);
                            const isSelected = progress.settings.selectedTheme === theme.id;

                            return (
                                <button key={theme.id} onClick={() => handleBuyOrSelect(theme, 'theme')} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'bg-white/20 border-[#2a9d8f]' : 'bg-white/5 border-white/10'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full ${theme.color} border-2 border-white/20`}></div>
                                        <div className="text-left">
                                            <div className="font-bold">{theme.name}</div>
                                            {!isUnlocked && <div className="text-xs text-yellow-400">💎 {theme.cost}</div>}
                                            {isUnlocked && <div className="text-xs text-green-400">Owned</div>}
                                        </div>
                                    </div>
                                    {isSelected && <div className="bg-[#2a9d8f] text-xs px-2 py-1 rounded">EQUIPPED</div>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <button onClick={onClose} className="mt-6 w-full py-4 text-center font-bold text-white/60 hover:text-white">Close</button>
        </div>
    );
}

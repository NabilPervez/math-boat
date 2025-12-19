import type { UserProgress } from '../hooks/usePersistence';

interface StoreScreenProps {
    onClose: () => void;
    progress: UserProgress;
    onPurchase: (cost: number, type: 'boat' | 'theme', id: string) => boolean;
    onSelect: (type: 'boat' | 'theme', id: string) => void;
}

const BOATS = [
    { id: 'classic', name: 'Classic Sloop', cost: 0, icon: '⛵' },
    { id: 'canoe', name: 'Wooden Canoe', cost: 200, icon: '🛶' },
    { id: 'duck', name: 'Rubber Duck', cost: 300, icon: '🦆' },
    { id: 'paper', name: 'Paper Boat', cost: 400, icon: '📰' },
    { id: 'speed', name: 'Speedboat', cost: 500, icon: '🚤' },
    { id: 'ferry', name: 'Ferry', cost: 600, icon: '⛴️' },
    { id: 'yacht', name: 'Luxury Yacht', cost: 800, icon: '🛥️' },
    { id: 'ship', name: 'Pirate Ship', cost: 1000, icon: '🏴‍☠️' },
    { id: 'cruise', name: 'Cruise Liner', cost: 1200, icon: '🚢' },
    { id: 'whale', name: 'Blue Whale', cost: 1500, icon: '🐋' },
    { id: 'dragon', name: 'Dragon', cost: 2000, icon: '🐉' },
    { id: 'ufo', name: 'U.F.O', cost: 3000, icon: '🛸' },
    { id: 'rocket', name: 'Rocket Ship', cost: 5000, icon: '🚀' },
];

const THEMES = [
    { id: 'sunset', name: 'Sunset (Default)', cost: 0, color: 'bg-gradient-to-b from-[#F4AC86] to-[#C85646]' },
    { id: 'rain', name: 'Rainy Day', cost: 200, color: 'bg-gradient-to-b from-[#5c6e7a] to-[#2c3e50]' },
    { id: 'forest', name: 'Deep Forest', cost: 400, color: 'bg-gradient-to-b from-[#2d4d23] to-[#1a2e15]' },
    { id: 'snow', name: 'Snow Storm', cost: 600, color: 'bg-gradient-to-b from-[#e6e9f0] to-[#eef1f5]' }, // Use slight grey for visibility
    { id: 'night', name: 'Midnight', cost: 800, color: 'bg-gradient-to-b from-[#0f2027] to-[#203a43]' },
    { id: 'desert', name: 'Sahara', cost: 900, color: 'bg-gradient-to-b from-[#fce38a] to-[#f38181]' },
    { id: 'candy', name: 'Candy Land', cost: 1000, color: 'bg-gradient-to-b from-[#ff9a9e] to-[#fecfef]' },
    { id: 'storm', name: 'Thunderstorm', cost: 1200, color: 'bg-gradient-to-b from-[#373B44] to-[#4286f4]' },
    { id: 'volcano', name: 'Volcano', cost: 1500, color: 'bg-gradient-to-b from-[#430b0b] to-[#791515]' },
    { id: 'tornado', name: 'Tornado Alley', cost: 1800, color: 'bg-gradient-to-b from-[#414345] to-[#232526]' },
    { id: 'space', name: 'Deep Space', cost: 2500, color: 'bg-gradient-to-b from-[#000000] to-[#0f0c29]' },
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
                    onSelect(type, item.id);
                }
            }
        }
    };

    return (
        <div className="flex flex-col w-full h-full p-6 pt-12 relative z-50 bg-black/60 backdrop-blur-xl text-white">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-display font-bold">Shipyard</h2>
                <div className="bg-white/10 px-4 py-2 rounded-full font-bold">💎 {progress.points}</div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar pb-20">

                {/* Boats Section */}
                <div>
                    <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4 font-bold flex items-center gap-2">
                        Vessels <span className="text-xs opacity-50">({progress.unlockedBoats.length}/{BOATS.length})</span>
                    </h3>
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
                                    {!isSelected && !isUnlocked && <div className="text-xs text-white/40">LOCKED</div>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Themes Section */}
                <div>
                    <h3 className="text-sm uppercase tracking-widest text-white/50 mb-4 font-bold flex items-center gap-2">
                        Horizons <span className="text-xs opacity-50">({progress.unlockedThemes.length}/{THEMES.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {THEMES.map(theme => {
                            const isUnlocked = progress.unlockedThemes.includes(theme.id);
                            const isSelected = progress.settings.selectedTheme === theme.id;

                            return (
                                <button key={theme.id} onClick={() => handleBuyOrSelect(theme, 'theme')} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'bg-white/20 border-[#2a9d8f]' : 'bg-white/5 border-white/10'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full ${theme.color} border-2 border-white/20 shadow-sm`}></div>
                                        <div className="text-left">
                                            <div className="font-bold">{theme.name}</div>
                                            {!isUnlocked && <div className="text-xs text-yellow-400">💎 {theme.cost}</div>}
                                            {isUnlocked && <div className="text-xs text-green-400">Owned</div>}
                                        </div>
                                    </div>
                                    {isSelected && <div className="bg-[#2a9d8f] text-xs px-2 py-1 rounded">EQUIPPED</div>}
                                    {!isSelected && !isUnlocked && <div className="text-xs text-white/40">LOCKED</div>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-6 right-6">
                <button onClick={onClose} className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-xl font-bold text-white shadow-lg backdrop-blur-md">Close Store</button>
            </div>
        </div>
    );
}

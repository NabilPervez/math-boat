import { useState, useEffect } from 'react';

export interface UserProgress {
    points: number;
    streak: number;
    lastPlayedDate: string | null; // ISO Date "YYYY-MM-DD"
    unlockedBoats: string[];
    unlockedThemes: string[];
    settings: {
        volume: number; // 0 to 1
        selectedBoat: string;
        selectedTheme: string;
    };
}

const DEFAULT_PROGRESS: UserProgress = {
    points: 0,
    streak: 0,
    lastPlayedDate: null,
    unlockedBoats: ['classic'],
    unlockedThemes: ['sunset'],
    settings: {
        volume: 0.5,
        selectedBoat: 'classic',
        selectedTheme: 'sunset',
    },
};

export const usePersistence = () => {
    const [progress, setProgress] = useState<UserProgress>(() => {
        const saved = localStorage.getItem('mathflow_progress');
        return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
    });

    useEffect(() => {
        localStorage.setItem('mathflow_progress', JSON.stringify(progress));
    }, [progress]);

    const updateStreak = () => {
        const today = new Date().toISOString().split('T')[0];
        if (progress.lastPlayedDate === today) return; // Already played today

        let newStreak = progress.streak;

        if (progress.lastPlayedDate) {
            const last = new Date(progress.lastPlayedDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - last.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 2) { // 1 day difference generally, allowing a bit of leeway for timezones/late night play logic
                newStreak += 1;
            } else {
                newStreak = 1; // Reset if missed a day
            }
        } else {
            newStreak = 1;
        }

        setProgress(p => ({
            ...p,
            streak: newStreak,
            lastPlayedDate: today
        }));
    };

    const addPoints = (amount: number) => {
        setProgress(p => ({ ...p, points: p.points + amount }));
    };

    const runTransaction = (cost: number, unlockType: 'boat' | 'theme', id: string) => {
        if (progress.points < cost) return false;

        setProgress(p => {
            const list = unlockType === 'boat' ? p.unlockedBoats : p.unlockedThemes;
            if (list.includes(id)) return p; // Already owned

            return {
                ...p,
                points: p.points - cost,
                [unlockType === 'boat' ? 'unlockedBoats' : 'unlockedThemes']: [...list, id]
            }
        });
        return true;
    };

    const updateSettings = (partialSettings: Partial<UserProgress['settings']>) => {
        setProgress(p => ({
            ...p,
            settings: { ...p.settings, ...partialSettings }
        }));
    };

    return { progress, updateStreak, addPoints, runTransaction, updateSettings };
};

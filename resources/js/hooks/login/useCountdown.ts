import { useState, useEffect, useCallback } from 'react';

export function useCountdown(targetTime?: string | number, isActive: boolean = true): number {
    const [countdown, setCountdown] = useState<number>(0);

    const calculateRemaining = useCallback(() => {
        if (!targetTime || !isActive) return 0;
        
        const target = typeof targetTime === 'string' 
            ? new Date(targetTime).getTime() 
            : targetTime * 1000;
        
        const now = Date.now();
        return Math.max(0, Math.floor((target - now) / 1000));
    }, [targetTime, isActive]);

    useEffect(() => {
        if (!targetTime || !isActive) {
            setCountdown(0);
            return;
        }

        setCountdown(calculateRemaining());

        const timer = setInterval(() => {
            setCountdown(prev => {
                const remaining = calculateRemaining();
                if (remaining <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return remaining;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [targetTime, isActive, calculateRemaining]);

    return countdown;
}

export function formatCountdown(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
import { useState, useEffect, useCallback } from 'react';
import { ScreenSize } from '@/types';

interface ScreenDetection {
    isMobile: boolean;
    isTablet: boolean;
    isLandscape: boolean;
    screenSize: ScreenSize;
}

export function useScreenDetection(): ScreenDetection {
    const [screen, setScreen] = useState<ScreenDetection>({
        isMobile: false,
        isTablet: false,
        isLandscape: false,
        screenSize: 'lg',
    });

    const detectScreen = useCallback(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        let screenSize: ScreenSize = 'lg';
        if (width < 640) screenSize = 'xs';
        else if (width < 768) screenSize = 'sm';
        else if (width < 1024) screenSize = 'md';
        else if (width < 1280) screenSize = 'lg';
        else screenSize = 'xl';
        
        setScreen({
            isMobile: width < 768,
            isTablet: width >= 768 && width < 1024,
            isLandscape: width > height && width >= 768,
            screenSize,
        });
    }, []);

    useEffect(() => {
        detectScreen();
        window.addEventListener('resize', detectScreen);
        window.addEventListener('orientationchange', detectScreen);
        
        return () => {
            window.removeEventListener('resize', detectScreen);
            window.removeEventListener('orientationchange', detectScreen);
        };
    }, [detectScreen]);

    return screen;
}
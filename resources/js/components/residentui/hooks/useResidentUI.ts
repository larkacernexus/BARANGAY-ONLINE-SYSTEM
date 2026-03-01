import { useState, useEffect, useCallback } from 'react';

export const useMobileDetect = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return { isMobile, isClient };
};

export const useScrollSpy = (threshold: number = 200) => {
    const [isPastThreshold, setIsPastThreshold] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsPastThreshold(window.scrollY > threshold);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return isPastThreshold;
};

export const useExpandableSections = (initialState: Record<string, boolean> = {}) => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(initialState);

    const toggleSection = useCallback((section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    }, []);

    return { expandedSections, toggleSection };
};

export const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    useEffect(() => {
        if (!isMounted || !isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isMounted, isOpen, close]);

    return { isOpen, isMounted, open, close, toggle };
};
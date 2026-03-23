import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';

interface UseFiltersProps {
    initialFilters?: Record<string, any>;
    route: string;
    debounceMs?: number;
}

export function useFilters({ initialFilters = {}, route, debounceMs = 800 }: UseFiltersProps) {
    const [filters, setFilters] = useState(initialFilters);
    const [loading, setLoading] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateFilters = (newFilters: Record<string, any>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);

        const cleanFilters: Record<string, string> = {};
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (value && value !== '' && value !== 'all' && value !== undefined) {
                cleanFilters[key] = value.toString();
            }
        });

        setLoading(true);
        router.get(route, cleanFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    const debouncedUpdate = (newFilters: Record<string, any>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            updateFilters(newFilters);
        }, debounceMs);
    };

    const clearFilters = () => {
        const emptyFilters = Object.keys(filters).reduce((acc, key) => {
            acc[key] = '';
            return acc;
        }, {} as Record<string, any>);
        updateFilters(emptyFilters);
    };

    const hasActiveFilters = Object.values(filters).some(
        value => value && value !== '' && value !== 'all'
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return {
        filters,
        setFilters,
        updateFilters,
        debouncedUpdate,
        clearFilters,
        loading,
        hasActiveFilters
    };
}
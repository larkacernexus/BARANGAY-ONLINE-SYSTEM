export const truncateText = (text: string, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export const getTruncationLength = (type: 'name' | 'description' | 'code' = 'name'): number => {
    if (typeof window === 'undefined') return 30;
    
    const width = window.innerWidth;
    if (width < 640) { // Mobile
        switch(type) {
            case 'name': return 15;
            case 'description': return 20;
            case 'code': return 8;
            default: return 15;
        }
    }
    if (width < 768) { // Tablet
        switch(type) {
            case 'name': return 20;
            case 'description': return 25;
            case 'code': return 10;
            default: return 20;
        }
    }
    if (width < 1024) { // Small desktop
        switch(type) {
            case 'name': return 25;
            case 'description': return 30;
            case 'code': return 12;
            default: return 25;
        }
    }
    // Large desktop
    switch(type) {
        case 'name': return 30;
        case 'description': return 35;
        case 'code': return 15;
        default: return 30;
    }
};

export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
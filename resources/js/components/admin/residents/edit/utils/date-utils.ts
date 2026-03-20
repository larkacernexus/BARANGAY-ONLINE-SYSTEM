// utils/date-utils.ts
export const formatDisplayDate = (dateString: string): string => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

export const calculateAgeFromDate = (birthDate: string): number => {
    try {
        const birth = new Date(birthDate);
        if (isNaN(birth.getTime())) return 0;
        
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return Math.max(0, age);
    } catch {
        return 0;
    }
};
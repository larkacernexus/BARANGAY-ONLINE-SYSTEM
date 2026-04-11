// resources/js/components/admin/payment/ResidentAvatar.tsx

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface ResidentAvatarProps {
    resident: {
        id: number | string;  // ← Allow both types
        name: string;
        photo_path?: string | null;
        photo_url?: string | null;
    };
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    showFallbackIcon?: boolean;
}

export function ResidentAvatar({ 
    resident, 
    size = 'md', 
    className = '', 
    showFallbackIcon = true 
}: ResidentAvatarProps) {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };
    
    const iconSizes = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
        xl: 'h-8 w-8'
    };
    
    const getImageUrl = () => {
        if (imageError) return null;
        
        const photoSource = resident?.photo_url || resident?.photo_path;
        
        if (!photoSource) return null;
        
        if (photoSource.startsWith('http://') || photoSource.startsWith('https://')) {
            return photoSource;
        }
        
        if (photoSource.startsWith('/storage')) {
            return photoSource;
        }
        
        if (photoSource.startsWith('storage/')) {
            return '/' + photoSource;
        }
        
        return `/storage/${photoSource}`;
    };
    
    const imageUrl = getImageUrl();
    const initials = resident?.name
        ? resident.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';
    
    if (imageUrl && !imageError) {
        return (
            <div className="relative flex-shrink-0">
                {isLoading && (
                    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
                )}
                <img
                    src={imageUrl}
                    alt={resident?.name || 'Resident'}
                    className={`${sizeClasses[size]} rounded-full object-cover ${className} ${isLoading ? 'hidden' : ''}`}
                    onLoad={() => {
                        setIsLoading(false);
                    }}
                    onError={() => {
                        setIsLoading(false);
                        setImageError(true);
                    }}
                />
            </div>
        );
    }
    
    return (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0 ${className}`}>
            {initials !== '?' && initials !== '??' ? initials : (showFallbackIcon && <User className={iconSizes[size]} />)}
        </div>
    );
}
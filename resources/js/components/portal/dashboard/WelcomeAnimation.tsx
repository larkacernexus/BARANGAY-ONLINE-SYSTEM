// /components/portal/dashboard/WelcomeAnimation.tsx (CSS-only version)
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeAnimationProps {
    isVisible: boolean;
    onClose: () => void;
    residentName: string;
    greeting: string;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({
    isVisible,
    onClose,
    residentName,
    greeting
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    if (!shouldRender) return null;

    return (
        <div 
            className={cn(
                "fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md",
                "transition-all duration-300 ease-out",
                isAnimating 
                    ? "opacity-100 translate-y-0 scale-100" 
                    : "opacity-0 -translate-y-5 scale-95"
            )}
        >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/30">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="welcome-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="20" cy="20" r="2" fill="white" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#welcome-pattern)" />
                    </svg>
                </div>

                <div className="relative p-6">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors group"
                    >
                        <X className="h-4 w-4 text-white/80 group-hover:text-white" />
                    </button>

                    {/* Content */}
                    <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                            <div className="animate-bounce">
                                {/* Person SVG */}
                                <svg viewBox="0 0 80 100" className="h-20 w-16">
                                    <ellipse cx="40" cy="70" rx="20" ry="25" fill="white" />
                                    <circle cx="40" cy="35" r="18" fill="white" />
                                    <path d="M22 35 Q22 15 40 17 Q58 15 58 35" fill="#1a1a1a" opacity="0.9" />
                                    <circle cx="33" cy="35" r="3" fill="#1a1a1a" />
                                    <circle cx="47" cy="35" r="3" fill="#1a1a1a" />
                                    <path d="M32 42 Q40 50 48 42" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
                                    <circle cx="27" cy="40" r="4" fill="#FFB6C1" opacity="0.4" />
                                    <circle cx="53" cy="40" r="4" fill="#FFB6C1" opacity="0.4" />
                                </svg>
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-white/90 text-sm font-medium mb-1">
                                {greeting}
                            </p>
                            <h3 className="text-white text-xl font-bold mb-2 truncate">
                                {residentName}! 👋
                            </h3>
                            <p className="text-white/80 text-sm leading-relaxed">
                                Welcome to your Barangay Portal. We're here to help you with all your community needs.
                            </p>

                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-4">
                                <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg">
                                    Get Started
                                </button>
                                <button className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
                    style={{
                        animation: isVisible ? 'shrink 5s linear forwards' : 'none'
                    }}
                />
            </div>

            <style>{`
                @keyframes shrink {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
};
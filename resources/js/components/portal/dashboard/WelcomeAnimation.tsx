// /components/portal/dashboard/WelcomeAnimation.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [wave, setWave] = useState(false);

    useEffect(() => {
        if (isVisible) {
            const interval = setInterval(() => {
                setWave(prev => !prev);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 30,
                        duration: 0.4 
                    }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md"
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

                        {/* Floating Particles */}
                        <motion.div
                            animate={{
                                y: [-10, 10, -10],
                                x: [-5, 5, -5],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="absolute top-4 right-16 h-2 w-2 rounded-full bg-white/30"
                        />
                        <motion.div
                            animate={{
                                y: [10, -10, 10],
                                x: [5, -5, 5],
                            }}
                            transition={{
                                duration: 3.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                            }}
                            className="absolute bottom-4 left-12 h-1.5 w-1.5 rounded-full bg-white/20"
                        />
                        <motion.div
                            animate={{
                                y: [-5, 15, -5],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 1
                            }}
                            className="absolute top-8 left-8 h-1 w-1 rounded-full bg-white/40"
                        />

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
                                {/* Animated Person Illustration */}
                                <div className="relative flex-shrink-0">
                                    <motion.div
                                        initial={{ rotate: -10 }}
                                        animate={{ rotate: wave ? 10 : -10 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatDelay: 1.4
                                        }}
                                        className="relative"
                                    >
                                        {/* Person SVG */}
                                        <svg 
                                            viewBox="0 0 80 100" 
                                            className="h-20 w-16"
                                        >
                                            {/* Body */}
                                            <motion.ellipse
                                                cx="40" cy="70" rx="20" ry="25"
                                                fill="white"
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: [0.95, 1.02, 0.95] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                            
                                            {/* Head */}
                                            <motion.circle
                                                cx="40" cy="35" r="18"
                                                fill="white"
                                                initial={{ y: 0 }}
                                                animate={{ y: [-1, 1, -1] }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            />
                                            
                                            {/* Hair */}
                                            <path
                                                d="M22 35 Q22 15 40 17 Q58 15 58 35"
                                                fill="#1a1a1a"
                                                opacity="0.9"
                                            />
                                            
                                            {/* Eyes */}
                                            <motion.circle
                                                cx="33" cy="35" r="3"
                                                fill="#1a1a1a"
                                                animate={{ scaleY: [1, 0.1, 1] }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    times: [0, 0.05, 0.1],
                                                    repeatDelay: 2
                                                }}
                                            />
                                            <motion.circle
                                                cx="47" cy="35" r="3"
                                                fill="#1a1a1a"
                                                animate={{ scaleY: [1, 0.1, 1] }}
                                                transition={{
                                                    duration: 3,
                                                    repeat: Infinity,
                                                    ease: "easeInOut",
                                                    times: [0, 0.05, 0.1],
                                                    repeatDelay: 2
                                                }}
                                            />
                                            
                                            {/* Smile */}
                                            <path
                                                d="M32 42 Q40 50 48 42"
                                                stroke="#1a1a1a"
                                                strokeWidth="2"
                                                fill="none"
                                                strokeLinecap="round"
                                            />
                                            
                                            {/* Rosy Cheeks */}
                                            <circle cx="27" cy="40" r="4" fill="#FFB6C1" opacity="0.4" />
                                            <circle cx="53" cy="40" r="4" fill="#FFB6C1" opacity="0.4" />
                                            
                                            {/* Waving Hand */}
                                            <motion.g
                                                animate={{ rotate: wave ? 20 : -10 }}
                                                transition={{
                                                    duration: 0.5,
                                                    ease: "easeInOut"
                                                }}
                                                style={{ transformOrigin: '55px 50px' }}
                                            >
                                                <path
                                                    d="M58 45 Q70 35 72 25 Q74 15 68 18"
                                                    stroke="white"
                                                    strokeWidth="6"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                />
                                                {/* Fingers */}
                                                <line x1="68" y1="18" x2="72" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="70" y1="20" x2="75" y2="15" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                                <line x1="72" y1="22" x2="78" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                            </motion.g>
                                        </svg>
                                    </motion.div>

                                    {/* Sparkles around person */}
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [1, 0.5, 1],
                                        }}
                                        transition={{
                                            duration: 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute -top-1 -right-1"
                                    >
                                        <SparkleIcon />
                                    </motion.div>
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.3, 1],
                                            opacity: [0.8, 0.3, 0.8],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.7
                                        }}
                                        className="absolute -bottom-2 -left-2"
                                    >
                                        <SparkleIcon className="h-3 w-3" />
                                    </motion.div>
                                </div>

                                {/* Text Content */}
                                <div className="flex-1 min-w-0">
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <p className="text-white/90 text-sm font-medium mb-1">
                                            {greeting}
                                        </p>
                                        <h3 className="text-white text-xl font-bold mb-2 truncate">
                                            {residentName}! 👋
                                        </h3>
                                        <p className="text-white/80 text-sm leading-relaxed">
                                            Welcome to your Barangay Portal. We're here to help you with all your community needs.
                                        </p>
                                    </motion.div>

                                    {/* Action Buttons */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="flex gap-2 mt-4"
                                    >
                                        <button className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors shadow-lg">
                                            Get Started
                                        </button>
                                        <button className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                                            Learn More
                                        </button>
                                    </motion.div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: 5, ease: "linear" }}
                            className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
                            style={{ transformOrigin: 'left' }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// Sparkle Icon Component
const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg 
        viewBox="0 0 24 24" 
        className={cn("h-4 w-4 text-yellow-300", className)}
        fill="currentColor"
    >
        <path d="M12 0L14.5 8.5L23 11L14.5 13.5L12 22L9.5 13.5L1 11L9.5 8.5L12 0Z" />
    </svg>
);
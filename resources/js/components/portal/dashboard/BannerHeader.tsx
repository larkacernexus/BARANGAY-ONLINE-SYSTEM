// /components/portal/dashboard/BannerHeader.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Bell, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export interface BannerSlide {
    id: string | number;
    image: string;
    title?: string;
    description?: string;
    link?: string;
    buttonText?: string;
    alt?: string;
    mobileImage?: string;
}

export interface BannerAnnouncement {
    id: number;
    title: string;
    content: string;
    type: 'general' | 'important' | 'event' | 'maintenance' | 'other';
    priority: number;
    created_at: string;
    time_ago?: string;
    priority_label?: string;
    type_label?: string;
    status_color?: string;
}

interface BannerHeaderProps {
    slides: BannerSlide[];
    announcements?: BannerAnnouncement[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showIndicators?: boolean;
    showArrows?: boolean;
    height?: {
        desktop?: string;
        mobile?: string;
    };
    className?: string;
    onSlideChange?: (index: number) => void;
}

// Helper function to check if a link is external
const isExternalLink = (url?: string): boolean => {
    if (!url) return false;
    // Check if URL starts with http://, https://, or other external protocols
    return /^(https?:\/\/|mailto:|tel:|\/\/)/i.test(url);
};

export function BannerHeader({
    slides,
    announcements = [],
    autoPlay = true,
    autoPlayInterval = 5000,
    showIndicators = true,
    showArrows = true,
    height = { desktop: '320px', mobile: '200px' },
    className,
    onSlideChange
}: BannerHeaderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    const [isVisible, setIsVisible] = useState(true);
    const bannerRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const DISMISSED_KEY = `banner_dismissed_${slides[0]?.id || 'default'}`;

    // Track window width for responsive height
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Intersection Observer - only autoPlay when visible
    useEffect(() => {
        if (!bannerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        observer.observe(bannerRef.current);
        return () => observer.disconnect();
    }, []);

    // Check if banner was dismissed
    useEffect(() => {
        const dismissed = sessionStorage.getItem(DISMISSED_KEY);
        if (dismissed === 'true') {
            setIsDismissed(true);
        }
    }, [DISMISSED_KEY]);

    // Auto play with visibility check
    useEffect(() => {
        const shouldAutoPlay = autoPlay && !isHovered && slides.length > 1 && !isDismissed && isVisible;
        
        if (!shouldAutoPlay) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        timerRef.current = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, autoPlayInterval);

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [autoPlay, autoPlayInterval, isHovered, slides.length, isDismissed, isVisible, currentIndex]);

    useEffect(() => {
        onSlideChange?.(currentIndex);
    }, [currentIndex, onSlideChange]);

    const handlePrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const handleDismiss = useCallback(() => {
        setIsDismissed(true);
        sessionStorage.setItem(DISMISSED_KEY, 'true');
    }, [DISMISSED_KEY]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const minSwipeDistance = 50;

        if (Math.abs(distance) > minSwipeDistance) {
            if (distance > 0) {
                handleNext();
            } else {
                handlePrevious();
            }
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    const getPriorityColor = (priority: number) => {
        const colors = {
            4: 'bg-red-500',
            3: 'bg-orange-500',
            2: 'bg-yellow-500',
            1: 'bg-blue-500',
            0: 'bg-gray-500',
        };
        return colors[priority as keyof typeof colors] || colors[0];
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'important':
                return <AlertCircle className="h-4 w-4" />;
            case 'event':
                return <Calendar className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    if ((slides.length === 0 && announcements.length === 0) || isDismissed) {
        return null;
    }

    const currentSlide = slides[currentIndex];
    const isMobile = windowWidth < 640;
    const bannerHeight = isMobile ? height.mobile : height.desktop;
    const latestAnnouncements = announcements.slice(0, 2);

    // Render link button based on internal/external URL
    const renderLinkButton = () => {
        if (!currentSlide?.link) return null;
        
        const isExternal = isExternalLink(currentSlide.link);
        const buttonClasses = "inline-flex items-center gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-white text-gray-900 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5";
        
        if (isExternal) {
            // External link - opens in new tab
            return (
                <a
                    href={currentSlide.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses}
                >
                    {currentSlide.buttonText || 'Learn More'}
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                </a>
            );
        } else {
            // Internal link - uses Inertia
            return (
                <Link
                    href={currentSlide.link}
                    className={buttonClasses}
                >
                    {currentSlide.buttonText || 'Learn More'}
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                </Link>
            );
        }
    };

    return (
        <div 
            ref={bannerRef}
            className={cn(
                "relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg",
                "bg-gray-100 dark:bg-gray-900",
                className
            )}
            style={{ height: bannerHeight }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Image Slides - object-cover to warp/fill the container */}
            <div className="absolute inset-0 w-full h-full">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={cn(
                            "absolute inset-0 w-full h-full transition-opacity duration-500",
                            index === currentIndex 
                                ? "opacity-100 z-10" 
                                : "opacity-0 z-0"
                        )}
                    >
                        <picture className="absolute inset-0 w-full h-full">
                            {slide.mobileImage && isMobile && (
                                <source 
                                    media="(max-width: 640px)" 
                                    srcSet={slide.mobileImage} 
                                />
                            )}
                            <img
                                src={slide.image}
                                alt={slide.alt || slide.title || 'Banner'}
                                className="w-full h-full object-cover"
                                style={{ 
                                    objectPosition: 'center center'
                                }}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                onError={(e) => {
                                    // Fallback if image fails to load
                                    (e.target as HTMLImageElement).src = '/images/fallback-banner.jpg';
                                }}
                            />
                        </picture>
                        {/* Dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20 dark:from-black/80 dark:via-black/50 dark:to-black/30" />
                    </div>
                ))}
            </div>

            {/* Content Overlay - Positioned above the image */}
            <div className="absolute inset-0 flex items-center z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                        {/* Left Side - Banner Content */}
                        <div className={cn(
                            "space-y-2 sm:space-y-3 md:space-y-4",
                            showArrows && "lg:pl-8 lg:pr-4"
                        )}>
                            {currentSlide?.title && (
                                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
                                    {currentSlide.title}
                                </h2>
                            )}
                            {currentSlide?.description && (
                                <p className="text-sm sm:text-base md:text-lg text-white/95 drop-shadow-md max-w-lg">
                                    {currentSlide.description}
                                </p>
                            )}
                            {renderLinkButton()}
                        </div>

                        {/* Right Side - Announcements */}
                        {latestAnnouncements.length > 0 && (
                            <div className={cn(
                                "lg:pl-4 space-y-2 sm:space-y-3",
                                showArrows && "lg:pr-8"
                            )}>
                                <div className="flex items-center gap-2 text-white mb-2 sm:mb-3 drop-shadow-md">
                                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <h3 className="text-sm sm:text-base font-semibold">Latest Announcements</h3>
                                </div>
                                <div className="space-y-2">
                                    {latestAnnouncements.map((announcement) => (
                                        <Link
                                            key={announcement.id}
                                            href={`/resident/announcements/${announcement.id}`}
                                            className="block p-3 sm:p-4 bg-black/40 backdrop-blur-md rounded-lg sm:rounded-xl border border-white/20 hover:bg-black/50 transition-all group dark:bg-black/50 dark:hover:bg-black/60"
                                        >
                                            <div className="flex items-start gap-2 sm:gap-3">
                                                <div className={cn(
                                                    "w-1.5 sm:w-2 h-full min-h-[40px] sm:min-h-[50px] rounded-full shrink-0",
                                                    getPriorityColor(announcement.priority)
                                                )} />
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <span className="text-white/80">
                                                            {getTypeIcon(announcement.type)}
                                                        </span>
                                                        <h4 className="text-sm sm:text-base font-semibold text-white truncate group-hover:text-white/90">
                                                            {announcement.title}
                                                        </h4>
                                                        {announcement.priority >= 3 && (
                                                            <span className="px-1.5 py-0.5 text-[10px] sm:text-xs font-medium bg-red-500/30 text-red-100 rounded backdrop-blur-sm">
                                                                {announcement.priority_label || 'High Priority'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-white/90 line-clamp-2 mb-1 sm:mb-2">
                                                        {announcement.content}
                                                    </p>
                                                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/70">
                                                        <span>{announcement.time_ago || 'Just now'}</span>
                                                        <span className="group-hover:text-white transition-colors flex items-center gap-1">
                                                            Read more 
                                                            <ChevronRight className="h-3 w-3" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                
                                {announcements.length > 2 && (
                                    <Link
                                        href="/resident/announcements"
                                        className="inline-flex items-center gap-1 text-xs sm:text-sm text-white/80 hover:text-white transition-colors mt-2"
                                    >
                                        View all {announcements.length} announcements
                                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {showArrows && slides.length > 1 && (
                <>
                    <button
                        onClick={handlePrevious}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all z-30 group"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all z-30 group"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
                    </button>
                </>
            )}

            {/* Indicators */}
            {showIndicators && slides.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-30">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrentIndex(index);
                            }}
                            className={cn(
                                "h-1.5 sm:h-2 rounded-full transition-all duration-300",
                                index === currentIndex 
                                    ? "w-6 sm:w-8 bg-white" 
                                    : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/75"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Dismiss Button */}
            <button
                onClick={handleDismiss}
                className="absolute top-2 sm:top-4 right-2 sm:right-4 p-1.5 sm:p-2 bg-black/50 backdrop-blur-sm rounded-full hover:bg-black/70 transition-all z-30 group"
                aria-label="Dismiss banner"
            >
                <X className="h-4 w-4 sm:h-5 sm:w-5 text-white/75 group-hover:text-white group-hover:scale-110 transition-all" />
            </button>
        </div>
    );
}
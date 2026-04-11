import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Search, PenSquare, AlertCircle, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurposeOption {
    value: string;
    label: string;
    icon: any;
}

interface PurposeDropdownProps {
    value: string;
    purposeCustom: string;
    isCustomPurpose: boolean;
    availablePurposes: PurposeOption[];
    purposeSearch: string;
    showPurposeDropdown: boolean;
    disabled?: boolean;
    placeholder?: string;
    onSelect: (value: string, label: string) => void;
    onCustomChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onToggleDropdown: (show: boolean) => void;
}

export function PurposeDropdown({
    value,
    purposeCustom,
    isCustomPurpose,
    availablePurposes,
    purposeSearch,
    showPurposeDropdown,
    disabled = false,
    placeholder = "Select purpose",
    onSelect,
    onCustomChange,
    onSearchChange,
    onToggleDropdown,
}: PurposeDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const dropdownContentRef = useRef<HTMLDivElement>(null);
    const [filteredPurposes, setFilteredPurposes] = useState<PurposeOption[]>(availablePurposes);
    const [isClosing, setIsClosing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const touchStartRef = useRef<{ y: number; x: number } | null>(null);
    const scrollPositionRef = useRef<number>(0);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle keyboard appearance on mobile
    useEffect(() => {
        if (!isMobile) return;
        
        const handleVisualViewport = () => {
            if (window.visualViewport) {
                const isKeyboardOpen = window.visualViewport.height < window.innerHeight * 0.8;
                setKeyboardVisible(isKeyboardOpen);
            }
        };
        
        window.visualViewport?.addEventListener('resize', handleVisualViewport);
        return () => window.visualViewport?.removeEventListener('resize', handleVisualViewport);
    }, [isMobile]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && !isClosing) {
                handleCloseDropdown();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isClosing]);

    // Prevent body scroll when mobile dropdown is open (FIXED)
    useEffect(() => {
        if (isMobile && showPurposeDropdown) {
            // Store current scroll position
            scrollPositionRef.current = window.scrollY;
            
            // Apply scroll lock without position:fixed
            document.body.style.overflow = 'hidden';
            document.body.style.top = `-${scrollPositionRef.current}px`;
        } else {
            // Restore scroll position
            const scrollY = document.body.style.top;
            document.body.style.overflow = '';
            document.body.style.top = '';
            
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
        
        return () => {
            document.body.style.overflow = '';
            document.body.style.top = '';
        };
    }, [isMobile, showPurposeDropdown]);

    // Auto-focus search on desktop only
    useEffect(() => {
        if (showPurposeDropdown && !isMobile && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 200);
        }
    }, [showPurposeDropdown, isMobile]);

    useEffect(() => {
        const filtered = purposeSearch
            ? availablePurposes.filter(purpose =>
                purpose.label.toLowerCase().includes(purposeSearch.toLowerCase())
              )
            : availablePurposes;
        setFilteredPurposes(filtered);
    }, [purposeSearch, availablePurposes]);

    const handleCloseDropdown = () => {
        setIsClosing(true);
        setTimeout(() => {
            onToggleDropdown(false);
            setIsClosing(false);
        }, 200);
    };

    // Improved touch handling with direction detection
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = {
            y: e.touches[0].clientY,
            x: e.touches[0].clientX
        };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartRef.current || !isMobile) return;
        
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const diffY = currentY - touchStartRef.current.y;
        const diffX = Math.abs(currentX - touchStartRef.current.x);
        
        // Only close if vertical swipe is intentional (more vertical than horizontal)
        // and user is not trying to scroll the content
        const contentElement = dropdownContentRef.current;
        const isAtTop = contentElement?.scrollTop === 0;
        
        if (diffY > 80 && diffY > diffX * 2 && isAtTop) {
            handleCloseDropdown();
            touchStartRef.current = null;
        }
    };

    const handleTouchEnd = () => {
        touchStartRef.current = null;
    };

    const getDisplayPurpose = () => {
        if (isCustomPurpose) {
            return purposeCustom || placeholder;
        }
        const selectedPurpose = availablePurposes.find(p => p.value === value);
        return selectedPurpose?.label || placeholder;
    };

    const getPurposeIcon = () => {
        if (isCustomPurpose && purposeCustom) {
            return <PenSquare className="h-4 w-4 mr-2 text-blue-600" />;
        }
        const purpose = availablePurposes.find(p => p.value === value);
        if (purpose?.icon && !isCustomPurpose) {
            const IconComponent = purpose.icon;
            return <IconComponent className="h-4 w-4 mr-2 text-blue-600" />;
        }
        return null;
    };

    const clearSelection = () => {
        onSelect('', '');
        handleCloseDropdown();
    };

    const handleSelect = (val: string, label: string) => {
        onSelect(val, label);
        handleCloseDropdown();
        onSearchChange('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        "flex-1 justify-between h-12 text-sm border-2",
                        isCustomPurpose && "border-blue-500"
                    )}
                    onClick={() => onToggleDropdown(!showPurposeDropdown)}
                    disabled={disabled}
                >
                    <div className="flex items-center truncate">
                        {getPurposeIcon()}
                        <span className={cn(
                            "truncate text-sm",
                            (!isCustomPurpose && !value) ? "text-gray-400 dark:text-gray-500" : "text-gray-900 dark:text-gray-100"
                        )}>
                            {getDisplayPurpose() || placeholder}
                        </span>
                    </div>
                    <ChevronDown className={cn(
                        "h-4 w-4 transition-transform text-gray-400",
                        showPurposeDropdown && "rotate-180"
                    )} />
                </Button>
                
                {value && !isCustomPurpose && !disabled && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 text-gray-400 hover:text-gray-600"
                        onClick={clearSelection}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {showPurposeDropdown && !disabled && (
                <>
                    {/* Backdrop for mobile */}
                    {isMobile && (
                        <div 
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                            onClick={handleCloseDropdown}
                        />
                    )}
                    
                    {/* Dropdown Content */}
                    <div 
                        ref={dropdownContentRef}
                        className={cn(
                            "overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl",
                            isMobile 
                                ? cn(
                                    "fixed left-0 right-0 z-50 mt-0 rounded-t-2xl rounded-b-none",
                                    keyboardVisible ? "bottom-0" : "bottom-0 top-auto"
                                  )
                                : "absolute z-50 mt-2 w-full rounded-lg",
                            isClosing 
                                ? "animate-out slide-out-to-bottom duration-200"
                                : isMobile 
                                    ? "animate-in slide-in-from-bottom duration-400"
                                    : "animate-in fade-in-zoom duration-300"
                        )}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Header for mobile */}
                        {isMobile && (
                            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
                                <div className="animate-in slide-in-from-left duration-300">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Select Purpose</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {filteredPurposes.length} options available
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCloseDropdown}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        {/* Search inside dropdown */}
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-300" />
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search purposes..."
                                    value={purposeSearch}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-9 pr-9 text-sm h-10 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    autoFocus={!isMobile}
                                    // Prevent keyboard from closing dropdown on mobile
                                    onFocus={(e) => {
                                        if (isMobile) {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                {purposeSearch && (
                                    <button
                                        type="button"
                                        onClick={() => onSearchChange('')}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                                    >
                                        <X className="h-3 w-3 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Options List */}
                        <div className={cn(
                            "overflow-y-auto overscroll-contain",
                            isMobile ? "max-h-[calc(70vh-180px)]" : "max-h-80"
                        )}>
                            {filteredPurposes.length > 0 ? (
                                <div className="py-1">
                                    {filteredPurposes.map((purpose, index) => {
                                        const IconComponent = purpose.icon;
                                        const isSelected = value === purpose.value && !isCustomPurpose;
                                        
                                        return (
                                            <button
                                                key={purpose.value}
                                                type="button"
                                                className={cn(
                                                    "w-full text-left px-3 py-3 text-sm transition-all duration-300 flex items-center justify-between group",
                                                    isSelected && "bg-blue-50 dark:bg-blue-900/20"
                                                )}
                                                style={{
                                                    animationDelay: `${index * 50}ms`,
                                                }}
                                                onClick={() => handleSelect(purpose.value, purpose.label)}
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className={cn(
                                                        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                                                        isSelected
                                                            ? 'bg-blue-100 dark:bg-blue-900/40 scale-110 shadow-md'
                                                            : 'bg-gray-100 dark:bg-gray-800 group-hover:scale-105 group-hover:shadow-sm'
                                                    )}>
                                                        <IconComponent className={cn(
                                                            "h-4 w-4 transition-all duration-300",
                                                            isSelected
                                                                ? 'text-blue-600 dark:text-blue-400 scale-110'
                                                                : 'text-gray-500 group-hover:scale-110'
                                                        )} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            "font-medium text-sm truncate transition-all duration-300",
                                                            isSelected
                                                                ? 'text-blue-600 dark:text-blue-400'
                                                                : 'text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                                        )}>
                                                            {purpose.label}
                                                        </p>
                                                        {purpose.value === 'custom' && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                Specify your own purpose
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 ml-2 animate-in zoom-in duration-300 shadow-md">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="px-4 py-12 text-center animate-in fade-in duration-500">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 animate-pulse">
                                        <AlertCircle className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">No purposes found</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try a different search term</p>
                                    {purposeSearch && (
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            onClick={() => onSearchChange('')}
                                            className="mt-3 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:scale-105"
                                        >
                                            Clear search
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Results Count Footer */}
                        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <p className="text-xs text-gray-500 text-center animate-in fade-in duration-300">
                                {filteredPurposes.length} purpose{filteredPurposes.length !== 1 ? 's' : ''} found
                            </p>
                        </div>

                        {/* Swipe indicator for mobile */}
                        {isMobile && (
                            <div className="py-2 flex justify-center animate-in fade-in duration-300">
                                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full transition-all duration-200 hover:w-12" />
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Custom Purpose Input */}
            {isCustomPurpose && (
                <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                            <PenSquare className="h-3 w-3" />
                            Custom Purpose
                        </Badge>
                        <button
                            type="button"
                            onClick={() => {
                                onSelect('', '');
                                onToggleDropdown(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            Choose from list
                        </button>
                    </div>
                    <Input
                        value={purposeCustom}
                        onChange={(e) => onCustomChange(e.target.value)}
                        placeholder="Describe your specific purpose in detail..."
                        className="h-12 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        autoFocus
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Be specific about where and why you need this clearance
                    </p>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInZoom {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .fade-in-zoom {
                    animation: fadeInZoom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                @keyframes slideInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .slide-in-from-bottom {
                    animation: slideInFromBottom 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                
                @keyframes slideOutToBottom {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(100%);
                    }
                }
                
                .slide-out-to-bottom {
                    animation: slideOutToBottom 0.2s ease-in forwards;
                }
            `}</style>
        </div>
    );
}
// components/ui/admin-tabs.tsx - Modified version without focus ring/box

import React from 'react';
import { cn } from "@/lib/utils";

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number | null;
    disabled?: boolean;
}

export interface AdminTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
    variant?: 'underlined' | 'pills' | 'segmented';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    scrollable?: boolean;
    showCountBadges?: boolean;
}

export const AdminTabs: React.FC<AdminTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    className,
    variant = 'underlined',
    size = 'md',
    fullWidth = false,
    scrollable = true,
    showCountBadges = true,
}) => {
    // Size classes
    const sizeClasses = {
        sm: {
            button: 'px-3 py-2 text-xs',
            icon: 'h-3 w-3',
            badge: 'px-1 py-0 text-[10px]',
        },
        md: {
            button: 'px-4 py-3 text-sm',
            icon: 'h-4 w-4',
            badge: 'px-1.5 py-0.5 text-xs',
        },
        lg: {
            button: 'px-5 py-4 text-base',
            icon: 'h-5 w-5',
            badge: 'px-2 py-1 text-xs',
        },
    };

    // Variant classes - COMPLETELY CLEAN, NO BORDERS ANYWHERE
    const variantClasses: Record<'underlined' | 'pills' | 'segmented', {
        container: string;
        button: (isActive: boolean) => string;
    }> = {
        underlined: {
            container: '', // NO border at all
            button: (isActive: boolean) => cn(
                "pb-2", // Add padding bottom for the underline
                isActive
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent"
            ),
        },
        pills: {
            container: 'gap-2 p-1',
            button: (isActive: boolean) => cn(
                "rounded-full transition-all",
                isActive
                    ? "bg-blue-500 text-white shadow-md dark:bg-blue-600"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            ),
        },
        segmented: {
            container: 'bg-gray-100 dark:bg-gray-800 rounded-lg p-1 gap-1',
            button: (isActive: boolean) => cn(
                "rounded-md transition-all",
                isActive
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            ),
        },
    };

    const currentVariant = variantClasses[variant];
    const currentSize = sizeClasses[size];

    return (
        <div className={cn("w-full", className)}>
            {/* Tab Navigation - NO container border */}
            <div className={cn(
                "flex items-center",
                scrollable && "overflow-x-auto no-scrollbar",
                fullWidth && !scrollable && "w-full",
                currentVariant.container
            )}>
                <div className={cn(
                    "flex items-center gap-4", // Added gap between tabs
                    fullWidth && !scrollable ? "w-full" : "w-max",
                    variant === 'pills' && "gap-2",
                    variant === 'segmented' && "gap-1",
                    variant !== 'underlined' && "p-1"
                )}>
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const isDisabled = tab.disabled;
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => !isDisabled && onTabChange(tab.id)}
                                disabled={isDisabled}
                                className={cn(
                                    // Base styles
                                    "flex items-center gap-2 font-medium transition-all duration-200",
                                    "whitespace-nowrap",
                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                    // REMOVED focus styles to prevent box on click
                                    "focus:outline-none",
                                    "focus-visible:outline-none",
                                    "focus-visible:ring-0",
                                    "focus-visible:ring-offset-0",
                                    currentSize.button,
                                    currentVariant.button(isActive),
                                    
                                    // Additional styles for non-underlined variants
                                    variant !== 'underlined' && [
                                        "rounded-lg",
                                        isActive && "shadow-sm",
                                        !isActive && "hover:shadow-sm"
                                    ],
                                    
                                    // Full width
                                    fullWidth && !scrollable && "flex-1 justify-center"
                                )}
                                aria-selected={isActive}
                                role="tab"
                            >
                                {tab.icon && (
                                    <span className={cn(
                                        "flex-shrink-0",
                                        currentSize.icon
                                    )}>
                                        {tab.icon}
                                    </span>
                                )}
                                
                                <span className="truncate">
                                    {tab.label}
                                </span>
                                
                                {showCountBadges && tab.count !== undefined && tab.count !== null && tab.count > 0 && (
                                    <span className={cn(
                                        "font-semibold rounded-full",
                                        currentSize.badge,
                                        variant === 'underlined'
                                            ? isActive
                                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                            : isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                    )}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Define the TabPanel component interface
export interface AdminTabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
    unmountOnExit?: boolean;
}

// Type guard function to check if a child is a TabPanel
const isAdminTabPanel = (child: React.ReactNode): child is React.ReactElement<AdminTabPanelProps> => {
    if (!React.isValidElement(child)) return false;
    return 'value' in (child.props as object);
};

// Enhanced version with content rendering
export interface AdminTabsWithContentProps extends AdminTabsProps {
    children: React.ReactNode;
    contentClassName?: string;
    lazyLoad?: boolean;
}

export const AdminTabsWithContent: React.FC<AdminTabsWithContentProps> = ({
    tabs,
    activeTab,
    onTabChange,
    children,
    className,
    contentClassName,
    lazyLoad = false,
    ...tabsProps
}) => {
    const activeContent = React.Children.toArray(children).find(
        (child) => {
            if (isAdminTabPanel(child)) {
                return child.props.value === activeTab;
            }
            return false;
        }
    );

    return (
        <div className={cn("w-full", className)}>
            <AdminTabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={onTabChange}
                {...tabsProps}
            />
            
            <div className={cn("mt-6", contentClassName)}>
                {lazyLoad ? (
                    activeContent
                ) : (
                    React.Children.map(children, (child) => {
                        if (isAdminTabPanel(child)) {
                            const isActive = activeTab === child.props.value;
                            const newProps: AdminTabPanelProps = {
                                ...child.props,
                                className: cn(
                                    child.props.className,
                                    !isActive && "hidden"
                                ),
                            };
                            return React.cloneElement(child, newProps);
                        }
                        return child;
                    })
                )}
            </div>
        </div>
    );
};

// Tab Panel Component
export const AdminTabPanel: React.FC<AdminTabPanelProps> = ({
    value,
    unmountOnExit = false,
    children,
    className,
    ...props
}) => {
    return (
        <div
            role="tabpanel"
            data-value={value}
            className={cn(
                "w-full transition-all duration-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

// Scrollable tabs with navigation buttons
export interface ScrollableAdminTabsProps extends AdminTabsProps {
    showNavButtons?: boolean;
    autoHideNavButtons?: boolean;
}

export const ScrollableAdminTabs: React.FC<ScrollableAdminTabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    showNavButtons = true,
    autoHideNavButtons = true,
    ...tabsProps
}) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [showLeftButton, setShowLeftButton] = React.useState(false);
    const [showRightButton, setShowRightButton] = React.useState(false);

    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            setShowLeftButton(container.scrollLeft > 0);
            setShowRightButton(
                container.scrollLeft < container.scrollWidth - container.clientWidth
            );
        }
    };

    React.useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            checkScroll();
            container.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                container.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 200;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="relative group">
            {showNavButtons && showLeftButton && (
                <button
                    onClick={() => scroll('left')}
                    className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 z-10",
                        "flex items-center justify-center w-8 h-8",
                        "bg-white dark:bg-gray-800 rounded-full shadow-lg",
                        "border border-gray-200 dark:border-gray-700",
                        "hover:bg-gray-50 dark:hover:bg-gray-700",
                        "transition-all duration-200",
                        autoHideNavButtons && "opacity-0 group-hover:opacity-100",
                        // Remove focus box from navigation buttons too
                        "focus:outline-none",
                        "focus-visible:outline-none",
                        "focus-visible:ring-0"
                    )}
                    aria-label="Scroll left"
                >
                    ←
                </button>
            )}
            
            <div
                ref={scrollContainerRef}
                className="overflow-x-auto scroll-smooth no-scrollbar"
            >
                <AdminTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    scrollable={true}
                    {...tabsProps}
                />
            </div>
            
            {showNavButtons && showRightButton && (
                <button
                    onClick={() => scroll('right')}
                    className={cn(
                        "absolute right-0 top-1/2 -translate-y-1/2 z-10",
                        "flex items-center justify-center w-8 h-8",
                        "bg-white dark:bg-gray-800 rounded-full shadow-lg",
                        "border border-gray-200 dark:border-gray-700",
                        "hover:bg-gray-50 dark:hover:bg-gray-700",
                        "transition-all duration-200",
                        autoHideNavButtons && "opacity-0 group-hover:opacity-100",
                        // Remove focus box from navigation buttons too
                        "focus:outline-none",
                        "focus-visible:outline-none",
                        "focus-visible:ring-0"
                    )}
                    aria-label="Scroll right"
                >
                    →
                </button>
            )}
        </div>
    );
};
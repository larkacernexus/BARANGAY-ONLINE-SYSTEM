import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, defaultValue, value: propValue, onValueChange, children, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  
  const value = propValue !== undefined ? propValue : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div 
        ref={ref} 
        className={cn("w-full touch-manipulation select-none", className)} 
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    scrollable?: boolean;
    centered?: boolean;
    fullWidth?: boolean;
    variant?: 'underlined' | 'pills' | 'segmented';
  }
>(({ className, scrollable = false, centered = false, fullWidth = false, variant = 'underlined', ...props }, ref) => {
  const containerClass = scrollable 
    ? "flex overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x" 
    : "flex";
  
  // Remove background and border for underlined variant
  const variantStyles = {
    underlined: "bg-transparent border-none shadow-none",
    pills: "bg-muted/30 p-1 rounded-xl border border-muted-foreground/10 shadow-sm shadow-black/5",
    segmented: "bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-border/50 shadow-sm shadow-black/5"
  };
  
  return (
    <div
      ref={ref}
      className={cn(
        containerClass,
        "min-h-12 w-full",
        centered ? "justify-center" : "justify-start",
        fullWidth && !scrollable ? "grid grid-flow-col" : "",
        "touch-manipulation select-none",
        variantStyles[variant],
        className
      )}
      role="tablist"
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  touchPadding?: boolean;
  icon?: React.ReactNode;
  textSize?: 'sm' | 'base' | 'lg';
  variant?: 'underlined' | 'pills' | 'segmented';
}

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, onClick, touchPadding = true, icon, textSize = 'base', variant = 'underlined', children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const rippleRef = React.useRef<HTMLSpanElement>(null);
  
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const isActive = context.value === value;

  // Get text size class based on prop
  const textSizeClass = {
    'sm': 'text-sm',
    'base': 'text-base',
    'lg': 'text-lg'
  }[textSize];

  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const ripple = rippleRef.current;
    if (!ripple) return;

    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    ripple.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;

    ripple.classList.add("animate-ripple");
    
    setTimeout(() => {
      ripple.classList.remove("animate-ripple");
    }, 600);
  };

  const handleInteraction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    createRipple(e);
    context.onValueChange(value);
    onClick?.(e);
    
    if (window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
  };

  const [isPressed, setIsPressed] = React.useState(false);

  // Variant-specific styles
  const variantStyles = {
    underlined: {
      base: cn(
        "relative flex items-center justify-center gap-2",
        "font-medium transition-all duration-200",
        "disabled:pointer-events-none disabled:opacity-30",
        "touch-manipulation select-none overflow-hidden",
        // Remove focus ring
        "focus:outline-none focus-visible:outline-none focus-visible:ring-0",
        // Remove active scale effect
        "active:scale-100 active:opacity-100"
      ),
      active: cn(
        "text-blue-600 dark:text-blue-400",
        "border-b-2 border-blue-500 pb-2"
      ),
      inactive: cn(
        "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
        "border-b-2 border-transparent pb-2"
      ),
      padding: touchPadding ? "px-4 py-3 min-h-12" : "px-4 py-2"
    },
    pills: {
      base: cn(
        "relative flex items-center justify-center gap-2",
        "font-medium transition-all duration-200 rounded-full",
        "disabled:pointer-events-none disabled:opacity-30",
        "touch-manipulation select-none overflow-hidden",
        "focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      ),
      active: cn(
        "bg-blue-500 text-white shadow-md dark:bg-blue-600"
      ),
      inactive: cn(
        "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
      ),
      padding: touchPadding ? "px-5 py-2 min-h-10" : "px-4 py-2"
    },
    segmented: {
      base: cn(
        "relative flex items-center justify-center gap-2",
        "font-medium transition-all duration-200 rounded-md",
        "disabled:pointer-events-none disabled:opacity-30",
        "touch-manipulation select-none overflow-hidden",
        "focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      ),
      active: cn(
        "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
      ),
      inactive: cn(
        "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
      ),
      padding: touchPadding ? "px-5 py-2 min-h-10" : "px-4 py-2"
    }
  };

  const styles = variantStyles[variant];

  return (
    <button
      ref={ref}
      className={cn(
        styles.base,
        styles.padding,
        textSizeClass,
        isActive ? styles.active : styles.inactive,
        // Full width handling
        "flex-1 min-w-0",
        // Snap for scrollable lists
        "snap-start",
        className
      )}
      onClick={handleInteraction}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onTouchCancel={() => setIsPressed(false)}
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      aria-label={`Tab: ${value}`}
      style={{
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
      {...props}
    >
      {/* Ripple effect */}
      <span
        ref={rippleRef}
        className="absolute inset-0 rounded-lg bg-gradient-to-b from-white/20 to-transparent opacity-0"
      />
      
      {/* Icon */}
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      {/* Text */}
      <span className="truncate">
        {children}
      </span>
      
      {/* Active indicator for underlined variant */}
      {variant === 'underlined' && isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
      )}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  unmountOnExit?: boolean;
  swipeable?: boolean;
}

const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps
>(({ className, value, unmountOnExit = false, swipeable = false, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = React.useState(0);
  const [touchEnd, setTouchEnd] = React.useState(0);
  const [swipeDirection, setSwipeDirection] = React.useState<'left' | 'right' | null>(null);
  
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  const isActive = context.value === value;

  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    if (!swipeable) return;
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    if (!swipeable) return;
    setTouchEnd(e.targetTouches[0].clientX);
    
    if (touchStart - touchEnd > minSwipeDistance) {
      setSwipeDirection('left');
    } else if (touchEnd - touchStart > minSwipeDistance) {
      setSwipeDirection('right');
    }
  };
  
  const onTouchEnd = () => {
    if (!swipeable) return;
    
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe || isRightSwipe) {
      if (window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
    }
    
    setSwipeDirection(null);
    setTouchStart(0);
    setTouchEnd(0);
  };

  if (unmountOnExit && !isActive) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
        (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cn(
        "mt-3 p-4 md:p-5",
        "ring-offset-background focus-visible:outline-none",
        "w-full transition-all duration-300 ease-out",
        "rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm",
        "shadow-sm shadow-black/5",
        !isActive && "hidden",
        swipeDirection === 'left' && "translate-x-2 opacity-90",
        swipeDirection === 'right' && "-translate-x-2 opacity-90",
        className
      )}
      role="tabpanel"
      aria-hidden={!isActive}
      data-state={isActive ? "active" : "inactive"}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = "TabsContent";

const TabsScrollContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    showScrollbar?: boolean;
    showNavButtons?: boolean;
    variant?: 'underlined' | 'pills' | 'segmented';
  }
>(({ className, showScrollbar = false, showNavButtons = true, variant = 'underlined', children, ...props }, ref) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    
    if (window.navigator.vibrate) {
      window.navigator.vibrate(5);
    }
  };

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden group",
        className
      )}
      {...props}
    >
      {showNavButtons && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex md:flex items-center justify-center w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border border-border hover:bg-background active:scale-95 transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex md:flex items-center justify-center w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border border-border hover:bg-background active:scale-95 transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-0"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
      
      <div 
        ref={scrollRef}
        className="overflow-x-auto scroll-smooth touch-pan-x"
        style={{
          scrollPadding: '0 1rem',
        }}
      >
        <TabsList 
          className={cn(
            "w-max px-4",
            !showScrollbar && "scrollbar-hide"
          )}
          scrollable={true}
          variant={variant}
        >
          {children}
        </TabsList>
      </div>
      
      {!showScrollbar && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </>
      )}
      
      <div className="flex justify-center gap-1 mt-2 md:hidden">
        {React.Children.map(children, (_, index) => (
          <span 
            key={index}
            className="w-2 h-2 rounded-full bg-muted-foreground/30"
          />
        ))}
      </div>
    </div>
  );
});
TabsScrollContainer.displayName = "TabsScrollContainer";

const TabsBottomBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'underlined' | 'pills' | 'segmented';
  }
>(({ className, variant = 'underlined', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-lg",
        "border-t border-border",
        "safe-bottom",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.1)]",
        className
      )}
      {...props}
    >
      <TabsList 
        className="bg-transparent border-none p-2 min-h-20"
        fullWidth={true}
        variant={variant}
      >
        {children}
      </TabsList>
    </div>
  );
});
TabsBottomBar.displayName = "TabsBottomBar";

const TabsSegmented = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    variant?: 'underlined' | 'pills' | 'segmented';
  }
>(({ className, variant = 'segmented', children, ...props }, ref) => {
  return (
    <Tabs
      ref={ref}
      className={cn(
        "bg-muted/30 p-1 rounded-2xl border border-border",
        className
      )}
      {...props}
    >
      <TabsList className="bg-transparent border-none p-0" fullWidth variant={variant}>
        {children}
      </TabsList>
    </Tabs>
  );
});
TabsSegmented.displayName = "TabsSegmented";

// Make sure all exports are properly defined
export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent, 
  TabsScrollContainer,
  TabsBottomBar,
  TabsSegmented
};
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
  }
>(({ className, scrollable = false, centered = false, fullWidth = false, ...props }, ref) => {
  const containerClass = scrollable 
    ? "flex overflow-x-auto scrollbar-hide snap-x snap-mandatory touch-pan-x" 
    : "flex";
  
  return (
    <div
      ref={ref}
      className={cn(
        containerClass,
        "min-h-16 w-full bg-muted/30 p-1 rounded-xl",
        "border border-muted-foreground/10",
        centered ? "justify-center" : "justify-start",
        fullWidth && !scrollable ? "grid grid-flow-col" : "",
        "touch-manipulation select-none",
        "shadow-sm shadow-black/5",
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
}

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, onClick, touchPadding = true, icon, textSize = 'base', children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const touchRef = React.useRef<HTMLButtonElement>(null);
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

  return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        "relative flex items-center justify-center gap-2",
        `flex-1 min-w-0 px-4 py-4 ${textSizeClass} font-medium transition-all duration-200`,
        "ring-offset-background focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-30",
        "touch-manipulation select-none overflow-hidden",
        "active:scale-[0.98] active:opacity-90",
        
        // Active state
        isActive 
          ? "bg-background text-foreground shadow-md rounded-lg border border-border/50" 
          : "text-muted-foreground active:bg-muted/50",
        
        // Touch padding
        touchPadding && "min-h-14 min-w-[5rem]",
        
        // Press feedback
        isPressed && "scale-[0.98] opacity-90",
        
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
        <span className="flex-shrink-0 text-lg">
          {icon}
        </span>
      )}
      
      {/* Text */}
      <span className="truncate">
        {children}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
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
  }
>(({ className, showScrollbar = false, showNavButtons = true, children, ...props }, ref) => {
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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex md:flex items-center justify-center w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border border-border hover:bg-background active:scale-95 transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden group-hover:flex md:flex items-center justify-center w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full shadow-lg border border-border hover:bg-background active:scale-95 transition-all"
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
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
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
  }
>(({ className, children, ...props }, ref) => {
  return (
    <Tabs
      ref={ref}
      className={cn(
        "bg-muted/30 p-1 rounded-2xl border border-border",
        className
      )}
      {...props}
    >
      <TabsList className="bg-transparent border-none p-0" fullWidth>
        {children}
      </TabsList>
    </Tabs>
  );
});
TabsSegmented.displayName = "TabsSegmented";

export { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent, 
  TabsScrollContainer,
  TabsBottomBar,
  TabsSegmented
};
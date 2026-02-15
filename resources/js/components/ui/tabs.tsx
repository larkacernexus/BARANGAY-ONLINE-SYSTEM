import * as React from "react";
import { cn } from "@/lib/utils";

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
        className={cn("w-full", className)} 
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
    fullWidth?: boolean;
  }
>(({ className, scrollable = false, fullWidth = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex border-b border-gray-200 dark:border-gray-800",
        "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gray-100 dark:after:bg-gray-900/50",
        scrollable ? "overflow-x-auto scrollbar-hide" : "",
        fullWidth ? "grid grid-flow-col" : "",
        className
      )}
      role="tablist"
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: React.ReactNode;
  textSize?: 'sm' | 'base' | 'lg';
  showCount?: boolean;
  count?: number;
}

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  TabsTriggerProps
>(({ className, value, onClick, icon, textSize = 'base', showCount = false, count, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const isActive = context.value === value;

  const textSizeClass = {
    'sm': 'text-sm',
    'base': 'text-sm md:text-base',
    'lg': 'text-base md:text-lg'
  }[textSize];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.onValueChange(value);
    onClick?.(e);
  };

  return (
    <button
      ref={ref}
      className={cn(
        // Base styles
        "relative flex items-center justify-center gap-2 px-4 py-3",
        `font-medium transition-all duration-200`,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50",
        "disabled:pointer-events-none disabled:opacity-30",
        
        // Text and spacing
        textSizeClass,
        
        // Active state - text color only
        isActive 
          ? "text-foreground font-semibold" 
          : "text-muted-foreground hover:text-foreground/80",
        
        className
      )}
      onClick={handleClick}
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      data-value={value}
      style={{
        WebkitTapHighlightColor: 'transparent',
      }}
      {...props}
    >
      {/* Active indicator line */}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-primary rounded-t-full transition-all duration-200" />
      )}
      
      {/* Hover effect */}
      <span className="absolute inset-0 bg-gray-100 dark:bg-gray-800/30 opacity-0 hover:opacity-100 transition-opacity duration-150 rounded-t-lg" />
      
      {/* Icon */}
      {icon && (
        <span className="flex-shrink-0 text-current">
          {icon}
        </span>
      )}
      
      {/* Text */}
      <span className="relative truncate whitespace-nowrap">
        {children}
      </span>
      
      {/* Count badge */}
      {showCount && count !== undefined && (
        <span className={cn(
          "flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-medium rounded-full transition-colors",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "bg-gray-100 dark:bg-gray-800 text-muted-foreground"
        )}>
          {count}
        </span>
      )}
    </button>
  );
});
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  unmountOnExit?: boolean;
}

const TabsContent = React.forwardRef<
  HTMLDivElement,
  TabsContentProps
>(({ className, value, unmountOnExit = false, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  const isActive = context.value === value;

  if (unmountOnExit && !isActive) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "pt-6",
        "focus-visible:outline-none",
        "w-full",
        !isActive && "hidden",
        className
      )}
      role="tabpanel"
      aria-hidden={!isActive}
      data-state={isActive ? "active" : "inactive"}
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
  }
>(({ className, showScrollbar = false, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full",
        className
      )}
      {...props}
    >
      <div className="relative">
        {/* Gradient fade on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div 
          className={cn(
            "overflow-x-auto scroll-smooth",
            !showScrollbar && "scrollbar-hide"
          )}
        >
          <TabsList 
            className="min-w-max"
            scrollable={true}
          >
            {children}
          </TabsList>
        </div>
      </div>
    </div>
  );
});
TabsScrollContainer.displayName = "TabsScrollContainer";

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
      className={cn(className)}
      {...props}
    >
      <TabsList className="bg-transparent p-0" fullWidth>
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
  TabsSegmented
};
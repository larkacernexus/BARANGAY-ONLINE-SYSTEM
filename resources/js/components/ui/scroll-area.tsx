import * as React from "react"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-auto",
      "[&>div]:max-h-full",
      className
    )}
    {...props}
  >
    <div className="h-full w-full rounded-[inherit]">
      {children}
    </div>
  </div>
))
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex touch-none select-none transition-colors",
      "absolute top-0 right-0 z-50 w-2.5",
      "hover:bg-gray-800/20 dark:hover:bg-gray-200/20",
      className
    )}
    {...props}
  >
    <div className="relative flex-1 rounded-full bg-gray-300 dark:bg-gray-700" />
  </div>
))
ScrollBar.displayName = "ScrollBar"

const ScrollViewport = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "h-full w-full overflow-auto",
      "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
ScrollViewport.displayName = "ScrollViewport"

export { ScrollArea, ScrollBar, ScrollViewport }
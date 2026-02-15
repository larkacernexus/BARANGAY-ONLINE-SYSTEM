// components/ui/grid-item-actions.tsx
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Edit, Trash2, Copy, Download, FileText } from 'lucide-react';
import { ReactNode } from 'react';

interface GridItemAction {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'ghost';
  className?: string;
}

interface GridItemActionsProps {
  actions: GridItemAction[];
  showThreeDots?: boolean;
  className?: string;
}

export function GridItemActions({ 
  actions, 
  showThreeDots = true,
  className = '' 
}: GridItemActionsProps) {
  
  // If we're showing the three-dots menu
  if (showThreeDots) {
    return (
      <div className={`flex justify-end pt-2 border-t ${className}`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {actions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={action.onClick}
                className={action.className}
              >
                <span className="mr-2">{action.icon}</span>
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Original inline buttons layout
  return (
    <div className={`flex justify-between pt-2 border-t ${className}`}>
      {actions.map((action, index) => (
        <Button
          key={index}
          size="sm"
          variant={action.variant || 'ghost'}
          onClick={action.onClick}
          className={action.className}
          title={action.label}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  );
}
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Bell, HelpCircle, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type ReactNode } from 'react';

interface AppSidebarHeaderProps {
    breadcrumbs?: BreadcrumbItemType[];
    title?: string;
    description?: string;
    headerActions?: ReactNode;
    user?: {
        name: string;
        role: string;
        avatar?: string;
        initials?: string;
    };
}

export function AppSidebarHeader({
    breadcrumbs = [],
    title,
    description,
    headerActions,
    user = {
        name: 'John Doe',
        role: 'Administrator',
        avatar: 'https://github.com/shadcn.png',
        initials: 'JD'
    },
}: AppSidebarHeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 bg-background">
            {/* Left side: Sidebar trigger, breadcrumbs, and title */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <SidebarTrigger className="-ml-1" />
                <div className="flex flex-col min-w-0">
                    {/* Breadcrumbs row - hidden on phone, visible on tablet and above */}
                    {breadcrumbs.length > 0 && (
                        <div className="hidden md:flex items-center gap-2">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    )}
                    
                    {/* Title and description */}
                    {(title || description) && (
                        <div className="min-w-0">
                            {title && (
                                <h1 className="text-xl font-semibold text-foreground truncate">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="text-sm text-muted-foreground truncate">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: Search, Help, Notifications, User menu */}
            <div className="flex items-center gap-4">
                {/* Search button */}
                <button 
                    className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    aria-label="Search"
                >
                    <Search className="h-5 w-5" />
                </button>

                {/* Help button */}
                <button 
                    className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                    aria-label="Help"
                >
                    <HelpCircle className="h-5 w-5" />
                </button>

                {/* Notifications with badge */}
                <div className="relative">
                    <button 
                        className="p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label="Notifications"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background"></span>
                    </button>
                </div>

                {/* User avatar and info */}
                <div className="flex items-center gap-3 pl-2 border-l border-border">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block">
                        <p className="text-sm font-medium text-foreground">
                            {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {user.role}
                        </p>
                    </div>
                </div>

                {/* Custom header actions */}
                {headerActions && (
                    <div className="ml-2">
                        {headerActions}
                    </div>
                )}
            </div>
        </header>
    );
}
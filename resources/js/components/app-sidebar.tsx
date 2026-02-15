import { NavUser } from '@/components/nav-user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    AlertOctagon as AlertOctagonIcon,
    Award,
    BarChart3,
    Bell,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle,
    ChevronDown,
    Clock,
    CreditCard,
    Database,
    DollarSign,
    Eye,
    FileBarChart,
    FileBox,
    FilePlus,
    FileText,
    FileType,
    FolderOpen,
    History,
    Home,
    Key,
    LayoutGrid,
    Link as LinkIcon,
    Lock,
    LogIn,
    Megaphone,
    Monitor,
    Palette,
    PlusCircle,
    Receipt,
    Scale,
    Server,
    Settings,
    Shield,
    ShieldCheck,
    Sparkles,
    Tag,
    User,
    UserCheck,
    UserCog,
    Users,
    Users2,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const DASHBOARD_URL = '/dashboard';

// Define interfaces
interface SidebarItem {
    title: string;
    href: string;
    icon: LucideIcon;
    badge?: number | string;
    isActive?: (currentUrl: string) => boolean;
    description?: string;
    color?: string;
    requiredPermission?: string;
    isNew?: boolean;
    isUpdated?: boolean;
}

interface QuickAction extends SidebarItem {
    color:
        | 'blue'
        | 'green'
        | 'purple'
        | 'orange'
        | 'red'
        | 'indigo'
        | 'amber'
        | 'cyan'
        | 'lime'
        | 'pink'
        | 'violet'
        | 'yellow';
}

interface SidebarCategory {
    title: string;
    icon: LucideIcon;
    items: SidebarItem[];
}

// Tab types
type SidebarTab = 'operations' | 'settings';

// Compact Menu Item Component
const CompactMenuItem = ({
    item,
    type = 'operations',
}: {
    item: SidebarItem;
    type?: SidebarTab;
}) => {
    const { url: currentUrl } = usePage();
    const isActive = item.isActive
        ? item.isActive(currentUrl)
        : currentUrl === item.href;

    const colors = {
        operations: {
            activeText: 'text-blue-700 dark:text-blue-300',
            activeBg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        settings: {
            activeText: 'text-purple-700 dark:text-purple-300',
            activeBg: 'bg-purple-50 dark:bg-purple-900/20',
        },
    };

    const currentColors = colors[type];

    return (
        <DropdownMenuItem asChild>
            <Link
                href={item.href}
                className={cn(
                    'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
                    isActive &&
                        cn(currentColors.activeBg, currentColors.activeText),
                )}
            >
                <div
                    className={cn(
                        'flex h-5 w-5 items-center justify-center rounded',
                        isActive
                            ? item.color ||
                                  (type === 'operations'
                                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400'
                                      : 'bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-400')
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                    )}
                >
                    <item.icon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                        <span className="truncate font-medium">
                            {item.title}
                        </span>
                        <div className="flex items-center gap-1">
                            {item.isNew && (
                                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-800 dark:text-green-300">
                                    New
                                </span>
                            )}
                            {item.isUpdated && (
                                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                    Updated
                                </span>
                            )}
                            {item.badge && (
                                <span
                                    className={cn(
                                        'ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                        type === 'operations'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
                                    )}
                                >
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    </div>
                    {item.description && (
                        <span className="block truncate text-[10px] text-gray-500 dark:text-gray-400">
                            {item.description}
                        </span>
                    )}
                </div>
            </Link>
        </DropdownMenuItem>
    );
};

// Regular Menu Item Component
const RegularMenuItem = ({
    item,
    isCollapsed,
    type = 'operations',
}: {
    item: SidebarItem;
    isCollapsed: boolean;
    type?: SidebarTab;
}) => {
    const { url: currentUrl } = usePage();
    const isActive = item.isActive
        ? item.isActive(currentUrl)
        : currentUrl === item.href;

    const colors = {
        operations: {
            activeBg: 'bg-blue-50 dark:bg-blue-900/20',
            activeText: 'text-blue-700 dark:text-blue-300',
            activeBorder: 'bg-blue-600 dark:bg-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
            badgeBg:
                'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
        },
        settings: {
            activeBg: 'bg-purple-50 dark:bg-purple-900/20',
            activeText: 'text-purple-700 dark:text-purple-300',
            activeBorder: 'bg-purple-600 dark:bg-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
            badgeBg:
                'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
        },
    };

    const currentColors = colors[type];

    return (
        <SidebarMenuItem key={item.title}>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <SidebarMenuButton asChild>
                        <Link
                            href={item.href}
                            className={cn(
                                'relative flex items-center gap-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
                                isCollapsed ? 'justify-center px-1' : 'px-2',
                                isActive &&
                                    cn(
                                        currentColors.activeBg,
                                        currentColors.activeText,
                                    ),
                            )}
                        >
                            {isActive && !isCollapsed && (
                                <div
                                    className={cn(
                                        'absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 transform rounded-r-full',
                                        currentColors.activeBorder,
                                    )}
                                />
                            )}
                            <div className="relative">
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded transition-colors',
                                        isCollapsed ? 'h-6 w-6' : 'h-7 w-7',
                                        isActive
                                            ? currentColors.iconBg
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            isCollapsed
                                                ? 'h-3 w-3'
                                                : 'h-3.5 w-3.5',
                                        )}
                                    />
                                </div>
                                {item.isNew && !isCollapsed && (
                                    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900" />
                                )}
                            </div>
                            {!isCollapsed && (
                                <>
                                    <div className="flex min-w-0 flex-1 flex-col items-start">
                                        <div className="flex items-center gap-1">
                                            <span className="truncate text-xs font-medium">
                                                {item.title}
                                            </span>
                                            {item.isNew && (
                                                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-800 dark:text-green-300">
                                                    New
                                                </span>
                                            )}
                                            {item.isUpdated && (
                                                <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                                                    Updated
                                                </span>
                                            )}
                                        </div>
                                        {item.description && (
                                            <span className="truncate text-[10px] leading-tight text-gray-500 dark:text-gray-400">
                                                {item.description}
                                            </span>
                                        )}
                                    </div>
                                    {item.badge && (
                                        <span
                                            className={cn(
                                                'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                                currentColors.badgeBg,
                                            )}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                        </Link>
                    </SidebarMenuButton>
                </TooltipTrigger>
                {isCollapsed && (
                    <TooltipContent
                        side="right"
                        className="flex max-w-[200px] flex-col items-start"
                    >
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-medium">{item.title}</p>
                            {item.isNew && (
                                <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-800 dark:text-green-300">
                                    New
                                </span>
                            )}
                        </div>
                        {item.description && (
                            <p className="mt-0.5 text-xs text-gray-500">
                                {item.description}
                            </p>
                        )}
                        {item.badge && (
                            <span
                                className={cn(
                                    'mt-1 rounded-full px-1.5 py-0.5 text-xs font-medium',
                                    currentColors.badgeBg,
                                )}
                            >
                                {item.badge}
                            </span>
                        )}
                    </TooltipContent>
                )}
            </Tooltip>
        </SidebarMenuItem>
    );
};

// Category Component
const CategoryItem = ({
    category,
    type = 'operations',
    isCollapsed,
}: {
    category: SidebarCategory;
    type?: SidebarTab;
    isCollapsed: boolean;
}) => {
    const { url: currentUrl } = usePage();

    // If only 1 item, render as regular menu item
    if (category.items.length === 1) {
        return (
            <RegularMenuItem
                item={category.items[0]}
                isCollapsed={isCollapsed}
                type={type}
            />
        );
    }

    // For multiple items, use dropdown
    const isAnyActive = category.items.some((item) =>
        item.isActive ? item.isActive(currentUrl) : currentUrl === item.href,
    );

    const colors = {
        operations: {
            activeText: 'text-blue-700 dark:text-blue-300',
            activeBg: 'bg-blue-50 dark:bg-blue-900/20',
            activeBorder: 'border-blue-600 dark:border-blue-400',
            iconBg: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
        },
        settings: {
            activeText: 'text-purple-700 dark:text-purple-300',
            activeBg: 'bg-purple-50 dark:bg-purple-900/20',
            activeBorder: 'border-purple-600 dark:border-purple-400',
            iconBg: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
        },
    };

    const currentColors = colors[type];

    if (isCollapsed) {
        return (
            <SidebarMenuItem>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <div className="flex justify-center px-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            'h-7 w-7 transition-colors',
                                            isAnyActive &&
                                                cn(
                                                    currentColors.iconBg,
                                                    'border',
                                                    currentColors.activeBorder,
                                                ),
                                        )}
                                    >
                                        <category.icon className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="right"
                                    align="start"
                                    className="max-h-[400px] w-64 overflow-y-auto"
                                >
                                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold">
                                        <category.icon className="h-3.5 w-3.5" />
                                        {category.title}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {category.items.map((item) => (
                                        <CompactMenuItem
                                            key={`${category.title}-${item.title}-${item.href}`}
                                            item={item}
                                            type={type}
                                        />
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p className="text-sm font-medium">{category.title}</p>
                        <p className="text-xs text-gray-500">
                            {category.items.length} items
                        </p>
                    </TooltipContent>
                </Tooltip>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            'w-full justify-start px-2 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800',
                            isAnyActive && currentColors.activeBg,
                        )}
                    >
                        <div className="flex w-full items-center gap-2">
                            <div
                                className={cn(
                                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded',
                                    isAnyActive
                                        ? currentColors.iconBg
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                                )}
                            >
                                <category.icon className="h-3 w-3" />
                            </div>
                            <div className="flex flex-1 items-center justify-between">
                                <span className="truncate text-left">
                                    {category.title}
                                </span>
                                <ChevronDown className="h-3 w-3 flex-shrink-0 text-gray-400" />
                            </div>
                            {isAnyActive && (
                                <div
                                    className={cn(
                                        'h-1.5 w-1.5 rounded-full',
                                        currentColors.activeBorder.replace(
                                            'border-',
                                            'bg-',
                                        ),
                                    )}
                                />
                            )}
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="right"
                    align="start"
                    className="max-h-[400px] w-64 overflow-y-auto"
                >
                    <DropdownMenuLabel className="flex items-center gap-2 text-xs font-semibold">
                        <category.icon className="h-3.5 w-3.5" />
                        {category.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {category.items.map((item) => (
                        <CompactMenuItem
                            key={`${category.title}-${item.title}-${item.href}`}
                            item={item}
                            type={type}
                        />
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};

// Quick Action Item
const QuickActionItem = ({
    action,
    isCollapsed,
}: {
    action: QuickAction;
    isCollapsed: boolean;
}) => {
    const iconClasses = {
        blue: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
        green: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
        purple: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
        red: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
        indigo: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400',
        amber: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
        cyan: 'bg-cyan-100 dark:bg-cyan-800 text-cyan-600 dark:text-cyan-400',
        lime: 'bg-lime-100 dark:bg-lime-800 text-lime-600 dark:text-lime-400',
        pink: 'bg-pink-100 dark:bg-pink-800 text-pink-600 dark:text-pink-400',
        violet: 'bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-400',
        yellow: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400',
    };

    const hoverIconClasses = {
        blue: 'hover:bg-blue-200 dark:hover:bg-blue-700 hover:text-blue-700 dark:hover:text-blue-300',
        green: 'hover:bg-green-200 dark:hover:bg-green-700 hover:text-green-700 dark:hover:text-green-300',
        purple: 'hover:bg-purple-200 dark:hover:bg-purple-700 hover:text-purple-700 dark:hover:text-purple-300',
        orange: 'hover:bg-orange-200 dark:hover:bg-orange-700 hover:text-orange-700 dark:hover:text-orange-300',
        red: 'hover:bg-red-200 dark:hover:bg-red-700 hover:text-red-700 dark:hover:text-red-300',
        indigo: 'hover:bg-indigo-200 dark:hover:bg-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300',
        amber: 'hover:bg-amber-200 dark:hover:bg-amber-700 hover:text-amber-700 dark:hover:text-amber-300',
        cyan: 'hover:bg-cyan-200 dark:hover:bg-cyan-700 hover:text-cyan-700 dark:hover:text-cyan-300',
        lime: 'hover:bg-lime-200 dark:hover:bg-lime-700 hover:text-lime-700 dark:hover:text-lime-300',
        pink: 'hover:bg-pink-200 dark:hover:bg-pink-700 hover:text-pink-700 dark:hover:text-pink-300',
        violet: 'hover:bg-violet-200 dark:hover:bg-violet-700 hover:text-violet-700 dark:hover:text-violet-300',
        yellow: 'hover:bg-yellow-200 dark:hover:bg-yellow-700 hover:text-yellow-700 dark:hover:text-yellow-300',
    };

    if (isCollapsed) {
        return (
            <SidebarMenuItem>
                <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                            <Link
                                href={action.href}
                                className="flex justify-center px-1"
                            >
                                <div
                                    className={cn(
                                        'flex items-center justify-center rounded-lg transition-all hover:scale-110',
                                        'h-6 w-6',
                                        iconClasses[action.color],
                                        hoverIconClasses[action.color],
                                    )}
                                >
                                    <action.icon className="h-3 w-3" />
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </TooltipTrigger>
                    <TooltipContent
                        side="right"
                        className="flex max-w-[180px] flex-col items-start"
                    >
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-medium">
                                {action.title}
                            </p>
                            <Sparkles className="h-3 w-3 text-amber-500" />
                        </div>
                        <p className="text-xs text-gray-500">Quick action</p>
                    </TooltipContent>
                </Tooltip>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild>
                <Link
                    href={action.href}
                    className={cn(
                        'group flex items-center gap-2 px-2 py-1.5 transition-all',
                        'rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50',
                    )}
                >
                    <div
                        className={cn(
                            'flex items-center justify-center rounded-lg transition-transform',
                            'h-7 w-7 shrink-0',
                            iconClasses[action.color],
                            'group-hover:scale-110',
                        )}
                    >
                        <action.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="truncate text-xs font-medium">
                                {action.title}
                            </span>
                            <Sparkles className="h-2.5 w-2.5 shrink-0 text-amber-500 dark:text-amber-400" />
                        </div>
                        <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                            Quick action
                        </span>
                    </div>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
};

// Compact Tab Switcher Component
const TabSwitcher = ({
    activeTab,
    handleTabChange,
    isCollapsed,
}: {
    activeTab: SidebarTab;
    handleTabChange: (tab: SidebarTab) => void;
    isCollapsed: boolean;
}) => {
    if (isCollapsed) {
        return (
            <div className="mb-3 flex flex-col items-center gap-1 px-1">
                <Button
                    size="icon"
                    variant={activeTab === 'operations' ? 'default' : 'ghost'}
                    className={cn(
                        'h-7 w-7 transition-all',
                        activeTab === 'operations'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white hover:from-blue-700 hover:to-blue-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                    )}
                    onClick={() => handleTabChange('operations')}
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                    size="icon"
                    variant={activeTab === 'settings' ? 'default' : 'ghost'}
                    className={cn(
                        'h-7 w-7 transition-all',
                        activeTab === 'settings'
                            ? 'bg-gradient-to-br from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                    )}
                    onClick={() => handleTabChange('settings')}
                >
                    <Settings className="h-3.5 w-3.5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-3 flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800">
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-8 flex-1 rounded text-xs transition-all',
                    activeTab === 'operations'
                        ? 'bg-white text-blue-700 shadow-sm dark:bg-gray-900 dark:text-blue-300'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700',
                )}
                onClick={() => handleTabChange('operations')}
            >
                <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
                Operations
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    'h-8 flex-1 rounded text-xs transition-all',
                    activeTab === 'settings'
                        ? 'bg-white text-purple-700 shadow-sm dark:bg-gray-900 dark:text-purple-300'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700',
                )}
                onClick={() => handleTabChange('settings')}
            >
                <Settings className="mr-1.5 h-3.5 w-3.5" />
                Settings
            </Button>
        </div>
    );
};

// Stats Card Component
const StatsCard = ({
    icon: Icon,
    title,
    value,
    color,
    isCollapsed,
}: {
    icon: LucideIcon;
    title: string;
    value: number;
    color: string;
    isCollapsed: boolean;
}) => {
    if (isCollapsed) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <Icon className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-gray-500">{value} items</p>
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-800/50">
            <div
                className={cn(
                    'flex h-6 w-6 items-center justify-center rounded',
                    color,
                )}
            >
                <Icon className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    {title}
                </div>
                <div className="text-xs font-semibold">{value}</div>
            </div>
        </div>
    );
};

export function AppSidebar({ className }: { className?: string }) {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const { url: currentUrl, props } = usePage() as any;
    const [activeTab, setActiveTab] = useState<SidebarTab>('operations');

    // Get user permissions and role from Inertia props
    const user = props?.auth?.user;
    const userPermissions = (user?.permissions || []) as string[];
    const userRoleName = (user?.role_name || user?.role?.name || '') as string;

    // Get report stats from props if available
    const reportStats = props?.reportStats || {
        total: 0,
        pending: 0,
        community_reports: 0,
        blotters: 0,
        today: 0,
        under_review: 0,
        assigned: 0,
        in_progress: 0,
        resolved: 0,
        rejected: 0,
        high_priority: 0,
    };

    // Helper function to check if user has permission
    const hasPermission = (permission: string | undefined): boolean => {
        if (!permission) return true;
        if (userRoleName === 'admin' || userRoleName === 'barangay_officer')
            return true;
        return userPermissions.includes(permission);
    };

    // Set initial tab based on URL
    useEffect(() => {
        const url = currentUrl.split('?')[0];

        // Settings pages
        const settingsPaths = [
            '/adminsettings',
            '/users',
            '/roles',
            '/permissions',
            '/role-permissions',
            '/audit-logs',
            '/security',
            '/backup',
            '/puroks',
            '/positions',
            '/committees',
            '/officials',
            '/clearance-types',
            '/fee-types',
            '/report-types',
            '/document-types',
            '/reports/activity-logs',
            '/reports/login-logs',
        ];

        if (settingsPaths.some((path) => url.startsWith(path))) {
            setActiveTab('settings');
        }
    }, []);

    // Operations navigation - categorized WITH PERMISSIONS
    const operationsCategories = useMemo(() => {
        const allCategories: SidebarCategory[] = [
            {
                title: 'Dashboard',
                icon: LayoutGrid,
                items: [
                    {
                        title: 'Overview',
                        href: '/dashboard',
                        icon: LayoutGrid,
                        description: 'System overview',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url === '/dashboard' || url === '/admin',
                        requiredPermission: 'view-dashboard',
                    },
                ],
            },
            {
                title: 'Incident Management',
                icon: AlertCircle,
                items: [
                    {
                        title: 'All Reports',
                        href: '/admin/community-reports',
                        icon: FolderOpen,
                        description: 'Community reports',
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/community-reports') &&
                            !url.includes('/create'),
                        requiredPermission: 'view-reports',
                        badge: reportStats.total,
                    },
                    {
                        title: 'New Report',
                        href: '/admin/community-reports/create',
                        icon: FilePlus,
                        description: 'Create community report',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url === '/admin/community-reports/create',
                        requiredPermission: 'create-reports',
                        isNew: true,
                    },
                    {
                        title: 'Pending Review',
                        href: '/admin/community-reports?status=pending',
                        icon: AlertCircle,
                        description: 'Needs attention',
                        color: 'bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400',
                        isActive: (url: string) =>
                            url.includes('status=pending'),
                        requiredPermission: 'review-reports',
                        badge: reportStats.pending,
                    },
                    {
                        title: 'In Progress',
                        href: '/admin/community-reports?status=in_progress',
                        icon: Clock,
                        description: 'Being processed',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url.includes('status=in_progress'),
                        requiredPermission: 'view-reports',
                        badge: reportStats.in_progress,
                    },
                    {
                        title: 'Assigned',
                        href: '/admin/community-reports?status=assigned',
                        icon: UserCheck,
                        description: 'Assigned to staff',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) =>
                            url.includes('status=assigned'),
                        requiredPermission: 'view-reports',
                        badge: reportStats.assigned,
                    },
                    {
                        title: 'Blotters',
                        href: '/admin/blotters',
                        icon: Scale,
                        description: 'Mediation cases',
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/blotters'),
                        requiredPermission: 'manage-blotters',
                        badge: reportStats.blotters,
                        isUpdated: true,
                    },
                ],
            },
            {
                title: 'Residents',
                icon: Users,
                items: [
                    {
                        title: 'All Residents',
                        href: '/residents',
                        icon: Users,
                        description: 'Manage residents',
                        badge: 5,
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url.startsWith('/residents') &&
                            !url.includes('/create'),
                        requiredPermission: 'manage-residents',
                    },
                    {
                        title: 'Households',
                        href: '/households',
                        icon: Home,
                        description: 'Manage households',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/households') &&
                            !url.includes('/create'),
                        requiredPermission: 'manage-households',
                    },
                ],
            },
            {
                title: 'Services',
                icon: FileText,
                items: [
                    {
                        title: 'Forms',
                        href: '/forms',
                        icon: FileText,
                        description: 'Downloadable forms',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) =>
                            url.startsWith('/forms') &&
                            !url.includes('/create'),
                        requiredPermission: 'manage-forms',
                    },
                    {
                        title: 'Announcements',
                        href: '/announcements',
                        icon: Megaphone,
                        description: 'Public announcements',
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) =>
                            url.startsWith('/announcements') &&
                            !url.includes('/create'),
                        requiredPermission: 'view-announcements',
                    },
                    {
                        title: 'Clearances',
                        href: '/clearances',
                        icon: CheckCircle,
                        description: 'Barangay clearances',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/clearances') &&
                            !url.startsWith('/clearances/approval'),
                        requiredPermission: 'view-clearances',
                    },
                    {
                        title: 'Calendar',
                        href: '/calendar',
                        icon: Calendar,
                        description: 'Events & schedules',
                        color: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400',
                        isActive: (url: string) => url.startsWith('/calendar'),
                        requiredPermission: 'view-calendar',
                        isNew: true,
                    },
                ],
            },
            {
                title: 'Payments',
                icon: CreditCard,
                items: [
                    {
                        title: 'Fees',
                        href: '/fees',
                        icon: DollarSign,
                        description: 'Manage fees',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/fees') && !url.includes('/create'),
                        requiredPermission: 'view-fees',
                    },
                    {
                        title: 'Payments',
                        href: '/payments',
                        icon: CreditCard,
                        description: 'Payment records',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url.startsWith('/payments') &&
                            !url.includes('/create'),
                        requiredPermission: 'view-payments',
                    },
                    {
                        title: 'Receipts',
                        href: '/receipts',
                        icon: Receipt,
                        description: 'Generate receipts',
                        color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
                        isActive: (url: string) => url.startsWith('/receipts'),
                        requiredPermission: 'manage-payments',
                    },
                ],
            },
            {
                title: 'Reports',
                icon: BarChart3,
                items: [
                    {
                        title: 'Collections',
                        href: '/reports/collections',
                        icon: FileText,
                        description: 'Payment collections',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url === '/reports/collections',
                        requiredPermission: 'view-reports',
                    },
                    {
                        title: 'Revenue',
                        href: '/reports/revenue',
                        icon: BarChart3,
                        description: 'Revenue analytics',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url === '/reports/revenue',
                        requiredPermission: 'view-reports',
                    },
                    {
                        title: 'Community Reports',
                        href: '/admin/community-reports/statistics',
                        icon: FileBarChart,
                        description: 'Report analytics',
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) =>
                            url === '/admin/community-reports/statistics',
                        requiredPermission: 'view-reports',
                        isNew: true,
                    },
                ],
            },
        ];

        // Filter categories based on permissions
        return allCategories
            .map((category) => ({
                ...category,
                items: category.items.filter((item) =>
                    hasPermission(item.requiredPermission),
                ),
            }))
            .filter((category) => category.items.length > 0);
    }, [userPermissions, userRoleName, reportStats]);

    // Settings navigation WITH PERMISSIONS
    const settingsCategories = useMemo(() => {
        const allCategories: SidebarCategory[] = [
            {
                title: 'Personal',
                icon: UserCog,
                items: [
                    {
                        title: 'Profile',
                        href: '/adminsettings/profile',
                        icon: User,
                        description: 'Personal info',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url === '/adminsettings/profile',
                        requiredPermission: undefined,
                    },
                    {
                        title: 'Password',
                        href: '/adminsettings/password',
                        icon: Lock,
                        description: 'Change password',
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) =>
                            url === '/adminsettings/password',
                        requiredPermission: undefined,
                    },
                    {
                        title: 'Theme',
                        href: '/adminsettings/appearance',
                        icon: Palette,
                        description: 'Appearance',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) =>
                            url === '/adminsettings/appearance',
                        requiredPermission: undefined,
                    },
                ],
            },
            {
                title: 'Barangay',
                icon: Building2,
                items: [
                    {
                        title: 'Puroks',
                        href: '/puroks',
                        icon: Briefcase,
                        description: 'Manage zones',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/puroks'),
                        requiredPermission: 'manage-puroks',
                    },
                    {
                        title: 'Positions',
                        href: '/positions',
                        icon: Briefcase,
                        description: 'Official roles',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url.startsWith('/positions'),
                        requiredPermission: 'manage-positions',
                    },
                    {
                        title: 'Committees',
                        href: '/committees',
                        icon: Users2,
                        description: 'Barangay committees',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) =>
                            url.startsWith('/committees'),
                        requiredPermission: 'manage-committees',
                    },
                    {
                        title: 'Officials',
                        href: '/officials',
                        icon: Award,
                        description: 'Manage officials',
                        color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
                        isActive: (url: string) => url.startsWith('/officials'),
                        requiredPermission: 'manage-officials',
                    },
                ],
            },
            {
                title: 'Users & Roles',
                icon: Users,
                items: [
                    {
                        title: 'Users',
                        href: '/users',
                        icon: Users,
                        description: 'Manage users',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/users'),
                        requiredPermission: 'manage-users',
                    },
                    {
                        title: 'Roles',
                        href: '/roles',
                        icon: Shield,
                        description: 'Manage roles',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.startsWith('/roles'),
                        requiredPermission: 'manage-roles',
                    },
                    {
                        title: 'Permissions',
                        href: '/permissions',
                        icon: Key,
                        description: 'Manage permissions',
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) =>
                            url.startsWith('/permissions'),
                        requiredPermission: 'manage-permissions',
                    },
                    {
                        title: 'Assign Permissions',
                        href: '/role-permissions',
                        icon: LinkIcon,
                        description: 'Assign permissions to roles',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/role-permissions'),
                        requiredPermission: 'manage-permissions',
                        isNew: true,
                    },
                ],
            },
            {
                title: 'Security',
                icon: ShieldCheck,
                items: [
                    {
                        title: 'Security Audit',
                        href: '/security/security-audit',
                        icon: ShieldCheck,
                        description: 'Compliance reports',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url === '/security/security-audit',
                        requiredPermission: 'view-security-logs',
                    },
                    {
                        title: 'Access Logs',
                        href: '/security/access-logs',
                        icon: Eye,
                        description: 'Access monitoring',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url === '/security/access-logs',
                        requiredPermission: 'view-security-logs',
                    },
                    {
                        title: 'Audit Logs',
                        href: '/audit-logs',
                        icon: History,
                        description: 'Compliance audit trail',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url === '/audit-logs',
                        requiredPermission: 'view-reports',
                    },
                    {
                        title: 'Activity Logs',
                        href: '/reports/activity-logs',
                        icon: Activity,
                        description: 'System activities',
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) =>
                            url.startsWith('/reports/activity-logs'),
                        requiredPermission: 'view-reports',
                    },
                    {
                        title: 'Login Logs',
                        href: '/reports/login-logs',
                        icon: LogIn,
                        description: 'Authentication history',
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) =>
                            url.startsWith('/reports/login-logs'),
                        requiredPermission: 'view-reports',
                    },
                    {
                        title: 'Sessions',
                        href: '/security/sessions',
                        icon: Monitor,
                        description: 'Active sessions',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url === '/security/sessions',
                        requiredPermission: 'view-security-logs',
                    },
                ],
            },
            {
                title: 'System',
                icon: Server,
                items: [
                    {
                        title: 'Backup',
                        href: '/backup',
                        icon: Database,
                        description: 'Backup & restore',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/backup'),
                        requiredPermission: 'manage-backups',
                    },
                    {
                        title: 'Clearance Types',
                        href: '/clearance-types',
                        icon: FileType,
                        description: 'Clearance categories',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/clearance-types'),
                        requiredPermission: 'manage-clearance-types',
                    },
                    {
                        title: 'Fee Types',
                        href: '/fee-types',
                        icon: Tag,
                        description: 'Fee categories',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.startsWith('/fee-types'),
                        requiredPermission: 'manage-fee-types',
                    },
                    {
                        title: 'Report Types',
                        href: '/report-types',
                        icon: FileText,
                        description: 'Community report categories',
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) =>
                            url.startsWith('/report-types'),
                        requiredPermission: 'manage-report-types',
                        isNew: true,
                    },
                    {
                        title: 'Document Types',
                        href: '/document-types',
                        icon: FileBox,
                        description: 'Document categories & requirements',
                        color: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400',
                        isActive: (url: string) =>
                            url.startsWith('/document-types'),
                        requiredPermission: 'manage-document-types',
                        isNew: true,
                    },
                ],
            },
        ];

        // Filter categories based on permissions
        return allCategories
            .map((category) => ({
                ...category,
                items: category.items.filter((item) =>
                    hasPermission(item.requiredPermission),
                ),
            }))
            .filter((category) => category.items.length > 0);
    }, [userPermissions, userRoleName]);

    // Quick Actions with permission checks
    const quickActions = useMemo(() => {
        const actions: QuickAction[] = [
            {
                title: 'Requests',
                href: '/clearances/approval/requests',
                icon: FilePlus,
                color: 'orange',
                requiredPermission: 'issue-clearances',
            },
            {
                title: 'Add Resident',
                href: '/residents/create',
                icon: Users,
                color: 'blue',
                requiredPermission: 'manage-residents',
            },
            {
                title: 'Add Household',
                href: '/households/create',
                icon: Home,
                color: 'green',
                requiredPermission: 'manage-households',
            },
            {
                title: 'New Announcement',
                href: '/announcements/create',
                icon: Bell,
                color: 'red',
                requiredPermission: 'manage-announcements',
            },
            {
                title: 'Upload Form',
                href: '/forms/create',
                icon: PlusCircle,
                color: 'purple',
                requiredPermission: 'manage-forms',
            },
            {
                title: 'New Report',
                href: '/admin/community-reports/create',
                icon: AlertCircle,
                color: 'yellow',
                requiredPermission: 'create-reports',
            },
            {
                title: 'Assigned to Me',
                href: '/admin/community-reports?assigned_to=me',
                icon: User,
                color: 'indigo',
                requiredPermission: 'view-reports',
            },
        ];

        return actions.filter((action) =>
            hasPermission(action.requiredPermission),
        );
    }, [userPermissions, userRoleName]);

    // Today's Activity Stats
    const renderTodayStats = () => {
        if (isCollapsed || reportStats.today === 0) return null;

        return (
            <div className="mb-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 p-2.5 dark:from-orange-900/20 dark:to-amber-900/20">
                <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <Activity className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs font-medium text-orange-900 dark:text-orange-200">
                            Today's Activity
                        </span>
                    </div>
                    <Badge
                        variant="outline"
                        className="h-5 border-orange-200 bg-orange-100 px-1.5 text-[10px] text-orange-700 dark:border-orange-800 dark:bg-orange-900 dark:text-orange-300"
                    >
                        {reportStats.today} new
                    </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <StatsCard
                        icon={AlertCircle}
                        title="Community"
                        value={reportStats.community_reports}
                        color="bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400"
                        isCollapsed={isCollapsed}
                    />
                    <StatsCard
                        icon={Scale}
                        title="Blotters"
                        value={reportStats.blotters}
                        color="bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400"
                        isCollapsed={isCollapsed}
                    />
                </div>
            </div>
        );
    };

    // Pending Cases Alert
    const renderPendingAlert = () => {
        if (isCollapsed || reportStats.pending === 0) return null;

        return (
            <div className="mb-3 rounded-lg border border-yellow-200 bg-yellow-50 p-2.5 dark:border-yellow-800 dark:bg-yellow-900/20">
                <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-900 dark:text-yellow-200">
                            Attention Needed
                        </span>
                    </div>
                    <Badge
                        variant="destructive"
                        className="h-5 animate-pulse px-1.5 text-[10px]"
                    >
                        {reportStats.pending} pending
                    </Badge>
                </div>
                <div className="text-[10px] text-yellow-800 dark:text-yellow-300">
                    {reportStats.pending === 1
                        ? '1 community report needs review'
                        : `${reportStats.pending} community reports need review`}
                </div>
            </div>
        );
    };

    // Urgent Reports Alert
    const renderUrgentAlert = () => {
        const urgentCount = reportStats.high_priority || 0;
        if (isCollapsed || urgentCount === 0) return null;

        return (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2.5 dark:border-red-800 dark:bg-red-900/20">
                <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <AlertOctagonIcon className="h-3 w-3 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-medium text-red-900 dark:text-red-200">
                            Urgent Reports
                        </span>
                    </div>
                    <Badge
                        variant="destructive"
                        className="h-5 animate-pulse bg-red-600 px-1.5 text-[10px]"
                    >
                        {urgentCount} urgent
                    </Badge>
                </div>
                <div className="text-[10px] text-red-800 dark:text-red-300">
                    {urgentCount === 1
                        ? '1 high priority report requires immediate action'
                        : `${urgentCount} high priority reports require immediate action`}
                </div>
            </div>
        );
    };

    // Quick Stats Row (for collapsed sidebar)
    const renderCollapsedStats = () => {
        if (!isCollapsed) return null;

        return (
            <div className="mb-3 flex flex-col items-center gap-1">
                {reportStats.total > 0 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-800">
                        <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-300">
                            {reportStats.total}
                        </span>
                    </div>
                )}
                {reportStats.pending > 0 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-800">
                        <span className="text-[10px] font-semibold text-yellow-700 dark:text-yellow-300">
                            {reportStats.pending}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    // Render operations content
    const renderOperationsContent = () => (
        <>
            {/* Today's Stats & Alerts */}
            {renderTodayStats()}
            {renderPendingAlert()}
            {renderUrgentAlert()}
            {renderCollapsedStats()}

            {/* Quick Actions Section */}
            {quickActions.length > 0 && (
                <SidebarGroup className="mb-2">
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 flex items-center gap-1 px-1">
                            <Zap className="h-2.5 w-2.5 text-amber-500" />
                            <span className="truncate text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Quick Actions
                            </span>
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu className="space-y-0.5">
                        {quickActions.map((action) => (
                            <QuickActionItem
                                key={`${action.title}-${action.href}`}
                                action={action}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {/* Operations Categories */}
            {operationsCategories.length > 0 && (
                <SidebarGroup>
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 px-1">
                            <span className="truncate text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Operations
                            </span>
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu className="space-y-0.5">
                        {operationsCategories.map((category) => (
                            <CategoryItem
                                key={category.title}
                                category={category}
                                type="operations"
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </>
    );

    // Render settings content
    const renderSettingsContent = () =>
        settingsCategories.length > 0 && (
            <SidebarGroup>
                {!isCollapsed && (
                    <SidebarGroupLabel className="mb-1 px-1">
                        <span className="truncate text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                            Settings
                        </span>
                    </SidebarGroupLabel>
                )}
                <SidebarMenu className="space-y-0.5">
                    {settingsCategories.map((category) => (
                        <CategoryItem
                            key={`settings-${category.title}`}
                            category={category}
                            type="settings"
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </SidebarMenu>
            </SidebarGroup>
        );

    // Don't show sidebar if user has no permissions at all
    const hasAnyAccess =
        operationsCategories.length > 0 || settingsCategories.length > 0;

    if (!hasAnyAccess) {
        return null;
    }

    return (
        <TooltipProvider delayDuration={300}>
            <Sidebar
                collapsible="icon"
                variant="inset"
                className={cn(
                    'border-r border-gray-200 dark:border-gray-800',
                    className,
                )}
            >
                <SidebarHeader className="border-b border-gray-200 p-3 dark:border-gray-800">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild size="lg">
                                <Link
                                    href={DASHBOARD_URL}
                                    className={cn(
                                        'flex items-center gap-2 transition-all hover:opacity-90',
                                        isCollapsed ? 'justify-center' : '',
                                    )}
                                >
                                    <div
                                        className={cn(
                                            'flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg transition-transform hover:scale-105',
                                            isCollapsed ? 'h-8 w-8' : 'h-9 w-9',
                                        )}
                                    >
                                        <Building2
                                            className={cn(
                                                'text-white',
                                                isCollapsed
                                                    ? 'h-4 w-4'
                                                    : 'h-5 w-5',
                                            )}
                                        />
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="truncate text-sm font-bold text-gray-900 dark:text-white">
                                                Brgy. Kibawe
                                            </span>
                                            <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                                                Management System
                                            </span>
                                        </div>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent className="overflow-y-auto p-3">
                    {/* Tab Switcher */}
                    <TabSwitcher
                        activeTab={activeTab}
                        handleTabChange={setActiveTab}
                        isCollapsed={isCollapsed}
                    />

                    {/* Content based on active tab */}
                    {activeTab === 'operations'
                        ? renderOperationsContent()
                        : renderSettingsContent()}
                </SidebarContent>

                {/* Footer */}
                <SidebarFooter className="border-t border-gray-200 p-3 dark:border-gray-800">
                    {!isCollapsed ? (
                        <div className="space-y-2">
                            <NavUser />
                            <div className="border-t border-gray-200 pt-2 dark:border-gray-800">
                                <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                                    <span>v1.2.0</span>
                                    <span
                                        className={cn(
                                            'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                            activeTab === 'operations'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                                        )}
                                    >
                                        {activeTab === 'operations'
                                            ? 'Operations'
                                            : 'Settings'}
                                    </span>
                                    <span>{new Date().getFullYear()}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-1">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 shadow-md">
                                <User className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span
                                className={cn(
                                    'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                    activeTab === 'operations'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
                                )}
                            >
                                {activeTab === 'operations'
                                    ? 'Ops'
                                    : 'Settings'}
                            </span>
                        </div>
                    )}
                </SidebarFooter>
            </Sidebar>
        </TooltipProvider>
    );
}

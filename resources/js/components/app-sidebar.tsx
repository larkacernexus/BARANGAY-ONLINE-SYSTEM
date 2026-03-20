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

const DASHBOARD_URL = '/admin/dashboard';

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
        | 'yellow'
        | 'emerald'
        | 'teal';
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
        : currentUrl === item.href || currentUrl.startsWith(item.href + '/');

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
                    'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-xs transition-colors hover:bg-gray-100 dark:hover:bg-gray-900',
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
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
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

// Regular Menu Item Component - For direct links (NO DROPDOWN)
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
        : currentUrl === item.href || currentUrl.startsWith(item.href + '/');

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
                                'relative flex items-center gap-1.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50',
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
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
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

// Category Component - For categories with multiple items (uses dropdown)
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
        item.isActive ? item.isActive(currentUrl) : currentUrl.startsWith(item.href),
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
                            'w-full justify-start px-2 py-1.5 text-xs font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-900',
                            isAnyActive && currentColors.activeBg,
                        )}
                    >
                        <div className="flex w-full items-center gap-2">
                            <div
                                className={cn(
                                    'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded',
                                    isAnyActive
                                        ? currentColors.iconBg
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400',
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
        emerald: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400',
        teal: 'bg-teal-100 dark:bg-teal-800 text-teal-600 dark:text-teal-400',
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
        emerald: 'hover:bg-emerald-200 dark:hover:bg-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300',
        teal: 'hover:bg-teal-200 dark:hover:bg-teal-700 hover:text-teal-700 dark:hover:text-teal-300',
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
                        'rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/50',
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
                            {action.description || 'Quick action'}
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
                            : 'hover:bg-gray-100 dark:hover:bg-gray-900',
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
                            : 'hover:bg-gray-100 dark:hover:bg-gray-900',
                    )}
                    onClick={() => handleTabChange('settings')}
                >
                    <Settings className="h-3.5 w-3.5" />
                </Button>
            </div>
        );
    }

    return (
        <div className="mb-3 flex rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
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
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
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
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-2 py-1.5 dark:bg-gray-900/50">
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

    // SAFELY get user permissions and role from Inertia props with fallbacks
    const user = props?.auth?.user || {};
    const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
    const userRoleName = user?.role_name || user?.role?.name || '';

    // SAFELY get report stats from props with fallbacks
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
        pending_clearances: 0,
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
            '/admin/settings',
            '/admin/users',
            '/admin/roles',
            '/admin/permissions',
            '/admin/role-permissions',
            '/admin/reports/audit-logs',
            '/admin/reports/activity-logs',
            '/admin/reports/login-logs',
            '/admin/security',
            '/admin/backup',
            '/admin/puroks',
            '/admin/positions',
            '/admin/committees',
            '/admin/officials',
            '/admin/clearance-types',
            '/admin/fee-types',
            '/admin/report-types',
            '/admin/document-types',
        ];

        if (settingsPaths.some((path) => url.startsWith(path))) {
            setActiveTab('settings');
        }
    }, [currentUrl]);

    // Operations navigation - categorized WITH PERMISSIONS
    const operationsCategories = useMemo(() => {
        const allCategories: SidebarCategory[] = [
            {
                title: 'Dashboard',
                icon: LayoutGrid,
                items: [
                    {
                        title: 'Overview',
                        href: '/admin/dashboard',
                        icon: LayoutGrid,
                        description: 'System overview',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url === '/admin/dashboard' || url === '/admin',
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
                            url.startsWith('/admin/blotters') &&
                            !url.includes('/create'),
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
                        href: '/admin/residents',
                        icon: Users,
                        description: 'Manage residents',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/residents') &&
                            !url.includes('/create'),
                        requiredPermission: 'manage-residents',
                    },
                    {
                        title: 'Households',
                        href: '/admin/households',
                        icon: Home,
                        description: 'Manage households',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/households') &&
                            !url.includes('/create'),
                        requiredPermission: 'manage-households',
                    },
                    {
                        title: 'Businesses',
                        href: '/admin/businesses',
                        icon: Briefcase,
                        description: 'Manage businesses',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/businesses') &&
                            !url.includes('/create'),
                        requiredPermission: 'manage-businesses',
                    },
                ],
            },
            {
                title: 'Services',
                icon: FileText,
                items: [
                    {
                        title: 'Forms',
                        href: '/admin/forms',
                        icon: FileText,
                        description: 'Downloadable forms',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/forms') &&
                            !url.includes('/create'),
                        requiredPermission: 'manage-forms',
                    },
                    {
                        title: 'Privileges',
                        href: '/admin/privileges',
                        icon: Award,
                        description: 'Manage resident privileges & discounts',
                        color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/privileges') &&
                            !url.includes('/create'),
                        requiredPermission: 'manage-privileges',
                    },
                    {
                        title: 'Announcements',
                        href: '/admin/announcements',
                        icon: Megaphone,
                        description: 'Public announcements',
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/announcements') &&
                            !url.includes('/create'),
                        requiredPermission: 'view-announcements',
                    },
                    {
                        title: 'Clearances',
                        href: '/admin/clearances',
                        icon: CheckCircle,
                        description: 'Barangay clearances',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/clearances') &&
                            !url.startsWith('/admin/clearances/approval') &&
                            !url.includes('/create'),
                        requiredPermission: 'view-clearances',
                    },
                    {
                        title: 'Approval Requests',
                        href: '/admin/clearances/approval/requests',
                        icon: CheckCircle,
                        description: 'Review clearance requests',
                        color: 'bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/clearances/approval'),
                        requiredPermission: 'issue-clearances',
                        badge: reportStats.pending_clearances || 0,
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
                        href: '/admin/fees',
                        icon: DollarSign,
                        description: 'Manage fees',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/fees') && !url.includes('/create'),
                        requiredPermission: 'view-fees',
                    },
                    {
                        title: 'Payments',
                        href: '/admin/payments',
                        icon: CreditCard,
                        description: 'Payment records',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/payments') &&
                            !url.includes('/create'),
                        requiredPermission: 'view-payments',
                    },
                    {
                        title: 'Receipts',
                        href: '/admin/receipts',
                        icon: Receipt,
                        description: 'Generate receipts',
                        color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
                        isActive: (url: string) => url.startsWith('/admin/receipts'),
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
                        href: '/admin/reports/collections',
                        icon: FileText,
                        description: 'Payment collections',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url === '/admin/reports/collections',
                        requiredPermission: 'view-reports',
                    },
                    {
                        title: 'Revenue',
                        href: '/admin/reports/revenue',
                        icon: BarChart3,
                        description: 'Revenue analytics',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url === '/admin/reports/revenue',
                        requiredPermission: 'view-reports',
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

    // Settings navigation - Personal category with DIRECT LINKS (NO DROPDOWN)
    const settingsCategories = useMemo(() => {
        const allCategories: SidebarCategory[] = [
            {
                title: 'Personal', // KEPT Personal category
                icon: UserCog,
                items: [
                    {
                        title: 'Profile',
                        href: '/admin/settings/profile',
                        icon: User,
                        description: 'Personal info',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url === '/admin/settings/profile',
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
                        href: '/admin/puroks',
                        icon: Briefcase,
                        description: 'Manage zones',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/admin/puroks') && !url.includes('/create'),
                        requiredPermission: 'manage-puroks',
                    },
                    {
                        title: 'Positions',
                        href: '/admin/positions',
                        icon: Briefcase,
                        description: 'Official roles',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) => url.startsWith('/admin/positions') && !url.includes('/create'),
                        requiredPermission: 'manage-positions',
                    },
                    {
                        title: 'Committees',
                        href: '/admin/committees',
                        icon: Users2,
                        description: 'Barangay committees',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/committees') && !url.includes('/create'),
                        requiredPermission: 'manage-committees',
                    },
                    {
                        title: 'Officials',
                        href: '/admin/officials',
                        icon: Award,
                        description: 'Manage officials',
                        color: 'bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400',
                        isActive: (url: string) => url.startsWith('/admin/officials') && !url.includes('/create'),
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
                        href: '/admin/users',
                        icon: Users,
                        description: 'Manage users',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/admin/users') && !url.includes('/create'),
                        requiredPermission: 'manage-users',
                    },
                    {
                        title: 'Roles',
                        href: '/admin/roles',
                        icon: Shield,
                        description: 'Manage roles',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.startsWith('/admin/roles') && !url.includes('/create'),
                        requiredPermission: 'manage-roles',
                    },
                    {
                        title: 'Permissions',
                        href: '/admin/permissions',
                        icon: Key,
                        description: 'Manage permissions',
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/permissions') && !url.includes('/create'),
                        requiredPermission: 'manage-permissions',
                    },
                    {
                        title: 'Assign Permissions',
                        href: '/admin/role-permissions',
                        icon: LinkIcon,
                        description: 'Assign permissions to roles',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/role-permissions'),
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
                        href: '/admin/security/security-audit',
                        icon: ShieldCheck,
                        description: 'Compliance reports',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) =>
                            url === '/admin/security/security-audit',
                        requiredPermission: 'view-security-logs',
                    },
                    {
                        title: 'Access Logs',
                        href: '/admin/security/access-logs',
                        icon: Eye,
                        description: 'Access monitoring',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url === '/admin/security/access-logs',
                        requiredPermission: 'view-security-logs',
                    },
                    {
                        title: 'Audit Logs',
                        href: '/admin/reports/audit-logs',
                        icon: History,
                        description: 'Compliance audit trail',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url === '/admin/reports/audit-logs',
                        requiredPermission: 'view-reports',
                    },
                    {
                        title: 'Activity Logs',
                        href: '/admin/reports/activity-logs',
                        icon: Activity,
                        description: 'System activities',
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/reports/activity-logs'),
                        requiredPermission: 'view-reports',
                    },
                    {
                        title: 'Login Logs',
                        href: '/admin/reports/login-logs',
                        icon: LogIn,
                        description: 'Authentication history',
                        color: 'bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/reports/login-logs'),
                        requiredPermission: 'view-reports',
                    },
                    {
                        title: 'Sessions',
                        href: '/admin/security/sessions',
                        icon: Monitor,
                        description: 'Active sessions',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url === '/admin/security/sessions',
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
                        href: '/admin/backup',
                        icon: Database,
                        description: 'Backup & restore',
                        color: 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400',
                        isActive: (url: string) => url.startsWith('/admin/backup'),
                        requiredPermission: 'manage-backups',
                    },
                    {
                        title: 'Clearance Types',
                        href: '/admin/clearance-types',
                        icon: FileType,
                        description: 'Clearance categories',
                        color: 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/clearance-types') && !url.includes('/create'),
                        requiredPermission: 'manage-clearance-types',
                    },
                    {
                        title: 'Fee Types',
                        href: '/admin/fee-types',
                        icon: Tag,
                        description: 'Fee categories',
                        color: 'bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400',
                        isActive: (url: string) => url.startsWith('/admin/fee-types') && !url.includes('/create'),
                        requiredPermission: 'manage-fee-types',
                    },
                    {
                        title: 'Report Types',
                        href: '/admin/report-types',
                        icon: FileText,
                        description: 'Community report categories',
                        color: 'bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/report-types') && !url.includes('/create'),
                        requiredPermission: 'manage-report-types',
                        isNew: true,
                    },
                    {
                        title: 'Document Types',
                        href: '/admin/document-types',
                        icon: FileBox,
                        description: 'Document categories & requirements',
                        color: 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-400',
                        isActive: (url: string) =>
                            url.startsWith('/admin/document-types') && !url.includes('/create'),
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

    // Grouped Quick Actions for Operations tab
    const operationsQuickActionGroups = useMemo(() => {
        const groups = {
            reports: [
                {
                    title: 'New Report',
                    href: '/admin/community-reports/community-reports/create',
                    icon: AlertCircle,
                    color: 'orange' as const,
                    requiredPermission: 'create-reports',
                    description: 'Create incident report',
                    isNew: true,
                },
                {
                    title: 'New Blotter',
                    href: '/admin/blotters/create',
                    icon: Scale,
                    color: 'red' as const,
                    requiredPermission: 'manage-blotters',
                    description: 'File new blotter case',
                },
            ],
            residents: [
                {
                    title: 'Add Resident',
                    href: '/admin/residents/create',
                    icon: Users,
                    color: 'blue' as const,
                    requiredPermission: 'manage-residents',
                    description: 'Register new resident',
                },
                {
                    title: 'Add Household',
                    href: '/admin/households/create',
                    icon: Home,
                    color: 'green' as const,
                    requiredPermission: 'manage-households',
                    description: 'Create new household',
                },
                {
                    title: 'Add Business',
                    href: '/admin/businesses/create',
                    icon: Briefcase,
                    color: 'purple' as const,
                    requiredPermission: 'manage-businesses',
                    description: 'Register new business',
                },
            ],
            services: [
                {
                    title: 'Issue Clearance',
                    href: '/admin/clearances/clearances/create',
                    icon: CheckCircle,
                    color: 'emerald' as const,
                    requiredPermission: 'issue-clearances',
                    description: 'Issue barangay clearance',
                },
                {
                    title: 'Approval Requests',
                    href: '/admin/clearances/approval/requests',
                    icon: CheckCircle,
                    color: 'violet' as const,
                    requiredPermission: 'issue-clearances',
                    description: 'Review clearance requests',
                    badge: reportStats.pending_clearances || 0,
                    isNew: true,
                },
                {
                    title: 'Record Payment',
                    href: '/admin/payments/payments/create',
                    icon: CreditCard,
                    color: 'cyan' as const,
                    requiredPermission: 'manage-payments',
                    description: 'Record new payment',
                },
                {
                    title: 'Create Fee',
                    href: '/admin/fees/fees/create',
                    icon: DollarSign,
                    color: 'yellow' as const,
                    requiredPermission: 'manage-fees',
                    description: 'Add new fee type',
                },
                {
                    title: 'Upload Form',
                    href: '/admin/forms/create',
                    icon: FileText,
                    color: 'indigo' as const,
                    requiredPermission: 'manage-forms',
                    description: 'Upload new form',
                },
                {
                    title: 'New Announcement',
                    href: '/admin/announcements/create',
                    icon: Megaphone,
                    color: 'pink' as const,
                    requiredPermission: 'manage-announcements',
                    description: 'Create announcement',
                },
                {
                    title: 'Add Privilege',
                    href: '/admin/privileges/create',
                    icon: Award,
                    color: 'amber' as const,
                    requiredPermission: 'manage-privileges',
                    description: 'Create new privilege',
                },
                {
                    title: 'Assign Privilege',
                    href: '/admin/privileges/assign',
                    icon: UserCheck,
                    color: 'violet' as const,
                    requiredPermission: 'assign-privileges',
                    description: 'Assign privilege to resident',
                    isNew: true,
                },
            ],
        };

        // Filter each group by permissions
        return {
            reports: groups.reports.filter(a => hasPermission(a.requiredPermission)),
            residents: groups.residents.filter(a => hasPermission(a.requiredPermission)),
            services: groups.services.filter(a => hasPermission(a.requiredPermission)),
        };
    }, [userPermissions, userRoleName, reportStats]);

    // Grouped Quick Actions for Settings tab
    const settingsQuickActionGroups = useMemo(() => {
        const groups = {
            personal: [ // KEPT Personal quick actions
                {
                    title: 'Edit Profile',
                    href: '/admin/settings/profile',
                    icon: User,
                    color: 'blue' as const,
                    requiredPermission: undefined,
                    description: 'Update personal info',
                },
                {
                    title: 'Change Password',
                    href: '/admin/settings/password',
                    icon: Lock,
                    color: 'red' as const,
                    requiredPermission: undefined,
                    description: 'Update password',
                },
                {
                    title: 'Customize Theme',
                    href: '/admin/settings/appearance',
                    icon: Palette,
                    color: 'purple' as const,
                    requiredPermission: undefined,
                    description: 'Change appearance',
                },
            ],
            barangay: [
                {
                    title: 'Add Purok',
                    href: '/admin/puroks/create',
                    icon: Briefcase,
                    color: 'violet' as const,
                    requiredPermission: 'manage-puroks',
                    description: 'Create new purok',
                },
                {
                    title: 'Add Position',
                    href: '/admin/positions/create',
                    icon: Briefcase,
                    color: 'teal' as const,
                    requiredPermission: 'manage-positions',
                    description: 'Create new position',
                },
                {
                    title: 'New Committee',
                    href: '/admin/committees/create',
                    icon: Users2,
                    color: 'lime' as const,
                    requiredPermission: 'manage-committees',
                    description: 'Create committee',
                },
                {
                    title: 'Add Official',
                    href: '/admin/officials/create',
                    icon: Award,
                    color: 'amber' as const,
                    requiredPermission: 'manage-officials',
                    description: 'Add barangay official',
                },
            ],
            users: [
                {
                    title: 'Add User',
                    href: '/admin/users/create',
                    icon: Users,
                    color: 'indigo' as const,
                    requiredPermission: 'manage-users',
                    description: 'Create new user',
                },
                {
                    title: 'Add Role',
                    href: '/admin/roles/create',
                    icon: Shield,
                    color: 'purple' as const,
                    requiredPermission: 'manage-roles',
                    description: 'Create new role',
                },
                {
                    title: 'Add Permission',
                    href: '/admin/permissions/create',
                    icon: Key,
                    color: 'red' as const,
                    requiredPermission: 'manage-permissions',
                    description: 'Create new permission',
                },
            ],
            system: [
                {
                    title: 'Run Backup',
                    href: '/admin/backup',
                    icon: Database,
                    color: 'blue' as const,
                    requiredPermission: 'manage-backups',
                    description: 'Create system backup',
                },
                {
                    title: 'Add Clearance Type',
                    href: '/admin/clearance-types/create',
                    icon: FileType,
                    color: 'emerald' as const,
                    requiredPermission: 'manage-clearance-types',
                    description: 'Create clearance type',
                },
                {
                    title: 'Add Fee Type',
                    href: '/admin/fee-types/create',
                    icon: Tag,
                    color: 'yellow' as const,
                    requiredPermission: 'manage-fee-types',
                    description: 'Create fee type',
                },
                {
                    title: 'Add Report Type',
                    href: '/admin/report-types/create',
                    icon: FileText,
                    color: 'orange' as const,
                    requiredPermission: 'manage-report-types',
                    description: 'Create report type',
                    isNew: true,
                },
                {
                    title: 'Add Document Type',
                    href: '/admin/document-types/create',
                    icon: FileBox,
                    color: 'indigo' as const,
                    requiredPermission: 'manage-document-types',
                    description: 'Create document type',
                    isNew: true,
                },
            ],
            security: [
                {
                    title: 'View Audit Logs',
                    href: '/admin/reports/audit-logs',
                    icon: History,
                    color: 'purple' as const,
                    requiredPermission: 'view-reports',
                    description: 'Check audit trail',
                },
                {
                    title: 'View Activity Logs',
                    href: '/admin/reports/activity-logs',
                    icon: Activity,
                    color: 'orange' as const,
                    requiredPermission: 'view-reports',
                    description: 'Monitor activities',
                },
                {
                    title: 'View Sessions',
                    href: '/admin/security/sessions',
                    icon: Monitor,
                    color: 'cyan' as const,
                    requiredPermission: 'view-security-logs',
                    description: 'Active sessions',
                },
            ],
        };

        // Filter each group by permissions
        return {
            personal: groups.personal.filter(a => hasPermission(a.requiredPermission)),
            barangay: groups.barangay.filter(a => hasPermission(a.requiredPermission)),
            users: groups.users.filter(a => hasPermission(a.requiredPermission)),
            system: groups.system.filter(a => hasPermission(a.requiredPermission)),
            security: groups.security.filter(a => hasPermission(a.requiredPermission)),
        };
    }, [userPermissions, userRoleName]);

    // Flatten for main display in Operations tab (take 1 from each category, max 5)
    const mainOperationsQuickActions = useMemo(() => {
        const allActions = [
            ...operationsQuickActionGroups.reports.slice(0, 1),
            ...operationsQuickActionGroups.residents.slice(0, 1),
            ...operationsQuickActionGroups.services.slice(0, 2),
        ].slice(0, 5);

        return allActions;
    }, [operationsQuickActionGroups]);

    // Flatten for main display in Settings tab (take 1 from each category, max 5)
    const mainSettingsQuickActions = useMemo(() => {
        const allActions = [
            ...settingsQuickActionGroups.personal.slice(0, 1),
            ...settingsQuickActionGroups.barangay.slice(0, 1),
            ...settingsQuickActionGroups.users.slice(0, 1),
            ...settingsQuickActionGroups.system.slice(0, 1),
            ...settingsQuickActionGroups.security.slice(0, 1),
        ].slice(0, 5);

        return allActions;
    }, [settingsQuickActionGroups]);

    // Get all remaining actions for Settings "More Settings" dropdown (exclude those in main quick actions)
    const remainingSettingsActions = useMemo(() => {
        const mainActionHrefs = new Set(mainSettingsQuickActions.map(a => a.href));
        
        const allSettingsActions = [
            ...settingsQuickActionGroups.personal,
            ...settingsQuickActionGroups.barangay,
            ...settingsQuickActionGroups.users,
            ...settingsQuickActionGroups.system,
            ...settingsQuickActionGroups.security,
        ];
        
        // Filter out actions that are already in main quick actions
        return allSettingsActions.filter(action => !mainActionHrefs.has(action.href));
    }, [settingsQuickActionGroups, mainSettingsQuickActions]);

    // Get all remaining actions for Operations "More Actions" dropdown (exclude those in main quick actions)
    const remainingOperationsActions = useMemo(() => {
        const mainActionHrefs = new Set(mainOperationsQuickActions.map(a => a.href));
        
        const allOperationsActions = [
            ...operationsQuickActionGroups.reports,
            ...operationsQuickActionGroups.residents,
            ...operationsQuickActionGroups.services,
        ];
        
        // Filter out actions that are already in main quick actions
        return allOperationsActions.filter(action => !mainActionHrefs.has(action.href));
    }, [operationsQuickActionGroups, mainOperationsQuickActions]);

    // Group remaining operations actions by category for better organization
    const remainingOperationsByCategory = useMemo(() => {
        const grouped = {
            reports: remainingOperationsActions.filter(action => 
                operationsQuickActionGroups.reports.some(r => r.href === action.href)
            ),
            residents: remainingOperationsActions.filter(action => 
                operationsQuickActionGroups.residents.some(r => r.href === action.href)
            ),
            services: remainingOperationsActions.filter(action => 
                operationsQuickActionGroups.services.some(s => s.href === action.href)
            ),
        };
        
        return Object.entries(grouped).filter(([_, items]) => items.length > 0);
    }, [remainingOperationsActions, operationsQuickActionGroups]);

    // Group remaining settings actions by category for better organization
    const remainingSettingsByCategory = useMemo(() => {
        const grouped = {
            personal: remainingSettingsActions.filter(action => 
                settingsQuickActionGroups.personal.some(p => p.href === action.href)
            ),
            barangay: remainingSettingsActions.filter(action => 
                settingsQuickActionGroups.barangay.some(b => b.href === action.href)
            ),
            users: remainingSettingsActions.filter(action => 
                settingsQuickActionGroups.users.some(u => u.href === action.href)
            ),
            system: remainingSettingsActions.filter(action => 
                settingsQuickActionGroups.system.some(s => s.href === action.href)
            ),
            security: remainingSettingsActions.filter(action => 
                settingsQuickActionGroups.security.some(s => s.href === action.href)
            ),
        };
        
        return Object.entries(grouped).filter(([_, items]) => items.length > 0);
    }, [remainingSettingsActions, settingsQuickActionGroups]);

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
            {mainOperationsQuickActions.length > 0 && (
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
                        {mainOperationsQuickActions.map((action) => (
                            <QuickActionItem
                                key={`${action.title}-${action.href}`}
                                action={action}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                        
                        {/* More Actions Dropdown - Only show if there are remaining actions */}
                        {!isCollapsed && remainingOperationsByCategory.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="mt-1 w-full justify-start gap-2 px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        <PlusCircle className="h-3.5 w-3.5" />
                                        More Actions ({remainingOperationsActions.length})
                                        <ChevronDown className="ml-auto h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-64 max-h-[400px] overflow-y-auto">
                                    {remainingOperationsByCategory.map(([category, items], index, array) => 
                                        items.length > 0 && (
                                            <div key={category}>
                                                <DropdownMenuLabel className="text-xs capitalize text-gray-500">
                                                    {category}
                                                </DropdownMenuLabel>
                                                {items.map(action => (
                                                    <CompactMenuItem 
                                                        key={`${action.title}-${action.href}`} 
                                                        item={action} 
                                                        type="operations" 
                                                    />
                                                ))}
                                                {index < array.length - 1 && <DropdownMenuSeparator />}
                                            </div>
                                        )
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
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
    const renderSettingsContent = () => (
        <>
            {/* Settings Quick Actions */}
            {mainSettingsQuickActions.length > 0 && (
                <SidebarGroup className="mb-2">
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 flex items-center gap-1 px-1">
                            <Zap className="h-2.5 w-2.5 text-purple-500" />
                            <span className="truncate text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Settings Quick Actions
                            </span>
                        </SidebarGroupLabel>
                    )}
                    
                    <SidebarMenu className="space-y-0.5">
                        {mainSettingsQuickActions.map((action) => (
                            <QuickActionItem
                                key={`${action.title}-${action.href}`}
                                action={action}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                        
                        {/* More Settings Actions Dropdown - Only show if there are remaining actions */}
                        {!isCollapsed && remainingSettingsByCategory.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="mt-1 w-full justify-start gap-2 px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900"
                                    >
                                        <PlusCircle className="h-3.5 w-3.5" />
                                        More Settings ({remainingSettingsActions.length})
                                        <ChevronDown className="ml-auto h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-64 max-h-[400px] overflow-y-auto">
                                    {remainingSettingsByCategory.map(([category, items], index, array) => 
                                        items.length > 0 && (
                                            <div key={category}>
                                                <DropdownMenuLabel className="text-xs capitalize text-gray-500">
                                                    {category}
                                                </DropdownMenuLabel>
                                                {items.map(action => (
                                                    <CompactMenuItem 
                                                        key={`${action.title}-${action.href}`} 
                                                        item={action} 
                                                        type="settings" 
                                                    />
                                                ))}
                                                {index < array.length - 1 && <DropdownMenuSeparator />}
                                            </div>
                                        )
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {/* Settings Categories */}
            {settingsCategories.length > 0 && (
                <SidebarGroup>
                    {!isCollapsed && (
                        <SidebarGroupLabel className="mb-1 px-1">
                            <span className="truncate text-[10px] font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Settings
                            </span>
                        </SidebarGroupLabel>
                    )}
                    <SidebarMenu className="space-y-0.5">
                        {settingsCategories.map((category) => {
                            // For Personal category, render each item as a direct link (NO DROPDOWN)
                            if (category.title === 'Personal') {
                                return category.items.map((item) => (
                                    <RegularMenuItem
                                        key={item.title}
                                        item={item}
                                        isCollapsed={isCollapsed}
                                        type="settings"
                                    />
                                ));
                            }
                            
                            // For other categories with multiple items, use dropdown
                            return (
                                <CategoryItem
                                    key={`settings-${category.title}`}
                                    category={category}
                                    type="settings"
                                    isCollapsed={isCollapsed}
                                />
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </>
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
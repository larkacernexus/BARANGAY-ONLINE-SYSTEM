import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
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

export interface QuickAction extends SidebarItem {
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

export interface SidebarCategory {
    title: string;
    icon: LucideIcon;
    items: SidebarItem[];
}

export type SidebarTab = 'operations' | 'settings';
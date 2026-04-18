// ==================== BREADCRUMB / NAV TYPES ====================

export interface NavItem {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;  // component, not ReactNode
    active?: boolean;
    exact?: boolean;                   // used in isActivePath()
    description?: string;             // shown in dropdown headers & search results
    badge?: string;                   // badge label on nav button
    disabled?: boolean;
    external?: boolean;               // open in new tab
    children?: Omit<NavItem, 'children' | 'description' | 'exact' | 'badge'>[];  // one level deep
}

// ==================== BREADCRUMB TYPES ====================
export interface BreadcrumbItem {
    title: string;
    href: string;
    icon?: React.ReactNode;
    active?: boolean;
}
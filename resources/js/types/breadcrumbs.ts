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

// // ==================== SHARED DATA TYPE ====================
// This is the main type that extends Auth and includes flash messages
export interface SharedData {
    auth: Auth;
    flash?: FlashMessage;
    errors?: Record<string, string>;
    [key: string]: any;
}

export interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}


export interface Auth {
    user: User;
    permissions?: string[];
    roles?: string[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    role_id?: number;
    created_at?: string;
    updated_at?: string;
}
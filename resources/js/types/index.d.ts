// Add these interfaces to your existing types file

// ==================== COMMUNITY REPORTS TYPES ====================

export interface CommunityReport {
    id: number;
    report_number: string;
    title: string;
    description: string;
    location: string;
    incident_date: string;
    status: string;
    priority: string;
    category?: string | { id: number; name: string };
    report_type?: string | { id: number; name: string };
    is_anonymous: boolean;
    safety_concern: boolean;
    urgency_level?: string;
    recurring_issue: boolean;
    environmental_impact: boolean;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email?: string;
        phone?: string;
        purok?: string | { id: number; name: string };
    };
    assigned_to?: {
        id: number;
        name: string;
        email?: string;
    };
    evidences?: Array<{
        id: number;
        file_path: string;
        file_type: string;
        description?: string;
    }>;
}

// ==================== GRID VIEW PROPS WITH PRIVILEGES ====================

export interface GridViewProps {
    isBulkMode: boolean;
    isMobile: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    selectedItems: number[];
    onItemSelect: (id: number) => void;
    selectionStats?: SelectionStats;
}


export interface FilterState {
    status: string;
    purok_id: string | number;
    gender: string;
    min_age?: number;
    max_age?: number;
    civil_status: string;
    is_voter: string;
    is_head: string;
    privilege_id?: string | number;
    privilege?: string;
}
// Community Reports Grid Props
export interface CommunityReportsGridProps extends GridViewProps {
    reports: CommunityReport[];
    onDelete: (report: CommunityReport) => void;
    onViewDetails: (report: CommunityReport) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    onMarkResolved?: (report: CommunityReport) => void;
    safeStatuses: Record<string, string>;
    safePriorities: Record<string, string>;
    windowWidth: number;
}

// Residents Grid Props (updated with privilege support)
export interface ResidentsGridProps extends GridViewProps {
    residents: Resident[];
    onDelete?: (resident: Resident) => void;
    onViewPhoto?: (resident: Resident) => void;
    privileges?: Privilege[];
    allPrivileges?: Privilege[];
    onAddPrivilege?: (residentId: number, privilegeId: number) => void;
    onRemovePrivilege?: (residentId: number, privilegeId: number) => void;
    onViewPrivileges?: (resident: Resident) => void;
}

// Forms Grid Props
export interface FormsGridProps extends GridViewProps {
    forms: Form[];
    onDelete: (form: Form) => void;
    onToggleStatus: (form: Form) => void;
    onDownload: (form: Form) => void;
    truncateText: (text: string, length: number) => string;
    formatFileSize: (bytes: number) => string;
    getCategoryColor: (category: string) => string;
    formatDateTime: (date: string) => string;
}

// Privileges Grid Props
export interface PrivilegesGridProps extends GridViewProps {
    privileges: Privilege[];
    onDelete: (privilege: Privilege) => void;
    onToggleStatus: (privilege: Privilege) => void;
    onDuplicate: (privilege: Privilege) => void;
    discountTypes: DiscountType[];
    can: {
        edit: boolean;
        delete: boolean;
        assign: boolean;
    };
}



// Announcements Grid Props
export interface AnnouncementsGridProps extends GridViewProps {
    announcements: Announcement[];
    onDelete: (announcement: Announcement) => void;
    onToggleStatus: (announcement: Announcement) => void;
    truncateText: (text: string, length: number) => string;
    formatDate: (date: string | null) => string;
    getTypeColor: (type: string) => string;
    getPriorityColor: (priority: number) => string;
}

// Officials Grid Props
export interface OfficialsGridProps extends GridViewProps {
    officials: Official[];
    onDelete: (official: Official) => void;
    onToggleStatus: (official: Official) => void;
}

// ==================== DISCOUNT TYPES (if not already defined) ====================

export interface DiscountType {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_percentage: boolean;
    value: number;
    max_discount?: number;
    min_purchase?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// ==================== UTILITY FUNCTIONS TYPES ====================

export interface TruncateOptions {
    length: number;
    omission?: string;
    wordBoundary?: boolean;
}

export interface ColorClasses {
    bg: string;
    text: string;
    border: string;
    darkBg: string;
    darkText: string;
    darkBorder: string;
}

// ==================== DYNAMIC PRIVILEGE HELPER TYPES ====================

export interface PrivilegeBadge {
    code: string;
    name: string;
    icon: string;
    color: string;
    id_number?: string;
    expires_at?: string | null;
    status?: 'active' | 'expiring_soon' | 'expired' | 'pending';
}

export interface ResidentWithPrivileges extends Resident {
    privilege_badges?: PrivilegeBadge[];
    active_privileges?: ResidentPrivilege[];
    expiring_privileges?: ResidentPrivilege[];
}

// ==================== ENHANCED RESIDENT TYPE WITH PRIVILEGE METHODS ====================

// Extend the existing Resident interface with privilege helper methods
export interface EnhancedResident extends Resident {
    // Privilege helper methods (these would be added at runtime by utilities)
    getPrivilegeBadges?: () => PrivilegeBadge[];
    hasPrivilege?: (privilegeCode: string) => boolean;
    getPrivilegeById?: (privilegeId: number) => ResidentPrivilege | undefined;
    getExpiringPrivileges?: (daysThreshold?: number) => ResidentPrivilege[];
    isPrivilegeActive?: (privilegeId: number) => boolean;
    canAvailDiscount?: (feeTypeId: number) => {
        eligible: boolean;
        discountPercentage: number;
        privilegeCode: string;
        privilegeName: string;
        requiresVerification: boolean;
        requiresIdNumber: boolean;
    } | null;
}

// ==================== BULK OPERATION TYPES WITH PRIVILEGES ====================

export interface BulkPrivilegeOperation {
    residentIds: number[];
    privilegeId: number;
    action: 'add' | 'remove' | 'renew' | 'verify';
    data?: {
        id_number?: string;
        verified_at?: string;
        expires_at?: string;
        discount_percentage?: number;
        remarks?: string;
    };
}

export interface BulkOperationResult {
    success: boolean;
    processed: number;
    failed: number;
    errors?: Array<{
        residentId: number;
        error: string;
    }>;
}

// ==================== EXPANDED STATS TYPES WITH PRIVILEGES ====================

export interface ResidentStats extends Stats {
    privilege_counts?: {
        [privilegeCode: string]: number;
    };
    total_privileges_granted?: number;
    active_privileges?: number;
    expiring_privileges?: number;
    residents_with_multiple_privileges?: number;
}

export interface PrivilegeStats {
    total_assignments: number;
    active_assignments: number;
    expiring_soon: number;
    expired: number;
    pending_verification: number;
    by_purok?: Record<string, number>;
    by_gender?: Record<string, number>;
    by_age_group?: Record<string, number>;
}

// ==================== FILTER TYPES WITH PRIVILEGES ====================

export interface ResidentFilterParams extends FilterParams {
    privilege_id?: string;
    privilege_code?: string;
    has_privilege?: string;
    privilege_status?: 'active' | 'expiring_soon' | 'expired' | 'pending';
    privilege_expiring_within?: number; // days
}

export interface PrivilegeFilterParams extends FilterParams {
    discount_type_id?: string;
    requires_id_number?: boolean;
    requires_verification?: boolean;
    min_discount?: number;
    max_discount?: number;
    validity_years?: number;
}

// ==================== API RESPONSE TYPES WITH PRIVILEGES ====================

export interface PrivilegeAssignmentResponse extends ApiResponse {
    data: {
        assignment: ResidentPrivilege;
        resident: EnhancedResident;
        privilege: Privilege;
    };
}

export interface BulkPrivilegeResponse extends ApiResponse {
    data: BulkOperationResult;
}

// ==================== CARD COMPONENT PROPS ====================

export interface BaseCardProps {
    isSelected: boolean;
    isBulkMode: boolean;
    isMobile: boolean;
    onSelect: (id: number) => void;
    className?: string;
}

export interface ResidentCardProps extends BaseCardProps {
    resident: Resident;
    onDelete: (resident: Resident) => void;
    onViewPhoto: (resident: Resident) => void;
    truncateText: (text: string, length: number) => string;
    truncateAddress: (address: string, length: number) => string;
    formatContactNumber: (number: string) => string;
    getPhotoUrl: (path?: string | null, url?: string | null) => string | null;
    getFullName: (resident: Resident) => string;
    isHeadOfHousehold: (resident: Resident) => boolean;
    getStatusBadgeVariant: (status: string) => string;
    getStatusLabel: (status: string) => string;
    getHouseholdInfo: (resident: Resident) => { id: number; name: string } | null;
    // Privilege-specific props
    privileges?: Privilege[];
    onViewPrivileges?: (resident: Resident) => void;
}

export interface FormCardProps extends BaseCardProps {
    form: Form;
    onDelete: (form: Form) => void;
    onToggleStatus: (form: Form) => void;
    onDownload: (form: Form) => void;
    truncateText: (text: string, maxLength: number) => string;
    formatFileSize: (bytes: number) => string;
    getCategoryColor: (category: string) => string;
    formatDateTime: (dateString: string) => string;
}

export interface PrivilegeCardProps extends BaseCardProps {
    privilege: Privilege;
    onDelete: (privilege: Privilege) => void;
    onToggleStatus: (privilege: Privilege) => void;
    onDuplicate: (privilege: Privilege) => void;
    discountTypes: DiscountType[];
    can: {
        edit: boolean;
        delete: boolean;
        assign: boolean;
    };
    truncateText: (text: string, length: number) => string;
    getDiscountTypeName: (privilege: Privilege) => string;
    formatDate: (date: string) => string;
}

export interface AnnouncementCardProps extends BaseCardProps {
    announcement: Announcement;
    onDelete: (announcement: Announcement) => void;
    onToggleStatus: (announcement: Announcement) => void;
    truncateText: (text: string, maxLength: number) => string;
    formatDate: (dateString: string | null) => string;
    getTypeColor: (type: string) => string;
    getPriorityColor: (priority: number) => string;
}

export interface OfficialCardProps extends BaseCardProps {
    official: Official;
    onDelete: (official: Official) => void;
    onToggleStatus: (official: Official) => void;
    truncateText: (text: string, length: number) => string;
    formatDate: (date: string | null) => string;
}

// ==================== EXPANDED ANNOUNCEMENT TYPE ====================

export interface EnhancedAnnouncement extends Announcement {
    target_audience?: string | string[];
    location?: string;
    views_count?: number;
    created_by?: {
        id: number;
        name: string;
        email?: string;
    };
    expires_at?: string | null;
    is_currently_active?: boolean;
    days_remaining?: number | null;
}

// ==================== EXPANDED FORM TYPE ====================

export interface EnhancedForm extends Form {
    mime_type?: string;
    form_number?: string;
    version?: string;
    department?: string;
    tags?: string[];
    is_public?: boolean;
    required_documents?: string[];
    assigned_to?: string;
    expiry_date?: string;
    created_by?: {
        id: number;
        name: string;
        email: string;
    };
    downloads_count?: number;
}

// ==================== UTILITY FUNCTION SIGNATURES ====================

export type TruncateFunction = (text: string, maxLength: number) => string;
export type FormatDateFunction = (date: string | null) => string;
export type FormatDateTimeFunction = (date: string) => string;
export type FormatFileSizeFunction = (bytes: number) => string;
export type GetCategoryColorFunction = (category: string) => string;
export type GetPriorityColorFunction = (priority: number) => string;
export type GetTypeColorFunction = (type: string) => string;
export type GetStatusColorFunction = (status: string) => string;
export type {
    Auth,
    User,
    Paginated,
    FilterParams,
    Stats,
    Permission,
    Purok,
    Fee,
    Role,
    // Add these missing exports
    Announcement,
    Form,
    Official,
    Resident,
    Household,
    Privilege,
    ResidentPrivilege,
    DiscountType,
    CommunityReport,
    // Grid view props
    CommunityReportsGridProps,
    ResidentsGridProps,
    FormsGridProps,
    PrivilegesGridProps,
    AnnouncementsGridProps,
    OfficialsGridProps,
    // Card props
    ResidentCardProps,
    FormCardProps,
    PrivilegeCardProps,
    AnnouncementCardProps,
    OfficialCardProps,
    // Utility types
    TruncateFunction,
    FormatDateFunction,
    FormatDateTimeFunction,
    FormatFileSizeFunction,
    GetCategoryColorFunction,
    GetPriorityColorFunction,
    GetTypeColorFunction,
    GetStatusColorFunction,
    GridLayoutProps,
};
// ==================== GRID LAYOUT PROPS ====================

export interface GridLayoutProps {
    isEmpty: boolean;
    emptyState: React.ReactNode;
    gridCols?: {
        base?: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
        '2xl'?: number;
    };
    gap?: {
        base?: string;
        sm?: string;
        md?: string;
        lg?: string;
        xl?: string;
    };
    padding?: string;
    children: React.ReactNode;
    className?: string;
}
import AppLayout from '@/layouts/admin-app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Search,
    Filter,
    Download,
    Plus,
    User as UserIcon,
    Mail,
    Shield,
    Edit,
    Eye,
    Trash2,
    MoreVertical,
    CheckCircle,
    XCircle,
    UserCog,
    Clock,
    Calendar,
    Key,
    Lock,
    Unlock,
    Copy,
    AlertTriangle,
    RefreshCw,
    ChevronRight,
    ChevronLeft,
    Layers,
    MousePointer,
    FilterX,
    Rows,
    RotateCcw,
    Hash,
    PackageCheck,
    PackageX,
    ClipboardCopy,
    KeyRound,
    X,
    ChevronUp,
    ChevronDown,
    Loader2,
    FileSpreadsheet,
    Printer,
    Square,
    CheckSquare,
    MailOpen,
    Bell,
    EyeOff,
    UserPlus,
    UserMinus,
    MessageSquare,
    Ban,
    CheckCheck,
    Grid3X3,
    List
} from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useRef, useCallback, JSX } from 'react';
import { toast } from 'sonner';
import { PageProps } from '@/types';

// Types based on your database schema
interface User {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    username: string | null;
    contact_number: string | null;
    position: string | null;
    department_id: number | null;
    role_id: number;
    status: 'active' | 'inactive';
    email_verified_at: string | null;
    require_password_change: boolean;
    password_changed_at: string | null;
    two_factor_secret: string | null;
    two_factor_recovery_codes: string | null;
    two_factor_confirmed_at: string | null;
    created_at: string;
    updated_at: string;
    role?: {
        id: number;
        name: string;
        description?: string;
    };
    department?: {
        id: number;
        name: string;
        description?: string;
    };
    permissions?: any[];
    last_login_at?: string;
}

interface Role {
    id: number;
    name: string;
    count: number;
}

interface Stat {
    label: string;
    value: number;
}

interface PagePropsWithData extends PageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    stats: Stat[];
    roles: Role[];
    filters: {
        search?: string;
        role_id?: string | number;
        status?: string;
    };
}

// Helper functions
const truncateText = (text: string | null, maxLength: number = 30): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const truncateEmail = (email: string, maxLength: number = 25): string => {
    if (!email) return '';
    if (email.length <= maxLength) return email;
    const [local, domain] = email.split('@');
    if (!domain) return truncateText(email, maxLength);
    
    const maxLocal = Math.floor(maxLength / 2);
    const maxDomain = maxLength - maxLocal - 1; // -1 for the @ symbol
    
    const truncatedLocal = truncateText(local, maxLocal);
    const truncatedDomain = truncateText(domain, maxDomain);
    
    return `${truncatedLocal}@${truncatedDomain}`;
};

// Bulk operation types
type BulkOperation = 'export' | 'delete' | 'update_status' | 'update_role' | 'send_message' | 'reset_password' | 'toggle_2fa' | 'export_csv';

// Bulk edit field types
type BulkEditField = 'status' | 'role';

export default function Users() {
    const { users, stats, roles, filters } = usePage<PagePropsWithData>().props;
    
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState<string>(filters.role_id?.toString() || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [currentPage, setCurrentPage] = useState(users.current_page);
    const [itemsPerPage] = useState(users.per_page);
    const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    
    // Bulk selection states
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showBulkStatusDialog, setShowBulkStatusDialog] = useState(false);
    const [showBulkRoleDialog, setShowBulkRoleDialog] = useState(false);
    const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
    const [bulkEditField, setBulkEditField] = useState<BulkEditField>('status');
    const [bulkEditValue, setBulkEditValue] = useState<string>('');
    const [selectionMode, setSelectionMode] = useState<'page' | 'filtered' | 'all'>('page');
    const [showSelectionOptions, setShowSelectionOptions] = useState(false);
    
    const bulkActionRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Track window resize
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Apply filters when they change
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/users', {
                search: search || undefined,
                role_id: roleFilter !== 'all' ? roleFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, roleFilter, statusFilter]);

    // Update current page when pagination changes
    useEffect(() => {
        setCurrentPage(users.current_page);
    }, [users.current_page]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (bulkActionRef.current && !bulkActionRef.current.contains(event.target as Node)) {
                setShowBulkActions(false);
            }
            if (selectionRef.current && !selectionRef.current.contains(event.target as Node)) {
                setShowSelectionOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + A to select all on current page
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && isBulkMode) {
                e.preventDefault();
                if (e.shiftKey) {
                    handleSelectAllFiltered();
                } else {
                    handleSelectAllOnPage();
                }
            }
            // Escape to exit bulk mode or clear selection
            if (e.key === 'Escape') {
                if (isBulkMode) {
                    if (selectedUsers.length > 0) {
                        setSelectedUsers([]);
                    } else {
                        setIsBulkMode(false);
                    }
                }
                if (showBulkActions) setShowBulkActions(false);
                if (showSelectionOptions) setShowSelectionOptions(false);
            }
            // Ctrl/Cmd + Shift + B to toggle bulk mode
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                setIsBulkMode(!isBulkMode);
            }
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Delete key to open delete dialog
            if (e.key === 'Delete' && isBulkMode && selectedUsers.length > 0) {
                e.preventDefault();
                setShowBulkDeleteDialog(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isBulkMode, selectedUsers, showBulkActions, showSelectionOptions]);

    // Reset selection when bulk mode is turned off or filters change
    useEffect(() => {
        if (!isBulkMode) {
            setSelectedUsers([]);
            setIsSelectAll(false);
        }
    }, [isBulkMode]);

    // Get responsive truncation length
    const getTruncationLength = (type: 'name' | 'email' | 'role' = 'name'): number => {
        if (typeof window === 'undefined') return 30;
        
        const width = window.innerWidth;
        if (width < 640) { // Mobile
            switch(type) {
                case 'name': return 15;
                case 'email': return 20;
                case 'role': return 12;
                default: return 15;
            }
        }
        if (width < 768) { // Tablet
            switch(type) {
                case 'name': return 20;
                case 'email': return 25;
                case 'role': return 15;
                default: return 20;
            }
        }
        if (width < 1024) { // Small desktop
            switch(type) {
                case 'name': return 25;
                case 'email': return 30;
                case 'role': return 18;
                default: return 25;
            }
        }
        // Large desktop
        switch(type) {
            case 'name': return 30;
            case 'email': return 35;
            case 'role': return 20;
            default: return 30;
        }
    };

    // Handle select/deselect all on current page
    const handleSelectAllOnPage = () => {
        const pageIds = users.data.map(user => user.id);
        if (isSelectAll) {
            setSelectedUsers(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedUsers, ...pageIds])];
            setSelectedUsers(newSelected);
        }
        setIsSelectAll(!isSelectAll);
        setSelectionMode('page');
    };

    // Handle select/deselect all filtered items (client-side filtered)
    const handleSelectAllFiltered = () => {
        const allIds = users.data.map(user => user.id);
        if (selectedUsers.length === allIds.length && allIds.every(id => selectedUsers.includes(id))) {
            setSelectedUsers(prev => prev.filter(id => !allIds.includes(id)));
        } else {
            const newSelected = [...new Set([...selectedUsers, ...allIds])];
            setSelectedUsers(newSelected);
            setSelectionMode('filtered');
        }
    };

    // Handle select all items (including not loaded)
    const handleSelectAll = () => {
        if (confirm(`This will select ALL ${users.total} users. This action may take a moment.`)) {
            const pageIds = users.data.map(user => user.id);
            setSelectedUsers(pageIds);
            setSelectionMode('all');
            toast.info('Selected all items on current page.');
        }
    };

    // Handle individual item selection
    const handleItemSelect = (id: number) => {
        setSelectedUsers(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    // Check if all items on current page are selected
    useEffect(() => {
        const allPageIds = users.data.map(user => user.id);
        const allSelected = allPageIds.every(id => selectedUsers.includes(id));
        setIsSelectAll(allSelected);
    }, [selectedUsers, users.data]);

    // Get selected users data
    const selectedUsersData = useMemo(() => {
        return users.data.filter(user => selectedUsers.includes(user.id));
    }, [selectedUsers, users.data]);

    // Calculate selection stats
    const selectionStats = useMemo(() => {
        const selectedData = selectedUsersData;
        
        return {
            total: selectedData.length,
            active: selectedData.filter(u => u.status === 'active').length,
            inactive: selectedData.filter(u => u.status === 'inactive').length,
            admins: selectedData.filter(u => u.role_id === 1).length, // Assuming role_id 1 is Administrator
            twoFactorEnabled: selectedData.filter(u => u.two_factor_confirmed_at !== null).length,
            differentRoles: new Set(selectedData.map(u => u.role?.name)).size,
        };
    }, [selectedUsersData]);

    // Bulk operation handler
    const handleBulkOperation = async (operation: BulkOperation, customData?: any) => {
        if (selectedUsers.length === 0) {
            toast.error('Please select at least one user');
            return;
        }

        setIsPerformingBulkAction(true);

        try {
            switch (operation) {
                case 'export':
                case 'export_csv':
                    // Export to CSV
                    const exportData = selectedUsersData.map(user => ({
                        'ID': user.id,
                        'Name': user.first_name ? `${user.first_name} ${user.last_name}`.trim() : user.email,
                        'Email': user.email,
                        'Username': user.username || 'N/A',
                        'Role': user.role?.name || 'N/A',
                        'Department': user.department?.name || 'N/A',
                        'Status': user.status,
                        'Email Verified': user.email_verified_at ? 'Yes' : 'No',
                        '2FA Enabled': user.two_factor_confirmed_at ? 'Yes' : 'No',
                        'Position': user.position || 'N/A',
                        'Contact Number': user.contact_number || 'N/A',
                        'Created At': new Date(user.created_at).toLocaleDateString(),
                        'Last Updated': new Date(user.updated_at).toLocaleDateString(),
                    }));
                    
                    // Convert to CSV
                    const headers = Object.keys(exportData[0]);
                    const csv = [
                        headers.join(','),
                        ...exportData.map(row => 
                            headers.map(header => {
                                const value = row[header as keyof typeof row];
                                return typeof value === 'string' && value.includes(',') 
                                    ? `"${value}"` 
                                    : value;
                            }).join(',')
                        )
                    ].join('\n');
                    
                    // Create and download file
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    toast.success('Export completed successfully');
                    break;

                case 'delete':
                    if (confirm(`Are you sure you want to delete ${selectedUsers.length} selected user(s)? This action cannot be undone.`)) {
                        // Make API call to delete users
                        router.delete('/users/bulk-delete', {
                            data: { user_ids: selectedUsers },
                            onSuccess: () => {
                                toast.success(`${selectedUsers.length} user(s) deleted successfully`);
                                setSelectedUsers([]);
                                setShowBulkDeleteDialog(false);
                            },
                            onError: (errors) => {
                                toast.error('Failed to delete users');
                            },
                        });
                    }
                    break;

                case 'update_status':
                    if (!bulkEditValue) {
                        toast.error('Please select a status');
                        return;
                    }
                    
                    // Make API call to update status
                    router.put('/users/bulk-update', {
                        user_ids: selectedUsers,
                        status: bulkEditValue,
                    }, {
                        onSuccess: () => {
                            toast.success(`${selectedUsers.length} user(s) status updated to ${bulkEditValue}`);
                            setShowBulkStatusDialog(false);
                            setBulkEditValue('');
                            setSelectedUsers([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update user status');
                        },
                    });
                    break;

                case 'update_role':
                    if (!bulkEditValue) {
                        toast.error('Please select a role');
                        return;
                    }
                    
                    // Make API call to update role
                    router.put('/users/bulk-update', {
                        user_ids: selectedUsers,
                        role_id: bulkEditValue,
                    }, {
                        onSuccess: () => {
                            toast.success(`${selectedUsers.length} user(s) role updated`);
                            setShowBulkRoleDialog(false);
                            setBulkEditValue('');
                            setSelectedUsers([]);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update user roles');
                        },
                    });
                    break;

                case 'send_message':
                    // Open message composition with selected users
                    const emails = selectedUsersData
                        .filter(u => u.email)
                        .map(u => u.email)
                        .join(',');
                    
                    if (emails) {
                        const mailLink = `mailto:${emails}`;
                        window.location.href = mailLink;
                    } else {
                        toast.error('No email addresses available for selected users');
                    }
                    break;

                case 'reset_password':
                    // Make API call to reset passwords
                    router.post('/users/bulk-reset-password', {
                        user_ids: selectedUsers,
                    }, {
                        onSuccess: () => {
                            toast.success(`Password reset emails sent to ${selectedUsers.length} user(s)`);
                        },
                        onError: (errors) => {
                            toast.error('Failed to reset passwords');
                        },
                    });
                    break;

                case 'toggle_2fa':
                    // Make API call to toggle 2FA
                    router.put('/users/bulk-toggle-2fa', {
                        user_ids: selectedUsers,
                    }, {
                        onSuccess: () => {
                            toast.success(`2FA settings updated for ${selectedUsers.length} user(s)`);
                        },
                        onError: (errors) => {
                            toast.error('Failed to update 2FA settings');
                        },
                    });
                    break;

                default:
                    toast.error('Operation not supported');
            }
        } catch (error) {
            console.error('Bulk operation error:', error);
            toast.error('An error occurred during bulk operation');
        } finally {
            setIsPerformingBulkAction(false);
        }
    };

    // Copy selected data to clipboard
    const handleCopySelectedData = () => {
        if (selectedUsersData.length === 0) {
            toast.error('No data to copy');
            return;
        }
        
        const data = selectedUsersData.map(user => ({
            Name: user.first_name ? `${user.first_name} ${user.last_name}`.trim() : user.email,
            Email: user.email,
            Role: user.role?.name || 'N/A',
            Department: user.department?.name || 'N/A',
            Status: user.status,
        }));
        
        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        navigator.clipboard.writeText(csv).then(() => {
            toast.success('Selected data copied to clipboard as CSV');
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setRoleFilter('all');
        setStatusFilter('all');
        // Clear filters in URL
        router.get('/users', {}, { preserveState: true, replace: true });
    };

    const handleCopyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(`${label} copied to clipboard`);
        }).catch(() => {
            toast.error('Failed to copy to clipboard');
        });
    };

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'active': 'default',
            'inactive': 'secondary',
            'suspended': 'destructive',
            'pending': 'outline'
        };
        return variants[status] || 'outline';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            'active': <CheckCircle className="h-4 w-4 text-green-500" />,
            'inactive': <XCircle className="h-4 w-4 text-gray-500" />,
            'suspended': <AlertTriangle className="h-4 w-4 text-red-500" />,
            'pending': <Clock className="h-4 w-4 text-amber-500" />
        };
        return icons[status] || null;
    };

    const getRoleBadgeVariant = (roleName: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!roleName) return 'outline';
        
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'Administrator': 'destructive',
            'Admin': 'destructive',
            'Super Admin': 'destructive',
            'Treasury': 'outline',
            'Treasury Officer': 'outline',
            'Records Clerk': 'outline',
            'Clearance Officer': 'outline',
            'Analyst': 'secondary',
            'Auditor': 'outline',
            'Viewer': 'outline',
            'User': 'outline'
        };
        return variants[roleName] || 'outline';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSort = (column: string) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
        
        // Send sort parameters to server
        router.get('/users', {
            ...filters,
            sort_by: column,
            sort_order: newSortOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const hasActiveFilters = search || roleFilter !== 'all' || statusFilter !== 'all';

    // Get full name helper
    const getFullName = (user: User): string => {
        if (user.first_name && user.last_name) {
            return `${user.first_name} ${user.last_name}`.trim();
        } else if (user.first_name) {
            return user.first_name;
        } else if (user.last_name) {
            return user.last_name;
        } else {
            return user.email;
        }
    };

    // Handle pagination
    const handlePageChange = (page: number) => {
        router.get('/users', {
            ...filters,
            page,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout
            title="Users"
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Administration', href: '/administration' },
                { title: 'Users', href: '/users' }
            ]}
        >
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                                Manage user accounts and access permissions
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsBulkMode(!isBulkMode)}
                                        className={`h-9 ${isBulkMode ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
                                    >
                                        {isBulkMode ? (
                                            <>
                                                <Layers className="h-4 w-4 mr-2" />
                                                Bulk Mode
                                            </>
                                        ) : (
                                            <>
                                                <MousePointer className="h-4 w-4 mr-2" />
                                                Bulk Select
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Toggle Bulk Mode (Ctrl+Shift+B)</p>
                                    <p className="text-xs text-gray-500">Select multiple users for batch operations</p>
                                </TooltipContent>
                            </Tooltip>
                            <Link href="/users/create">
                                <Button className="h-9">
                                    <Plus className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Add User</span>
                                    <span className="sm:hidden">Add</span>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stats.map((stat) => (
                            <Card key={stat.label} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-gray-500">
                                        {stat.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Roles Overview */}
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5" />
                                User Roles
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                                {roles.map((role) => (
                                    <div 
                                        key={role.id} 
                                        className={`border rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${roleFilter === role.id.toString() ? 'ring-2 ring-primary-500' : ''}`}
                                        onClick={() => setRoleFilter(role.id.toString())}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`h-3 w-3 rounded-full bg-blue-500`} />
                                            <div className="text-sm font-medium truncate" title={role.name}>
                                                {truncateText(role.name, 15)}
                                            </div>
                                        </div>
                                        <div className="text-xl sm:text-2xl font-bold mt-2">{role.count}</div>
                                        <div className="text-xs text-gray-500 truncate">users</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search and Filters */}
                    <Card className="overflow-hidden">
                        <CardContent className="pt-6">
                            <div className="flex flex-col space-y-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            ref={searchInputRef}
                                            placeholder="Search users by name, email, or role... (Ctrl+F)"
                                            className="pl-10"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                        {search && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                                onClick={() => setSearch('')}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                            className="h-9"
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">
                                                {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
                                            </span>
                                            <span className="sm:hidden">
                                                {showAdvancedFilters ? 'Hide' : 'Filters'}
                                            </span>
                                        </Button>
                                        <Button 
                                            variant="outline"
                                            className="h-9"
                                            onClick={() => handleBulkOperation('export')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Export</span>
                                        </Button>
                                    </div>
                                </div>

                                {/* Basic Filters */}
                                <div className="flex flex-wrap gap-2 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Role:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                        >
                                            <option value="all">All Roles</option>
                                            {roles.map((role) => (
                                                <option key={role.id} value={role.id}>
                                                    {truncateText(role.name, 15)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Status:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="suspended">Suspended</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 hidden sm:inline">Sort:</span>
                                        <select
                                            className="border rounded px-2 py-1 text-sm w-28 sm:w-auto"
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="name">Name</option>
                                            <option value="created_at">Date Created</option>
                                            <option value="email">Email</option>
                                            <option value="status">Status</option>
                                        </select>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-7 w-7 p-0"
                                            onClick={() => {
                                                const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                                                setSortOrder(newOrder);
                                                // Update sort in URL
                                                router.get('/users', {
                                                    ...filters,
                                                    sort_by: sortBy,
                                                    sort_order: newOrder,
                                                }, {
                                                    preserveState: true,
                                                    replace: true,
                                                });
                                            }}
                                        >
                                            {sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>

                                {/* Advanced Filters */}
                                {showAdvancedFilters && (
                                    <div className="border-t pt-4 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* 2FA Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Two-Factor Authentication</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8"
                                                        onClick={() => {
                                                            // Add 2FA filter logic
                                                        }}
                                                    >
                                                        <Key className="h-3.5 w-3.5 mr-1" />
                                                        2FA Enabled
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8"
                                                    >
                                                        <Key className="h-3.5 w-3.5 mr-1" />
                                                        2FA Disabled
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Department Filter */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Department</label>
                                                <select
                                                    className="w-full border rounded px-2 py-1 text-sm"
                                                    onChange={(e) => {}}
                                                >
                                                    <option value="all">All Departments</option>
                                                    <option value="Barangay Office">Barangay Office</option>
                                                    <option value="Finance">Finance</option>
                                                    <option value="Registry">Registry</option>
                                                    <option value="Services">Services</option>
                                                    <option value="Planning">Planning</option>
                                                    <option value="Internal Audit">Internal Audit</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Active filters indicator and clear button */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {users.from} to {users.to} of {users.total} users
                                        {search && ` matching "${search}"`}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        {hasActiveFilters && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleClearFilters}
                                                className="text-red-600 hover:text-red-700 h-8"
                                            >
                                                <FilterX className="h-3.5 w-3.5 mr-1" />
                                                Clear Filters
                                            </Button>
                                        )}
                                        {isBulkMode && (
                                            <div className="flex items-center gap-2" ref={selectionRef}>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                                                    className="h-8"
                                                >
                                                    <Layers className="h-3.5 w-3.5 mr-1" />
                                                    Select
                                                </Button>
                                                {showSelectionOptions && (
                                                    <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                                        <div className="p-2">
                                                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                                SELECTION OPTIONS
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllOnPage}
                                                            >
                                                                <Rows className="h-3.5 w-3.5 mr-2" />
                                                                Current Page ({users.data.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAllFiltered}
                                                            >
                                                                <Filter className="h-3.5 w-3.5 mr-2" />
                                                                All Filtered ({users.data.length})
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm"
                                                                onClick={handleSelectAll}
                                                            >
                                                                <Hash className="h-3.5 w-3.5 mr-2" />
                                                                All ({users.total})
                                                            </Button>
                                                            <div className="border-t my-1"></div>
                                                            <Button
                                                                variant="ghost"
                                                                className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                                                                onClick={() => setSelectedUsers([])}
                                                            >
                                                                <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                                                Clear Selection
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enhanced Bulk Actions Bar */}
                    {isBulkMode && selectedUsers.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border">
                                        <PackageCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <span className="font-medium text-sm">
                                            {selectedUsers.length} selected
                                        </span>
                                        <Badge variant="outline" className="ml-1 h-5 text-xs">
                                            {selectionMode === 'page' ? 'Page' : 
                                             selectionMode === 'filtered' ? 'Filtered' : 'All'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedUsers([]);
                                                setIsSelectAll(false);
                                            }}
                                            className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <PackageX className="h-3.5 w-3.5 mr-1" />
                                            Clear
                                        </Button>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleCopySelectedData}
                                                    className="h-7"
                                                >
                                                    <ClipboardCopy className="h-3.5 w-3.5" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Copy selected data as CSV
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2" ref={bulkActionRef}>
                                    <div className="flex items-center gap-2">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('export')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                                                    Export
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Export selected users
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowBulkStatusDialog(true)}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Edit className="h-3.5 w-3.5 mr-1" />
                                                    Edit
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Bulk edit selected users
                                            </TooltipContent>
                                        </Tooltip>
                                        
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleBulkOperation('send_message')}
                                                    className="h-8"
                                                    disabled={isPerformingBulkAction}
                                                >
                                                    <Mail className="h-3.5 w-3.5 mr-1" />
                                                    Email
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                Send email to selected users
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    
                                    <div className="relative">
                                        <Button
                                            onClick={() => setShowBulkActions(!showBulkActions)}
                                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                                            disabled={isPerformingBulkAction}
                                        >
                                            {isPerformingBulkAction ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <>
                                                    <Layers className="h-3.5 w-3.5 mr-1" />
                                                    More
                                                </>
                                            )}
                                        </Button>
                                        
                                        {showBulkActions && (
                                            <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                                                <div className="p-2">
                                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1">
                                                        BULK ACTIONS
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => setShowBulkRoleDialog(true)}
                                                    >
                                                        <Shield className="h-3.5 w-3.5 mr-2" />
                                                        Update Role
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('reset_password')}
                                                    >
                                                        <Key className="h-3.5 w-3.5 mr-2" />
                                                        Reset Passwords
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm"
                                                        onClick={() => handleBulkOperation('toggle_2fa')}
                                                    >
                                                        <Shield className="h-3.5 w-3.5 mr-2" />
                                                        Toggle 2FA
                                                    </Button>
                                                    <DropdownMenuSeparator />
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => setShowBulkDeleteDialog(true)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                                        Delete Selected
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        className="h-8"
                                        onClick={() => setIsBulkMode(false)}
                                        disabled={isPerformingBulkAction}
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        Exit
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Enhanced stats of selected items */}
                            {selectedUsersData.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="h-3.5 w-3.5 text-blue-500" />
                                            <span>
                                                {selectionStats.total} users
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                            <span>
                                                {selectionStats.active} active
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-3.5 w-3.5 text-amber-500" />
                                            <span>
                                                {selectionStats.admins} admins
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Key className="h-3.5 w-3.5 text-purple-500" />
                                            <span>
                                                {selectionStats.twoFactorEnabled} 2FA
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Shield className="h-3 w-3 text-cyan-500" />
                                            <span>{selectionStats.differentRoles} different roles</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <XCircle className="h-3 w-3 text-gray-500" />
                                            <span>{selectionStats.inactive} inactive</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Users Table */}
                    <Card className="overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <div className="flex items-center gap-4">
                                <CardTitle className="text-lg sm:text-xl">
                                    User Accounts
                                    {selectedUsers.length > 0 && isBulkMode && (
                                        <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                            {selectedUsers.length} selected
                                        </span>
                                    )}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${viewMode === 'table' ? 'bg-gray-100' : ''}`}
                                                onClick={() => setViewMode('table')}
                                            >
                                                <List className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Table view</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                                                onClick={() => setViewMode('grid')}
                                            >
                                                <Grid3X3 className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Grid view</TooltipContent>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={isBulkMode}
                                                    onCheckedChange={setIsBulkMode}
                                                    className="data-[state=checked]:bg-blue-600"
                                                />
                                                <Label htmlFor="bulk-mode" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                                                    Bulk Mode
                                                </Label>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Toggle bulk selection mode</p>
                                            <p className="text-xs text-gray-500">Ctrl+Shift+B • Ctrl+A to select</p>
                                            <p className="text-xs text-gray-500">Esc to exit • Del to delete</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                
                                <div className="text-sm text-gray-500 hidden sm:block">
                                    Page {currentPage} of {users.last_page}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <div className="min-w-full inline-block align-middle">
                                    <div className="overflow-hidden">
                                        <Table className="min-w-full">
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                    {isBulkMode && (
                                                        <TableHead className="px-4 py-3 text-center w-12">
                                                            <div className="flex items-center justify-center">
                                                                <Checkbox
                                                                    checked={isSelectAll && users.data.length > 0}
                                                                    onCheckedChange={handleSelectAllOnPage}
                                                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                />
                                                            </div>
                                                        </TableHead>
                                                    )}
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('name')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            User
                                                            {getSortIcon('name')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('role')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Role
                                                            {getSortIcon('role')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100"
                                                    >
                                                        Department
                                                    </TableHead>
                                                    <TableHead 
                                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100"
                                                        onClick={() => handleSort('status')}
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            Status
                                                            {getSortIcon('status')}
                                                        </div>
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]">
                                                        Last Activity
                                                    </TableHead>
                                                    <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {users.data.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={isBulkMode ? 7 : 6} className="text-center py-8 text-gray-500">
                                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                                <UserIcon className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                                                                <div>
                                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                                                                    <p className="text-gray-500 dark:text-gray-400">
                                                                        {hasActiveFilters 
                                                                            ? 'Try changing your filters or search criteria.'
                                                                            : 'Get started by creating a new user.'}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    {hasActiveFilters && (
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={handleClearFilters}
                                                                            className="h-8"
                                                                        >
                                                                            Clear Filters
                                                                        </Button>
                                                                    )}
                                                                    <Link href="/users/create">
                                                                        <Button className="h-8">
                                                                            <Plus className="h-3 w-3 mr-1" />
                                                                            Create New User
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    users.data.map((user) => {
                                                        const nameLength = getTruncationLength('name');
                                                        const emailLength = getTruncationLength('email');
                                                        const roleLength = getTruncationLength('role');
                                                        const isSelected = selectedUsers.includes(user.id);
                                                        const fullName = getFullName(user);
                                                        const roleName = user.role?.name || 'N/A';
                                                        const departmentName = user.department?.name || 'N/A';
                                                        
                                                        return (
                                                            <TableRow 
                                                                key={user.id} 
                                                                className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                                                                    isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                                                                }`}
                                                                onClick={(e) => {
                                                                    if (isBulkMode && e.target instanceof HTMLElement && 
                                                                        !e.target.closest('a') && 
                                                                        !e.target.closest('button') &&
                                                                        !e.target.closest('.dropdown-menu-content') &&
                                                                        !e.target.closest('input[type="checkbox"]')) {
                                                                        handleItemSelect(user.id);
                                                                    }
                                                                }}
                                                            >
                                                                {isBulkMode && (
                                                                    <TableCell className="px-4 py-3 text-center">
                                                                        <div className="flex items-center justify-center">
                                                                            <Checkbox
                                                                                checked={isSelected}
                                                                                onCheckedChange={() => handleItemSelect(user.id)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                                            />
                                                                        </div>
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="px-4 py-3 whitespace-nowrap">
                                                                    <div 
                                                                        className="flex items-center gap-3 cursor-text select-text"
                                                                        onDoubleClick={(e) => {
                                                                            const selection = window.getSelection();
                                                                            if (selection) {
                                                                                const range = document.createRange();
                                                                                range.selectNodeContents(e.currentTarget);
                                                                                selection.removeAllRanges();
                                                                                selection.addRange(range);
                                                                            }
                                                                        }}
                                                                        title={`Double-click to select all\nName: ${fullName}\nEmail: ${user.email}`}
                                                                    >
                                                                        <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                                            <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                                                        </div>
                                                                        <div className="min-w-0">
                                                                            <div className="font-medium">
                                                                                <div 
                                                                                    className="truncate"
                                                                                    data-full-text={fullName}
                                                                                >
                                                                                    {truncateText(fullName, nameLength)}
                                                                                </div>
                                                                            </div>
                                                                            <div 
                                                                                className="text-sm text-gray-500 truncate flex items-center gap-1 mt-1"
                                                                                data-full-text={user.email}
                                                                            >
                                                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                                                {truncateEmail(user.email, emailLength)}
                                                                            </div>
                                                                            {user.username && (
                                                                                <div className="text-xs text-gray-400 truncate mt-1">
                                                                                    @{truncateText(user.username, 15)}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge 
                                                                        variant={getRoleBadgeVariant(roleName)}
                                                                        className="truncate max-w-full"
                                                                        title={roleName}
                                                                    >
                                                                        {truncateText(roleName, roleLength)}
                                                                    </Badge>
                                                                    {user.two_factor_confirmed_at && (
                                                                        <div className="mt-1">
                                                                            <Badge 
                                                                                variant="outline" 
                                                                                className="text-xs flex items-center gap-1"
                                                                                title="Two-Factor Authentication Enabled"
                                                                            >
                                                                                <Key className="h-2 w-2" />
                                                                                2FA
                                                                            </Badge>
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div 
                                                                        className="text-sm truncate"
                                                                        title={departmentName}
                                                                    >
                                                                        {truncateText(departmentName, 20)}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <Badge 
                                                                        variant={getStatusBadgeVariant(user.status)} 
                                                                        className="flex items-center gap-1 truncate max-w-full"
                                                                        title={user.status}
                                                                    >
                                                                        {getStatusIcon(user.status)}
                                                                        <span className="truncate capitalize">
                                                                            {user.status}
                                                                        </span>
                                                                    </Badge>
                                                                    {user.email_verified_at && (
                                                                        <div className="mt-1">
                                                                            <Badge 
                                                                                variant="outline" 
                                                                                className="text-xs flex items-center gap-1"
                                                                                title="Email Verified"
                                                                            >
                                                                                <CheckCircle className="h-2 w-2" />
                                                                                Verified
                                                                            </Badge>
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="space-y-1">
                                                                        <div className="text-sm text-gray-500 truncate" title={formatDateTime(user.last_login_at)}>
                                                                            {user.last_login_at ? formatDateTime(user.last_login_at) : 'Never logged in'}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                                            Created: {formatDate(user.created_at)}
                                                                        </div>
                                                                        {user.position && (
                                                                            <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                                                Position: {truncateText(user.position, 15)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-4 py-3 text-right sticky right-0 bg-white dark:bg-gray-900">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button 
                                                                                variant="ghost" 
                                                                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                            >
                                                                                <span className="sr-only">Open menu</span>
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="w-48">
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/users/${user.id}`} className="flex items-center cursor-pointer">
                                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                                    <span>View Profile</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/users/${user.id}/edit`} className="flex items-center cursor-pointer">
                                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                                    <span>Edit User</span>
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(user.email, 'Email')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Email</span>
                                                                            </DropdownMenuItem>
                                                                            
                                                                            <DropdownMenuItem 
                                                                                onClick={() => handleCopyToClipboard(fullName, 'Name')}
                                                                                className="flex items-center cursor-pointer"
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                <span>Copy Name</span>
                                                                            </DropdownMenuItem>

                                                                            {isBulkMode && (
                                                                                <>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem 
                                                                                        onClick={() => handleItemSelect(user.id)}
                                                                                        className="flex items-center cursor-pointer"
                                                                                    >
                                                                                        {isSelected ? (
                                                                                            <>
                                                                                                <CheckSquare className="mr-2 h-4 w-4 text-green-600" />
                                                                                                <span className="text-green-600">Deselect</span>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <Square className="mr-2 h-4 w-4" />
                                                                                                <span>Select for Bulk</span>
                                                                                            </>
                                                                                        )}
                                                                                    </DropdownMenuItem>
                                                                                </>
                                                                            )}
                                                                            
                                                                            <DropdownMenuSeparator />
                                                                            
                                                                            {user.status === 'active' ? (
                                                                                <DropdownMenuItem 
                                                                                    className="text-amber-600 focus:text-amber-700 focus:bg-amber-50"
                                                                                    onClick={() => {
                                                                                        if (confirm(`Are you sure you want to deactivate ${fullName}?`)) {
                                                                                            router.put(`/users/${user.id}`, {
                                                                                                status: 'inactive'
                                                                                            }, {
                                                                                                onSuccess: () => {
                                                                                                    toast.success('User deactivated successfully');
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <Lock className="mr-2 h-4 w-4" />
                                                                                    <span>Deactivate User</span>
                                                                                </DropdownMenuItem>
                                                                            ) : (
                                                                                <DropdownMenuItem 
                                                                                    className="text-green-600 focus:text-green-700 focus:bg-green-50"
                                                                                    onClick={() => {
                                                                                        if (confirm(`Are you sure you want to activate ${fullName}?`)) {
                                                                                            router.put(`/users/${user.id}`, {
                                                                                                status: 'active'
                                                                                            }, {
                                                                                                onSuccess: () => {
                                                                                                    toast.success('User activated successfully');
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    <Unlock className="mr-2 h-4 w-4" />
                                                                                    <span>Activate User</span>
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            
                                                                            <DropdownMenuItem 
                                                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                                                onClick={() => {
                                                                                    if (confirm(`Are you sure you want to delete user ${fullName}? This action cannot be undone.`)) {
                                                                                        router.delete(`/users/${user.id}`, {
                                                                                            onSuccess: () => {
                                                                                                toast.success('User deleted successfully');
                                                                                            },
                                                                                            onError: () => {
                                                                                                toast.error('Failed to delete user');
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                <span>Delete User</span>
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>

                            {/* Pagination */}
                            {users.last_page > 1 && (
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t">
                                    <div className="text-sm text-gray-500">
                                        Showing {users.from} to {users.to} of {users.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="h-8"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, users.last_page) }, (_, i) => {
                                                let pageNum;
                                                if (users.last_page <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= users.last_page - 2) {
                                                    pageNum = users.last_page - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === users.last_page}
                                            className="h-8"
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Keyboard Shortcuts Help */}
                    {isBulkMode && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">Keyboard Shortcuts</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBulkMode(false)}
                                    className="h-7 text-xs"
                                    disabled={isPerformingBulkAction}
                                >
                                    Exit Bulk Mode
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+A</kbd>
                                    <span>Select page</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Shift+Ctrl+A</kbd>
                                    <span>Select filtered</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Delete</kbd>
                                    <span>Delete selected</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd>
                                    <span>Exit/clear</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Permissions Overview (Optional - can be removed or kept) */}
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">System Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <h4 className="font-medium mb-2 truncate" title="Administrator">
                                        Administrator
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li className="truncate">• Full system access</li>
                                        <li className="truncate">• User management</li>
                                        <li className="truncate">• System configuration</li>
                                        <li className="truncate">• Audit logs access</li>
                                    </ul>
                                </div>
                                <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <h4 className="font-medium mb-2 truncate" title="Treasury Officer">
                                        Treasury Officer
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li className="truncate">• Payment management</li>
                                        <li className="truncate">• Financial reports</li>
                                        <li className="truncate">• Receipt generation</li>
                                        <li className="truncate">• Tax collection</li>
                                    </ul>
                                </div>
                                <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <h4 className="font-medium mb-2 truncate" title="Records Clerk">
                                        Records Clerk
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li className="truncate">• Resident registration</li>
                                        <li className="truncate">• Household management</li>
                                        <li className="truncate">• Data entry</li>
                                        <li className="truncate">• Basic reports</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TooltipProvider>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedUsers.length} selected user{selectedUsers.length !== 1 ? 's' : ''}?
                            This action cannot be undone. Active users cannot be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('delete')}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isPerformingBulkAction}
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Selected'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Status Update Dialog */}
            <AlertDialog open={showBulkStatusDialog} onOpenChange={setShowBulkStatusDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update status for {selectedUsers.length} selected users.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Status</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current selection stats:</div>
                            <ul className="list-disc list-inside space-y-1">
                                <li>{selectionStats.total} total users</li>
                                <li>{selectionStats.active} active • {selectionStats.inactive} inactive</li>
                                <li>{selectionStats.admins} administrators</li>
                                <li>{selectionStats.twoFactorEnabled} with 2FA enabled</li>
                                <li>{selectionStats.differentRoles} different roles</li>
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_status')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Status'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Role Update Dialog */}
            <AlertDialog open={showBulkRoleDialog} onOpenChange={setShowBulkRoleDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bulk Update Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Update role for {selectedUsers.length} selected users.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>New Role</Label>
                            <select 
                                className="w-full border rounded px-3 py-2 mt-1"
                                value={bulkEditValue}
                                onChange={(e) => setBulkEditValue(e.target.value)}
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Current role distribution:</div>
                            <ul className="list-disc list-inside space-y-1">
                                {(() => {
                                    const roleCounts: Record<string, number> = {};
                                    selectedUsersData.forEach(user => {
                                        const roleName = user.role?.name || 'Unknown';
                                        roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
                                    });
                                    
                                    return Object.entries(roleCounts).map(([role, count]) => (
                                        <li key={role}>{role}: {count} user(s)</li>
                                    ));
                                })()}
                            </ul>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPerformingBulkAction}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleBulkOperation('update_role')}
                            disabled={isPerformingBulkAction || !bulkEditValue}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isPerformingBulkAction ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                'Update Role'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
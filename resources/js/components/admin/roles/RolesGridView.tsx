// components/admin/roles/RolesGridView.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GridLayout } from '@/components/adminui/grid-layout';
import { EmptyState } from '@/components/adminui/empty-state';
import { 
    Shield, 
    Users, 
    Key, 
    Calendar, 
    MoreVertical,
    Eye,
    Edit,
    Copy,
    Trash2
} from 'lucide-react';
import { Role } from '@/types';
import { useState, useRef, useEffect } from 'react';

interface RolesGridViewProps {
    roles: Role[];
    isBulkMode: boolean;
    selectedRoles: number[];
    onItemSelect: (id: number) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onDelete: (role: Role) => void;
    onCopyToClipboard: (text: string, label: string) => void;
    windowWidth: number;
}

// Three Dots Menu Component
function ThreeDotsMenu({ 
    role, 
    deletable, 
    onDelete, 
    onCopyToClipboard 
}: { 
    role: Role;
    deletable: boolean;
    onDelete: (role: Role) => void;
    onCopyToClipboard: (text: string, label: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Calculate menu position to avoid overflow
    const [menuPosition, setMenuPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>('bottom-right');

    useEffect(() => {
        const updateMenuPosition = () => {
            if (buttonRef.current && open) {
                const buttonRect = buttonRef.current.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // Check if there's enough space at the bottom
                const spaceBelow = viewportHeight - buttonRect.bottom;
                const spaceAbove = buttonRect.top;
                
                // Check if there's enough space on the right
                const spaceRight = viewportWidth - buttonRect.right;
                const spaceLeft = buttonRect.left;
                
                if (spaceBelow < 200 && spaceAbove > 200) {
                    // Not enough space below, place above
                    setMenuPosition(spaceRight > 200 ? 'top-right' : 'top-left');
                } else {
                    // Place below
                    setMenuPosition(spaceRight > 200 ? 'bottom-right' : 'bottom-left');
                }
            }
        };

        if (open) {
            updateMenuPosition();
            window.addEventListener('resize', updateMenuPosition);
            window.addEventListener('scroll', updateMenuPosition);
        }

        return () => {
            window.removeEventListener('resize', updateMenuPosition);
            window.removeEventListener('scroll', updateMenuPosition);
        };
    }, [open]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current && 
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        // Close on escape key
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                buttonRef.current?.focus();
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscapeKey);
            
            // Focus first menu item when opened
            setTimeout(() => {
                const firstMenuItem = menuRef.current?.querySelector('a, button');
                (firstMenuItem as HTMLElement)?.focus();
            }, 10);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [open]);

    const handleCopy = (text: string, label: string) => {
        onCopyToClipboard(text, label);
        setOpen(false);
    };

    const handleDelete = () => {
        onDelete(role);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            action();
        }
    };

    const menuItems = [
        {
            icon: <Eye className="h-4 w-4" />,
            label: 'View Details',
            href: `/roles/${role.id}`,
            onClick: () => setOpen(false)
        },
        {
            icon: <Edit className="h-4 w-4" />,
            label: 'Edit Role',
            href: `/roles/${role.id}/edit`,
            disabled: role.is_system_role,
            tooltip: role.is_system_role ? 'System roles cannot be edited' : undefined,
            onClick: () => setOpen(false)
        },
        {
            icon: <Key className="h-4 w-4" />,
            label: 'Manage Permissions',
            href: `/roles/${role.id}/permissions`,
            onClick: () => setOpen(false)
        },
        {
            type: 'divider' as const
        },
        {
            icon: <Copy className="h-4 w-4" />,
            label: 'Copy Name',
            action: () => handleCopy(role.name, 'Role Name')
        },
        ...(role.description ? [{
            icon: <Copy className="h-4 w-4" />,
            label: 'Copy Description',
            action: () => handleCopy(role.description || '', 'Role Description')
        }] : []),
        {
            type: 'divider' as const
        },
        {
            icon: <Trash2 className="h-4 w-4" />,
            label: 'Delete Role',
            action: handleDelete,
            disabled: !deletable,
            destructive: true,
            tooltip: !deletable 
                ? role.is_system_role 
                    ? 'System roles cannot be deleted' 
                    : 'Roles with assigned users cannot be deleted'
                : undefined
        }
    ];

    const getMenuPositionClasses = () => {
        switch (menuPosition) {
            case 'bottom-left':
                return 'right-full top-0 mr-1';
            case 'top-right':
                return 'right-0 bottom-full mb-1';
            case 'top-left':
                return 'right-full bottom-full mb-1';
            case 'bottom-right':
            default:
                return 'right-0 top-full mt-1';
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' && !open) {
                        e.preventDefault();
                        setOpen(true);
                    }
                }}
                aria-label="Role actions menu"
                aria-expanded={open}
                aria-haspopup="true"
            >
                <MoreVertical className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {open && (
                <div 
                    ref={menuRef}
                    className={`fixed md:absolute z-[9999] w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 ${getMenuPositionClasses()}`}
                    role="menu"
                    aria-orientation="vertical"
                    style={{
                        // Ensure menu stays within viewport on mobile
                        maxHeight: 'calc(100vh - 100px)',
                        overflowY: 'auto'
                    }}
                >
                    {menuItems.map((item, index) => {
                        if (item.type === 'divider') {
                            return (
                                <div 
                                    key={`divider-${index}`}
                                    className="border-t border-gray-200 dark:border-gray-700 my-1"
                                    role="separator"
                                />
                            );
                        }

                        const className = `w-full px-4 py-2 text-sm text-left flex items-center gap-3 transition-colors ${
                            item.disabled 
                                ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-500' 
                                : item.destructive
                                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`;

                        if ('href' in item) {
                            return (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className={className}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (item.disabled) {
                                            e.preventDefault();
                                            return;
                                        }
                                        item.onClick?.();
                                    }}
                                    role="menuitem"
                                    tabIndex={item.disabled ? -1 : 0}
                                    onKeyDown={(e) => handleKeyDown(e, () => !item.disabled && item.onClick?.())}
                                    title={item.tooltip}
                                    aria-disabled={item.disabled}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </a>
                            );
                        }

                        return (
                            <button
                                key={item.label}
                                className={className}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!item.disabled && item.action) {
                                        item.action();
                                    }
                                }}
                                disabled={item.disabled}
                                role="menuitem"
                                tabIndex={item.disabled ? -1 : 0}
                                onKeyDown={(e) => handleKeyDown(e, () => !item.disabled && item.action?.())}
                                title={item.tooltip}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function RolesGridView({
    roles,
    isBulkMode,
    selectedRoles,
    onItemSelect,
    hasActiveFilters,
    onClearFilters,
    onDelete,
    onCopyToClipboard,
    windowWidth
}: RolesGridViewProps) {
    
    const getRoleTypeBadgeVariant = (isSystemRole: boolean) => {
        if (isSystemRole) {
            return {
                text: 'System',
                className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
            };
        }
        return {
            text: 'Custom',
            className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
        };
    };

    const canDeleteRole = (role: Role) => {
        return !role.is_system_role && (!role.users_count || role.users_count === 0);
    };

    const truncateText = (text: string, length: number = 20): string => {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    };

    const getTruncationLength = (type: 'name' | 'description', width: number) => {
        if (width < 640) return type === 'name' ? 15 : 30;
        if (width < 1024) return type === 'name' ? 20 : 40;
        return type === 'name' ? 25 : 50;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const emptyState = (
        <EmptyState
            title="No roles found"
            description={hasActiveFilters 
                ? 'Try changing your filters or search criteria.'
                : 'Get started by creating a role.'}
            icon={<Shield className="h-12 w-12 text-gray-300 dark:text-gray-700" />}
            hasFilters={hasActiveFilters}
            onClearFilters={onClearFilters}
            onCreateNew={() => window.location.href = '/roles/create'}
            createLabel="Create Role"
        />
    );

    return (
        <GridLayout
            isEmpty={roles.length === 0}
            emptyState={emptyState}
            gridCols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
            gap={{ base: '3', sm: '4' }}
            padding="p-4"
        >
            {roles.map((role) => {
                const isSelected = selectedRoles.includes(role.id);
                const nameLength = getTruncationLength('name', windowWidth);
                const descLength = getTruncationLength('description', windowWidth);
                const typeVariant = getRoleTypeBadgeVariant(role.is_system_role);
                const deletable = canDeleteRole(role);
                
                return (
                    <Card 
                        key={role.id}
                        className={`transition-all hover:shadow-md relative group ${
                            isSelected ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                        role="article"
                        aria-label={`Role: ${role.name}`}
                        onClick={(e) => {
                            if (isBulkMode && e.target instanceof HTMLElement && 
                                !e.target.closest('a') && 
                                !e.target.closest('button') &&
                                !e.target.closest('[role="menu"]')) {
                                onItemSelect(role.id);
                            }
                        }}
                        onKeyDown={(e) => {
                            if (isBulkMode && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                onItemSelect(role.id);
                            }
                        }}
                        tabIndex={0}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        role.is_system_role 
                                            ? 'bg-purple-100 dark:bg-purple-900' 
                                            : 'bg-green-100 dark:bg-green-900'
                                    }`}>
                                        <Shield className={`h-5 w-5 ${
                                            role.is_system_role 
                                                ? 'text-purple-600 dark:text-purple-400' 
                                                : 'text-green-600 dark:text-green-400'
                                        }`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-medium truncate" title={role.name}>
                                            {truncateText(role.name, nameLength)}
                                        </div>
                                        <div 
                                            className="text-xs text-gray-500 dark:text-gray-400 truncate"
                                            title={role.slug}
                                        >
                                            {role.slug}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                    {isBulkMode && (
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onItemSelect(role.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            onKeyDown={(e) => e.stopPropagation()}
                                            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            aria-label={`Select role ${role.name}`}
                                        />
                                    )}
                                    <ThreeDotsMenu 
                                        role={role}
                                        deletable={deletable}
                                        onDelete={onDelete}
                                        onCopyToClipboard={onCopyToClipboard}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    <Badge 
                                        className={`text-xs ${typeVariant.className}`}
                                        variant="secondary"
                                    >
                                        {typeVariant.text}
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {role.description && (
                                        <div 
                                            className="text-gray-600 dark:text-gray-400"
                                            title={role.description}
                                        >
                                            {truncateText(role.description, descLength)}
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                        <Users className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{role.users_count || 0} users</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                        <Key className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>{role.permissions_count || 0} permissions</span>
                                    </div>

                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>Created {formatDate(role.created_at)}</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                        <span>ID: {role.id}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs ${
                                            role.is_system_role 
                                                ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                                                : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                        }`}>
                                            {role.is_system_role ? 'System' : 'Custom'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </GridLayout>
    );
}
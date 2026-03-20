// components/admin/households/create/HouseholdInfoHeader.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Home, Users, FileText, Loader2, Upload } from 'lucide-react';

interface HouseholdInfoHeaderProps {
    title: string;
    subtitle?: string;
    backUrl: string;
    backText?: string;
    processing?: boolean;
    onSave?: () => void;
    onImport?: () => void;
    showImport?: boolean;
    showSave?: boolean;
    saveText?: string;
    savingText?: string;
    stats?: {
        label: string;
        value: string | number;
        icon?: React.ReactNode;
    }[];
    badge?: {
        text: string;
        color?: string;
        icon?: React.ReactNode;
    };
}

export default function HouseholdInfoHeader({
    title,
    subtitle,
    backUrl,
    backText = "Back to Households",
    processing = false,
    onSave,
    onImport,
    showImport = false,
    showSave = true,
    saveText = "Save Household",
    savingText = "Saving...",
    stats,
    badge
}: HouseholdInfoHeaderProps) {
    return (
        <div className="flex flex-col space-y-4">
            {/* Top row with back button and actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href={backUrl}>
                        <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {backText}
                        </Button>
                    </Link>
                    
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center shadow-lg shadow-green-500/20">
                            <Home className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-gray-100 flex items-center gap-2">
                                {title}
                                {badge && (
                                    <Badge variant="outline" className={`ml-2 flex items-center gap-1 ${badge.color || 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'}`}>
                                        {badge.icon}
                                        <span>{badge.text}</span>
                                    </Badge>
                                )}
                            </h1>
                            {subtitle && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {showImport && onImport && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onImport}
                            className="dark:border-gray-600 dark:text-gray-300"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import CSV
                        </Button>
                    )}
                    
                    {showSave && onSave && (
                        <Button
                            type="submit"
                            onClick={onSave}
                            disabled={processing}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white dark:from-green-700 dark:to-emerald-700"
                            size="sm"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {savingText}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {saveText}
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Stats row */}
            {stats && stats.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 mt-2">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                                {stat.icon || <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                                <p className="font-medium dark:text-gray-200">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Optional: Variant for edit forms
export function EditHouseholdInfoHeader({
    title,
    householdId,
    memberCount,
    ...props
}: Omit<HouseholdInfoHeaderProps, 'stats'> & {
    householdId: string | number;
    memberCount: number;
}) {
    const stats = [
        {
            label: 'Household ID',
            value: householdId,
            icon: <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        },
        {
            label: 'Members',
            value: memberCount,
            icon: <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        }
    ];

    return (
        <HouseholdInfoHeader
            title={title}
            stats={stats}
            {...props}
        />
    );
}

// Optional: Variant for view pages
export function ViewHouseholdInfoHeader({
    title,
    householdId,
    memberCount,
    status,
    ...props
}: Omit<HouseholdInfoHeaderProps, 'stats' | 'badge'> & {
    householdId: string | number;
    memberCount: number;
    status: 'active' | 'inactive' | 'archived';
}) {
    const stats = [
        {
            label: 'Household ID',
            value: householdId,
            icon: <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        },
        {
            label: 'Members',
            value: memberCount,
            icon: <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        }
    ];

    const getStatusBadge = () => {
        const colors = {
            active: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
            inactive: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            archived: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700'
        };

        const icons = {
            active: <div className="h-2 w-2 rounded-full bg-green-500 mr-1" />,
            inactive: <div className="h-2 w-2 rounded-full bg-amber-500 mr-1" />,
            archived: <div className="h-2 w-2 rounded-full bg-gray-500 mr-1" />
        };

        return {
            text: status.charAt(0).toUpperCase() + status.slice(1),
            color: colors[status],
            icon: icons[status]
        };
    };

    return (
        <HouseholdInfoHeader
            title={title}
            stats={stats}
            badge={getStatusBadge()}
            {...props}
        />
    );
}
// resources/js/components/admin/puroks/show/components/resident-privileges-card.tsx
import React, { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Users, ChevronDown, ChevronUp, ExternalLink, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Resident } from '@/types/admin/puroks/purok';

interface PrivilegeSummary {
    id: number;
    name: string;
    code: string;
    count: number;
    discountPercentage: number;
}

interface ResidentPrivilegesCardProps {
    residents: Resident[];
    privilegeSummary: PrivilegeSummary[];
}

interface PrivilegeWithResidents {
    id: number;
    name: string;
    code: string;
    count: number;
    discountPercentage: number;
    residents: Array<{ id: number; name: string }>;
}

// Color palette for different privilege types
const PRIVILEGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    default: { bg: 'bg-gray-50 dark:bg-gray-800/30', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' },
    senior: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    pwd: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    soloParent: { bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    indigent: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    veteran: { bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
    student: { bg: 'bg-cyan-50 dark:bg-cyan-950/20', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    fourPs: { bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
    ip: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
};

const getPrivilegeStyle = (code: string) => {
    const codeUpper = code.toUpperCase();
    if (codeUpper === 'SC' || codeUpper === 'SENIOR' || codeUpper === 'OSP') return PRIVILEGE_COLORS.senior;
    if (codeUpper === 'PWD') return PRIVILEGE_COLORS.pwd;
    if (codeUpper === 'SOLO_PARENT' || codeUpper === 'SP') return PRIVILEGE_COLORS.soloParent;
    if (codeUpper === 'INDIGENT' || codeUpper === 'IND') return PRIVILEGE_COLORS.indigent;
    if (codeUpper === 'VETERAN') return PRIVILEGE_COLORS.veteran;
    if (codeUpper === 'STUDENT') return PRIVILEGE_COLORS.student;
    if (codeUpper === '4PS') return PRIVILEGE_COLORS.fourPs;
    if (codeUpper === 'IP') return PRIVILEGE_COLORS.ip;
    return PRIVILEGE_COLORS.default;
};

const getPrivilegeIcon = (code: string): string => {
    const icons: Record<string, string> = {
        'SC': '👴', 'SENIOR': '👴', 'OSP': '👴',
        'PWD': '♿',
        'SOLO_PARENT': '👨‍👧', 'SP': '👨‍👧',
        'INDIGENT': '🏠', 'IND': '🏠',
        'VETERAN': '🎖️',
        'STUDENT': '📚',
        '4PS': '📦',
        'IP': '🌿',
    };
    return icons[code.toUpperCase()] || '🏷️';
};

// Items per page for pagination
const ITEMS_PER_PAGE = 20;

export const ResidentPrivilegesCard = ({ residents, privilegeSummary }: ResidentPrivilegesCardProps) => {
    const [expandedPrivilege, setExpandedPrivilege] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState<Record<string, number>>({});

    const privilegesWithResidents = useMemo(() => {
        const privilegesMap: Record<string, PrivilegeWithResidents> = {};
        
        privilegeSummary.forEach(privilege => {
            privilegesMap[privilege.code] = {
                id: privilege.id,
                name: privilege.name,
                code: privilege.code,
                count: 0,
                discountPercentage: privilege.discountPercentage,
                residents: []
            };
        });
        
        residents.forEach(resident => {
            const privileges = (resident as any).privileges_list || [];
            privileges.forEach((privilege: any) => {
                const code = privilege.code;
                if (privilegesMap[code]) {
                    privilegesMap[code].count++;
                    privilegesMap[code].residents.push({
                        id: resident.id,
                        name: resident.full_name || `${resident.first_name} ${resident.last_name}`
                    });
                }
            });
        });
        
        // Sort residents alphabetically by name for each privilege
        Object.values(privilegesMap).forEach(privilege => {
            privilege.residents.sort((a, b) => a.name.localeCompare(b.name));
        });
        
        return Object.values(privilegesMap).sort((a, b) => b.count - a.count);
    }, [residents, privilegeSummary]);

    const toggleExpand = (code: string) => {
        if (expandedPrivilege === code) {
            setExpandedPrivilege(null);
            setSearchTerm('');
            setCurrentPage({});
        } else {
            setExpandedPrivilege(code);
            setSearchTerm('');
            setCurrentPage({});
        }
    };

    const getCurrentPage = (code: string) => currentPage[code] || 1;
    const setPage = (code: string, page: number) => {
        setCurrentPage(prev => ({ ...prev, [code]: page }));
    };

    const getFilteredResidents = (residentsList: Array<{ id: number; name: string }>) => {
        if (!searchTerm) return residentsList;
        const term = searchTerm.toLowerCase();
        return residentsList.filter(r => r.name.toLowerCase().includes(term));
    };

    const getPaginatedResidents = (residentsList: Array<{ id: number; name: string }>) => {
        const filtered = getFilteredResidents(residentsList);
        const page = getCurrentPage(expandedPrivilege || '');
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return {
            items: filtered.slice(start, end),
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / ITEMS_PER_PAGE),
            currentPage: page
        };
    };

    if (privilegesWithResidents.length === 0) {
        return (
            <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold dark:text-gray-100">
                        <Award className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        Resident Privileges
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="rounded-full bg-gray-100 dark:bg-gray-800 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <Award className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No privileges assigned to residents
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Privileges will appear here once assigned
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalResidentsWithPrivileges = privilegesWithResidents.reduce((sum, p) => sum + p.count, 0);

    return (
        <Card className="dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <CardTitle className="flex items-center gap-2 text-base font-semibold dark:text-gray-100">
                        <Award className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        Resident Privileges
                        <Badge variant="secondary" className="ml-2 text-xs font-normal">
                            {privilegesWithResidents.length} types
                        </Badge>
                    </CardTitle>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {totalResidentsWithPrivileges} total assignments
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="space-y-3">
                    {privilegesWithResidents.map((privilege) => {
                        const style = getPrivilegeStyle(privilege.code);
                        const isExpanded = expandedPrivilege === privilege.code;
                        const paginationData = isExpanded ? getPaginatedResidents(privilege.residents) : null;
                        
                        return (
                            <div 
                                key={privilege.code}
                                className={cn(
                                    "rounded-lg border overflow-hidden transition-all duration-200",
                                    style.border
                                )}
                            >
                                {/* Header */}
                                <div 
                                    className={cn(
                                        "flex items-center justify-between p-3 cursor-pointer transition-colors",
                                        style.bg,
                                        isExpanded && "border-b border-gray-200 dark:border-gray-700"
                                    )}
                                    onClick={() => toggleExpand(privilege.code)}
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <span className="text-2xl flex-shrink-0" aria-hidden="true">
                                            {getPrivilegeIcon(privilege.code)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={cn("font-semibold text-sm", style.text)}>
                                                    {privilege.name}
                                                </span>
                                                {privilege.discountPercentage > 0 && (
                                                    <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                                                        {privilege.discountPercentage}% discount
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {privilege.count} resident{privilege.count !== 1 ? 's' : ''}
                                                </span>
                                                <span className="font-mono text-xs">Code: {privilege.code}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-7 w-7 p-0 rounded-full hover:bg-white/50 dark:hover:bg-gray-700/50 flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleExpand(privilege.code);
                                        }}
                                    >
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-gray-500" />
                                        )}
                                    </Button>
                                </div>
                                
                                {/* Expanded residents list with search and pagination */}
                                {isExpanded && (
                                    <div className="p-4 bg-white dark:bg-gray-800/10 space-y-4">
                                        {/* Search Bar - only show if many residents */}
                                        {privilege.residents.length > 10 && (
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                <Input
                                                    placeholder="Search residents..."
                                                    value={searchTerm}
                                                    onChange={(e) => {
                                                        setSearchTerm(e.target.value);
                                                        setPage(privilege.code, 1);
                                                    }}
                                                    className="pl-8 h-8 text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                                                />
                                                {searchTerm && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setPage(privilege.code, 1);
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                                    >
                                                        <X className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Residents List */}
                                        {paginationData && paginationData.items.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto p-1">
                                                    {paginationData.items.map((resident) => (
                                                        <Link 
                                                            key={resident.id}
                                                            href={`/admin/residents/${resident.id}`}
                                                            className="group flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-md text-xs bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                                                        >
                                                            <span className="truncate flex-1">{resident.name}</span>
                                                            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                                        </Link>
                                                    ))}
                                                </div>
                                                
                                                {/* Pagination */}
                                                {paginationData.totalPages > 1 && (
                                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                                                        <div className="text-xs text-gray-500">
                                                            Showing {(paginationData.currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(paginationData.currentPage * ITEMS_PER_PAGE, paginationData.total)} of {paginationData.total}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs"
                                                                onClick={() => setPage(privilege.code, paginationData.currentPage - 1)}
                                                                disabled={paginationData.currentPage === 1}
                                                            >
                                                                Previous
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 px-2 text-xs"
                                                                onClick={() => setPage(privilege.code, paginationData.currentPage + 1)}
                                                                disabled={paginationData.currentPage === paginationData.totalPages}
                                                            >
                                                                Next
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Show summary of total residents */}
                                                {!searchTerm && privilege.residents.length > ITEMS_PER_PAGE && (
                                                    <div className="text-center text-xs text-gray-400 pt-1">
                                                        {privilege.residents.length} total residents | Page {paginationData.currentPage} of {paginationData.totalPages}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-center py-6">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {searchTerm ? 'No matching residents found' : 'No residents currently have this privilege'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
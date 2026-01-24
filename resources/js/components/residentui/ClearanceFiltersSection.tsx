import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X, Download, FileText, Printer, Square } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Resident {
    id: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    suffix?: string;
}

interface ClearanceFiltersSectionProps {
    search: string;
    setSearch: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    residentFilter: string;
    setResidentFilter: (value: string) => void;
    urgencyFilter: string;
    setUrgencyFilter: (value: string) => void;
    householdResidents: Resident[];
    currentResident: {
        id: number;
        first_name: string;
        last_name: string;
    };
    household?: {
        head_resident_id?: number;
    };
    clearAllFilters: () => void;
    printClearances: () => void;
    exportToCSV: () => void;
    isExporting: boolean;
    toggleSelectMode: () => void;
    selectMode: boolean;
    hasActiveFilters: boolean;
}

export function ClearanceFiltersSection({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    residentFilter,
    setResidentFilter,
    urgencyFilter,
    setUrgencyFilter,
    householdResidents,
    currentResident,
    household,
    clearAllFilters,
    printClearances,
    exportToCSV,
    isExporting,
    toggleSelectMode,
    selectMode,
    hasActiveFilters
}: ClearanceFiltersSectionProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search by reference number, purpose, clearance type..."
                            className="pl-10 bg-white dark:bg-gray-800"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex gap-2 flex-wrap">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="pending_payment">Pending Payment</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="approved">Approved</SelectItem>
                                    <SelectItem value="issued">Issued</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={residentFilter} onValueChange={setResidentFilter}>
                                <SelectTrigger className="w-[160px] h-9">
                                    <SelectValue placeholder="Resident" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Household Members</SelectItem>
                                    {Array.isArray(householdResidents) && householdResidents.map(resident => (
                                        <SelectItem key={resident?.id || Math.random()} value={resident?.id?.toString() || ''}>
                                            {resident?.first_name || ''} {resident?.last_name || ''}
                                            {resident?.id === currentResident?.id && ' (You)'}
                                            {resident?.id === household?.head_resident_id && ' (Head)'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                                <SelectTrigger className="w-[140px] h-9">
                                    <SelectValue placeholder="Urgency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Urgency</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="rush">Rush</SelectItem>
                                    <SelectItem value="express">Express</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-gray-500"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear Filters
                                </Button>
                            )}
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Actions
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={printClearances}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print View
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
                                        <FileText className="h-4 w-4 mr-2" />
                                        {isExporting ? 'Exporting...' : 'Export to CSV'}
                                    </DropdownMenuItem>
                                    {!selectMode && (
                                        <DropdownMenuItem onClick={toggleSelectMode}>
                                            <Square className="h-4 w-4 mr-2" />
                                            Select Clearances
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
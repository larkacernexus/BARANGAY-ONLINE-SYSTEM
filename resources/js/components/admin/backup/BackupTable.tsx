import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MoreVertical, 
  Download, 
  History, 
  Copy, 
  Lock, 
  Unlock, 
  Trash2,
  CheckSquare,
  Square,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  DatabaseBackup,
  Save,
  ChevronUp,
  ChevronDown,
  FileText,
  Hash,
  Filter,
  RotateCcw
} from 'lucide-react';
import { formatDate, formatBytes, truncateText, getSizeColor } from '@/admin-utils/formatters';
import { getTypeIcon, getTypeColor, getTypeLabel, getProtectionBadge } from '@/admin-utils/backupUtils';
import type { BackupFile } from '@/types/backup';

interface BackupTableProps {
  backups: BackupFile[];
  isBulkMode: boolean;
  selectedBackups: string[];
  viewMode: 'table' | 'grid';
  isMobile: boolean;
  filtersState: any;
  onItemSelect: (id: string) => void;
  onSort: (column: string) => void;
  onDelete: (backup: BackupFile) => void;
  onDownload: (filename: string) => void;
  onToggleProtection: (filename: string) => void;
  onSelectAllOnPage: () => void;
  onSelectAllFiltered: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  isSelectAll: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onCreateBackup: () => void;
  filteredBackups: BackupFile[];
  setViewMode: (mode: 'table' | 'grid') => void;
  setIsBulkMode: (mode: boolean) => void;
  showSelectionOptions: boolean;
  setShowSelectionOptions: (show: boolean) => void;
  selectionRef: React.RefObject<HTMLDivElement>;
}

export default function BackupTable({
  backups,
  isBulkMode,
  selectedBackups,
  viewMode,
  isMobile,
  filtersState,
  onItemSelect,
  onSort,
  onDelete,
  onDownload,
  onToggleProtection,
  onSelectAllOnPage,
  onSelectAllFiltered,
  onSelectAll,
  onClearSelection,
  isSelectAll,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasActiveFilters,
  onClearFilters,
  onCreateBackup,
  filteredBackups,
  setViewMode,
  setIsBulkMode,
  showSelectionOptions,
  setShowSelectionOptions,
  selectionRef
}: BackupTableProps) {
  const getSortIcon = (column: string) => {
    if (filtersState.sort_by !== column) return null;
    return filtersState.sort_order === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const getTruncationLength = () => {
    if (isMobile) return 20;
    return 40;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-4">
            <CardTitle className="text-lg sm:text-xl">
              Backup Files
              {selectedBackups.length > 0 && isBulkMode && (
                <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded dark:bg-blue-900/20 dark:text-blue-300">
                  {selectedBackups.length} selected
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
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
                    className={`h-8 w-8 p-0 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
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
            
            {isBulkMode && (
              <div className="flex items-center gap-2" ref={selectionRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSelectionOptions(!showSelectionOptions)}
                  className="h-8"
                >
                  <List className="h-3.5 w-3.5 mr-1" />
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
                        onClick={onSelectAllOnPage}
                      >
                        <FileText className="h-3.5 w-3.5 mr-2" />
                        Current Page ({backups.length})
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm"
                        onClick={onSelectAllFiltered}
                      >
                        <Filter className="h-3.5 w-3.5 mr-2" />
                        All Filtered ({filteredBackups.length})
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm"
                        onClick={onSelectAll}
                      >
                        <Hash className="h-3.5 w-3.5 mr-2" />
                        All ({totalItems})
                      </Button>
                      <div className="border-t my-1"></div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-8 text-sm text-red-600 hover:text-red-700"
                        onClick={onClearSelection}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="text-sm text-gray-500 hidden sm:block dark:text-gray-400">
              Page {currentPage} of {totalPages}
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
                        <TableHead className="px-4 py-3 text-center w-12 dark:bg-gray-800">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelectAll && backups.length > 0}
                              onChange={onSelectAllOnPage}
                              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                            />
                          </div>
                        </TableHead>
                      )}
                      <TableHead 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800"
                        onClick={() => onSort('filename')}
                      >
                        <div className="flex items-center gap-1">
                          Filename & Details
                          {getSortIcon('filename')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800"
                        onClick={() => onSort('type')}
                      >
                        <div className="flex items-center gap-1">
                          Type
                          {getSortIcon('type')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800"
                        onClick={() => onSort('size')}
                      >
                        <div className="flex items-center gap-1">
                          Size
                          {getSortIcon('size')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800"
                        onClick={() => onSort('modified')}
                      >
                        <div className="flex items-center gap-1">
                          Modified
                          {getSortIcon('modified')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 dark:bg-gray-800"
                      >
                        Protection
                      </TableHead>
                      <TableHead className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 dark:bg-gray-800 min-w-[80px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {backups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isBulkMode ? 7 : 6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <div className="flex flex-col items-center justify-center space-y-4">
                            <DatabaseBackup className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No backups found
                              </h3>
                              <p className="text-gray-500 dark:text-gray-400">
                                {hasActiveFilters 
                                  ? 'Try changing your filters or search criteria.'
                                  : 'Get started by creating your first backup.'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {hasActiveFilters && (
                                <Button
                                  variant="outline"
                                  onClick={onClearFilters}
                                  className="h-8 dark:border-gray-700"
                                >
                                  Clear Filters
                                </Button>
                              )}
                              <Button 
                                onClick={onCreateBackup}
                                className="h-8"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Create Backup
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      backups.map((backup) => {
                        const isSelected = selectedBackups.includes(backup.id);
                        const truncateLength = getTruncationLength();
                        const TypeIcon = getTypeIcon(backup.type);
                        const protectionBadge = getProtectionBadge(backup.is_protected);
                        const ProtectionIcon = backup.is_protected ? Lock : Unlock;
                        
                        return (
                          <TableRow 
                            key={backup.id} 
                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                            }`}
                            onClick={(e) => {
                              if (isBulkMode && e.target instanceof HTMLElement && 
                                  !e.target.closest('a') && 
                                  !e.target.closest('button') &&
                                  !e.target.closest('.dropdown-menu-content') &&
                                  !e.target.closest('input[type="checkbox"]')) {
                                onItemSelect(backup.id);
                              }
                            }}
                          >
                            {isBulkMode && (
                              <TableCell className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => onItemSelect(backup.id)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                                  />
                                </div>
                              </TableCell>
                            )}
                            <TableCell className="px-4 py-3">
                              <div className="space-y-2">
                                <div className="font-medium">
                                  <div className="truncate" title={backup.filename}>
                                    {truncateText(backup.filename.replace('.zip', ''), truncateLength)}
                                  </div>
                                </div>
                                {backup.description && (
                                  <div className="text-sm text-gray-500 line-clamp-2" title={backup.description}>
                                    {truncateText(backup.description, truncateLength * 2)}
                                  </div>
                                )}
                                <div className="text-xs text-gray-400">
                                  Created: {formatDate(backup.modified)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <Badge 
                                variant="outline" 
                                className={`flex items-center gap-1 ${getTypeColor(backup.type)}`}
                              >
                                <TypeIcon className="h-4 w-4" />
                                <span className="truncate max-w-[80px]">
                                  {getTypeLabel(backup.type)}
                                </span>
                              </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="space-y-1">
                                <div className={`font-medium ${getSizeColor(backup.size_bytes)}`}>
                                  {backup.size}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatBytes(backup.size_bytes)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              <div className="space-y-1">
                                <div className="text-sm">
                                  {formatDate(backup.modified)}
                                </div>
                                {backup.created_by && (
                                  <div className="text-xs text-gray-500">
                                    by {backup.created_by}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3">
                              {protectionBadge && (
                                <Badge variant="outline" className={protectionBadge.className}>
                                  <protectionBadge.icon className="h-3 w-3 mr-1" />
                                  {protectionBadge.text}
                                </Badge>
                              )}
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
                                  <DropdownMenuItem 
                                    onClick={() => onDownload(backup.filename)}
                                    className="flex items-center cursor-pointer dark:hover:bg-gray-700"
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    <span>Download</span>
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuItem 
                                    onClick={() => onToggleProtection(backup.filename)}
                                    className="flex items-center cursor-pointer dark:hover:bg-gray-700"
                                  >
                                    {backup.is_protected ? (
                                      <>
                                        <Unlock className="mr-2 h-4 w-4" />
                                        <span>Remove Protection</span>
                                      </>
                                    ) : (
                                      <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        <span>Add Protection</span>
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuSeparator />
                                  
                                  <DropdownMenuItem 
                                    onClick={() => navigator.clipboard.writeText(backup.filename)}
                                    className="flex items-center cursor-pointer dark:hover:bg-gray-700"
                                  >
                                    <Copy className="mr-2 h-4 w-4" />
                                    <span>Copy Filename</span>
                                  </DropdownMenuItem>
                                  
                                  {isBulkMode && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        onClick={() => onItemSelect(backup.id)}
                                        className="flex items-center cursor-pointer dark:hover:bg-gray-700"
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
                                  
                                  <DropdownMenuItem 
                                    onClick={() => onDelete(backup)}
                                    className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
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
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-4 pt-4 px-4 border-t dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} results
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-8 dark:border-gray-700"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => onPageChange(pageNum)}
                        className="h-8 w-8 p-0 dark:border-gray-700"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 dark:border-gray-700"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
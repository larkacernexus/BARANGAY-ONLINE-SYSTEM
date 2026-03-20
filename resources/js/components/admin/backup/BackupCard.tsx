import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  MoreVertical, 
  Download, 
  Copy, 
  Lock, 
  Unlock, 
  Trash2,
  CheckSquare,
  Square,
  File,
  Info,
  Calendar,
  User
} from 'lucide-react';
import { formatDate, formatBytes, truncateText, getSizeColor } from '@/admin-utils/formatters';
import { getTypeIcon, getTypeColor, getTypeLabel, getProtectionBadge } from '@/admin-utils/backupUtils';
import type { BackupFile } from '@/types/backup';

interface BackupCardProps {
  backup: BackupFile;
  isSelected: boolean;
  isBulkMode: boolean;
  isMobile: boolean;
  onSelect: (id: string) => void;
  onDelete: (backup: BackupFile) => void;
  onDownload: (filename: string) => void;
  onToggleProtection: (filename: string) => void;
}

export function BackupCard({
  backup,
  isSelected,
  isBulkMode,
  isMobile,
  onSelect,
  onDelete,
  onDownload,
  onToggleProtection
}: BackupCardProps) {
  const truncateLength = isMobile ? 20 : 30;
  const TypeIcon = getTypeIcon(backup.type);
  const protectionBadge = getProtectionBadge(backup.is_protected);
  const ProtectionIcon = backup.is_protected ? Lock : Unlock;

  return (
    <Card 
      className={`overflow-hidden transition-all hover:shadow-md dark:border-gray-700 ${
        isSelected 
          ? 'ring-2 ring-blue-500 border-blue-500 dark:ring-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
          : 'hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={(e) => {
        if (isBulkMode && e.target instanceof HTMLElement && 
            !e.target.closest('a') && 
            !e.target.closest('button') &&
            !e.target.closest('.dropdown-menu-content')) {
          onSelect(backup.id);
        }
      }}
    >
      <div className="p-4">
        {/* Header with checkbox and actions */}
        <div className="flex items-start justify-between mb-3">
          {isBulkMode && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(backup.id)}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-blue-500"
              />
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-900"
                onClick={(e) => e.stopPropagation()}
              >
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
                    onClick={() => onSelect(backup.id)}
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
        </div>
        
        {/* File Icon and Type */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
            <TypeIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${getTypeColor(backup.type)}`}
            >
              <span className="truncate">
                {getTypeLabel(backup.type)}
              </span>
            </Badge>
          </div>
        </div>
        
        {/* Filename */}
        <div className="mb-3">
          <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">
            <File className="h-3 w-3 inline mr-1" />
            Filename
          </div>
          <div className="font-semibold truncate" title={backup.filename}>
            {truncateText(backup.filename.replace('.zip', ''), truncateLength)}
          </div>
          {backup.description && (
            <div className="mt-2 text-sm text-gray-500 line-clamp-2" title={backup.description}>
              <Info className="h-3 w-3 inline mr-1" />
              {truncateText(backup.description, truncateLength)}
            </div>
          )}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Size
            </div>
            <div className={`font-medium ${getSizeColor(backup.size_bytes)}`}>
              {backup.size}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatBytes(backup.size_bytes)}
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Modified
            </div>
            <div className="font-medium text-sm">
              {formatDate(backup.modified)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 inline mr-1" />
              Date
            </div>
          </div>
        </div>
        
        {/* Created By */}
        {backup.created_by && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Created By
            </div>
            <div className="text-sm font-medium flex items-center">
              <User className="h-3 w-3 mr-1 text-gray-400" />
              {backup.created_by}
            </div>
          </div>
        )}
        
        {/* Protection Status */}
        <div className="pt-3 border-t dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {protectionBadge && (
                <Badge variant="outline" className={protectionBadge.className}>
                  <protectionBadge.icon className="h-3 w-3 mr-1" />
                  {protectionBadge.text}
                </Badge>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleProtection(backup.filename);
                  }}
                >
                  <ProtectionIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {backup.is_protected ? 'Remove protection' : 'Add protection'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </Card>
  );
}
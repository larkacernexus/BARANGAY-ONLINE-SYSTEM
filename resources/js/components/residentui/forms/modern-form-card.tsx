import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, Download, Copy, MoreVertical, FileText, AlertCircle, Calendar, Building, Tag, ChevronDown } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernFormCardProps {
  form: any;
  selectMode?: boolean;
  selectedForms?: number[];
  toggleSelectForm?: (id: number) => void;
  formatDate: (date: string) => string;
  formatFileSize: (bytes: number) => string;
  getCategoryColor: (category: string) => string;
  getAgencyIcon: (agency: string) => any;
  getFileTypeIcon: (fileType: string) => any;
  getFileTypeColor: (fileType: string) => string;
  truncateText: (text: string, maxLength?: number) => string;
  onCopyLink?: (form: any) => void;
  onCopyTitle?: (title: string) => void;
  onViewDetails?: (id: number) => void;
  onDownload?: (form: any) => void;
  onGenerateReport?: (form: any) => void;
  onReportIssue?: (form: any) => void;
  isMobile?: boolean;
}

export const ModernFormCard = ({
  form,
  selectMode,
  selectedForms,
  toggleSelectForm,
  formatDate,
  formatFileSize,
  getCategoryColor,
  getAgencyIcon,
  getFileTypeIcon,
  getFileTypeColor,
  truncateText,
  onCopyLink,
  onCopyTitle,
  onViewDetails,
  onDownload,
  onGenerateReport,
  onReportIssue,
  isMobile = true,
}: ModernFormCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const FileTypeIcon = getFileTypeIcon(form.file_type);
  const AgencyIcon = getAgencyIcon(form.issuing_agency);

  return (
    <div className="mb-3 last:mb-0 animate-fade-in">
      <Card className={cn(
        "border-0 shadow-lg overflow-hidden transition-all duration-300",
        selectMode && selectedForms?.includes(form.id) && "ring-2 ring-blue-500 ring-offset-2"
      )}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              {selectMode && (
                <button
                  onClick={() => toggleSelectForm?.(form.id)}
                  className={cn(
                    "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    selectedForms?.includes(form.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {selectedForms?.includes(form.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileTypeIcon className={cn("h-4 w-4", getFileTypeColor(form.file_type))} />
                  <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                    {truncateText(form.title, 60)}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {truncateText(form.description, 100)}
                </p>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className={cn(getCategoryColor(form.category), "border-0")}>
              <Tag className="h-3 w-3 mr-1" />
              {form.category}
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-0">
              <AgencyIcon className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[100px]">{truncateText(form.issuing_agency, 15)}</span>
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">Downloads:</span>
              <span className="font-medium">{form.download_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">Size:</span>
              <span className="font-medium">{formatFileSize(form.file_size)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500">Added:</span>
              <span className="font-medium">{formatDate(form.created_at)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Type:</span>
              <span className="text-xs font-medium ml-1">{form.file_type}</span>
            </div>
          </div>

          {/* Expandable Details */}
          {isExpanded && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-3 animate-slide-down">
              {/* Full Description */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {form.description || 'No description provided'}
                </p>
              </div>

              {/* File Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">File Name</p>
                  <p className="text-sm font-medium truncate" title={form.file_name}>
                    {truncateText(form.file_name, 25)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">{formatDate(form.updated_at)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => onViewDetails?.(form.id)}
                >
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
                  onClick={() => onDownload?.(form)}
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>

              {/* More Options */}
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <MoreVertical className="h-3 w-3" />
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onCopyLink?.(form)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCopyTitle?.(form.title)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Title
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onGenerateReport?.(form)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => onReportIssue?.(form)}>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Report Issue
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2 pt-2 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              isExpanded && "transform rotate-180"
            )} />
            <span className="ml-1">{isExpanded ? 'Show Less' : 'Show More'}</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
};
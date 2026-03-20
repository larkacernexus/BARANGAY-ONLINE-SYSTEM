import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, Download, Copy, MoreVertical, FileText, AlertCircle, Calendar, Building, Tag } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernFormGridCardProps {
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
}

export const ModernFormGridCard = ({
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
}: ModernFormGridCardProps) => {
  const FileTypeIcon = getFileTypeIcon(form.file_type);
  const AgencyIcon = getAgencyIcon(form.issuing_agency);

  return (
    <div className="animate-fade-in-up h-full">
      <Card className={cn(
        "border-0 shadow-lg hover:shadow-xl transition-all duration-300 group h-full",
        selectMode && selectedForms?.includes(form.id) && "ring-2 ring-blue-500 ring-offset-2"
      )}>
        <CardContent className="p-5 h-full flex flex-col">
          {/* Header with Select */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              {selectMode && (
                <button
                  onClick={() => toggleSelectForm?.(form.id)}
                  className={cn(
                    "mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    selectedForms?.includes(form.id)
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600 group-hover:border-gray-400"
                  )}
                >
                  {selectedForms?.includes(form.id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </button>
              )}
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileTypeIcon className={cn("h-4 w-4", getFileTypeColor(form.file_type))} />
                  <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2" title={form.title}>
                    {truncateText(form.title, 50)}
                  </h4>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
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

          {/* Description */}
          <div className="mb-3 flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3" title={form.description}>
              {truncateText(form.description || 'No description provided', 120)}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className={cn(getCategoryColor(form.category), "border-0")}>
              <Tag className="h-3 w-3 mr-1" />
              {truncateText(form.category, 15)}
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-0">
              <AgencyIcon className="h-3 w-3 mr-1" />
              <span className="truncate max-w-[100px]" title={form.issuing_agency}>
                {truncateText(form.issuing_agency, 15)}
              </span>
            </Badge>
          </div>

          {/* Details Card */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Downloads</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {form.download_count.toLocaleString()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">File Size</span>
                <p className="font-medium">{formatFileSize(form.file_size)}</p>
              </div>
              <div>
                <span className="text-gray-500">File Type</span>
                <p className="font-medium">{form.file_type}</p>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-gray-500 text-xs">Uploaded</span>
              <p className="text-sm font-medium">{formatDate(form.created_at)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-auto">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => onViewDetails?.(form.id)}
            >
              <Eye className="h-4 w-4" />
              View
            </Button>
            <Button
              size="sm"
              className="flex-1 gap-2 bg-gradient-to-r from-blue-500 to-blue-600"
              onClick={() => onDownload?.(form)}
            >
              <Download className="h-4 w-4" />
              Get
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, MoreVertical, Copy, FileText, AlertCircle, Calendar, Building, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernFormTableProps {
  forms: any[];
  selectMode: boolean;
  selectedForms: number[];
  toggleSelectForm: (id: number) => void;
  selectAllForms: () => void;
  formatDate: (date: string) => string;
  formatFileSize: (bytes: number) => string;
  getCategoryColor: (category: string) => string;
  getAgencyIcon: (agency: string) => any;
  getFileTypeIcon: (fileType: string) => any;
  getFileTypeColor: (fileType: string) => string;
  truncateText: (text: string, maxLength?: number) => string;
  onCopyLink: (form: any) => void;
  onCopyTitle: (title: string) => void;
  onViewDetails: (id: number) => void;
  onDownload: (form: any) => void;
  onGenerateReport: (form: any) => void;
  onReportIssue: (form: any) => void;
}

export const ModernFormTable = ({
  forms,
  selectMode,
  selectedForms,
  toggleSelectForm,
  selectAllForms,
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
}: ModernFormTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selectMode && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedForms.length === forms.length && forms.length > 0}
                  onChange={selectAllForms}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
            )}
            <TableHead className="font-semibold">Form Details</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Agency</TableHead>
            <TableHead className="font-semibold">Downloads</TableHead>
            <TableHead className="font-semibold">File Info</TableHead>
            <TableHead className="font-semibold">Uploaded</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.map((form) => {
            const FileTypeIcon = getFileTypeIcon(form.file_type);
            const AgencyIcon = getAgencyIcon(form.issuing_agency);

            return (
              <TableRow key={form.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                {selectMode && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedForms.includes(form.id)}
                      onChange={() => toggleSelectForm(form.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileTypeIcon className={cn("h-4 w-4", getFileTypeColor(form.file_type))} />
                      <h4 className="font-medium text-gray-900 dark:text-white" title={form.title}>
                        {truncateText(form.title, 50)}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={form.description}>
                      {truncateText(form.description || 'No description', 80)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(getCategoryColor(form.category), "border-0")}>
                    <Tag className="h-3 w-3 mr-1" />
                    {form.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <AgencyIcon className="h-4 w-4 text-gray-500" />
                    <span className="truncate max-w-[150px]" title={form.issuing_agency}>
                      {form.issuing_agency}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold">{form.download_count.toLocaleString()}</div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{formatFileSize(form.file_size)}</div>
                    <div className="text-xs text-gray-500">{form.file_type}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{formatDate(form.created_at)}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => onViewDetails(form.id)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500 to-blue-600"
                      onClick={() => onDownload(form)}
                      title="Download"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Get
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onCopyLink(form)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCopyTitle(form.title)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Title
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onGenerateReport(form)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => onReportIssue(form)}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Report Issue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
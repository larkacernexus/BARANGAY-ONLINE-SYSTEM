// resources/js/pages/resident/Records/Create.tsx - COMPLETE REVISED VERSION WITH PASSWORD FIX
import React, { useState, useRef, ChangeEvent, useEffect, useCallback, useMemo, DragEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ResidentLayout from '@/layouts/resident-app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Upload,
  File,
  FileText,
  User,
  Calendar,
  Lock,
  Globe,
  AlertCircle,
  ArrowLeft,
  X,
  CheckCircle,
  Loader2,
  Info,
  Shield,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Award,
  DollarSign,
  Scan,
  Sparkles,
  Check,
  FileWarning,
  FolderOpen,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Database,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  RotateCw,
  Brain,
  Zap,
  Target,
  Search,
  List,
  Grid,
  SortAsc,
  SortDesc,
  CalendarDays,
  Tag,
  Plus,
  Eye,
  LockKeyhole,
  UploadCloud,
  HelpCircle,
  Download,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Printer,
  ChevronLeft,
  ChevronRight,
  Settings,
  Key,
  Hash,
  FileJson,
  Wrench,
  ZapOff,
  ShieldAlert,
  Code,
  Cpu,
  CheckSquare,
  Trash2,
  PlusCircle,
  Menu,
  Smartphone,
} from 'lucide-react';

// Interfaces
interface DocumentCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
  is_active: boolean;
  order: number;
  document_types?: DocumentType[];
}

interface DocumentType {
  id: number;
  name: string;
  code: string;
  description?: string;
  category: string;
  accepted_formats: string[];
  max_file_size: number;
  is_active: boolean;
  sort_order: number;
  document_category_id?: number;
  template?: DocumentTemplate;
  requires_expiry_date?: boolean;
  requires_reference_number?: boolean;
  tags?: string[];
  validation_rules?: string[];
}

interface DocumentTemplate {
  id: number;
  name: string;
  description?: string;
  fields: TemplateField[];
  preview_image?: string;
  is_active: boolean;
}

interface TemplateField {
  name: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
  help_text?: string;
}

interface Resident {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface PageProps {
  categories: DocumentCategory[];
  residents: Resident[];
  maxFileSize: number;
  allowedTypes: string[];
  recentDocuments?: any[];
  templates?: DocumentTemplate[];
  aiFeatures?: {
    ocr_enabled: boolean;
    auto_categorization: boolean;
    metadata_extraction: boolean;
    duplicate_detection: boolean;
  };
}

interface FormData {
  resident_id: string;
  document_type_id: string;
  name: string;
  description: string;
  file: File | null;
  issue_date: string;
  expiry_date: string;
  is_public: boolean;
  requires_password: boolean;
  password: string;
  confirm_password: string;
  reference_number: string;
  tags: string[];
  metadata?: Record<string, any> | string;
  custom_fields?: Record<string, any>;
}

interface ExtractedInfo {
  documentName?: string;
  description?: string;
  issueDate?: string;
  expiryDate?: string;
  referenceNumber?: string;
  confidence: number;
  metadata?: Record<string, any>;
  textContent?: string;
  detectedType?: string;
  suggestedCategory?: string;
  suggestedTags?: string[];
}

interface MetadataItem {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

// Mobile Navigation Drawer
interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
  steps: Array<{ title: string; icon: React.ReactNode }>;
}

function MobileNavDrawer({ isOpen, onClose, currentStep, totalSteps, steps }: MobileNavDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[280px] bg-white dark:bg-gray-900 shadow-xl animate-in slide-in-from-right duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Upload Steps</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Steps */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCurrent = currentStep === stepNumber;
                const isCompleted = stepNumber < currentStep;
                
                return (
                  <div
                    key={step.title}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      isCurrent 
                        ? 'bg-blue-50 border border-blue-200' 
                        : isCompleted
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className={`
                      flex items-center justify-center w-8 h-8 rounded-full border-2
                      ${isCurrent 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 text-gray-500'
                      }
                    `}>
                      {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {step.icon}
                        <span className={`font-medium ${isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                          {step.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {isCurrent ? 'Current step' : isCompleted ? 'Completed' : 'Upcoming'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{currentStep}/{totalSteps}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={currentStep === totalSteps ? "default" : "outline"}>
                    {currentStep === totalSteps ? 'Ready to upload' : 'In progress'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={onClose}
            >
              Close Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Full Screen Modal Component (Optimized for Mobile)
function FullScreenModal({ isOpen, onClose, children, title }: FullScreenModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-5 w-5 text-white flex-shrink-0" />
            <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-gray-800 flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-2">
          {children}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-gray-900 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">ESC</kbd> to exit
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-white border-gray-700 hover:bg-gray-800 text-sm"
            >
              <Minimize2 className="h-3 w-3 mr-1" />
              Exit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// PDF Preview Component (Mobile Optimized)
function PDFPreview({ file, zoomLevel }: PDFPreviewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const previewContent = (
    <div className="h-[300px] sm:h-[400px] flex flex-col">
      {/* PDF Info Bar */}
      <div className="bg-white border-b px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
          <span className="font-medium text-sm truncate">PDF Preview</span>
        </div>
        <div className="text-xs text-gray-500 hidden sm:block">
          Preview only
        </div>
      </div>
      
      {/* PDF Preview iframe */}
      <div className="flex-1 p-2">
        <div className="border rounded-lg overflow-hidden h-full bg-white">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('PDF preview could not be loaded');
              setIsLoading(false);
            }}
          />
        </div>
      </div>
      
      {/* PDF Actions - Mobile Optimized */}
      <div className="bg-white border-t px-3 py-2">
        <div className="text-xs text-gray-500 mb-2">
          Use the preview for basic viewing
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullScreen(true)}
            className="flex-1 text-sm"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Full
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(pdfUrl, '_blank')}
            className="flex-1 text-sm"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const link = document.createElement('a');
              link.href = pdfUrl || '';
              link.download = file.name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex-1 text-sm col-span-2 sm:col-span-1"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="relative border rounded-lg overflow-hidden bg-gray-50 min-h-[300px] sm:min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading preview...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
            <div className="text-center p-4 max-w-xs">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-sm sm:text-lg font-medium text-gray-900 mb-2">Preview Unavailable</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">{error}</p>
              <Button 
                onClick={() => window.open(pdfUrl, '_blank')}
                variant="default"
                size="sm"
                className="w-full sm:w-auto"
              >
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Open in New Tab
              </Button>
            </div>
          </div>
        ) : previewContent}
      </div>

      {/* Full Screen Modal */}
      <FullScreenModal
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        title={`PDF - ${file.name}`}
      >
        <div className="w-full h-full bg-gray-900 p-1">
          <div className="border border-gray-700 rounded-lg overflow-hidden h-full bg-gray-800">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Full Screen Preview"
            />
          </div>
        </div>
      </FullScreenModal>
    </>
  );
}

// Image Preview Component (Mobile Optimized)
function ImagePreview({ file, zoomLevel }: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Mobile touch handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scale <= 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  }, [scale, position]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || scale <= 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [isDragging, dragStart, scale]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleOpenFullScreen = () => {
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
  };

  if (!imageUrl) {
    return (
      <div className="flex items-center justify-center h-[300px] sm:h-[400px] bg-gray-50 rounded-lg">
        <div className="text-center">
          <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Failed to load image</p>
        </div>
      </div>
    );
  }

  const previewContent = (
    <div className="space-y-3">
      {/* Mobile Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(prev => Math.max(0.1, prev * 0.8))}
            disabled={scale <= 0.1}
            className="h-7 w-7 p-0"
            title="Zoom Out"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-14 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(prev => Math.min(5, prev * 1.2))}
            disabled={scale >= 5}
            className="h-7 w-7 p-0"
            title="Zoom In"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
            className="h-7 px-2 text-sm hidden sm:block"
            title="Reset View"
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenFullScreen}
            className="h-7 px-2 text-sm"
            title="Full Screen"
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
        </div>
        <div className="text-xs text-gray-500 w-full sm:w-auto text-center sm:text-left">
          {scale > 1 ? 'Touch and drag to pan' : 'Zoom in to pan'}
        </div>
      </div>
      
      {/* Image Container */}
      <div
        ref={containerRef}
        className="border rounded-lg overflow-hidden bg-gray-50 h-[300px] sm:h-[400px] relative"
        style={{
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
        onTouchStart={handleTouchStart}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading image...</p>
            </div>
          </div>
        )}
        
        <div
          className="absolute inset-0 flex items-center justify-center p-2"
        >
          <div
            className="flex items-center justify-center"
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease',
            }}
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain shadow-lg"
              onLoad={handleImageLoad}
              loading="lazy"
              onClick={handleOpenFullScreen}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {previewContent}

      <FullScreenModal
        isOpen={isFullScreen}
        onClose={handleCloseFullScreen}
        title={`Image - ${file.name}`}
      >
        <div className="w-full h-full flex items-center justify-center bg-gray-900 p-1">
          <img
            src={imageUrl}
            alt="Full Screen Preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </FullScreenModal>
    </>
  );
}

// Enhanced File Preview Component (Mobile Optimized)
function FilePreviewComponent({ file }: FilePreviewProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const icons: Record<string, any> = {
      pdf: FileText,
      doc: FileText,
      docx: FileText,
      xls: FileSpreadsheet,
      xlsx: FileSpreadsheet,
      jpg: ImageIcon,
      jpeg: ImageIcon,
      png: ImageIcon,
      gif: ImageIcon,
      txt: FileCode,
      csv: FileSpreadsheet,
    };
    return icons[extension || ''] || File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FileIcon = getFileIcon(file.name);
  const fileType = file.type || 'application/octet-stream';
  const fileSize = formatFileSize(file.size);

  const handleOpenFullScreen = () => {
    setIsFullScreen(true);
  };

  const previewContent = (
    <div className="text-center py-6 sm:py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
      <div className="inline-block p-4 sm:p-6 rounded-full bg-gray-100 border-4 border-white shadow-lg mb-4 sm:mb-6">
        <FileIcon className="h-16 w-16 sm:h-24 sm:w-24 text-gray-600" />
      </div>
      
      <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 px-2 break-words text-sm sm:text-base" title={file.name}>
        {file.name}
      </h3>
      
      <div className="space-y-2 text-gray-600 mb-4 sm:mb-6 px-2">
        <div className="font-medium text-sm sm:text-base">
          {file.type.split('/')[1]?.toUpperCase() || 'Document'} File
        </div>
        
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary" className="px-2 py-1 text-xs">
            {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
          </Badge>
          <Badge variant="outline" className="px-2 py-1 text-xs">
            {fileSize}
          </Badge>
          <Badge variant="outline" className="px-2 py-1 text-xs hidden sm:inline-flex">
            {fileType.split('/')[1]?.toUpperCase() || fileType}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 max-w-sm mx-auto px-2">
        <Button 
          onClick={() => {
            const url = URL.createObjectURL(file);
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
          }}
          size="sm"
          variant="outline"
          className="w-full py-2 text-sm"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open File
        </Button>

        <Button 
          onClick={handleOpenFullScreen}
          size="sm"
          variant="outline"
          className="w-full py-2 text-sm"
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Full Screen
        </Button>
        
        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            Full preview after upload
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {previewContent}

      <FullScreenModal
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        title={`File - ${file.name}`}
      >
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4">
          <div className="text-center max-w-xs sm:max-w-sm">
            <div className="inline-block p-6 sm:p-8 rounded-full bg-gray-800 border-4 border-gray-700 shadow-2xl mb-6 sm:mb-8">
              <FileIcon className="h-20 w-20 sm:h-24 sm:w-24 text-gray-300" />
            </div>
            
            <h3 className="font-semibold text-lg sm:text-xl text-white mb-3 sm:mb-4 break-words">
              {file.name}
            </h3>
            
            <div className="space-y-3 text-gray-300 mb-6 sm:mb-8">
              <div className="text-base sm:text-lg font-medium">
                {file.type.split('/')[1]?.toUpperCase() || 'Document'} File
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-xs bg-gray-800 text-gray-300">
                  {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                </Badge>
                <Badge variant="outline" className="px-3 py-1 text-xs border-gray-700 text-gray-300">
                  {fileSize}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  const url = URL.createObjectURL(file);
                  window.open(url, '_blank');
                  URL.revokeObjectURL(url);
                }}
                size="sm"
                variant="outline"
                className="w-full py-2 text-sm border-gray-700 text-white hover:bg-gray-800"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open File
              </Button>
              
              <Button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(file);
                  link.download = file.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(link.href);
                }}
                size="sm"
                variant="outline"
                className="w-full py-2 text-sm border-gray-700 text-white hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </FullScreenModal>
    </>
  );
}

// Mobile Bottom Action Bar - FIXED WITH FOOTER
function MobileBottomActionBar({
  processing,
  selectedFile,
  documentTypeId,
  residentId,
  onUpload,
  onCancel,
}: {
  processing: boolean;
  selectedFile: File | null;
  documentTypeId: string;
  residentId: string;
  onUpload: () => void;
  onCancel: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const isReady = !processing && selectedFile && documentTypeId && residentId;
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 100;
      
      // Only trigger if significant scroll happened
      if (Math.abs(currentScrollY - lastScrollY) < 5) return;
      
      if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
        // Scrolling DOWN - hide
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling UP - show
        setIsVisible(true);
      }
      
      // Always show when at the top
      if (currentScrollY < 30) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Show on initial load if near top
  useEffect(() => {
    if (window.scrollY < 100) {
      setIsVisible(true);
    }
  }, []);

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-all duration-300
      ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
    `}>
      <div className="px-3 pb-3">
        <div className="bg-white border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onUpload}
              disabled={!isReady || processing}
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Now
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            {isReady ? 'Ready to upload!' : 'Fill all required fields'}
          </p>
        </div>
      </div>
    </div>
  );
}

// AI Service
class AdvancedDocumentAIService {
  private documentPatterns: Record<string, RegExp[]> = {
    passport: [/passport/i, /international.*passport/i, /travel.*document/i],
    id_card: [/id.*card/i, /national.*id/i, /identification/i],
    license: [/driver.*license/i, /driving.*license/i, /permit/i],
    certificate: [/certificate/i, /certification/i, /diploma/i, /degree/i],
    bill: [/bill/i, /invoice/i, /receipt/i, /payment/i],
    contract: [/contract/i, /agreement/i, /lease/i, /deed/i],
    medical: [/medical/i, /health/i, /prescription/i, /vaccination/i],
    tax: [/tax/i, /irs/i, /return/i, /w-2/i, /1099/i],
    bank: [/bank/i, /statement/i, /transaction/i, /account/i],
  };

  async extractDocumentInfo(file: File, documentType?: DocumentType): Promise<ExtractedInfo> {
    const extractedInfo: ExtractedInfo = {
      confidence: 0,
      metadata: {},
      suggestedTags: [],
    };

    const filename = file.name;
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
    
    // Detect document type
    const detectedType = this.detectDocumentType(filename);
    if (detectedType) {
      extractedInfo.detectedType = detectedType;
      extractedInfo.confidence += 0.2;
    }

    // Extract document name
    extractedInfo.documentName = this.extractDocumentName(nameWithoutExt, documentType?.name || detectedType);
    if (extractedInfo.documentName) extractedInfo.confidence += 0.3;

    // Extract dates
    const dates = this.extractDates(filename);
    if (dates.issueDate) {
      extractedInfo.issueDate = dates.issueDate;
      extractedInfo.confidence += 0.15;
    }
    if (dates.expiryDate) {
      extractedInfo.expiryDate = dates.expiryDate;
      extractedInfo.confidence += 0.15;
    }

    // Extract reference numbers
    const refNumbers = this.extractReferenceNumbers(filename);
    if (refNumbers.length > 0) {
      extractedInfo.referenceNumber = refNumbers[0];
      extractedInfo.confidence += 0.15;
    }

    // Generate description
    extractedInfo.description = this.generateDescription(filename, documentType, detectedType);
    extractedInfo.confidence += 0.1;

    // Suggest tags
    const suggestions = this.suggestCategoryAndTags(filename, documentType);
    if (suggestions.category) {
      extractedInfo.suggestedCategory = suggestions.category;
      extractedInfo.confidence += 0.05;
    }
    if (suggestions.tags.length > 0) {
      extractedInfo.suggestedTags = suggestions.tags;
      extractedInfo.confidence += 0.05;
    }

    // Extract metadata
    extractedInfo.metadata = this.extractMetadata(filename);
    extractedInfo.confidence = Math.min(extractedInfo.confidence, 1.0);

    return extractedInfo;
  }

  private detectDocumentType(filename: string): string | null {
    const lowerFilename = filename.toLowerCase();
    
    for (const [type, patterns] of Object.entries(this.documentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(lowerFilename)) {
          return type.replace('_', ' ').toUpperCase();
        }
      }
    }
    
    if (lowerFilename.includes('passport')) return 'PASSPORT';
    if (lowerFilename.includes('id') && lowerFilename.includes('card')) return 'ID CARD';
    if (lowerFilename.includes('driver') || lowerFilename.includes('license')) return 'DRIVER LICENSE';
    if (lowerFilename.includes('birth') && lowerFilename.includes('certificate')) return 'BIRTH CERTIFICATE';
    if (lowerFilename.includes('tax') || lowerFilename.includes('w2') || lowerFilename.includes('1099')) return 'TAX DOCUMENT';
    if (lowerFilename.includes('bank') || lowerFilename.includes('statement')) return 'BANK STATEMENT';
    if (lowerFilename.includes('medical') || lowerFilename.includes('health')) return 'MEDICAL RECORD';
    if (lowerFilename.includes('contract') || lowerFilename.includes('agreement')) return 'CONTRACT';
    
    return null;
  }

  private extractDocumentName(filename: string, documentType?: string): string {
    let cleanName = filename
      .replace(/[_-]/g, ' ')
      .replace(/\d{4}[-_]\d{2}[-_]\d{2}/g, '')
      .replace(/\b\d{4}\b/g, '')
      .replace(/\.(pdf|jpg|jpeg|png|gif|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)$/i, '')
      .trim();

    const commonTerms = [
      'scan', 'copy', 'photo', 'image', 'picture', 'document', 'file',
      'final', 'draft', 'version', 'revised', 'updated', 'signed'
    ];
    
    commonTerms.forEach(term => {
      cleanName = cleanName.replace(new RegExp(`\\b${term}\\b`, 'gi'), '').trim();
    });

    const parts = cleanName.split(/\s+/).filter(part => part.length > 2);
    if (parts.length > 0) {
      return parts.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }

    return documentType || 'Document';
  }

  private extractDates(filename: string): { issueDate?: string; expiryDate?: string } {
    const datePatterns = [
      /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/g,
      /\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b/g,
    ];

    const dates: string[] = [];
    
    datePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(filename)) !== null) {
        try {
          let dateStr = this.parseDateMatch(match);
          if (dateStr) {
            dates.push(dateStr);
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    });

    dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    const result: { issueDate?: string; expiryDate?: string } = {};
    if (dates.length >= 1) {
      result.issueDate = dates[0];
    }
    if (dates.length >= 2) {
      result.expiryDate = dates[dates.length - 1];
    }
    
    return result;
  }

  private parseDateMatch(match: RegExpExecArray): string | null {
    try {
      if (match[1].length === 4) {
        const year = match[1];
        const month = match[2].padStart(2, '0');
        const day = match[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      } else {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        let year = match[3];
        if (year.length === 2) {
          year = `20${year}`;
        }
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      return null;
    }
  }

  private extractReferenceNumbers(filename: string): string[] {
    const patterns = [
      /[A-Z]{2,4}[-_]\d{4}[-_]\d{3,5}/gi,
      /\b\d{4}[-_]\d{4}[-_]\d{4}\b/g,
      /\b[A-Z0-9]{8,12}\b/g,
    ];

    const results: string[] = [];
    
    patterns.forEach(pattern => {
      const matches = filename.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length >= 5) {
            results.push(match);
          }
        });
      }
    });

    return [...new Set(results)];
  }

  private generateDescription(filename: string, documentType?: DocumentType, detectedType?: string): string {
    const typeName = documentType?.name || detectedType || 'document';
    const now = new Date();
    
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `${typeName} uploaded on ${formattedDate}. Original filename: ${filename}`;
  }

  private suggestCategoryAndTags(filename: string, documentType?: DocumentType): { category?: string; tags: string[] } {
    const tags: string[] = [];
    let category: string | undefined;
    
    const lowerFilename = filename.toLowerCase();
    
    if (lowerFilename.includes('passport') || lowerFilename.includes('visa')) {
      category = 'Travel';
      tags.push('travel', 'identification', 'international');
    } else if (lowerFilename.includes('license') || lowerFilename.includes('permit')) {
      category = 'Legal';
      tags.push('driving', 'government', 'identification');
    } else if (lowerFilename.includes('certificate') || lowerFilename.includes('diploma')) {
      category = 'Education';
      tags.push('education', 'achievement', 'certification');
    } else if (lowerFilename.includes('medical') || lowerFilename.includes('health')) {
      category = 'Medical';
      tags.push('health', 'insurance', 'records');
    } else if (lowerFilename.includes('tax') || lowerFilename.includes('irs')) {
      category = 'Financial';
      tags.push('taxes', 'finance', 'government');
    } else if (lowerFilename.includes('bank') || lowerFilename.includes('statement')) {
      category = 'Financial';
      tags.push('banking', 'finance', 'statements');
    } else if (lowerFilename.includes('contract') || lowerFilename.includes('agreement')) {
      category = 'Legal';
      tags.push('legal', 'contract', 'agreement');
    } else if (lowerFilename.includes('bill') || lowerFilename.includes('invoice')) {
      category = 'Financial';
      tags.push('bills', 'payments', 'utilities');
    }
    
    if (documentType?.tags) {
      tags.push(...documentType.tags);
    }
    
    if (filename.match(/\.(pdf)$/i)) tags.push('pdf');
    if (filename.match(/\.(jpg|jpeg|png|gif)$/i)) tags.push('image');
    if (filename.match(/\.(doc|docx)$/i)) tags.push('word', 'document');
    if (filename.match(/\.(xls|xlsx)$/i)) tags.push('excel', 'spreadsheet');
    
    return {
      category,
      tags: [...new Set(tags)],
    };
  }

  private extractMetadata(filename: string): Record<string, any> {
    return {
      originalFilename: filename,
      fileExtension: filename.split('.').pop()?.toLowerCase() || '',
      containsDates: /\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}/.test(filename),
      containsNumbers: /\d/.test(filename),
      wordCount: filename.split(/[_\-\s]+/).length,
    };
  }
}

// Helper functions
const getCategoryIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'User': User,
    'Shield': Shield,
    'Briefcase': Briefcase,
    'GraduationCap': GraduationCap,
    'Heart': Heart,
    'Home': Home,
    'Award': Award,
    'DollarSign': DollarSign,
    'FileText': FileText,
    'FolderOpen': FolderOpen,
    'Database': Database,
    'ShieldCheck': ShieldCheck,
  };
  return iconMap[iconName] || File;
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatKBtoMB = (kb: number) => {
  return (kb / 1024).toFixed(2) + ' MB';
};

// Main Component - PHONE READY VERSION WITH FIXED PASSWORD TOGGLE
export default function DocumentCreate({ 
  categories, 
  residents, 
  maxFileSize, 
  allowedTypes,
  recentDocuments = [],
  templates = [],
  aiFeatures = {
    ocr_enabled: true,
    auto_categorization: true,
    metadata_extraction: true,
    duplicate_detection: true,
  }
}: PageProps) {
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const [showExtractedInfo, setShowExtractedInfo] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadStep, setUploadStep] = useState<'type-selection' | 'file-upload' | 'details'>('type-selection');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [metadataInput, setMetadataInput] = useState<string>('{}');
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Mobile-specific state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'preview' | 'security'>('details');

  // Advanced Options State
  const [metadataItems, setMetadataItems] = useState<MetadataItem[]>([
    { key: 'originalFilename', value: '', type: 'string' },
    { key: 'fileExtension', value: '', type: 'string' },
    { key: 'fileSize', value: '0', type: 'number' },
    { key: 'uploadTimestamp', value: new Date().toISOString().split('T')[0], type: 'date' },
  ]);
  const [newMetadataKey, setNewMetadataKey] = useState('');
  const [newMetadataValue, setNewMetadataValue] = useState('');
  const [newMetadataType, setNewMetadataType] = useState<'string' | 'number' | 'boolean' | 'date'>('string');
  const [ocrEnabled, setOcrEnabled] = useState(aiFeatures.ocr_enabled);
  const [validationEnabled, setValidationEnabled] = useState(true);
  const [enableDuplicateCheck, setEnableDuplicateCheck] = useState(aiFeatures.duplicate_detection);
  const [enableAutoCategorization, setEnableAutoCategorization] = useState(aiFeatures.auto_categorization);
  
  // AI Service
  const [aiService] = useState<AdvancedDocumentAIService>(new AdvancedDocumentAIService());

  // Form
  const { data, setData, post, processing, errors } = useForm<FormData>({
    resident_id: '',
    document_type_id: '',
    name: '',
    description: '',
    file: null,
    issue_date: '',
    expiry_date: '',
    is_public: true,
    requires_password: false,
    password: '',
    confirm_password: '',
    reference_number: '',
    tags: [],
    metadata: {},
    custom_fields: {},
  });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Memoized document types
  const allDocumentTypes = useMemo(() => 
    categories.flatMap(category => 
      category.document_types?.map(type => ({
        ...type,
        category_name: category.name,
        category_icon: category.icon,
        category_color: category.color,
        category_description: category.description,
      })) || []
    ),
    [categories]
  );

  const filteredDocumentTypes = useMemo(() => {
    let types = selectedCategory === 'all' 
      ? allDocumentTypes 
      : allDocumentTypes.filter(type => type.document_category_id?.toString() === selectedCategory);

    if (searchQuery) {
      types = types.filter(type => 
        type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    types.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = (a.max_file_size || 0) - (b.max_file_size || 0);
          break;
        case 'date':
          comparison = (a.sort_order || 0) - (b.sort_order || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return types;
  }, [selectedCategory, allDocumentTypes, searchQuery, sortBy, sortOrder]);

  // Effects
  useEffect(() => {
    if (data.document_type_id) {
      const docType = filteredDocumentTypes.find(type => type.id.toString() === data.document_type_id);
      setSelectedDocumentType(docType || null);
      if (docType) {
        setUploadStep('file-upload');
      }
    } else {
      setSelectedDocumentType(null);
    }
  }, [data.document_type_id, filteredDocumentTypes]);

  useEffect(() => {
    setData('tags', selectedTags);
  }, [selectedTags, setData]);

  useEffect(() => {
    if (selectedFile) {
      const updatedItems = [...metadataItems];
      const filenameIndex = updatedItems.findIndex(item => item.key === 'originalFilename');
      const extensionIndex = updatedItems.findIndex(item => item.key === 'fileExtension');
      const sizeIndex = updatedItems.findIndex(item => item.key === 'fileSize');
      
      if (filenameIndex !== -1) {
        updatedItems[filenameIndex].value = selectedFile.name;
      }
      if (extensionIndex !== -1) {
        updatedItems[extensionIndex].value = selectedFile.name.split('.').pop() || '';
      }
      if (sizeIndex !== -1) {
        updatedItems[sizeIndex].value = selectedFile.size.toString();
      }
      
      setMetadataItems(updatedItems);
      
      const metadataObj = updatedItems.reduce((acc, item) => {
        let parsedValue: any = item.value;
        
        switch (item.type) {
          case 'number':
            parsedValue = parseFloat(item.value) || 0;
            break;
          case 'boolean':
            parsedValue = item.value.toLowerCase() === 'true';
            break;
          case 'date':
            parsedValue = item.value;
            break;
          default:
            parsedValue = item.value;
        }
        
        acc[item.key] = parsedValue;
        return acc;
      }, {} as Record<string, any>);
      
      setData('metadata', metadataObj);
      setMetadataInput(JSON.stringify(metadataObj, null, 2));
    }
  }, [selectedFile]);

  // Check file type
  const isPdf = selectedFile?.type === 'application/pdf' || selectedFile?.name.toLowerCase().endsWith('.pdf');
  const isImage = selectedFile?.type?.startsWith('image/') || 
                  ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].some(ext => 
                    selectedFile?.name.toLowerCase().endsWith(ext)
                  );

  // Mobile tabs for details view
  const mobileTabs = [
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  // Handlers
  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect({ target: { files: [e.dataTransfer.files[0]] } } as ChangeEvent<HTMLInputElement>);
    }
  }, []);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError(null);
    setUploadError(null);
    setExtractedInfo(null);
    setShowExtractedInfo(false);
    setZoomLevel(100);

    // Basic validation
    const maxSize = maxFileSize * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError(`File too large (max ${maxFileSize}MB)`);
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedTypes.includes(fileExtension)) {
      setFileError(`File type not allowed`);
      return;
    }

    setSelectedFile(file);
    setData('file', file);
    setUploadStep('details');

    // Set default name
    const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    if (!data.name) {
      setData('name', fileNameWithoutExt.replace(/[_-]/g, ' '));
    }

    // Extract info with AI
    if (selectedDocumentType) {
      setIsScanning(true);
      try {
        const info = await aiService.extractDocumentInfo(file, selectedDocumentType);
        setExtractedInfo(info);
        setShowExtractedInfo(true);
        
        if (info.documentName && !data.name) {
          setData('name', info.documentName);
        }
        if (info.description && !data.description) {
          setData('description', info.description);
        }
        if (info.issueDate && !data.issue_date) {
          setData('issue_date', info.issueDate);
        }
        if (info.expiryDate && !data.expiry_date) {
          setData('expiry_date', info.expiryDate);
        }
        if (info.referenceNumber && !data.reference_number) {
          setData('reference_number', info.referenceNumber);
        }
        if (info.suggestedTags && info.suggestedTags.length > 0) {
          const newTags = [...selectedTags, ...info.suggestedTags!]
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 10);
          setSelectedTags(newTags);
        }
        if (info.metadata) {
          setData('metadata', { ...data.metadata, ...info.metadata });
        }
      } catch (error) {
        console.error('AI extraction error:', error);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleApplyExtractedInfo = () => {
    if (!extractedInfo) return;

    if (extractedInfo.documentName) {
      setData('name', extractedInfo.documentName);
    }
    if (extractedInfo.description) {
      setData('description', extractedInfo.description);
    }
    if (extractedInfo.issueDate) {
      setData('issue_date', extractedInfo.issueDate);
    }
    if (extractedInfo.expiryDate) {
      setData('expiry_date', extractedInfo.expiryDate);
    }
    if (extractedInfo.referenceNumber) {
      setData('reference_number', extractedInfo.referenceNumber);
    }
    if (extractedInfo.suggestedTags) {
      const newTags = [...selectedTags, ...extractedInfo.suggestedTags!]
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
      setSelectedTags(newTags);
    }
    if (extractedInfo.metadata) {
      setData('metadata', { ...data.metadata, ...extractedInfo.metadata });
    }

    setShowExtractedInfo(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setData('file', null);
    setFileError(null);
    setExtractedInfo(null);
    setShowExtractedInfo(false);
    setZoomLevel(100);
    setUploadStep('file-upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTagSelect = (tag: string) => {
    const newTags = selectedTags.includes(tag) 
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag].slice(0, 10);
    setSelectedTags(newTags);
  };

  const handleAddCustomTag = () => {
    if (customTags.trim()) {
      const newTags = customTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      const updatedTags = [...selectedTags, ...newTags]
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 10);
      setSelectedTags(updatedTags);
      setCustomTags('');
    }
  };

  const handleBackToTypeSelection = () => {
    setUploadStep('type-selection');
    setSelectedDocumentType(null);
    setData('document_type_id', '');
  };

  const handleBackToFileUpload = () => {
    setUploadStep('file-upload');
  };

  // Metadata handlers
  const addMetadataItem = () => {
    if (newMetadataKey.trim() && newMetadataValue.trim()) {
      const newItem: MetadataItem = {
        key: newMetadataKey.trim(),
        value: newMetadataValue.trim(),
        type: newMetadataType,
      };
      
      setMetadataItems([...metadataItems, newItem]);
      setNewMetadataKey('');
      setNewMetadataValue('');
      
      const metadataObj = [...metadataItems, newItem].reduce((acc, item) => {
        let parsedValue: any = item.value;
        
        switch (item.type) {
          case 'number':
            parsedValue = parseFloat(item.value) || 0;
            break;
          case 'boolean':
            parsedValue = item.value.toLowerCase() === 'true';
            break;
          case 'date':
            parsedValue = item.value;
            break;
          default:
        parsedValue = item.value;
        }
        
        acc[item.key] = parsedValue;
        return acc;
      }, {} as Record<string, any>);
      
      setData('metadata', metadataObj);
      setMetadataInput(JSON.stringify(metadataObj, null, 2));
    }
  };

  const removeMetadataItem = (index: number) => {
    const updatedItems = metadataItems.filter((_, i) => i !== index);
    setMetadataItems(updatedItems);
    
    const metadataObj = updatedItems.reduce((acc, item) => {
      let parsedValue: any = item.value;
      
      switch (item.type) {
        case 'number':
          parsedValue = parseFloat(item.value) || 0;
          break;
        case 'boolean':
          parsedValue = item.value.toLowerCase() === 'true';
          break;
        case 'date':
          parsedValue = item.value;
          break;
        default:
          parsedValue = item.value;
      }
      
      acc[item.key] = parsedValue;
      return acc;
    }, {} as Record<string, any>);
    
    setData('metadata', metadataObj);
    setMetadataInput(JSON.stringify(metadataObj, null, 2));
  };

  const updateMetadataItem = (index: number, field: 'key' | 'value' | 'type', value: string) => {
    const updatedItems = [...metadataItems];
    
    if (field === 'type') {
      updatedItems[index].type = value as 'string' | 'number' | 'boolean' | 'date';
    } else {
      updatedItems[index][field] = value;
    }
    
    setMetadataItems(updatedItems);
    
    const metadataObj = updatedItems.reduce((acc, item) => {
      let parsedValue: any = item.value;
      
      switch (item.type) {
        case 'number':
          parsedValue = parseFloat(item.value) || 0;
          break;
        case 'boolean':
          parsedValue = item.value.toLowerCase() === 'true';
          break;
        case 'date':
          parsedValue = item.value;
          break;
        default:
        parsedValue = item.value;
      }
      
      acc[item.key] = parsedValue;
      return acc;
    }, {} as Record<string, any>);
    
    setData('metadata', metadataObj);
    setMetadataInput(JSON.stringify(metadataObj, null, 2));
  };

  const handleJsonInputChange = (value: string) => {
    setMetadataInput(value);
    try {
      const parsed = JSON.parse(value);
      setData('metadata', parsed);
      
      const items: MetadataItem[] = Object.entries(parsed).map(([key, value]) => {
        let type: 'string' | 'number' | 'boolean' | 'date' = 'string';
        
        if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
          type = 'date';
        }
        
        return {
          key,
          value: String(value),
          type,
        };
      });
      
      setMetadataItems(items);
    } catch {
      // Keep existing metadata if JSON is invalid
    }
  };

  const handleToggleAllAIFeatures = (enabled: boolean) => {
    setOcrEnabled(enabled);
    setValidationEnabled(enabled);
    setEnableDuplicateCheck(enabled);
    setEnableAutoCategorization(enabled);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  // Submit handler with fixed password handling
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUploadError(null);

    // Validation
    if (!data.resident_id) {
      setUploadError('Please select a resident.');
      return;
    }
    if (!data.document_type_id) {
      setUploadError('Please select a document type.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }
    
    // Password validation - only validate if requires_password is true
    if (data.requires_password) {
      if (!data.password) {
        setUploadError('Please enter a password for the document.');
        return;
      }
      if (data.password !== data.confirm_password) {
        setUploadError('Passwords do not match.');
        return;
      }
      if (data.password.length < 4) {
        setUploadError('Password must be at least 4 characters long.');
        return;
      }
    } else {
      // Clear password fields if not required
      setData('password', '');
      setData('confirm_password', '');
    }

    // Prepare FormData
    const formData = new FormData();
    
    // Required fields
    formData.append('resident_id', data.resident_id);
    formData.append('document_type_id', data.document_type_id);
    formData.append('name', data.name || selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' '));
    formData.append('description', data.description || '');
    formData.append('file', selectedFile);
    formData.append('is_public', data.is_public ? '1' : '0');
    formData.append('requires_password', data.requires_password ? '1' : '0');
    
    // Optional fields
    if (data.issue_date) formData.append('issue_date', data.issue_date);
    if (data.expiry_date) formData.append('expiry_date', data.expiry_date);
    if (data.reference_number) formData.append('reference_number', data.reference_number);
    
    // Password fields - only include if requires_password is true
    if (data.requires_password) {
      formData.append('password', data.password);
      formData.append('confirm_password', data.confirm_password);
    } else {
      // Send empty strings to clear any previous values
      formData.append('password', '');
      formData.append('confirm_password', '');
    }
    
    // TAGS: Convert to JSON string
    const cleanTags = selectedTags
      .map(tag => tag.toString().trim())
      .filter(tag => tag.length > 0);
    
    formData.append('tags', JSON.stringify(cleanTags));
    
    // METADATA: Ensure it's a JSON string
    let metadataValue = data.metadata || {};
    if (typeof metadataValue === 'string') {
      try {
        metadataValue = JSON.parse(metadataValue);
      } catch {
        metadataValue = {};
      }
    }
    
    formData.append('metadata', JSON.stringify(metadataValue));
    
    // Submit
    post('/my-records', formData, {
      forceFormData: true,
      preserveScroll: true,
      onStart: () => setUploadProgress(10),
      onProgress: (progress) => {
        if (progress.percentage) setUploadProgress(Math.round(progress.percentage));
      },
      onSuccess: () => setUploadProgress(100),
      onError: (errors) => {
        console.error('Upload errors:', errors);
        
        if (errors.tags) {
          setUploadError(`Tags error: ${errors.tags}`);
        } else if (errors.metadata) {
          setUploadError(`Metadata error: ${errors.metadata}`);
        } else if (errors.reference_number) {
          setUploadError('Reference number already exists. Please use a different one.');
        } else if (errors.password) {
          setUploadError(`Password error: ${errors.password}`);
        } else if (errors.confirm_password) {
          setUploadError(`Confirm password error: ${errors.confirm_password}`);
        } else {
          setUploadError(Object.values(errors)[0] || 'Upload failed.');
        }
        setUploadProgress(0);
      },
    });
  };

  // Mobile steps for navigation drawer
  const mobileSteps = [
    { title: 'Document Type', icon: <FileText className="h-4 w-4" /> },
    { title: 'File Upload', icon: <Upload className="h-4 w-4" /> },
    { title: 'Details', icon: <FileText className="h-4 w-4" /> },
  ];

  const currentStepNumber = {
    'type-selection': 1,
    'file-upload': 2,
    'details': 3,
  }[uploadStep];

  // Render
  return (
    <ResidentLayout
      title="Upload Document"
      breadcrumbs={[
        { title: 'Dashboard', href: '/resident/dashboard' },
        { title: 'My Records', href: '/my-records' },
        { title: 'Upload Document', href: '#' },
      ]}
    >
      <Head title="Upload Document" />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        currentStep={currentStepNumber}
        totalSteps={3}
        steps={mobileSteps}
      />

      {/* Mobile Bottom Action Bar - Aligned with footer */}
      {uploadStep === 'details' && isMobile && (
        <MobileBottomActionBar
          processing={processing}
          selectedFile={selectedFile}
          documentTypeId={data.document_type_id}
          residentId={data.resident_id}
          onUpload={() => handleSubmit()}
          onCancel={() => window.history.back()}
        />
      )}

      {/* Main content with adjusted bottom padding */}
      <div className={`space-y-4 sm:space-y-6 ${uploadStep === 'details' && isMobile ? 'pb-24' : 'pb-20 sm:pb-6'}`}>
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Link href="/my-records" className="sm:hidden">
              <Button type="button" variant="ghost" size="sm" className="h-9 w-9 p-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Upload Document</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Upload and manage your personal documents
              </p>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="lg:hidden h-9 w-9 p-0"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Badge variant="outline" className="hidden sm:inline-flex gap-1">
            <Sparkles className="h-3 w-3" />
            AI
          </Badge>
        </div>

        {/* Mobile Step Indicator */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-sm font-medium">Step {currentStepNumber} of 3</span>
            <span className="text-xs text-gray-500">
              {uploadStep === 'type-selection' ? 'Select Type' : 
               uploadStep === 'file-upload' ? 'Upload File' : 'Details'}
            </span>
          </div>
          <Progress value={(currentStepNumber / 3) * 100} className="h-2" />
        </div>

        {/* Progress Steps - Desktop */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {['type-selection', 'file-upload', 'details'].map((step, index) => {
              const stepNumber = index + 1;
              const isCurrent = uploadStep === step;
              const isCompleted = 
                (step === 'type-selection' && uploadStep !== 'type-selection') ||
                (step === 'file-upload' && uploadStep === 'details');
              
              return (
                <div key={step} className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                          ${isCurrent 
                            ? 'bg-blue-600 border-blue-600 text-white scale-110' 
                            : isCompleted
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'border-gray-300 text-gray-500'
                          }
                        `}>
                          {isCompleted ? <Check className="h-5 w-5" /> : stepNumber}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{['Document Type', 'File Upload', 'Details'][index]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {index < 2 && <div className="w-16 h-0.5 bg-gray-300"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {uploadError && (
          <Alert variant="destructive" className="text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Upload Failed</AlertTitle>
            <AlertDescription className="text-xs">{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Main Content - Mobile Responsive Grid */}
        <div className="space-y-4 sm:space-y-6">
          {/* Mobile Layout: Single Column */}
          <div className="lg:hidden space-y-4">
            
            {/* Step 1: Document Type Selection */}
            {uploadStep === 'type-selection' && (
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Select Document Type
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Choose the type of document you want to upload
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="name">Sort by Name</option>
                        <option value="size">Sort by Size</option>
                        <option value="date">Sort by Date</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {filteredDocumentTypes.map((type) => {
                      const CategoryIcon = getCategoryIcon(type.category_icon);
                      const isSelected = data.document_type_id === type.id.toString();
                      
                      return (
                        <div
                          key={type.id}
                          className={`
                            border rounded-lg p-3 cursor-pointer transition-all
                            ${isSelected 
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }
                          `}
                          onClick={() => {
                            setData('document_type_id', type.id.toString());
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${type.category_color}20` }}>
                              <CategoryIcon className="h-5 w-5" style={{ color: type.category_color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm truncate">{type.name}</h4>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{type.description}</p>
                              <div className="flex flex-wrap gap-1">
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  {type.code}
                                </Badge>
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                  Max: {formatKBtoMB(type.max_file_size || maxFileSize * 1024)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredDocumentTypes.length === 0 && (
                    <div className="text-center py-8">
                      <FileWarning className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <h3 className="font-medium text-base mb-1">No document types found</h3>
                      <p className="text-sm text-gray-500">Try adjusting your search</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: File Upload */}
            {uploadStep === 'file-upload' && selectedDocumentType && (
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2 text-lg truncate">
                        <Upload className="h-5 w-5" />
                        Upload File
                      </CardTitle>
                      <CardDescription className="text-sm truncate">
                        for {selectedDocumentType.name}
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleBackToTypeSelection}
                      className="gap-1 text-sm"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <Alert className="bg-blue-50 border-blue-200 text-sm">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 text-sm">
                      Requirements
                    </AlertTitle>
                    <AlertDescription className="text-blue-700 text-xs">
                      <div className="space-y-1 mt-1">
                        <div className="flex justify-between">
                          <span>Max Size:</span>
                          <span>{formatKBtoMB(selectedDocumentType.max_file_size || maxFileSize * 1024)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Formats:</span>
                          <span>
                            {selectedDocumentType.accepted_formats?.slice(0, 3).map(f => f.toUpperCase()).join(', ')}
                            {selectedDocumentType.accepted_formats?.length > 3 && '...'}
                          </span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {/* Mobile File Drop Area */}
                  <div
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
                      ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                    `}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-base mb-1">Drag & drop</h3>
                    <p className="text-gray-500 text-sm mb-3">or tap to browse</p>
                    <Button 
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept={allowedTypes.map(type => `.${type}`).join(',')}
                    />
                  </div>

                  {fileError && (
                    <Alert variant="destructive" className="text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">{fileError}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Details - Mobile Tabs */}
            {uploadStep === 'details' && (
              <>
                {/* Mobile Tabs */}
                <div className="border-b">
                  <div className="flex">
                    {mobileTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          className={`flex-1 py-3 text-center border-b-2 transition-colors text-sm font-medium
                            ${activeTab === tab.id 
                              ? 'border-blue-600 text-blue-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          onClick={() => setActiveTab(tab.id as any)}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <Icon className="h-4 w-4" />
                            <span className="hidden xs:inline">{tab.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="space-y-4 mb-4">
                  {/* Details Tab */}
                  {activeTab === 'details' && (
                    <>
                      {/* File Preview Card */}
                      {selectedFile && (
                        <Card>
                          <CardHeader className="p-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Eye className="h-5 w-5" />
                              File Preview
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="border rounded-lg p-3 bg-gray-50">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white rounded-lg border">
                                  <FileText className="h-8 w-8 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">{selectedFile.name}</h4>
                                  <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1]?.toUpperCase()}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={handleBackToFileUpload}
                                  className="text-sm"
                                >
                                  Change File
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="text-sm"
                                >
                                  Replace
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* AI Extracted Info */}
                      {showExtractedInfo && extractedInfo && (
                        <Alert className="bg-green-50 border-green-200">
                          <div className="flex items-start gap-3">
                            <Sparkles className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <div className="flex-1">
                              <AlertTitle className="text-green-800 text-sm">
                                AI Suggestions
                                <Badge variant="outline" className="ml-2 text-xs bg-green-100 text-green-800 border-green-300">
                                  {Math.round(extractedInfo.confidence * 100)}%
                                </Badge>
                              </AlertTitle>
                              <AlertDescription className="text-green-700 text-xs">
                                <div className="mt-2 space-y-2">
                                  {extractedInfo.documentName && (
                                    <div className="flex justify-between">
                                      <span>Name:</span>
                                      <span className="font-medium">{extractedInfo.documentName}</span>
                                    </div>
                                  )}
                                  {(extractedInfo.issueDate || extractedInfo.expiryDate) && (
                                    <div className="flex justify-between">
                                      <span>Dates:</span>
                                      <span className="font-medium">
                                        {extractedInfo.issueDate} {extractedInfo.expiryDate && `- ${extractedInfo.expiryDate}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="text-xs flex-1 border-green-300 text-green-700"
                                    onClick={() => setShowExtractedInfo(false)}
                                  >
                                    Ignore
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="default"
                                    className="text-xs flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={handleApplyExtractedInfo}
                                  >
                                    Apply All
                                  </Button>
                                </div>
                              </AlertDescription>
                            </div>
                          </div>
                        </Alert>
                      )}

                      {/* Document Details Form */}
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">Document Details</CardTitle>
                          <CardDescription className="text-sm">
                            Fill in the details below
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div className="space-y-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="name" className="text-sm">Document Name *</Label>
                              <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., Birth Certificate"
                                required
                                disabled={processing}
                                className="text-sm"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <Label htmlFor="description" className="text-sm">Description</Label>
                              <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Brief description..."
                                rows={2}
                                disabled={processing}
                                className="text-sm"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="issue_date" className="text-sm">Issue Date</Label>
                              <Input
                                id="issue_date"
                                type="date"
                                value={data.issue_date}
                                onChange={(e) => setData('issue_date', e.target.value)}
                                disabled={processing}
                                className="text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="expiry_date" className="text-sm">Expiry Date</Label>
                              <Input
                                id="expiry_date"
                                type="date"
                                value={data.expiry_date}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                disabled={processing}
                                className="text-sm"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label htmlFor="reference_number" className="text-sm">Reference Number</Label>
                            <Input
                              id="reference_number"
                              value={data.reference_number}
                              onChange={(e) => setData('reference_number', e.target.value)}
                              placeholder="Auto-generate if empty"
                              disabled={processing}
                              className="text-sm"
                            />
                          </div>

                          {/* Tags */}
                          <div className="space-y-1.5">
                            <Label className="text-sm">Tags</Label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {selectedTags.map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant="secondary"
                                  className="text-xs cursor-pointer gap-1 px-2 py-0.5"
                                  onClick={() => handleTagSelect(tag)}
                                >
                                  {tag}
                                  <X className="h-2.5 w-2.5" />
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                value={customTags}
                                onChange={(e) => setCustomTags(e.target.value)}
                                placeholder="Add tags (comma separated)"
                                disabled={processing}
                                className="text-sm flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddCustomTag}
                                disabled={processing}
                                className="text-sm"
                              >
                                Add
                              </Button>
                            </div>
                          </div>

                          {/* Advanced Options - Mobile Collapsed */}
                          <div className="space-y-3">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between text-sm"
                              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                            >
                              <span>Advanced Options</span>
                              {showAdvancedOptions ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                            
                            {showAdvancedOptions && (
                              <div className="space-y-4 p-3 border rounded-lg bg-gray-50">
                                {/* Simplified AI Features for Mobile */}
                                <div className="space-y-3">
                                  <Label className="text-sm">AI Features</Label>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label className="text-xs flex items-center gap-1">
                                          <Scan className="h-3 w-3" />
                                          Enable OCR
                                        </Label>
                                        <p className="text-xs text-gray-500">Extract text from images</p>
                                      </div>
                                      <Switch
                                        id="enable-ocr-mobile"
                                        checked={ocrEnabled}
                                        onCheckedChange={setOcrEnabled}
                                        disabled={processing}
                                        className="scale-90"
                                      />
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="space-y-0.5">
                                        <Label className="text-xs flex items-center gap-1">
                                          <Database className="h-3 w-3" />
                                          Duplicate Check
                                        </Label>
                                        <p className="text-xs text-gray-500">Find similar documents</p>
                                      </div>
                                      <Switch
                                        id="enable-duplicate-mobile"
                                        checked={enableDuplicateCheck}
                                        onCheckedChange={setEnableDuplicateCheck}
                                        disabled={processing}
                                        className="scale-90"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Resident Information */}
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5" />
                            Resident
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                          <div className="space-y-1.5">
                            <Label htmlFor="resident_id_mobile" className="text-sm">Select Resident *</Label>
                            <select
                              id="resident_id_mobile"
                              value={data.resident_id}
                              onChange={(e) => setData('resident_id', e.target.value)}
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              required
                              disabled={processing}
                            >
                              <option value="">Choose a resident...</option>
                              {residents.map((resident) => (
                                <option key={resident.id} value={resident.id}>
                                  {resident.first_name} {resident.last_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Preview Tab */}
                  {activeTab === 'preview' && selectedFile && (
                    <div className="space-y-4">
                      {/* PDF Preview */}
                      {isPdf && selectedFile && (
                        <PDFPreview file={selectedFile} zoomLevel={zoomLevel} />
                      )}

                      {/* Image Preview */}
                      {isImage && selectedFile && (
                        <ImagePreview file={selectedFile} zoomLevel={zoomLevel} />
                      )}

                      {/* Other File Preview */}
                      {!isPdf && !isImage && selectedFile && (
                        <FilePreviewComponent file={selectedFile} />
                      )}
                    </div>
                  )}

                  {/* Security Tab - WITH FIXED PASSWORD TOGGLE */}
                  {activeTab === 'security' && (
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        {/* Security & Privacy */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="block text-sm">Make Public</Label>
                              <p className="text-xs text-gray-500">Anyone can view</p>
                            </div>
                            <Switch
                              checked={data.is_public}
                              onCheckedChange={(checked) => setData('is_public', checked)}
                              disabled={processing}
                            />
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="block text-sm">Password Protect</Label>
                                <p className="text-xs text-gray-500">Require password</p>
                              </div>
                              <Switch
                                checked={data.requires_password}
                                onCheckedChange={(checked) => {
                                  setData('requires_password', checked);
                                  // Clear password fields when turning OFF
                                  if (!checked) {
                                    setData('password', '');
                                    setData('confirm_password', '');
                                  }
                                }}
                                disabled={processing}
                              />
                            </div>

                            {data.requires_password && (
                              <div className="space-y-2 pl-2 border-l-2 border-gray-200">
                                <div className="space-y-1.5">
                                  <Label className="text-sm">Password *</Label>
                                  <div className="relative">
                                    <Input
                                      type="password"
                                      value={data.password}
                                      onChange={(e) => setData('password', e.target.value)}
                                      placeholder="Enter password"
                                      disabled={processing}
                                      className="pr-10 text-sm"
                                    />
                                    {data.password && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setData('password', '')}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  {errors.password && (
                                    <p className="text-xs text-red-600">{errors.password}</p>
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  <Label className="text-sm">Confirm Password *</Label>
                                  <div className="relative">
                                    <Input
                                      type="password"
                                      value={data.confirm_password}
                                      onChange={(e) => setData('confirm_password', e.target.value)}
                                      placeholder="Confirm password"
                                      disabled={processing}
                                      className="text-sm"
                                    />
                                    {data.confirm_password && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3"
                                        onClick={() => setData('confirm_password', '')}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                  {errors.confirm_password && (
                                    <p className="text-xs text-red-600">{errors.confirm_password}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Upload Summary for Mobile */}
                        <div className="pt-4 border-t">
                          <h3 className="font-medium text-lg mb-3">Upload Summary</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">File:</span>
                              <span className="font-medium truncate max-w-[150px]">
                                {selectedFile ? selectedFile.name : 'No file'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Size:</span>
                              <span className="font-medium">
                                {selectedFile ? formatFileSize(selectedFile.size) : 'N/A'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Type:</span>
                              <span className="font-medium">
                                {selectedDocumentType?.name || 'Not selected'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Tags:</span>
                              <span className="font-medium">
                                {selectedTags.length > 0 ? `${selectedTags.length} tags` : 'None'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Status:</span>
                              <Badge variant={data.is_public ? "outline" : "secondary"}>
                                {data.is_public ? 'Public' : 'Private'}
                              </Badge>
                            </div>
                          </div>
                          
                          {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="space-y-1 pt-2">
                              <Progress value={uploadProgress} className="h-2" />
                              <p className="text-xs text-gray-500 text-center">
                                Uploading... {uploadProgress}%
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Desktop Layout: Two Column Grid */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Document Type Selection */}
              {uploadStep === 'type-selection' && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Select Document Type
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        >
                          {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                          {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Choose the type of document you want to upload
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search document types..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Categories</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="name">Sort by Name</option>
                          <option value="size">Sort by Size</option>
                          <option value="date">Sort by Date</option>
                        </select>
                      </div>
                    </div>

                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                      {filteredDocumentTypes.map((type) => {
                        const CategoryIcon = getCategoryIcon(type.category_icon);
                        const isSelected = data.document_type_id === type.id.toString();
                        
                        return (
                          <div
                            key={type.id}
                            className={`
                              border rounded-lg p-4 cursor-pointer transition-all
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' 
                                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }
                              ${viewMode === 'list' ? 'flex items-center gap-4' : ''}
                            `}
                            onClick={() => {
                              setData('document_type_id', type.id.toString());
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: `${type.category_color}20` }}>
                                <CategoryIcon className="h-6 w-6" style={{ color: type.category_color }} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{type.name}</h4>
                                    {type.requires_expiry_date && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <CalendarDays className="h-4 w-4 text-yellow-600" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Requires expiry date</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                    {type.requires_reference_number && (
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Tag className="h-4 w-4 text-purple-600" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Requires reference number</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <Check className="h-5 w-5 text-blue-600" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    <Database className="h-3 w-3 mr-1" />
                                    {type.code}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    Max: {formatKBtoMB(type.max_file_size || maxFileSize * 1024)}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Check className="h-3 w-3 mr-1" />
                                    {type.accepted_formats?.length > 0 
                                      ? type.accepted_formats.map(f => f.split('/').pop()?.toUpperCase() || f.toUpperCase()).join(', ')
                                      : allowedTypes.map(t => t.toUpperCase()).join(', ')
                                    }
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredDocumentTypes.length === 0 && (
                      <div className="text-center py-8">
                        <FileWarning className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-lg mb-2">No document types found</h3>
                        <p className="text-gray-500">Try adjusting your search</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 2: File Upload (Desktop) */}
              {uploadStep === 'file-upload' && selectedDocumentType && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Upload className="h-5 w-5" />
                          Upload File for {selectedDocumentType.name}
                        </CardTitle>
                        <CardDescription>
                          Select a file to upload
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleBackToTypeSelection}
                        className="gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Change Type
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">
                        Document Requirements
                        {aiFeatures.ocr_enabled && (
                          <Badge variant="outline" className="ml-2">
                            <Scan className="h-3 w-3 mr-1" />
                            AI Scanning Available
                          </Badge>
                        )}
                      </AlertTitle>
                      <AlertDescription className="text-blue-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Max File Size:</span>
                            <span>{formatKBtoMB(selectedDocumentType.max_file_size || maxFileSize * 1024)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Accepted Formats:</span>
                            <span>
                              {selectedDocumentType.accepted_formats?.length > 0 
                                ? selectedDocumentType.accepted_formats.map(f => f.toUpperCase()).join(', ')
                                : allowedTypes.map(t => t.toUpperCase()).join(', ')
                              }
                            </span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {/* File Drop Area */}
                    <div
                      className={`
                        border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                        ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                      `}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-medium text-lg mb-2">Drag & drop a file here</h3>
                      <p className="text-gray-500 mb-4">or click to browse</p>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Browse Files
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept={allowedTypes.map(type => `.${type}`).join(',')}
                      />
                    </div>

                    {fileError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{fileError}</AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Details (Desktop) */}
              {uploadStep === 'details' && (
                <>
                  {/* File Preview */}
                  {selectedFile && (
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            File Preview
                            {isScanning && (
                              <span className="ml-2 flex items-center text-sm text-blue-600">
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                Scanning...
                              </span>
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            {(isPdf || isImage) && (
                              <div className="flex items-center gap-1 border-r pr-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleZoomOut}
                                  disabled={zoomLevel <= 50}
                                  className="h-8 w-8 p-0"
                                  title="Zoom Out"
                                >
                                  <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium w-12 text-center">{zoomLevel}%</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleZoomIn}
                                  disabled={zoomLevel >= 200}
                                  className="h-8 w-8 p-0"
                                  title="Zoom In"
                                >
                                  <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleZoomReset}
                                  className="h-8 w-8 p-0"
                                  title="Reset Zoom"
                                >
                                  <RotateCw className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleBackToFileUpload}
                              className="gap-2"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              Change File
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          Preview of the selected file
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* PDF Preview */}
                        {isPdf && selectedFile && (
                          <PDFPreview file={selectedFile} zoomLevel={zoomLevel} />
                        )}

                        {/* Image Preview */}
                        {isImage && selectedFile && (
                          <ImagePreview file={selectedFile} zoomLevel={zoomLevel} />
                        )}

                        {/* Other File Preview */}
                        {!isPdf && !isImage && selectedFile && (
                          <FilePreviewComponent file={selectedFile} />
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Extracted Info */}
                  {showExtractedInfo && extractedInfo && (
                    <Alert className="bg-green-50 border-green-200">
                      <div className="flex items-start gap-3">
                        <Sparkles className="h-6 w-6 text-green-600" />
                        <div className="flex-1">
                          <AlertTitle className="text-green-800">
                            AI Analysis Complete!
                            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">
                              <Brain className="h-3 w-3 mr-1" />
                              {Math.round(extractedInfo.confidence * 100)}% Confidence
                            </Badge>
                          </AlertTitle>
                          <AlertDescription className="text-green-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              {extractedInfo.documentName && (
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">Document Name</div>
                                  <div className="text-sm">{extractedInfo.documentName}</div>
                                </div>
                              )}
                              {extractedInfo.issueDate && (
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">Issue Date</div>
                                  <div className="text-sm">{extractedInfo.issueDate}</div>
                                </div>
                              )}
                              {extractedInfo.expiryDate && (
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">Expiry Date</div>
                                  <div className="text-sm">{extractedInfo.expiryDate}</div>
                                </div>
                              )}
                              {extractedInfo.referenceNumber && (
                                <div className="space-y-1">
                                  <div className="font-medium text-sm">Reference Number</div>
                                  <div className="text-sm">{extractedInfo.referenceNumber}</div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-green-300 text-green-700"
                                onClick={() => setShowExtractedInfo(false)}
                              >
                                Ignore
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="default"
                                className="bg-green-600 hover:bg-green-700 gap-2"
                                onClick={handleApplyExtractedInfo}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Apply All Suggestions
                              </Button>
                            </div>
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* Document Details Form (Desktop) */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Details</CardTitle>
                      <CardDescription>
                        Provide information about the document
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Document Name *</Label>
                          <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g., Birth Certificate, Passport"
                            required
                            disabled={processing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Brief description of the document..."
                            rows={3}
                            disabled={processing}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="issue_date">Issue Date</Label>
                            <Input
                              id="issue_date"
                              type="date"
                              value={data.issue_date}
                              onChange={(e) => setData('issue_date', e.target.value)}
                              disabled={processing}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expiry_date">Expiry Date</Label>
                            <Input
                              id="expiry_date"
                              type="date"
                              value={data.expiry_date}
                              onChange={(e) => setData('expiry_date', e.target.value)}
                              disabled={processing}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reference_number">Reference Number</Label>
                          <Input
                            id="reference_number"
                            value={data.reference_number}
                            onChange={(e) => setData('reference_number', e.target.value)}
                            placeholder="Auto-generated if empty"
                            disabled={processing}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Right Column (1/3 width) - Desktop */}
            <div className="space-y-6">
              {/* Resident Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Resident Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resident_id">Select Resident *</Label>
                    <select
                      id="resident_id"
                      value={data.resident_id}
                      onChange={(e) => setData('resident_id', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={processing}
                    >
                      <option value="">Choose a resident...</option>
                      {residents.map((resident) => (
                        <option key={resident.id} value={resident.id}>
                          {resident.first_name} {resident.last_name}
                        </option>
                      ))}
                    </select>
                    {errors.resident_id && (
                      <p className="text-sm text-red-600">{errors.resident_id}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Document Type */}
              {selectedDocumentType && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Document Type</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${selectedDocumentType.category_color}20` }}>
                          {(() => {
                            const IconComponent = getCategoryIcon(selectedDocumentType.category_icon);
                            return <IconComponent className="h-6 w-6" style={{ color: selectedDocumentType.category_color }} />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{selectedDocumentType.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              {selectedDocumentType.code}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{selectedDocumentType.description}</p>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={handleBackToTypeSelection}
                        disabled={processing}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Change Type
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security & Privacy (Desktop) - WITH FIXED PASSWORD TOGGLE */}
              {uploadStep === 'details' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security & Privacy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="block font-medium">Make Document Public</Label>
                          <p className="text-sm text-gray-600">Anyone can view this document</p>
                        </div>
                        <Switch
                          checked={data.is_public}
                          onCheckedChange={(checked) => setData('is_public', checked)}
                          disabled={processing}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="block font-medium">Password Protect</Label>
                            <p className="text-sm text-gray-600">Require password to view</p>
                          </div>
                          <Switch
                            checked={data.requires_password}
                            onCheckedChange={(checked) => {
                              setData('requires_password', checked);
                              // Clear password fields when turning OFF
                              if (!checked) {
                                setData('password', '');
                                setData('confirm_password', '');
                              }
                            }}
                            disabled={processing}
                          />
                        </div>
                        
                        {data.requires_password && (
                          <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                            <div className="space-y-2">
                              <Label htmlFor="password">Password *</Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type="password"
                                  value={data.password}
                                  onChange={(e) => setData('password', e.target.value)}
                                  placeholder="Enter password"
                                  disabled={processing}
                                />
                                {data.password && (
                                  <button
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setData('password', '')}
                                    tabIndex={-1}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              {errors.password && (
                                <p className="text-sm text-red-600">{errors.password}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm_password">Confirm Password *</Label>
                              <div className="relative">
                                <Input
                                  id="confirm_password"
                                  type="password"
                                  value={data.confirm_password}
                                  onChange={(e) => setData('confirm_password', e.target.value)}
                                  placeholder="Confirm password"
                                  disabled={processing}
                                />
                                {data.confirm_password && (
                                  <button
                                    type="button"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setData('confirm_password', '')}
                                    tabIndex={-1}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                              {errors.confirm_password && (
                                <p className="text-sm text-red-600">{errors.confirm_password}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Upload Summary (Desktop) */}
              {uploadStep === 'details' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UploadCloud className="h-5 w-5" />
                      Upload Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">File:</span>
                        <span className="font-medium truncate max-w-[150px]" title={selectedFile?.name}>
                          {selectedFile ? selectedFile.name : 'No file selected'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">
                          {selectedFile ? formatFileSize(selectedFile.size) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">
                          {selectedDocumentType?.name || 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tags:</span>
                        <span className="font-medium">
                          {selectedTags.length > 0 ? `${selectedTags.length} tags` : 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Visibility:</span>
                        <Badge variant={data.is_public ? "outline" : "secondary"}>
                          {data.is_public ? 'Public' : 'Private'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Password:</span>
                        <Badge variant={data.requires_password ? "destructive" : "outline"}>
                          {data.requires_password ? 'Protected' : 'None'}
                        </Badge>
                      </div>
                    </div>
                    
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="space-y-2 pt-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-sm text-gray-600 text-center">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}
                    
                    <Button
                      type="button"
                      className="w-full mt-4"
                      onClick={() => handleSubmit()}
                      disabled={processing || !selectedFile || !data.document_type_id || !data.resident_id}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Document
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Submit Section - Desktop */}
        {!isMobile && uploadStep === 'details' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">
                    Ready to upload your document?
                  </p>
                  {uploadError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link href="/my-records">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    disabled={processing || !selectedFile || !data.document_type_id || !data.resident_id}
                    onClick={() => handleSubmit()}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ResidentLayout>
  );
}

// Type declarations for missing interfaces
interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

interface PDFPreviewProps {
  file: File;
  zoomLevel: number;
}

interface ImagePreviewProps {
  file: File;
  zoomLevel: number;
}

interface FilePreviewProps {
  file: File;
}
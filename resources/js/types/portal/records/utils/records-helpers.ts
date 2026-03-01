// utils/records-helpers.ts

import {
  User,
  Shield,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Award,
  DollarSign,
  FileText,
  FolderOpen,
  Database,
  ShieldCheck,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';

// Get category icon component
export const getCategoryIcon = (iconName: string) => {
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

// Format file size
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format KB to MB
export const formatKBtoMB = (kb: number) => {
  return (kb / 1024).toFixed(2) + ' MB';
};

// Check if file is PDF
export const isPdf = (file: File | null): boolean => {
  return file?.type === 'application/pdf' || file?.name.toLowerCase().endsWith('.pdf') || false;
};

// Check if file is image
export const isImage = (file: File | null): boolean => {
  return file?.type?.startsWith('image/') || 
         ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].some(ext => 
           file?.name.toLowerCase().endsWith(ext)
         ) || false;
};

// Get file icon based on type
export const getFileIcon = (fileName: string) => {
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
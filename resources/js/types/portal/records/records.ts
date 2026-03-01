// types/records.ts

import { ReactNode } from 'react';

export interface DocumentCategory {
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

export interface DocumentType {
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

export interface DocumentTemplate {
  id: number;
  name: string;
  description?: string;
  fields: TemplateField[];
  preview_image?: string;
  is_active: boolean;
}

export interface TemplateField {
  name: string;
  type: 'text' | 'date' | 'number' | 'select' | 'textarea';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: string;
  help_text?: string;
}

export interface Resident {
  id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface PageProps {
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

export interface FormData {
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

export interface ExtractedInfo {
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

export interface MetadataItem {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'date';
}

export interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export interface PDFPreviewProps {
  file: File;
  zoomLevel: number;
}

export interface ImagePreviewProps {
  file: File;
  zoomLevel: number;
}

export interface FilePreviewProps {
  file: File;
}

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    description: string; title: string; icon: React.ReactNode 
}>;
}

export interface MobileBottomActionBarProps {
  processing: boolean;
  selectedFile: File | null;
  documentTypeId: string;
  residentId: string;
  onUpload: () => void;
  onCancel: () => void;
}
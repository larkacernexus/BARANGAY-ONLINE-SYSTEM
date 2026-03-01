// hooks/useRecordsFileHandling.ts

import { useState, useRef, useCallback, ChangeEvent, DragEvent } from 'react';
import { ExtractedInfo, DocumentType } from '@/types/portal/records/records';
import { AdvancedDocumentAIService } from '@/types/portal/records/services/AdvancedDocumentAIService';

interface UseRecordsFileHandlingProps {
  maxFileSize: number;
  allowedTypes: string[];
  selectedDocumentType: DocumentType | null;
  setData: (key: string, value: any) => void;
  data: any;
  setUploadStep: (step: 'type-selection' | 'file-upload' | 'details') => void;
  setFileError: (error: string | null) => void;
}

export const useRecordsFileHandling = ({
  maxFileSize,
  allowedTypes,
  selectedDocumentType,
  setData,
  data,
  setUploadStep,
  setFileError,
}: UseRecordsFileHandlingProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null);
  const [showExtractedInfo, setShowExtractedInfo] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiService = new AdvancedDocumentAIService();

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
      handleFileSelectInternal(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelectInternal(file);
    }
  };

  const handleFileSelectInternal = async (file: File) => {
    setFileError(null);
    setExtractedInfo(null);
    setShowExtractedInfo(false);
    setZoomLevel(100);

    // Basic validation
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
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
      } catch (error) {
        console.error('AI extraction error:', error);
      } finally {
        setIsScanning(false);
      }
    }
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

    setShowExtractedInfo(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  return {
    selectedFile,
    setSelectedFile,
    isScanning,
    extractedInfo,
    showExtractedInfo,
    setShowExtractedInfo,
    dragActive,
    isDragging,
    zoomLevel,
    fileInputRef,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleRemoveFile,
    handleApplyExtractedInfo,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  };
};
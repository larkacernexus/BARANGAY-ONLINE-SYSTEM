// components/portal/records/FileUploadArea.tsx

import React, { RefObject } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, Info, AlertCircle, Scan, ArrowLeft } from 'lucide-react';
import { DocumentType } from '@/types/portal/records/records';
import { formatKBtoMB } from '@/types/portal/records/utils/records-helpers';

interface FileUploadAreaProps {
  selectedDocumentType: DocumentType;
  maxFileSize: number;
  allowedTypes: string[];
  dragActive: boolean;
  fileInputRef: RefObject<HTMLInputElement>;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBrowseClick: (e: React.MouseEvent) => void;
  fileError: string | null;
  aiFeatures?: {
    ocr_enabled: boolean;
  };
  onBackToTypeSelection: () => void;
}

export function FileUploadArea({
  selectedDocumentType,
  maxFileSize,
  allowedTypes,
  dragActive,
  fileInputRef,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  onBrowseClick,
  fileError,
  aiFeatures,
  onBackToTypeSelection,
}: FileUploadAreaProps) {
  // Helper function to safely get accepted formats as a string
  const getAcceptedFormatsString = () => {
    // Check if accepted_formats exists and is an array
    if (selectedDocumentType.accepted_formats && Array.isArray(selectedDocumentType.accepted_formats)) {
      return selectedDocumentType.accepted_formats.map(f => f.toUpperCase()).join(', ');
    }
    // Fallback to allowedTypes if accepted_formats is not available or not an array
    return allowedTypes.map(t => t.toUpperCase()).join(', ');
  };

  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Upload className="h-5 w-5" />
              Upload File for {selectedDocumentType.name}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Select a file to upload
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToTypeSelection}
            className="gap-2 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Change Type
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">
            Document Requirements
            {aiFeatures?.ocr_enabled && (
              <Badge variant="outline" className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                <Scan className="h-3 w-3 mr-1" />
                AI Scanning Available
              </Badge>
            )}
          </AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">Max File Size:</span>
                <span>{formatKBtoMB(selectedDocumentType.max_file_size || maxFileSize * 1024)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Accepted Formats:</span>
                <span>{getAcceptedFormatsString()}</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* File Drop Area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
            ${dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
            }
          `}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-medium text-lg mb-2 dark:text-white">Drag & drop a file here</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">or click to browse</p>
          <Button 
            type="button"
            variant="outline"
            onClick={onBrowseClick}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onFileSelect}
            accept={allowedTypes.map(type => `.${type}`).join(',')}
          />
        </div>

        {fileError && (
          <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4 dark:text-red-400" />
            <AlertDescription className="dark:text-red-300">{fileError}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
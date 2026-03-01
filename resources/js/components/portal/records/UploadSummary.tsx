// components/portal/records/UploadSummary.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { UploadCloud, Loader2 } from 'lucide-react';
import { FormData, DocumentType } from '@/types/portal/records/records';
import { formatFileSize } from '@/types/portal/records/utils/records-helpers';

interface UploadSummaryProps {
  selectedFile: File | null;
  selectedDocumentType: DocumentType | null;
  data: FormData;
  selectedTags: string[];
  uploadProgress: number;
  processing: boolean;
  onUpload: () => void;
}

export function UploadSummary({
  selectedFile,
  selectedDocumentType,
  data,
  selectedTags,
  uploadProgress,
  processing,
  onUpload,
}: UploadSummaryProps) {
  return (
    <Card className="dark:bg-gray-900 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-white">
          <UploadCloud className="h-5 w-5" />
          Upload Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">File:</span>
            <span className="font-medium truncate max-w-[150px] dark:text-white" title={selectedFile?.name}>
              {selectedFile ? selectedFile.name : 'No file selected'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Size:</span>
            <span className="font-medium dark:text-white">
              {selectedFile ? formatFileSize(selectedFile.size) : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Type:</span>
            <span className="font-medium dark:text-white">
              {selectedDocumentType?.name || 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Tags:</span>
            <span className="font-medium dark:text-white">
              {selectedTags.length > 0 ? `${selectedTags.length} tags` : 'None'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Visibility:</span>
            <Badge variant={data.is_public ? "outline" : "secondary"} className="dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
              {data.is_public ? 'Public' : 'Private'}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Password:</span>
            <Badge variant={data.requires_password ? "destructive" : "outline"} className={data.requires_password ? '' : 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}>
              {data.requires_password ? 'Protected' : 'None'}
            </Badge>
          </div>
        </div>
        
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2 pt-2">
            <Progress value={uploadProgress} className="h-2 dark:bg-gray-700" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
        
        <Button
          type="button"
          className="w-full mt-4"
          onClick={onUpload}
          disabled={processing || !selectedFile || !selectedDocumentType || !data.resident_id}
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <UploadCloud className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
// components/records/PDFPreview.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, ExternalLink, Download, Maximize2 } from 'lucide-react';
import { PDFPreviewProps } from '@/types/portal/records/records';
import { FullScreenModal } from './FullScreenModal';

export function PDFPreview({ file, zoomLevel }: PDFPreviewProps) {
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
          <div className="border border-gray-700 rounded-lg overflow-hidden h-full bg-gray-900">
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
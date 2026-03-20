// components/records/FilePreviewComponent.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Download, Maximize2 } from 'lucide-react';
import { FilePreviewProps } from '@/types/portal/records/records';
import { formatFileSize, getFileIcon } from '@/types/portal/records/utils/records-helpers';
import { FullScreenModal } from './FullScreenModal';

export function FilePreviewComponent({ file }: FilePreviewProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

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
            <div className="inline-block p-6 sm:p-8 rounded-full bg-gray-900 border-4 border-gray-700 shadow-2xl mb-6 sm:mb-8">
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
                <Badge variant="secondary" className="px-3 py-1 text-xs bg-gray-900 text-gray-300">
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
                className="w-full py-2 text-sm border-gray-700 text-white hover:bg-gray-900"
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
                className="w-full py-2 text-sm border-gray-700 text-white hover:bg-gray-900"
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
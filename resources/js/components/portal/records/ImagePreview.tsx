// components/records/ImagePreview.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, ZoomIn, ZoomOut, RotateCw, Maximize2 } from 'lucide-react';
import { ImagePreviewProps } from '@/types/portal/records/records';
import { FullScreenModal } from './FullScreenModal';

export function ImagePreview({ file, zoomLevel }: ImagePreviewProps) {
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
            onClick={() => setIsFullScreen(true)}
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
        
        <div className="absolute inset-0 flex items-center justify-center p-2">
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
              onClick={() => setIsFullScreen(true)}
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
        onClose={() => setIsFullScreen(false)}
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
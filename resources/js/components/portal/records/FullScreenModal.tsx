// components/records/FullScreenModal.tsx

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Minimize2 } from 'lucide-react';
import { FullScreenModalProps } from '@/types/portal/records/records';
export function FullScreenModal({ isOpen, onClose, children, title }: FullScreenModalProps) {
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
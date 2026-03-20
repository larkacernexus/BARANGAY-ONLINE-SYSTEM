// components/portal/records/MobileBottomActionBar.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Loader2 } from 'lucide-react';
import { MobileBottomActionBarProps } from '@/types/portal/records/records';

export function MobileBottomActionBar({
  processing,
  selectedFile,
  documentTypeId,
  residentId,
  onUpload,
  onCancel,
}: MobileBottomActionBarProps) {
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
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="flex-1 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
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
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            {isReady ? 'Ready to upload!' : 'Fill all required fields'}
          </p>
        </div>
      </div>
    </div>
  );
}
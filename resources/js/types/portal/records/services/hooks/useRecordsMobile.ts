// hooks/useRecordsMobile.ts

import { useState, useEffect } from 'react';

export const useRecordsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'preview' | 'security'>('details');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    isMobile,
    mobileNavOpen,
    setMobileNavOpen,
    activeTab,
    setActiveTab,
  };
};
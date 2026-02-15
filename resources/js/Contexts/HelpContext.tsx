// resources/js/Contexts/HelpContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface HelpContextType {
  isHelpOpen: boolean;
  currentModule: string;
  customContent: React.ReactNode | null;
  openHelp: (module?: string, customContent?: React.ReactNode) => void;
  closeHelp: () => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

export const HelpProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState('general');
  const [customContent, setCustomContent] = useState<React.ReactNode | null>(null);

  const openHelp = (module = 'general', content: React.ReactNode | null = null) => {
    setCurrentModule(module);
    setCustomContent(content);
    setIsHelpOpen(true);
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
    setTimeout(() => {
      setCustomContent(null);
    }, 300);
  };

  // Listen for custom events
  useEffect(() => {
    const handleOpenHelp = (event: CustomEvent) => {
      openHelp(event.detail.module, event.detail.customContent);
    };

    window.addEventListener('open-help', handleOpenHelp as EventListener);
    return () => window.removeEventListener('open-help', handleOpenHelp as EventListener);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        openHelp();
      }
      if (e.key === 'Escape' && isHelpOpen) {
        closeHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpOpen]);

  return (
    <HelpContext.Provider value={{
      isHelpOpen,
      currentModule,
      customContent,
      openHelp,
      closeHelp
    }}>
      {children}
    </HelpContext.Provider>
  );
};
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsScrollContainer } from '@/components/ui/tabs';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isMobile: boolean;
}

export const TABS_CONFIG = [
  { id: 'personal', label: 'Personal' },
  { id: 'additional', label: 'Additional' },
  { id: 'household', label: 'Household' },
  { id: 'members', label: 'Members' },
  { id: 'qr', label: 'QR Login' },
];

export const TabNavigation = ({ activeTab, onTabChange, isMobile }: TabNavigationProps) => {
  if (isMobile) {
    return (
      <TabsScrollContainer className="mb-4" variant="underlined">
        {TABS_CONFIG.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            variant="underlined"
            textSize="sm"
            touchPadding={true}
            className="min-w-[100px]"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsScrollContainer>
    );
  }

  return (
    <TabsList className="w-full grid grid-cols-5" variant="underlined">
      {TABS_CONFIG.map((tab) => (
        <TabsTrigger 
          key={tab.id} 
          value={tab.id}
          variant="underlined"
          textSize="base"
          touchPadding={true}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

// Content version with Tabs wrapper
export const TabNavigationWithContent = ({ 
  children, 
  activeTab, 
  onTabChange, 
  isMobile 
}: TabNavigationProps & { children: React.ReactNode }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      {isMobile ? (
        <TabsScrollContainer className="mb-4" variant="underlined">
          {TABS_CONFIG.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              variant="underlined"
              textSize="sm"
              touchPadding={true}
              className="min-w-[100px]"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsScrollContainer>
      ) : (
        <TabsList className="w-full grid grid-cols-5" variant="underlined">
          {TABS_CONFIG.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              variant="underlined"
              textSize="base"
              touchPadding={true}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
      
      <div className="mt-6">
        {children}
      </div>
    </Tabs>
  );
};

// Export TabPanel for convenience
export const TabPanel = TabsContent;
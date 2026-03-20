import React from 'react';
import { User, Info, Home, Users, QrCode } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsScrollContainer } from '@/components/ui/tabs';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isMobile: boolean;
}

export const TABS_CONFIG = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'additional', label: 'Additional', icon: Info },
  { id: 'household', label: 'Household', icon: Home },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'qr', label: 'QR Login', icon: QrCode },
];

export const TabNavigation = ({ activeTab, onTabChange, isMobile }: TabNavigationProps) => {
  if (isMobile) {
    return (
      <TabsScrollContainer className="mb-4">
        {TABS_CONFIG.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="min-w-[100px]">
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsScrollContainer>
    );
  }

  return (
    <TabsList className="w-full grid grid-cols-5">
      {TABS_CONFIG.map((tab) => (
        <TabsTrigger key={tab.id} value={tab.id}>
          <tab.icon className="h-4 w-4 mr-2" />
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};
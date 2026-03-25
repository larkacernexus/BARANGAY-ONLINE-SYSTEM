// /components/residentui/dashboard/ServiceIcon.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ServiceIconProps {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({ icon: Icon, gradient }) => (
    <div className={cn(`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`)}>
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
    </div>
);
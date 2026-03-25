// /components/residentui/dashboard/EmergencyContact.tsx
import React from 'react';
import { GlassCard } from './GlassCard';
import { ServiceIcon } from './ServiceIcon';
import { EmergencyContact as EmergencyContactType } from  '@/types/portal/dashboard/dashboard-types';


interface EmergencyContactProps {
    contact: EmergencyContactType;
}

export const EmergencyContact: React.FC<EmergencyContactProps> = ({ contact }) => (
    <a href={`tel:${contact.number}`} className="group block">
        <GlassCard interactive className="p-3 sm:p-4">
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <ServiceIcon icon={contact.icon} gradient={contact.gradient} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{contact.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{contact.number}</p>
                </div>
            </div>
        </GlassCard>
    </a>
);
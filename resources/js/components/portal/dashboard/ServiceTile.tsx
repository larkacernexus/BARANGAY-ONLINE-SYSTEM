// /components/residentui/dashboard/ServiceTile.tsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { GlassCard } from './GlassCard';
import { ServiceIcon } from './ServiceIcon';
import { Service } from '@/types/portal/dashboard/dashboard-types';


export const ServiceTile: React.FC<Service> = ({ icon, label, href, gradient, count = 0 }) => (
    <Link href={href} className="group block">
        <GlassCard interactive className="p-2 sm:p-4">
            <div className="flex flex-col items-center text-center">
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                    <ServiceIcon icon={icon} gradient={gradient} />
                </div>
                <span className="mt-1 sm:mt-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">{label}</span>
                {count > 0 && (
                    <span className="mt-0.5 sm:mt-1 text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        {count}
                    </span>
                )}
            </div>
        </GlassCard>
    </Link>
);
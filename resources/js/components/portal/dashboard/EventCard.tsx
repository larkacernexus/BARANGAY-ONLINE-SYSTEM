// /components/residentui/dashboard/EventCard.tsx
import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Event } from  '@/types/portal/dashboard/dashboard-types';


interface EventCardProps {
    event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const eventDate = new Date(event.event_date || event.date || '');
    
    return (
        <GlassCard className="p-3 sm:p-4">
            <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-center min-w-[50px] sm:min-w-[60px] flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {eventDate.toLocaleDateString('en-US', { day: 'numeric' })}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                        {eventDate.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">{event.title}</h3>
                    {event.location && (
                        <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">
                            {eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};
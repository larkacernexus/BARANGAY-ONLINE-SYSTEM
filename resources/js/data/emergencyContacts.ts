import { EmergencyContact, BarangayService } from '@/types';
import {
    Shield, Flame, Ambulance, Home, Building,
    Heart, Siren, Zap,
    Building2, Users, FileText, Calendar,
} from 'lucide-react';

export const emergencyContacts: EmergencyContact[] = [
    { 
        name: 'Police', 
        number: '09654965749', 
        description: 'Emergency',
        lightColor: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
        darkColor: 'dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-950',
        icon: Shield,
        bgColor: 'bg-blue-500',
        shortName: 'POL',
        emergencyLevel: 'high',
        callIcon: Siren
    },
    { 
        name: 'Fire', 
        number: '09654848484', 
        description: 'Fire & Rescue',
        lightColor: 'bg-gradient-to-br from-red-500 via-red-600 to-red-700',
        darkColor: 'dark:bg-gradient-to-br dark:from-red-900 dark:to-red-950',
        icon: Flame,
        bgColor: 'bg-red-500',
        shortName: 'FIRE',
        emergencyLevel: 'high',
        callIcon: Zap
    },
    { 
        name: 'Ambulance', 
        number: '09659965749', 
        description: 'Medical',
        lightColor: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700',
        darkColor: 'dark:bg-gradient-to-br dark:from-emerald-900 dark:to-emerald-950',
        icon: Ambulance,
        bgColor: 'bg-emerald-500',
        shortName: 'MED',
        emergencyLevel: 'high',
        callIcon: Heart
    },
    { 
        name: 'Barangay', 
        number: '09874965749', 
        description: 'Local Govt',
        lightColor: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
        darkColor: 'dark:bg-gradient-to-br dark:from-purple-900 dark:to-purple-950',
        icon: Home,
        bgColor: 'bg-purple-500',
        shortName: 'BRGY',
        emergencyLevel: 'medium',
        callIcon: Building
    },
];

export const barangayServices: BarangayService[] = [
    { name: 'Community Center', icon: Building2, color: 'text-blue-500' },
    { name: 'Health Services', icon: Users, color: 'text-emerald-500' },
    { name: 'Document Processing', icon: FileText, color: 'text-amber-500' },
    { name: 'Events & Activities', icon: Calendar, color: 'text-purple-500' },
];

export const additionalHotlines = [
    {
        name: 'Government Hotline',
        number: '8888',
        description: 'Complaints and assistance',
        color: 'blue',
        icon: Heart,
    },
    {
        name: 'Health Hotline',
        number: '136',
        description: 'Health concerns and information',
        color: 'emerald',
        icon: Heart,
    },
];
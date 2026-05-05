export interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    lastLoginInfo?: LastLoginInfo;
    failedLoginCount: number;
    isLocked: boolean;
    unlockTime?: string;
    isRateLimited: boolean;
    rateLimitReset?: number;
}

export interface LastLoginInfo {
    time: string;
    ip: string;
    location?: string;
    device?: string;
}

export interface EmergencyContact {
    name: string;
    number: string;
    description: string;
    lightColor: string;
    darkColor: string;
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    shortName: string;
    emergencyLevel: 'high' | 'medium';
    callIcon: React.ComponentType<{ className?: string }>;
}

export interface BarangayService {
    name: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
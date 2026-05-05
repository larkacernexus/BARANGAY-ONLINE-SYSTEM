import { LastLoginInfo as LastLoginInfoType } from '@/types/login/login';
import { Clock, MapPin, Monitor, Smartphone, ShieldCheck, X } from 'lucide-react';

interface LastLoginInfoProps {
    lastLoginInfo: LastLoginInfoType;
    onDismiss: () => void;
    isMobileView?: boolean;
}

function getDeviceIcon(device?: string) {
    if (!device) return <Monitor className="h-4 w-4" aria-hidden="true" />;
    
    const normalizedDevice = device.toLowerCase();
    
    if (normalizedDevice.includes('mobile') || normalizedDevice.includes('phone')) {
        return <Smartphone className="h-4 w-4" aria-hidden="true" />;
    }
    
    if (normalizedDevice.includes('tablet') || normalizedDevice.includes('ipad')) {
        return <Monitor className="h-4 w-4 rotate-90" aria-hidden="true" />;
    }
    
    return <Monitor className="h-4 w-4" aria-hidden="true" />;
}

function formatTime(timeString: string): string {
    if (!timeString) return 'Unknown';
    
    try {
        const date = new Date(timeString);
        
        // Validate that the date is valid
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        });
    } catch {
        // Return the original string if parsing fails
        return timeString;
    }
}

// Mask IP address for privacy (show only first octets)
function maskIpAddress(ip: string): string {
    if (!ip) return 'Unknown';
    
    // Handle IPv4
    const ipv4Parts = ip.split('.');
    if (ipv4Parts.length === 4) {
        return `${ipv4Parts[0]}.${ipv4Parts[1]}.***.***`;
    }
    
    // Handle IPv6 (show only first 2 groups)
    const ipv6Parts = ip.split(':');
    if (ipv6Parts.length >= 2) {
        return `${ipv6Parts[0]}:${ipv6Parts[1]}:****`;
    }
    
    // Fallback: show partial
    return ip.length > 8 ? `${ip.substring(0, 8)}...` : ip;
}

export function LastLoginInfo({ 
    lastLoginInfo, 
    onDismiss, 
    isMobileView = false 
}: LastLoginInfoProps) {
    // Validate required fields
    if (!lastLoginInfo?.time && !lastLoginInfo?.ip) {
        return null;
    }

    return (
        <div 
            className={`${
                isMobileView ? 'p-3' : 'p-3 sm:p-4'
            } bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-900 border border-blue-200 dark:border-gray-800 rounded-lg sm:rounded-xl backdrop-blur-sm`}
            role="alert"
            aria-label="Last login activity information"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 sm:gap-3">
                    <ShieldCheck 
                        className={`${
                            isMobileView ? 'w-5 h-5' : 'w-4 h-4 sm:w-5 sm:h-5'
                        } text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0`} 
                        aria-hidden="true" 
                    />
                    <div className="flex-1 min-w-0">
                        <h4 className={`${
                            isMobileView ? 'text-sm' : 'text-xs sm:text-sm'
                        } font-medium text-blue-800 dark:text-gray-200 mb-1 truncate`}>
                            Last Login Activity
                        </h4>
                        <div className="space-y-1">
                            {/* Login Time */}
                            {lastLoginInfo.time && (
                                <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-700 dark:text-gray-400">
                                    <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                                    <span className="truncate">{formatTime(lastLoginInfo.time)}</span>
                                </div>
                            )}
                            
                            {/* IP Address (partially masked for privacy) */}
                            {lastLoginInfo.ip && (
                                <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-700 dark:text-gray-400">
                                    <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                                    <span className="truncate">
                                        IP: {maskIpAddress(lastLoginInfo.ip)}
                                    </span>
                                    {lastLoginInfo.location && (
                                        <span className="text-blue-600 dark:text-blue-300 truncate">
                                            ({lastLoginInfo.location})
                                        </span>
                                    )}
                                </div>
                            )}
                            
                            {/* Device Info */}
                            {lastLoginInfo.device && (
                                <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-700 dark:text-gray-400">
                                    {getDeviceIcon(lastLoginInfo.device)}
                                    <span className="truncate">{lastLoginInfo.device}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Dismiss Button */}
                <button
                    onClick={onDismiss}
                    className="text-blue-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 flex-shrink-0 rounded-full hover:bg-blue-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    type="button"
                    aria-label="Dismiss last login information"
                >
                    <X className="w-4 h-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}
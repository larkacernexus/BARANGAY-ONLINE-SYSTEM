import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { 
    Shield, 
    AlertTriangle, 
    LogIn, 
    Eye, 
    EyeOff,
    ShieldCheck,
    Clock,
    MapPin,
    Smartphone,
    Monitor,
    Lock,
    RefreshCw,
    Phone,
    AlertCircle,
    Home,
    ChevronDown,
    ChevronUp,
    User,
    Key,
    Smartphone as MobileIcon,
    HelpCircle,
    ExternalLink,
    AlertOctagon,
    PhoneCall,
    Building2,
    Users,
    FileText,
    Calendar,
    X,
    ChevronRight,
    Zap,
    Building,
    Heart,
    Flame,
    Ambulance,
    Siren,
    Activity
} from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    lastLoginInfo?: {
        time: string;
        ip: string;
        location?: string;
        device?: string;
    };
    failedLoginCount?: number;
    isLocked?: boolean;
    unlockTime?: string;
    rateLimitRemaining?: number;
    rateLimitReset?: number;
}

export default function Login({
    status,
    canResetPassword,
    lastLoginInfo,
    failedLoginCount = 0,
    isLocked = false,
    unlockTime,
    rateLimitRemaining,
    rateLimitReset,
}: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showSecurityAlert, setShowSecurityAlert] = useState(true);
    const [accountLocked, setAccountLocked] = useState(isLocked);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isLandscape, setIsLandscape] = useState(false);
    const [screenSize, setScreenSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
    const [countdown, setCountdown] = useState<number>(0);
    const [rateLimitCountdown, setRateLimitCountdown] = useState<number>(0);
    const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);
    const [emergencyFloating, setEmergencyFloating] = useState(false);

    // Emergency contacts
    const emergencyContacts = [
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

    // Barangay services
    const barangayServices = [
        { name: 'Community Center', icon: Building2, color: 'text-blue-500' },
        { name: 'Health Services', icon: Users, color: 'text-emerald-500' },
        { name: 'Document Processing', icon: FileText, color: 'text-amber-500' },
        { name: 'Events & Activities', icon: Calendar, color: 'text-purple-500' },
    ];

    // Detect screen size and orientation
    useEffect(() => {
        const checkScreen = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Determine screen size category
            if (width < 640) setScreenSize('xs');
            else if (width < 768) setScreenSize('sm');
            else if (width < 1024) setScreenSize('md');
            else if (width < 1280) setScreenSize('lg');
            else setScreenSize('xl');
            
            const mobile = width < 768;
            const tablet = width >= 768 && width < 1024;
            const landscape = width > height && width >= 768;
            
            setIsMobile(mobile);
            setIsTablet(tablet);
            setIsLandscape(landscape);
            
            // Show floating emergency contacts on mobile by default
            if (mobile && !tablet) {
                setEmergencyFloating(true);
            } else {
                setEmergencyFloating(false);
            }
        };

        checkScreen();
        window.addEventListener('resize', checkScreen);
        window.addEventListener('orientationchange', checkScreen);
        return () => {
            window.removeEventListener('resize', checkScreen);
            window.removeEventListener('orientationchange', checkScreen);
        };
    }, []);

    // Countdown timer for account lock
    useEffect(() => {
        if (unlockTime) {
            const unlockDate = new Date(unlockTime).getTime();
            const now = new Date().getTime();
            const remaining = Math.max(0, Math.floor((unlockDate - now) / 1000));
            
            setCountdown(remaining);
            
            const timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setAccountLocked(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [unlockTime]);

    // Rate limiting countdown
    useEffect(() => {
        if (rateLimitReset) {
            const resetTime = new Date(rateLimitReset * 1000).getTime();
            const now = new Date().getTime();
            const remaining = Math.max(0, Math.floor((resetTime - now) / 1000));
            
            setRateLimitCountdown(remaining);
            
            const timer = setInterval(() => {
                setRateLimitCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            return () => clearInterval(timer);
        }
    }, [rateLimitReset]);

    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const getDeviceIcon = (device?: string) => {
        if (!device) return <Monitor className="h-4 w-4" />;
        
        if (device.includes('Mobile')) return <MobileIcon className="h-4 w-4" />;
        if (device.includes('Tablet')) return <Monitor className="h-4 w-4 rotate-90" />;
        if (device.includes('Windows') || device.includes('Mac') || device.includes('Linux')) 
            return <Monitor className="h-4 w-4" />;
        
        return <Monitor className="h-4 w-4" />;
    };

    const formatTime = (timeString: string) => {
        try {
            const date = new Date(timeString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return timeString;
        }
    };

    const refreshPage = () => {
        router.reload({ only: ['failedLoginCount', 'isLocked', 'unlockTime', 'rateLimitRemaining', 'rateLimitReset'] });
    };

    const handleEmergencyCall = (number: string) => {
        window.open(`tel:${number}`, '_blank');
    };

    // Desktop/Landscape Layout - Full Split Screen
    if (!isMobile && (isLandscape || window.innerWidth >= 1024)) {
        return (
            <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-gray-950">
                <Head title="Log in" />
                
                {/* Background Pattern */}
                <div 
                    className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />
                
                {/* Decorative Elements */}
                <div className="fixed top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
                <div className="fixed bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-3xl" />

                {/* Left Side - Hero Section */}
                <div className="relative lg:w-2/5 xl:w-2/5 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-emerald-900/90 text-white p-4 sm:p-6 md:p-8 lg:p-12 backdrop-blur-sm">
                    <div className="absolute inset-0 opacity-20">
                        <img 
                            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=2070&auto=format&fit=crop" 
                            alt="Barangay Community Background"
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-emerald-900/90 mix-blend-multiply" />
                    </div>
                    
                    <div className="relative z-10 h-full flex flex-col">
                        {/* Logo/Header */}
                        <div className="mb-6 sm:mb-8 lg:mb-12">
                            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm border border-white/30">
                                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                                </div>
                                <div>
                                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                                        Barangay Portal
                                    </h1>
                                    <p className="text-white/80 mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base">
                                        Serving Our Community with Excellence
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hero Content */}
                        <div className="flex-1 overflow-y-auto pr-2">
                            <div className="mb-6 sm:mb-8 lg:mb-12">
                                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 sm:mb-4 leading-snug">
                                    Welcome to Your <span className="text-emerald-300">Community Hub</span>
                                </h2>
                                <p className="text-white/80 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 leading-relaxed">
                                    Access government services, emergency contacts, and community resources in one secure platform.
                                </p>

                                {/* Barangay Services */}
                                <div className="mb-6 sm:mb-8 md:mb-10">
                                    <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                                        <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                        Available Services
                                    </h3>
                                    <div className={`grid ${screenSize === 'xs' ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-3`}>
                                        {barangayServices.map((service) => {
                                            const ServiceIcon = service.icon;
                                            return (
                                                <div key={service.name} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                                                    <ServiceIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${service.color}`} />
                                                    <span className="text-xs sm:text-sm font-medium truncate">{service.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Emergency Contacts */}
                                <div className="mb-6 sm:mb-8 md:mb-10">
                                    <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                                        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2 sm:gap-3">
                                            <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-rose-300" />
                                            Emergency Contacts
                                        </h2>
                                    </div>
                                    
                                    <div className={`grid ${screenSize === 'xs' ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-3 md:gap-4 lg:gap-6`}>
                                        {emergencyContacts.map((contact) => {
                                            const ContactIcon = contact.icon;
                                            return (
                                                <button
                                                    key={contact.name}
                                                    type="button"
                                                    onClick={() => handleEmergencyCall(contact.number)}
                                                    className={`group relative overflow-hidden rounded-lg sm:rounded-xl ${contact.lightColor} ${contact.darkColor} p-3 sm:p-4 md:p-5 lg:p-6 text-left transition-all hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl border border-white/20`}
                                                >
                                                    <div className="relative z-10">
                                                        <div className="mb-1 sm:mb-2 lg:mb-3 flex items-center gap-1 sm:gap-2">
                                                            <div className="rounded-lg sm:rounded-xl bg-white/20 p-1 sm:p-1.5 md:p-2 backdrop-blur-sm">
                                                                <ContactIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white" />
                                                            </div>
                                                            <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-white/90 truncate">
                                                                {contact.name}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 break-all">
                                                            {contact.number}
                                                        </p>
                                                        <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-100 dark:text-gray-300 truncate">
                                                            {contact.description}
                                                        </p>
                                                    </div>
                                                    <div className="absolute right-1.5 sm:right-2 md:right-3 bottom-1.5 sm:bottom-2 md:bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <PhoneCall className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white/30" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-white/20">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
                                <div className="flex items-center gap-2 sm:gap-3 text-white/80">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>24/7 Emergency Services</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    <span className="text-emerald-300 text-xs sm:text-sm">System Secure</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="relative lg:w-3/5 xl:w-3/5 p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
                    <div className="absolute right-0 top-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-3xl" />
                    
                    <div className="relative z-10 max-w-md mx-auto h-full flex flex-col justify-center">
                        {/* Login Header */}
                        <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center">
                            <div className="inline-flex items-center justify-center p-2 sm:p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-3 sm:mb-4">
                                <User className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                            </div>
                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 leading-tight">
                                Secure Login
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base">
                                Enter your credentials to access government services
                            </p>
                        </div>

                        {/* Alerts Container */}
                        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                            {rateLimitRemaining !== undefined && rateLimitRemaining <= 2 && (
                                <div className="p-3 sm:p-4 bg-amber-50 dark:bg-gray-900 border border-amber-200 dark:border-amber-900 rounded-lg sm:rounded-xl backdrop-blur-sm">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-300 mb-1 truncate">
                                                Rate Limit Warning
                                            </h4>
                                            <p className="text-xs text-amber-700 dark:text-amber-400 mb-2 break-words">
                                                {rateLimitRemaining === 0 
                                                    ? `Too many requests. Please wait ${formatCountdown(rateLimitCountdown)} before trying again.`
                                                    : `Only ${rateLimitRemaining} attempt${rateLimitRemaining === 1 ? '' : 's'} remaining.`
                                                }
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="text-xs h-7 sm:h-8 border-amber-300 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-gray-800"
                                                onClick={refreshPage}
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                Refresh Status
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {accountLocked && (
                                <div className="p-3 sm:p-4 bg-red-50 dark:bg-gray-900 border border-red-200 dark:border-red-900 rounded-lg sm:rounded-xl backdrop-blur-sm">
                                    <div className="flex items-start gap-2 sm:gap-3">
                                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300 mb-1 truncate">
                                                Account Temporarily Locked
                                            </h4>
                                            <p className="text-xs text-red-700 dark:text-red-400 mb-2 break-words">
                                                Too many failed login attempts. Please try again in {formatCountdown(countdown)}.
                                            </p>
                                            <div className="flex flex-wrap gap-1 sm:gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="text-xs h-7 sm:h-8 border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-gray-800"
                                                    onClick={refreshPage}
                                                >
                                                    <RefreshCw className="w-3 h-3 mr-1" />
                                                    Refresh
                                                </Button>
                                                {canResetPassword && (
                                                    <Button 
                                                        variant="link" 
                                                        size="sm" 
                                                        className="text-xs h-7 sm:h-8 px-0 text-red-600 dark:text-red-400"
                                                        asChild
                                                    >
                                                        <TextLink href="/forgot-password">
                                                            Forgot Password?
                                                        </TextLink>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showSecurityAlert && lastLoginInfo && !accountLocked && (
                                <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-gray-900 dark:to-gray-900 border border-blue-200 dark:border-gray-800 rounded-lg sm:rounded-xl backdrop-blur-sm">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-start gap-2 sm:gap-3">
                                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs sm:text-sm font-medium text-blue-800 dark:text-gray-200 mb-1 truncate">
                                                    Last Login Activity
                                                </h4>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-700 dark:text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="truncate">{formatTime(lastLoginInfo.time)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-700 dark:text-gray-400">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="truncate">IP: {lastLoginInfo.ip}</span>
                                                        {lastLoginInfo.location && (
                                                            <span className="text-blue-600 dark:text-blue-300 truncate">
                                                                ({lastLoginInfo.location})
                                                            </span>
                                                        )}
                                                    </div>
                                                    {lastLoginInfo.device && (
                                                        <div className="flex items-center gap-1 sm:gap-2 text-xs text-blue-700 dark:text-gray-400">
                                                            {getDeviceIcon(lastLoginInfo.device)}
                                                            <span className="truncate">{lastLoginInfo.device}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowSecurityAlert(false)}
                                            className="text-blue-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-gray-300 p-1 flex-shrink-0"
                                        >
                                            <span className="sr-only">Dismiss</span>
                                            ×
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Login Form */}
                        <form onSubmit={submit} className="space-y-4 sm:space-y-6">
                            <div className="space-y-3 sm:space-y-4">
                                <div className="space-y-1 sm:space-y-2">
                                    <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <User className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Email Address
                                        </div>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoFocus={!accountLocked}
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="Enter your email address"
                                            className="h-10 sm:h-11 md:h-12 text-sm sm:text-base pr-10 sm:pr-12 bg-white/50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500 backdrop-blur-sm"
                                            disabled={accountLocked || processing}
                                        />
                                        {data.email && !accountLocked && (
                                            <button
                                                type="button"
                                                onClick={() => setData('email', '')}
                                                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                tabIndex={-1}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-1 sm:space-y-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <Key className="w-3 h-3 sm:w-4 sm:h-4" />
                                                Password
                                            </div>
                                        </Label>
                                        {canResetPassword && !accountLocked && (
                                            <TextLink
                                                href="/forgot-password"
                                                className="ml-auto text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            className="h-10 sm:h-11 md:h-12 text-sm sm:text-base pr-10 sm:pr-12 bg-white/50 dark:bg-gray-900/50 border-gray-300 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500 backdrop-blur-sm"
                                            disabled={accountLocked || processing}
                                        />
                                        {!accountLocked && (
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                tabIndex={3}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                                                ) : (
                                                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                {!accountLocked && (
                                    <div className="flex items-center space-x-2 sm:space-x-3 pt-1 sm:pt-2">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                            tabIndex={4}
                                            disabled={processing}
                                            className="h-4 w-4 sm:h-5 sm:w-5 border-gray-300 dark:border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                        />
                                        <Label htmlFor="remember" className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                            Remember this device
                                        </Label>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base font-semibold mt-4 sm:mt-6 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                    tabIndex={5}
                                    disabled={accountLocked || processing}
                                    data-test="login-button"
                                >
                                    {processing ? (
                                        <>
                                            <Spinner className="mr-2 sm:mr-3" />
                                            <span className="truncate">Signing in...</span>
                                        </>
                                    ) : accountLocked ? (
                                        <>
                                            <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                            <span className="truncate">Account Locked</span>
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                            <span className="truncate">Sign In to Account</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>

                        {status && (
                            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-900 dark:to-gray-900 border border-emerald-200 dark:border-emerald-900 rounded-lg sm:rounded-xl backdrop-blur-sm">
                                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
                                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="truncate">{status}</span>
                                </div>
                            </div>
                        )}

                        {/* Security Tips */}
                        {!accountLocked && (
                            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-800">
                                <h5 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                                    Security Best Practices
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                    {['Secure Connection', 'Log Out', 'Keep Private'].map((title, index) => (
                                        <div key={title} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-br from-blue-50/50 to-white/50 dark:from-gray-900 dark:to-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-200 dark:border-gray-800">
                                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                                    {title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1 line-clamp-2">
                                                    {index === 0 && 'Always verify HTTPS'}
                                                    {index === 1 && 'Always logout from shared devices'}
                                                    {index === 2 && 'Never share credentials'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Links */}
                        <div className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-800">
                            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                <button
                                    onClick={() => setShowSecurityAlert(!showSecurityAlert)}
                                    className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors flex items-center gap-1 whitespace-nowrap"
                                >
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {showSecurityAlert ? 'Hide Security' : 'Show Security'}
                                </button>
                                <span className="text-gray-400 dark:text-gray-700 hidden sm:inline">•</span>
                                <a href="/help" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors flex items-center gap-1 whitespace-nowrap">
                                    <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Need Help?
                                </a>
                                <span className="text-gray-400 dark:text-gray-700 hidden sm:inline">•</span>
                                <a href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors flex items-center gap-1 whitespace-nowrap">
                                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Privacy Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Mobile/Tablet Portrait Layout - FIXED FOOTER SPACING
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pb-16"> {/* Added pb-16 */}
            <Head title="Log in" />
            
            {/* Fixed Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-600">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Barangay Portal
                                </h1>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Secure Login
                                </p>
                            </div>
                        </div>
                        
                        {/* Emergency Quick Action */}
                        <button
                            onClick={() => setShowEmergencyContacts(true)}
                            className="relative p-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <AlertOctagon className="w-5 h-5 text-white" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content with Emergency Banner at Top */}
            <div className="p-4 pt-0">
                {/* Emergency Banner */}
                <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                    Emergency Contacts
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Immediate access to emergency services
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowEmergencyContacts(true)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Login Form Section */}
                <div className="mb-6 p-5 rounded-2xl bg-white dark:bg-gray-900 shadow-lg">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-3">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            Welcome Back
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Enter your credentials to continue
                        </p>
                    </div>

                    {/* Alerts */}
                    <div className="space-y-3 mb-6">
                        {rateLimitRemaining !== undefined && rateLimitRemaining <= 2 && (
                            <div className="p-3 bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-amber-900 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                                            Rate Limit Warning
                                        </h4>
                                        <p className="text-xs text-amber-700 dark:text-amber-400">
                                            {rateLimitRemaining === 0 
                                                ? `Please wait ${formatCountdown(rateLimitCountdown)} before trying again`
                                                : `${rateLimitRemaining} attempt${rateLimitRemaining === 1 ? '' : 's'} remaining`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {accountLocked && (
                            <div className="p-3 bg-red-50 dark:bg-gray-800 border border-red-200 dark:border-red-900 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Lock className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                                            Account Locked
                                        </h4>
                                        <p className="text-xs text-red-700 dark:text-red-400 mb-2">
                                            Try again in {formatCountdown(countdown)}
                                        </p>
                                        {canResetPassword && (
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="text-xs h-7 px-0 text-red-600 dark:text-red-400"
                                                asChild
                                            >
                                                <TextLink href="/forgot-password">
                                                    Forgot Password?
                                                </TextLink>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {showSecurityAlert && lastLoginInfo && !accountLocked && (
                            <div className="p-3 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-medium text-blue-800 dark:text-gray-200 mb-1">
                                            Last Login
                                        </h4>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-gray-400">
                                                <Clock className="w-3 h-3" />
                                                <span>{formatTime(lastLoginInfo.time)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-gray-400">
                                                <MapPin className="w-3 h-3" />
                                                <span>IP: {lastLoginInfo.ip}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowSecurityAlert(false)}
                                        className="text-blue-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        autoFocus={!accountLocked}
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="h-12 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                        disabled={accountLocked || processing}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                    </Label>
                                    {canResetPassword && !accountLocked && (
                                        <TextLink
                                            href="/forgot-password"
                                            className="ml-auto text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            tabIndex={5}
                                        >
                                            Forgot?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        className="h-12 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                                        disabled={accountLocked || processing}
                                    />
                                    {!accountLocked && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                            tabIndex={3}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    )}
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {!accountLocked && (
                                <div className="flex items-center space-x-3 pt-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                        tabIndex={4}
                                        disabled={processing}
                                        className="h-5 w-5 border-gray-300 dark:border-gray-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">
                                        Remember me
                                    </Label>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold mt-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                tabIndex={5}
                                disabled={accountLocked || processing}
                                data-test="login-button"
                            >
                                {processing ? (
                                    <>
                                        <Spinner className="mr-3" />
                                        Signing in...
                                    </>
                                ) : accountLocked ? (
                                    <>
                                        <Lock className="w-5 h-5 mr-3" />
                                        Account Locked
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5 mr-3" />
                                        Sign In
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

                    {status && (
                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                            <div className="flex items-center gap-3 text-sm text-emerald-700 dark:text-emerald-400">
                                <ShieldCheck className="w-5 h-5" />
                                <span>{status}</span>
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <button
                                onClick={() => setShowSecurityAlert(!showSecurityAlert)}
                                className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
                            >
                                <Eye className="w-4 h-4" />
                                {showSecurityAlert ? 'Hide' : 'Show'} Info
                            </button>
                            <span className="text-gray-400 dark:text-gray-700">•</span>
                            <a href="/help" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors flex items-center gap-1">
                                <HelpCircle className="w-4 h-4" />
                                Help
                            </a>
                        </div>
                    </div>
                </div>

                {/* Quick Emergency Access */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Quick Emergency Access
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {emergencyContacts.slice(0, 2).map((contact) => {
                            const CallIcon = contact.callIcon;
                            return (
                                <button
                                    key={contact.name}
                                    type="button"
                                    onClick={() => handleEmergencyCall(contact.number)}
                                    className={`${contact.lightColor} p-4 rounded-xl text-white active:scale-95 transition-transform`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-white/20">
                                                <contact.icon className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold">{contact.name}</p>
                                                <p className="text-xs opacity-90">{contact.description}</p>
                                            </div>
                                        </div>
                                        <CallIcon className="w-5 h-5 opacity-70" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    
                    <button
                        onClick={() => setShowEmergencyContacts(true)}
                        className="w-full mt-3 p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <AlertOctagon className="w-5 h-5 text-red-500" />
                            <div className="text-left">
                                <p className="text-sm font-semibold">View All Emergency Contacts</p>
                                <p className="text-xs opacity-70">Police, Fire, Ambulance & More</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Security Tips - Now with proper spacing */}
                <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" />
                        Security Tips
                    </h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <span>Always verify you're on the official portal</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span>Log out after each session on shared devices</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            <span>Never share your login credentials</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Emergency Contacts Panel */}
            {showEmergencyContacts && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setShowEmergencyContacts(false)}></div>
                    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl">
                        <div className="h-full max-h-[85vh] overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="sticky top-0 z-10 p-6 bg-gradient-to-r from-red-600 to-rose-600 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <AlertOctagon className="w-7 h-7" />
                                        <div>
                                            <h2 className="text-xl font-bold">Emergency Contacts</h2>
                                            <p className="text-sm opacity-90">Tap to call immediately</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowEmergencyContacts(false)}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                
                                {/* Emergency Hotline */}
                                <button
                                    onClick={() => handleEmergencyCall('911')}
                                    className="w-full p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 flex items-center justify-between active:scale-95 transition-transform"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-white">
                                            <Siren className="w-6 h-6 text-red-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-lg font-bold">National Emergency</p>
                                            <p className="text-sm opacity-90">Dial 911 for all emergencies</p>
                                        </div>
                                    </div>
                                    <Phone className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Emergency Contacts Grid */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                        Emergency Services
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {emergencyContacts.map((contact) => {
                                            const ContactIcon = contact.icon;
                                            const CallIcon = contact.callIcon;
                                            return (
                                                <button
                                                    key={contact.name}
                                                    type="button"
                                                    onClick={() => handleEmergencyCall(contact.number)}
                                                    className={`${contact.lightColor} p-4 rounded-xl text-white active:scale-95 transition-transform`}
                                                >
                                                    <div className="flex flex-col items-center text-center gap-3">
                                                        <div className="relative">
                                                            <div className="p-3 rounded-full bg-white/20">
                                                                <ContactIcon className="w-6 h-6" />
                                                            </div>
                                                            {contact.emergencyLevel === 'high' && (
                                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">{contact.name}</p>
                                                            <p className="text-xs opacity-90">{contact.description}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <CallIcon className="w-4 h-4 opacity-70" />
                                                            <p className="text-sm font-bold">{contact.number}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Additional Hotlines */}
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                                        Additional Hotlines
                                    </h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleEmergencyCall('8888')}
                                            className="w-full p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between active:scale-95 transition-transform"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-800">
                                                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                        Government Hotline
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Complaints and assistance
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">8888</p>
                                        </button>
                                        
                                        <button
                                            onClick={() => handleEmergencyCall('136')}
                                            className="w-full p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between active:scale-95 transition-transform"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-800">
                                                    <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                        Health Hotline
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Health concerns and information
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">136</p>
                                        </button>
                                    </div>
                                </div>

                                {/* Important Notes */}
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                                                Important Notes
                                            </h4>
                                            <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                                                <li>• Provide clear location details when calling</li>
                                                <li>• Stay on the line until help arrives</li>
                                                <li>• Keep emergency contacts saved offline</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                                <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                                    <p>For immediate assistance, tap any contact above</p>
                                    <p className="mt-1">All services available 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-3 z-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Secure Connection</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.open('https://brgy.gov.ph', '_blank')}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            Website
                        </button>
                        <button
                            onClick={() => window.open('mailto:support@barangay.gov.ph', '_blank')}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
import { Head } from '@inertiajs/react';
import { useScreenDetection } from '@/hooks/login/useScreenDetection';
import { LoginProps } from '@/types/login/login';
import { DesktopLogin } from '@/components/login/DesktopLogin';
import { MobileLogin } from '@/components/login/MobileLogin';
import { HeroSection } from '@/components/login/HeroSection';
import { useCallback } from 'react';

export default function Login(props: LoginProps) {
    const { isMobile, isLandscape, screenSize } = useScreenDetection();
    
    /**
     * Handled via useCallback to prevent re-renders in children components
     * Strictly validates input before attempting to open dialer
     */
    const handleEmergencyCall = useCallback((number: string) => {
        if (!number || typeof number !== 'string') return;
        
        // Sanitize: strip non-numeric characters except +
        const sanitized = number.replace(/[^\d+]/g, '');
        if (sanitized.length < 3) return;

        window.open(`tel:${sanitized}`, '_blank');
    }, []);

    const isDesktopLayout = !isMobile && (isLandscape || window.innerWidth >= 1024);

    if (isDesktopLayout) {
        return (
            <div className="relative min-h-screen flex flex-col lg:flex-row bg-[#020617] selection:bg-blue-500/30">
                <Head title="Secure Authentication | BarangayOS" />
                
                {/* Unified High-End Background Layer */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    {/* Primary Deep Base */}
                    <div className="absolute inset-0 bg-[#020617]" />
                    
                    {/* Soft Mesh Accents - Top Right */}
                    <div className="absolute -top-24 -right-24 w-[40rem] h-[40rem] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
                    
                    {/* Soft Mesh Accents - Bottom Left */}
                    <div className="absolute -bottom-24 -left-24 w-[30rem] h-[30rem] bg-emerald-600/5 blur-[100px] rounded-full" />
                </div>

                {/* Main Interaction Zones */}
                <div className="relative z-10 flex flex-col lg:flex-row w-full">
                    <HeroSection 
                        screenSize={screenSize} 
                        onEmergencyCall={handleEmergencyCall} 
                    />
                    
                    <DesktopLogin 
                        {...props} 
                        onEmergencyCall={handleEmergencyCall} 
                    />
                </div>
            </div>
        );
    }

    // Default to Mobile View
    return (
        <>
            <Head title="Mobile Access | BarangayOS" />
            <MobileLogin 
                {...props} 
                onEmergencyCall={handleEmergencyCall} 
            />
        </>
    );
}
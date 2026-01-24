import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, RefreshCw, Moon, Sun, Monitor } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/resident-app-layout';
import SettingsLayout from '@/layouts/settings/residentlayout';

// Fix: Add index signature to satisfy Inertia's PageProps constraint
interface PageProps extends Record<string, any> {
    flash?: {
        success?: string;
        error?: string;
        info?: string;
    };
    errors?: Record<string, string>;
    theme?: string;
    user?: {
        id: number;
        theme_preference?: string;
    };
}

export default function Appearance() {
    const { flash, errors: pageErrors, theme, user } = usePage<PageProps>().props;
    
    const [showFlashMessages, setShowFlashMessages] = useState<boolean>(true);
    const [currentTheme, setCurrentTheme] = useState<string>(theme || user?.theme_preference || 'system');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showSaveButton, setShowSaveButton] = useState<boolean>(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Appearance Settings',
            href: route('appearance.edit'),
        },
    ];

    // Auto-hide flash messages after 5 seconds
    useEffect(() => {
        if (flash?.success || flash?.error || flash?.info) {
            setShowFlashMessages(true);
            const timer = setTimeout(() => {
                setShowFlashMessages(false);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [flash]);

    // Sync theme from backend if provided
    useEffect(() => {
        if (theme || user?.theme_preference) {
            setCurrentTheme(theme || user?.theme_preference || 'system');
        }
    }, [theme, user?.theme_preference]);

    // Handle theme change callback - modified to work with AppearanceTabs
    const handleThemeChange = (newTheme: string) => {
        const previousTheme = currentTheme;
        setCurrentTheme(newTheme);
        
        // Show save button if theme changed
        if (newTheme !== previousTheme) {
            setShowSaveButton(true);
        }
        
        // Apply theme immediately for better UX
        applyThemeToDocument(newTheme);
    };

    // Apply theme to HTML document
    const applyThemeToDocument = (theme: string) => {
        const html = document.documentElement;
        
        // Remove all theme classes
        html.classList.remove('light', 'dark');
        
        // Add the appropriate class
        if (theme === 'dark') {
            html.classList.add('dark');
        } else if (theme === 'light') {
            html.classList.add('light');
        } else {
            // For system theme, follow OS preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                html.classList.add('dark');
            } else {
                html.classList.add('light');
            }
        }
    };

    // Save theme preference to backend
    const saveThemePreference = () => {
        setIsSaving(true);
        
        router.post(route('resident.appearance.update'), {
            theme: currentTheme,
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsSaving(false);
                setShowSaveButton(false);
                setShowFlashMessages(true);
            },
            onError: () => {
                setIsSaving(false);
            },
        });
    };

    // Reset to default
    const resetToDefault = () => {
        const defaultTheme = 'system';
        setCurrentTheme(defaultTheme);
        setShowSaveButton(true);
        applyThemeToDocument(defaultTheme);
    };

    // Get theme display name and icon
    const getThemeDisplay = () => {
        switch (currentTheme) {
            case 'light':
                return { name: 'Light', icon: <Sun className="h-4 w-4" /> };
            case 'dark':
                return { name: 'Dark', icon: <Moon className="h-4 w-4" /> };
            case 'system':
                return { name: 'System Default', icon: <Monitor className="h-4 w-4" /> };
            default:
                return { name: currentTheme, icon: null };
        }
    };

    // Check if we need to show save button on initial load
    useEffect(() => {
        const savedTheme = user?.theme_preference || 'system';
        if (currentTheme !== savedTheme) {
            setShowSaveButton(true);
        }
    }, [currentTheme, user?.theme_preference]);

    // Option 1: If AppearanceTabs is a simple component without props, use it as-is
    // Option 2: If you need to pass props, check what props it actually accepts
    // Let me check what the actual AppearanceTabs component looks like

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    {/* Flash Messages */}
                    {showFlashMessages && flash?.success && (
                        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 animate-in fade-in slide-in-from-top-5 duration-300">
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-green-700 dark:text-green-300">
                                {flash.success}
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    {showFlashMessages && flash?.error && (
                        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-5 duration-300">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {flash.error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {showFlashMessages && flash?.info && (
                        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 animate-in fade-in slide-in-from-top-5 duration-300">
                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <AlertDescription className="text-blue-700 dark:text-blue-300">
                                {flash.info}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Page Errors */}
                    {pageErrors && Object.keys(pageErrors).length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {Object.values(pageErrors).map((error, index) => (
                                    <div key={index}>{error}</div>
                                ))}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <HeadingSmall
                            title="Appearance Settings"
                            description="Customize how the application looks and feels"
                        />
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {currentTheme && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted dark:bg-muted/50 rounded-lg">
                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                    <div className="flex items-center gap-2">
                                        {getThemeDisplay().icon}
                                        <span className="text-sm font-medium">
                                            Current theme: {getThemeDisplay().name}
                                        </span>
                                    </div>
                                </div>
                            )}
                            
                            {showSaveButton && (
                                <Button
                                    onClick={saveThemePreference}
                                    disabled={isSaving}
                                    size="sm"
                                >
                                    {isSaving ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="bg-muted/50 dark:bg-muted/30 p-4 rounded-lg border dark:border-muted">
                        <p className="text-sm text-muted-foreground">
                            Customize your experience by selecting your preferred theme. 
                            Changes are applied immediately. Choose "System Default" to 
                            follow your operating system's theme preference.
                        </p>
                    </div>

                    {/* OPTION 1: If AppearanceTabs doesn't accept props, use it without props */}
                    {/* <AppearanceTabs /> */}
                    
                    {/* OPTION 2: Create a custom theme selector if AppearanceTabs doesn't have theme props */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['light', 'dark', 'system'].map((themeOption) => (
                            <div
                                key={themeOption}
                                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary ${
                                    currentTheme === themeOption 
                                        ? 'border-primary bg-primary/5' 
                                        : 'hover:bg-muted/50'
                                }`}
                                onClick={() => handleThemeChange(themeOption)}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    {themeOption === 'light' && <Sun className="h-5 w-5" />}
                                    {themeOption === 'dark' && <Moon className="h-5 w-5" />}
                                    {themeOption === 'system' && <Monitor className="h-5 w-5" />}
                                    <span className="font-medium">
                                        {themeOption === 'light' && 'Light'}
                                        {themeOption === 'dark' && 'Dark'}
                                        {themeOption === 'system' && 'System Default'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {themeOption === 'light' && 'Bright interface with dark text'}
                                    {themeOption === 'dark' && 'Dark interface with light text'}
                                    {themeOption === 'system' && 'Follows your OS theme preference'}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end border-t pt-6">
                        <Button
                            onClick={resetToDefault}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Reset to Default
                        </Button>
                        
                        <Button
                            onClick={() => window.location.reload()}
                            variant="ghost"
                            size="sm"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Page
                        </Button>
                    </div>

                    {/* Additional Information */}
                    <div className="border rounded-lg p-4 bg-muted/20 dark:bg-muted/10">
                        <h4 className="text-sm font-semibold mb-2">Theme Information</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li className="flex items-center gap-2">
                                <Sun className="h-3 w-3" />
                                <span><strong>Light mode:</strong> Bright interface with dark text</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Moon className="h-3 w-3" />
                                <span><strong>Dark mode:</strong> Dark interface with light text, easier on the eyes</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Monitor className="h-3 w-3" />
                                <span><strong>System default:</strong> Automatically switches based on your OS preference</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
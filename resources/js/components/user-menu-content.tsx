import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { LogOut, Settings } from 'lucide-react';
import React from 'react';
import { router } from '@inertiajs/react';

// Declare type for Inertia Link component
interface InertiaLinkProps {
    href: string;
    children: React.ReactNode;
    prefetch?: boolean;
    onClick?: () => void;
    className?: string;
}

// Define the props interface
interface UserMenuContentProps {
    user: User;
    Link?: React.ComponentType<InertiaLinkProps>;
}

export function UserMenuContent({ user, Link }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    
    // Hardcoded URLs - replace with your actual URLs
    const LOGOUT_URL = '/logout';
    const PROFILE_EDIT_URL = '/adminsettings/profile'; // Change this to your actual profile edit URL
    
    console.log('Logout URL:', LOGOUT_URL);
    console.log('Profile edit URL:', PROFILE_EDIT_URL);
    
    // Default fallback components
    const DefaultLink = ({ href, children, ...props }: InertiaLinkProps) => (
        <a href={href} {...props}>{children}</a>
    );
    
    const LinkComponent = Link || DefaultLink;

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        cleanup();
        
        // Use Inertia's router.post() method
        // This automatically includes CSRF token and handles SPA navigation
        router.post(LOGOUT_URL);
    };

    const handleSettingsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        cleanup();
        
        // Navigate to profile edit page
        router.get(PROFILE_EDIT_URL);
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <LinkComponent
                        className="block w-full cursor-pointer"
                        href={PROFILE_EDIT_URL}
                        prefetch={true}
                        onClick={handleSettingsClick}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </LinkComponent>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center cursor-pointer px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    data-test="logout-button"
                    type="button"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                </button>
            </DropdownMenuItem>
        </>
    );
}
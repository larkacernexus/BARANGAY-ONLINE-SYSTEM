<?php

namespace App\Http\Controllers\Residentsettings;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    // Existing methods...
    public function profile()
    {
        return Inertia::render('ResidentSettings/Profile');
    }
    
    public function password()
    {
        return Inertia::render('ResidentSettings/Password');
    }
    
    public function twoFactor()
    {
        return Inertia::render('ResidentSettings/TwoFactor', [
            'twoFactorEnabled' => auth()->user()->two_factor_confirmed_at !== null,
            'requiresConfirmation' => false,
        ]);
    }
    
    public function appearance()
    {
        return Inertia::render('ResidentSettings/Appearance');
    }
    
    
    
    public function privacy()
    {
        // Privacy settings data
        $privacySettings = [
            'dataSharing' => [
                'analytics' => true,
                'personalizedAds' => false,
                'thirdPartySharing' => false,
            ],
            'communication' => [
                'emailNotifications' => true,
                'marketingEmails' => false,
            ],
        ];
        
        $connectedApps = [
            // Connected apps data
        ];
        
        return Inertia::render('residentsettings/privacy', [
            'privacySettings' => $privacySettings,
            'connectedApps' => $connectedApps,
            'dataCategories' => [],
        ]);
    }
    
    // Optional methods for nested pages
    public function security()
    {
        return Inertia::render('ResidentSettings/Security'); // Create this component if needed
    }
    
    public function preferences()
    {
        return Inertia::render('ResidentSettings/Preferences'); // Create this component if needed
    }
    
    public function notifications()
    {
        return Inertia::render('ResidentSettings/Notifications'); // Create this component if needed
    }
}
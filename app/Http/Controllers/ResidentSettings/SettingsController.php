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
    
    // NEW METHODS
    public function connectedDevices()
    {
        // You can pass dummy data or real data from your database
        $devices = [
            [
                'id' => 1,
                'name' => 'iPhone 14 Pro',
                'type' => 'mobile',
                'browser' => 'Safari',
                'os' => 'iOS 16.5',
                'location' => 'New York, USA',
                'lastActive' => '5 minutes ago',
                'isCurrent' => true,
                'status' => 'active',
            ],
            // Add more devices as needed
        ];
        
        $sessionHistory = [
            // Session history data
        ];
        
        return Inertia::render('residentsettings/connecteddevice', [
            'devices' => $devices,
            'sessionHistory' => $sessionHistory,
            'activeDevicesCount' => count(array_filter($devices, fn($d) => $d['status'] === 'active')),
        ]);
    }
    
    public function billing()
    {
        // Dummy data for billing page
        $paymentMethods = [
            [
                'id' => 1,
                'type' => 'credit_card',
                'last4' => '4242',
                'brand' => 'Visa',
                'expiry' => '12/25',
                'isDefault' => true,
            ],
            // Add more payment methods
        ];
        
        $invoices = [
            // Invoice data
        ];
        
        $currentPlan = [
            'name' => 'Premium Plan',
            'price' => 149.99,
            'interval' => 'month',
            'nextBilling' => now()->addMonth()->format('M d, Y'),
        ];
        
        return Inertia::render('residentsettings/billing', [
            'paymentMethods' => $paymentMethods,
            'invoices' => $invoices,
            'currentPlan' => $currentPlan,
            'billingHistory' => [],
        ]);
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
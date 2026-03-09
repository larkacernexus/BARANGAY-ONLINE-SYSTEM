<?php

namespace App\Http\Controllers\ResidentSettings;

use App\Http\Controllers\Controller;
use App\Models\UserLoginLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Jenssegers\Agent\Agent;

class DeviceController extends Controller
{
    public function connectedDevices()
    {
        $user = Auth::user();
        $agent = new Agent();
        
        // Get current session device
        $currentSession = [
            'id' => session()->getId(),
            'name' => $this->getDeviceName($agent),
            'type' => $this->getDeviceType($agent),
            'browser' => $agent->browser(),
            'os' => $agent->platform(),
            'ip_address' => request()->ip(),
            'location' => $this->getLocationFromIP(request()->ip()),
            'last_active' => now(),
            'last_active_human' => 'Just now',
            'is_current' => true,
            'status' => 'active',
            'is_trusted' => true,
            'user_agent' => request()->userAgent(),
        ];

        // Get other active sessions from sessions table
        $sessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', session()->getId())
            ->orderBy('last_activity', 'desc')
            ->get();

        $otherDevices = [];
        foreach ($sessions as $session) {
            $payload = unserialize(base64_decode($session->payload));
            $sessionAgent = new Agent();
            $sessionAgent->setUserAgent($payload['user_agent'] ?? '');
            
            $lastActive = \Carbon\Carbon::createFromTimestamp($session->last_activity);
            $lastActiveHuman = $lastActive->diffForHumans();
            
            // Check if this device was ever trusted based on login history
            $isTrusted = UserLoginLog::where('user_id', $user->id)
                ->where('ip_address', $session->ip_address)
                ->where('is_successful', true)
                ->where('login_at', '>=', now()->subDays(30))
                ->count() >= 3;
            
            $otherDevices[] = [
                'id' => $session->id,
                'name' => $this->getDeviceName($sessionAgent),
                'type' => $this->getDeviceType($sessionAgent),
                'browser' => $sessionAgent->browser(),
                'os' => $sessionAgent->platform(),
                'ip_address' => $session->ip_address,
                'location' => $this->getLocationFromIP($session->ip_address),
                'last_active' => $lastActive->toDateTimeString(),
                'last_active_human' => $lastActiveHuman,
                'is_current' => false,
                'status' => $lastActive->gt(now()->subHours(24)) ? 'active' : 'inactive',
                'is_trusted' => $isTrusted,
                'user_agent' => $payload['user_agent'] ?? '',
            ];
        }

        // Get login history from UserLoginLog model
        $loginLogs = UserLoginLog::where('user_id', $user->id)
            ->where('is_successful', true) // Only show successful logins in history
            ->orderBy('login_at', 'desc')
            ->limit(20)
            ->get();

        $sessionHistory = [];
        foreach ($loginLogs as $log) {
            $logAgent = new Agent();
            $logAgent->setUserAgent($log->user_agent ?? '');
            
            $sessionHistory[] = [
                'id' => $log->id,
                'device_name' => $this->getDeviceName($logAgent),
                'action' => $log->logout_at ? 'logout' : 'login',
                'location' => $this->getLocationFromIP($log->ip_address),
                'created_at' => $log->login_at->toDateTimeString(),
                'created_at_human' => $log->login_at->diffForHumans(),
                'status' => $log->is_successful ? 'success' : 'failed',
                'ip_address' => $log->ip_address,
            ];

            // If there's a logout, add it as a separate entry
            if ($log->logout_at) {
                $sessionHistory[] = [
                    'id' => $log->id . '_logout',
                    'device_name' => $this->getDeviceName($logAgent),
                    'action' => 'logout',
                    'location' => $this->getLocationFromIP($log->ip_address),
                    'created_at' => $log->logout_at->toDateTimeString(),
                    'created_at_human' => $log->logout_at->diffForHumans(),
                    'status' => 'success',
                    'ip_address' => $log->ip_address,
                ];
            }
        }

        // Sort session history by date
        usort($sessionHistory, function($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });

        // Combine current device with other devices
        $devices = array_merge([$currentSession], $otherDevices);

        // Calculate security stats
        $activeDevices = array_filter($devices, fn($d) => $d['status'] === 'active');
        $inactiveDevices = array_filter($devices, fn($d) => $d['status'] === 'inactive');
        
        // Check for suspicious activity (failed login attempts in last 7 days)
        $suspiciousCount = UserLoginLog::where('user_id', $user->id)
            ->where('is_successful', false)
            ->where('login_at', '>=', now()->subDays(7))
            ->count();

        // Calculate security score
        $securityScore = 100;
        
        // Deduct for multiple active devices
        if (count($activeDevices) > 3) $securityScore -= 10;
        if (count($activeDevices) > 5) $securityScore -= 5;
        
        // Deduct for suspicious activity
        if ($suspiciousCount > 0) {
            $securityScore -= min(30, $suspiciousCount * 5);
        }
        
        // Deduct for old inactive devices
        if (count($inactiveDevices) > 5) $securityScore -= 5;
        if (count($inactiveDevices) > 10) $securityScore -= 5;
        
        // Add for 2FA
        if ($user->two_factor_secret) $securityScore += 15;
        
        // Add for regular logins (trusted behavior)
        $regularLogins = UserLoginLog::where('user_id', $user->id)
            ->where('is_successful', true)
            ->where('login_at', '>=', now()->subDays(30))
            ->count();
        
        if ($regularLogins > 20) $securityScore += 5;

        // Ensure score is between 0-100
        $securityScore = min(100, max(0, $securityScore));

        // Count devices inactive for 7+ days
        $inactiveWarningCount = count(array_filter($devices, function($device) {
            if ($device['status'] !== 'inactive') return false;
            if ($device['is_current']) return false;
            $lastActive = \Carbon\Carbon::parse($device['last_active']);
            return $lastActive->lt(now()->subDays(7));
        }));

        $securityStats = [
            'total_devices' => count($devices),
            'active_devices' => count($activeDevices),
            'inactive_devices' => count($inactiveDevices),
            'suspicious_count' => $suspiciousCount,
            'two_factor_enabled' => !is_null($user->two_factor_secret),
            'security_score' => $securityScore,
            'inactive_warning_count' => $inactiveWarningCount,
        ];

        return Inertia::render('residentsettings/connecteddevice', [
            'devices' => $devices,
            'sessionHistory' => array_slice($sessionHistory, 0, 10), // Limit to 10 most recent
            'securityStats' => $securityStats,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    /**
     * Get device name from user agent
     */
    private function getDeviceName($agent)
    {
        if ($agent->isDesktop()) {
            return 'Desktop Computer';
        }
        
        if ($agent->isPhone()) {
            $device = $agent->device();
            return $device ?: 'Mobile Phone';
        }
        
        if ($agent->isTablet()) {
            $device = $agent->device();
            return $device ?: 'Tablet';
        }
        
        if ($agent->isRobot()) {
            return $agent->robot() ?: 'Bot/Crawler';
        }
        
        return 'Unknown Device';
    }

    /**
     * Get device type from user agent
     */
    private function getDeviceType($agent)
    {
        if ($agent->isMobile()) return 'mobile';
        if ($agent->isTablet()) return 'tablet';
        if ($agent->isDesktop()) return 'desktop';
        if ($agent->isRobot()) return 'bot';
        return 'desktop';
    }

    /**
     * Get location from IP address
     */
    private function getLocationFromIP($ip)
    {
        // Skip local IPs
        if ($ip === '127.0.0.1' || $ip === '::1' || str_starts_with($ip, '192.168.')) {
            return 'Local Network';
        }

        // You can implement IP geolocation here
        // For now, return a generic location
        return 'Unknown Location';
    }

    /**
     * Log out a specific device
     */
    public function logoutDevice(Request $request)
    {
        $request->validate([
            'device_id' => 'required|string'
        ]);

        // Delete the session from database
        DB::table('sessions')
            ->where('id', $request->device_id)
            ->where('user_id', Auth::id())
            ->delete();

        // Log the logout
        UserLoginLog::create([
            'user_id' => Auth::id(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => $request->device_id,
            'device_type' => 'unknown',
            'browser' => 'unknown',
            'platform' => 'unknown',
            'login_at' => now(),
            'logout_at' => now(),
            'is_successful' => true,
        ]);

        return back()->with('success', 'Device logged out successfully.');
    }

    /**
     * Log out all other devices
     */
    public function logoutAllDevices(Request $request)
    {
        $currentSessionId = session()->getId();
        
        // Get all other sessions
        $otherSessions = DB::table('sessions')
            ->where('user_id', Auth::id())
            ->where('id', '!=', $currentSessionId)
            ->get();

        // Log logout for each session
        foreach ($otherSessions as $session) {
            UserLoginLog::create([
                'user_id' => Auth::id(),
                'ip_address' => $session->ip_address,
                'user_agent' => unserialize(base64_decode($session->payload))['user_agent'] ?? '',
                'session_id' => $session->id,
                'device_type' => 'unknown',
                'browser' => 'unknown',
                'platform' => 'unknown',
                'login_at' => now(),
                'logout_at' => now(),
                'is_successful' => true,
            ]);
        }

        // Delete all other sessions
        DB::table('sessions')
            ->where('user_id', Auth::id())
            ->where('id', '!=', $currentSessionId)
            ->delete();

        return back()->with('success', 'Logged out from all other devices.');
    }

    /**
     * Trust a device
     */
    public function trustDevice(Request $request)
    {
        $request->validate([
            'device_id' => 'required|string'
        ]);

        // Store trusted devices in session or user meta
        $trustedDevices = session('trusted_devices', []);
        $trustedDevices[] = $request->device_id;
        session(['trusted_devices' => array_unique($trustedDevices)]);

        return back()->with('success', 'Device added to trusted list.');
    }

    /**
     * Untrust a device
     */
    public function untrustDevice(Request $request)
    {
        $request->validate([
            'device_id' => 'required|string'
        ]);

        $trustedDevices = session('trusted_devices', []);
        $trustedDevices = array_filter($trustedDevices, fn($id) => $id !== $request->device_id);
        session(['trusted_devices' => $trustedDevices]);

        return back()->with('success', 'Device removed from trusted list.');
    }

    /**
     * Report suspicious activity
     */
    public function reportSuspicious(Request $request)
    {
        // Log the suspicious login attempt
        UserLoginLog::create([
            'user_id' => Auth::id(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'session_id' => session()->getId(),
            'device_type' => 'unknown',
            'browser' => 'unknown',
            'platform' => 'unknown',
            'login_at' => now(),
            'is_successful' => false,
            'failure_reason' => 'User reported as suspicious',
        ]);

        // Notify admins (you can implement notification here)
        // You could also store in a security_reports table if needed

        return back()->with('success', 'Report submitted successfully. Our security team will investigate.');
    }
}
<?php
// app/Traits/HasActivities.php

namespace App\Traits;

use App\Models\UserLoginLog;
use App\Models\AccessLog;
use App\Models\Activity;
use Illuminate\Support\Facades\Request;

trait HasActivities
{
    /**
     * Log user login
     */
    public function logLogin($success = true, $reason = null)
    {
        $agent = new \Jenssegers\Agent\Agent();
        $agent->setUserAgent(Request::userAgent());
        
        return UserLoginLog::create([
            'user_id' => $this->id,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'session_id' => session()->getId(),
            'device_type' => $agent->deviceType(),
            'browser' => $agent->browser(),
            'platform' => $agent->platform(),
            'login_at' => now(),
            'is_successful' => $success,
            'failure_reason' => $reason,
        ]);
    }
    
    /**
     * Log user logout
     */
    public function logLogout()
    {
        UserLoginLog::where('user_id', $this->id)
            ->where('session_id', session()->getId())
            ->whereNull('logout_at')
            ->update(['logout_at' => now()]);
    }
    
    /**
     * Log access
     */
    public function logAccess($data = [])
    {
        return AccessLog::create(array_merge([
            'user_id' => $this->id,
            'session_id' => session()->getId(),
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'accessed_at' => now(),
        ], $data));
    }
    
    /**
     * Get recent activities
     */
    public function recentActivities($limit = 10)
    {
        return Activity::where('causer_id', $this->id)
            ->orWhere('causer_type', get_class($this))
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
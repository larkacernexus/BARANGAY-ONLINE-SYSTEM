<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    protected $table = 'sessions';
    
    protected $fillable = [
        'id',
        'user_id',
        'ip_address',
        'user_agent',
        'payload', // ← ADD THIS
        'last_activity',
    ];

    protected $casts = [
        'last_activity' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function loginLogs()
    {
        return $this->hasMany(UserLoginLog::class, 'session_id', 'id');
    }

    /**
     * Check if session is expired
     */
    public function getIsExpiredAttribute(): bool
    {
        $configLifetime = config('session.lifetime', 120);
        $lastActivity = $this->last_activity ?: now()->subDays(1);
        
        return now()->diffInMinutes($lastActivity) > $configLifetime;
    }

    /**
     * Check if session is active
     */
    public function getIsActiveAttribute(): bool
    {
        return !$this->is_expired;
    }

    /**
     * Get login_at from related login log
     */
    public function getLoginAtAttribute()
    {
        $loginLog = $this->loginLogs()
            ->where('is_successful', true)
            ->where('session_id', $this->id)
            ->first();
            
        return $loginLog ? $loginLog->login_at : null;
    }

    /**
     * Get logout_at from related login log
     */
    public function getLogoutAtAttribute()
    {
        $loginLog = $this->loginLogs()
            ->where('is_successful', true)
            ->where('session_id', $this->id)
            ->first();
            
        return $loginLog ? $loginLog->logout_at : null;
    }

    /**
     * Get session duration
     */
    public function getDurationAttribute(): ?int
    {
        $loginAt = $this->login_at;
        
        if (!$loginAt) {
            return null;
        }
        
        $logoutAt = $this->logout_at ?: now();
        return $logoutAt->diffInSeconds($loginAt);
    }

    /**
     * Get device info from related login log
     */
    public function getDeviceTypeAttribute()
    {
        $loginLog = $this->loginLogs()
            ->where('session_id', $this->id)
            ->first();
            
        return $loginLog ? $loginLog->device_type : null;
    }

    /**
     * Get browser from related login log
     */
    public function getBrowserAttribute()
    {
        $loginLog = $this->loginLogs()
            ->where('session_id', $this->id)
            ->first();
            
        return $loginLog ? $loginLog->browser : null;
    }

    /**
     * Get platform from related login log
     */
    public function getPlatformAttribute()
    {
        $loginLog = $this->loginLogs()
            ->where('session_id', $this->id)
            ->first();
            
        return $loginLog ? $loginLog->platform : null;
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserLoginLog extends Model
{
    protected $fillable = [
        'user_id',
        'ip_address',
        'user_agent',
        'session_id',
        'device_type',
        'browser',
        'platform',
        'login_at',
        'logout_at',
        'is_successful',
        'failure_reason',
    ];

    protected $casts = [
        'login_at' => 'datetime',
        'logout_at' => 'datetime',
        'is_successful' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
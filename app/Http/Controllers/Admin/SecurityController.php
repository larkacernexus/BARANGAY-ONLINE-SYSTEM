<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserLoginLog;
use App\Models\AccessLog;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class SecurityController extends Controller
{
    /**
     * Display active user sessions.
     */
    public function sessions(Request $request)
    {
        // Get active sessions from Laravel's sessions table
        $activeSessions = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>', now()->subHours(24)->timestamp) // Last 24 hours
            ->join('users', 'sessions.user_id', '=', 'users.id')
            ->select(
                'sessions.id as session_id',
                'sessions.user_id',
                'sessions.ip_address',
                'sessions.user_agent',
                'sessions.last_activity',
                'users.first_name',
                'users.last_name',
                'users.email',
                'users.username'
            )
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) {
                try {
                    $session->device_info = $this->parseUserAgent($session->user_agent);
                    $session->last_activity_formatted = Carbon::createFromTimestamp($session->last_activity)->diffForHumans();
                    $session->last_activity_full = Carbon::createFromTimestamp($session->last_activity)->format('Y-m-d H:i:s');
                    $session->is_active = $session->last_activity > now()->subMinutes(30)->timestamp;
                    $session->user_full_name = $session->first_name . ' ' . $session->last_name;
                    
                    // Get login log for this session
                    $loginLog = UserLoginLog::where('ip_address', $session->ip_address)
                        ->where('user_id', $session->user_id)
                        ->orderBy('login_at', 'desc')
                        ->first();
                    
                    $session->login_time = $loginLog ? $loginLog->login_at : null;
                    $session->session_duration = $loginLog ? $this->calculateSessionDuration($loginLog->login_at) : 'Unknown';
                    
                } catch (\Exception $e) {
                    $session->device_info = ['browser' => 'Unknown', 'os' => 'Unknown'];
                    $session->last_activity_formatted = 'Unknown';
                }
                
                return $session;
            });
        
        // Get statistics
        $stats = [
            'total_active' => $activeSessions->where('is_active', true)->count(),
            'total_sessions' => $activeSessions->count(),
            'unique_users' => $activeSessions->unique('user_id')->count(),
            'unique_ips' => $activeSessions->unique('ip_address')->count(),
        ];
        
        return Inertia::render('admin/Security/Sessions', [
            'sessions' => $activeSessions,
            'stats' => $stats,
            'filters' => $request->only(['search', 'user_id', 'status']),
        ]);
    }
    
    /**
     * Display security audit dashboard.
     */
    public function securityAudit(Request $request)
    {
        // Date range filters
        $dateFrom = $request->get('date_from', now()->subDays(30)->format('Y-m-d'));
        $dateTo = $request->get('date_to', now()->format('Y-m-d'));
        
        // Get failed login attempts
        $failedLogins = UserLoginLog::where('is_successful', false)
            ->whereBetween('login_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->with('user')
            ->orderBy('login_at', 'desc')
            ->limit(50)
            ->get();
        
        // Get suspicious IPs (more than 5 failed attempts)
        $suspiciousIps = UserLoginLog::select('ip_address')
            ->selectRaw('COUNT(*) as attempt_count')
            ->selectRaw('MAX(login_at) as last_attempt')
            ->selectRaw('MIN(login_at) as first_attempt')
            ->where('is_successful', false)
            ->whereBetween('login_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('ip_address')
            ->having('attempt_count', '>', 5)
            ->orderBy('attempt_count', 'desc')
            ->get()
            ->map(function ($ip) {
                $ip->location = $this->getIpLocation($ip->ip_address);
                return $ip;
            });
        
        // Get password change history
        $passwordChanges = Activity::where(function($query) {
                $query->where('description', 'LIKE', '%password%')
                      ->orWhere('description', 'LIKE', '%Password%');
            })
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->with('causer')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
        
        // Get account lockouts/security events
        $securityEvents = Activity::where(function($query) {
                $query->where('log_name', 'security')
                      ->orWhere('description', 'LIKE', '%lock%')
                      ->orWhere('description', 'LIKE', '%suspend%')
                      ->orWhere('description', 'LIKE', '%disable%');
            })
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->with('causer')
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();
        
        // Get two-factor authentication status
        $twoFactorStats = [
            'enabled' => User::whereNotNull('two_factor_secret')->whereNotNull('two_factor_confirmed_at')->count(),
            'disabled' => User::whereNull('two_factor_secret')->orWhereNull('two_factor_confirmed_at')->count(),
            'total' => User::count(),
        ];
        
        // Calculate statistics
        $stats = [
            'failed_login_attempts' => UserLoginLog::where('is_successful', false)
                ->whereBetween('login_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
                ->count(),
            'successful_logins' => UserLoginLog::where('is_successful', true)
                ->whereBetween('login_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
                ->count(),
            'suspicious_ips' => $suspiciousIps->count(),
            'password_changes' => $passwordChanges->count(),
            'security_events' => $securityEvents->count(),
            'unique_users_logged_in' => UserLoginLog::where('is_successful', true)
                ->whereBetween('login_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
                ->distinct('user_id')
                ->count('user_id'),
            'average_session_duration' => $this->calculateAverageSessionDuration($dateFrom, $dateTo),
        ];
        
        // Get security trends (last 7 days)
        $trends = $this->getSecurityTrends(7);
        
        return Inertia::render('admin/Security/Audit', [
            'failed_logins' => $failedLogins,
            'suspicious_ips' => $suspiciousIps,
            'password_changes' => $passwordChanges,
            'security_events' => $securityEvents,
            'two_factor_stats' => $twoFactorStats,
            'stats' => $stats,
            'trends' => $trends,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
    
    /**
     * Display comprehensive access logs.
     */
    public function accessLogs(Request $request)
    {
        $query = AccessLog::with('user')
            ->orderBy('accessed_at', 'desc');
        
        // Apply filters
        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('url', 'like', "%{$search}%")
                  ->orWhere('route_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }
        
        if ($userId = $request->get('user_id')) {
            $query->where('user_id', $userId);
        }
        
        if ($actionType = $request->get('action_type')) {
            $query->where('action_type', $actionType);
        }
        
        if ($method = $request->get('method')) {
            $query->where('method', $method);
        }
        
        if ($statusCode = $request->get('status_code')) {
            $query->where('status_code', $statusCode);
        }
        
        if ($sensitive = $request->get('sensitive')) {
            $query->where('is_sensitive', $sensitive === 'true');
        }
        
        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('accessed_at', '>=', $dateFrom);
        }
        
        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('accessed_at', '<=', $dateTo);
        }
        
        $perPage = $request->get('per_page', 25);
        $logs = $query->paginate($perPage);
        
        // Get filter options
        $users = User::whereIn('id', AccessLog::distinct('user_id')->pluck('user_id'))
            ->select('id', 'first_name', 'last_name', 'email')
            ->orderBy('first_name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'email' => $user->email,
                ];
            });
        
        $actionTypes = AccessLog::distinct('action_type')
            ->whereNotNull('action_type')
            ->pluck('action_type')
            ->sort()
            ->values();
        
        $methods = AccessLog::distinct('method')
            ->whereNotNull('method')
            ->pluck('method')
            ->sort()
            ->values();
        
        $statusCodes = AccessLog::distinct('status_code')
            ->whereNotNull('status_code')
            ->pluck('status_code')
            ->sort()
            ->values();
        
        // Get statistics
        $stats = [
            'total_logs' => AccessLog::count(),
            'total_users' => AccessLog::distinct('user_id')->count(),
            'sensitive_actions' => AccessLog::where('is_sensitive', true)->count(),
            'avg_response_time' => round(AccessLog::avg('response_time') ?? 0, 2),
            'today_logs' => AccessLog::whereDate('accessed_at', today())->count(),
            'top_users' => AccessLog::select('user_id')
                ->selectRaw('COUNT(*) as access_count')
                ->groupBy('user_id')
                ->orderBy('access_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    $user = User::find($item->user_id);
                    return [
                        'user' => $user ? [
                            'id' => $user->id,
                            'name' => $user->first_name . ' ' . $user->last_name,
                            'email' => $user->email,
                        ] : null,
                        'access_count' => $item->access_count,
                    ];
                }),
        ];
        
        return Inertia::render('admin/Security/AccessLogs', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'user_id', 'action_type', 'method', 'status_code', 'sensitive', 'date_from', 'date_to', 'per_page']),
            'users' => $users,
            'action_types' => $actionTypes,
            'methods' => $methods,
            'status_codes' => $statusCodes,
            'stats' => $stats,
        ]);
    }
    
    /**
     * Force logout a user session.
     */
    public function forceLogout(Request $request, $sessionId)
    {
        try {
            DB::table('sessions')->where('id', $sessionId)->delete();
            
            // Log this action
            activity()
                ->causedBy($request->user())
                ->withProperties(['session_id' => $sessionId])
                ->log('Force logged out user session');
            
            return redirect()->back()->with('success', 'Session terminated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to terminate session: ' . $e->getMessage());
        }
    }
    
    /**
     * Export access logs.
     */
    public function exportAccessLogs(Request $request)
    {
        // Query logic similar to accessLogs method
        $query = AccessLog::with('user')
            ->orderBy('accessed_at', 'desc');
        
        // Apply filters
        if ($dateFrom = $request->get('date_from')) {
            $query->whereDate('accessed_at', '>=', $dateFrom);
        }
        
        if ($dateTo = $request->get('date_to')) {
            $query->whereDate('accessed_at', '<=', $dateTo);
        }
        
        $logs = $query->get();
        
        // Generate CSV
        $csv = "Timestamp,User,IP Address,Method,URL,Route,Action Type,Resource,Status Code,Response Time,Description\n";
        
        foreach ($logs as $log) {
            $csv .= '"' . $log->accessed_at . '",' .
                   '"' . ($log->user ? $log->user->first_name . ' ' . $log->user->last_name : 'System') . '",' .
                   '"' . $log->ip_address . '",' .
                   '"' . $log->method . '",' .
                   '"' . str_replace('"', '""', $log->url) . '",' .
                   '"' . $log->route_name . '",' .
                   '"' . $log->action_type . '",' .
                   '"' . $log->resource_type . ($log->resource_id ? ' #' . $log->resource_id : '') . '",' .
                   '"' . $log->status_code . '",' .
                   '"' . $log->response_time . 'ms",' .
                   '"' . str_replace('"', '""', $log->description ?? '') . '"' . "\n";
        }
        
        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="access_logs_' . date('Y-m-d_H-i-s') . '.csv"',
        ]);
    }
    
    /**
     * Parse user agent string.
     */
    private function parseUserAgent($userAgent): array
    {
        $browser = 'Unknown';
        $os = 'Unknown';
        
        if (!$userAgent) {
            return ['browser' => $browser, 'os' => $os];
        }
        
        $ua = strtolower($userAgent);
        
        // Browser detection
        if (strpos($ua, 'chrome') !== false && strpos($ua, 'edg') === false) {
            $browser = 'Chrome';
        } elseif (strpos($ua, 'firefox') !== false) {
            $browser = 'Firefox';
        } elseif (strpos($ua, 'safari') !== false && strpos($ua, 'chrome') === false) {
            $browser = 'Safari';
        } elseif (strpos($ua, 'edg') !== false) {
            $browser = 'Edge';
        } elseif (strpos($ua, 'opera') !== false) {
            $browser = 'Opera';
        }
        
        // OS detection
        if (strpos($ua, 'windows') !== false) {
            $os = 'Windows';
        } elseif (strpos($ua, 'mac') !== false) {
            $os = 'macOS';
        } elseif (strpos($ua, 'linux') !== false) {
            $os = 'Linux';
        } elseif (strpos($ua, 'android') !== false) {
            $os = 'Android';
        } elseif (strpos($ua, 'iphone') !== false || strpos($ua, 'ipad') !== false) {
            $os = 'iOS';
        }
        
        return ['browser' => $browser, 'os' => $os];
    }
    
    /**
     * Calculate session duration.
     */
    private function calculateSessionDuration($loginTime): string
    {
        $login = Carbon::parse($loginTime);
        $now = now();
        
        $diff = $login->diff($now);
        
        if ($diff->days > 0) {
            return $diff->days . 'd ' . $diff->h . 'h';
        } elseif ($diff->h > 0) {
            return $diff->h . 'h ' . $diff->i . 'm';
        } else {
            return $diff->i . 'm ' . $diff->s . 's';
        }
    }
    
    /**
     * Get IP location (mock implementation).
     */
    private function getIpLocation($ip): array
    {
        if ($ip === '127.0.0.1') {
            return ['country' => 'Local', 'city' => 'Localhost', 'isp' => 'Internal'];
        }
        
        // Mock some common IPs
        $mockLocations = [
            '192.168.' => ['country' => 'Philippines', 'city' => 'Internal Network', 'isp' => 'LAN'],
            '10.' => ['country' => 'Philippines', 'city' => 'Internal Network', 'isp' => 'LAN'],
            '172.16.' => ['country' => 'Philippines', 'city' => 'Internal Network', 'isp' => 'LAN'],
        ];
        
        foreach ($mockLocations as $prefix => $location) {
            if (strpos($ip, $prefix) === 0) {
                return $location;
            }
        }
        
        return ['country' => 'Unknown', 'city' => 'Unknown', 'isp' => 'Unknown'];
    }
    
    /**
     * Calculate average session duration.
     */
    private function calculateAverageSessionDuration($dateFrom, $dateTo): string
    {
        $logins = UserLoginLog::where('is_successful', true)
            ->whereBetween('login_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->whereNotNull('logout_at')
            ->get();
        
        if ($logins->isEmpty()) {
            return '0s';
        }
        
        $totalSeconds = 0;
        $count = 0;
        
        foreach ($logins as $login) {
            $loginTime = Carbon::parse($login->login_at);
            $logoutTime = Carbon::parse($login->logout_at);
            $totalSeconds += $loginTime->diffInSeconds($logoutTime);
            $count++;
        }
        
        $avgSeconds = round($totalSeconds / $count);
        
        if ($avgSeconds < 60) {
            return $avgSeconds . 's';
        } elseif ($avgSeconds < 3600) {
            return round($avgSeconds / 60) . 'm';
        } else {
            return round($avgSeconds / 3600, 1) . 'h';
        }
    }
    
    /**
     * Get security trends for the last N days.
     */
    private function getSecurityTrends($days = 7): array
    {
        $trends = [];
        
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            
            $failedLogins = UserLoginLog::where('is_successful', false)
                ->whereDate('login_at', $date)
                ->count();
            
            $successfulLogins = UserLoginLog::where('is_successful', true)
                ->whereDate('login_at', $date)
                ->count();
            
            $sensitiveActions = AccessLog::where('is_sensitive', true)
                ->whereDate('accessed_at', $date)
                ->count();
            
            $trends[] = [
                'date' => $date,
                'failed_logins' => $failedLogins,
                'successful_logins' => $successfulLogins,
                'sensitive_actions' => $sensitiveActions,
            ];
        }
        
        return $trends;
    }
}
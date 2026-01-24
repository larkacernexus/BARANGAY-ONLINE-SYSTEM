<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserLoginLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class LoginLogController extends Controller
{
    /**
     * Display a listing of login logs.
     */
     public function index(Request $request)
    {
        $filters = $request->only([
            'search',
            'status',
            'user_id',
            'date_from',
            'date_to',
            'browser',
            'device_type',
            'per_page'
        ]);

        $query = UserLoginLog::with('user')
            ->latest('login_at');

        // Apply filters
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                  ->orWhere('browser', 'like', "%{$search}%")
                  ->orWhere('platform', 'like', "%{$search}%")
                  ->orWhere('device_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"]);
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('is_successful', $filters['status'] === 'success');
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('login_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('login_at', '<=', $filters['date_to']);
        }

        if (!empty($filters['browser'])) {
            $query->where('browser', $filters['browser']);
        }

        if (!empty($filters['device_type'])) {
            $query->where('device_type', $filters['device_type']);
        }

        $perPage = $filters['per_page'] ?? 25;
        $logs = $query->paginate($perPage);

        // Get distinct values for filters
        $browsers = UserLoginLog::distinct('browser')
            ->whereNotNull('browser')
            ->pluck('browser')
            ->filter()
            ->values()
            ->toArray();

        $devices = UserLoginLog::distinct('device_type')
            ->whereNotNull('device_type')
            ->pluck('device_type')
            ->filter()
            ->values()
            ->toArray();

        // Get users with their full names
        $users = User::whereIn('id', UserLoginLog::distinct('user_id')->pluck('user_id'))
            ->select('id', 'first_name', 'last_name', 'email', 'username')
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->first_name . ' ' . $user->last_name,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                    'username' => $user->username,
                ];
            })
            ->values()
            ->toArray();

        // Get stats
        $stats = [
            'total_logins' => UserLoginLog::count(),
            'successful_logins' => UserLoginLog::where('is_successful', true)->count(),
            'failed_logins' => UserLoginLog::where('is_successful', false)->count(),
            'active_sessions' => UserLoginLog::whereNull('logout_at')->count(),
            'today_logins' => UserLoginLog::whereDate('login_at', today())->count(),
            'unique_users' => UserLoginLog::distinct('user_id')->count(),
        ];

        // Get recent logins
        $recent_logins = UserLoginLog::with('user')
            ->latest('login_at')
            ->limit(10)
            ->get();

        // Get login summary for status tabs
        $login_summary = [
            ['status' => 'success', 'count' => $stats['successful_logins']],
            ['status' => 'failed', 'count' => $stats['failed_logins']]
        ];

        // Get browser summary
        $browser_summary = UserLoginLog::select('browser')
            ->selectRaw('COUNT(*) as count')
            ->whereNotNull('browser')
            ->groupBy('browser')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($item) => [
                'browser' => $item->browser,
                'count' => $item->count
            ])
            ->toArray();

        // Get device summary
        $device_summary = UserLoginLog::select('device_type')
            ->selectRaw('COUNT(*) as count')
            ->whereNotNull('device_type')
            ->groupBy('device_type')
            ->orderBy('count', 'desc')
            ->get()
            ->map(fn($item) => [
                'device_type' => $item->device_type,
                'count' => $item->count
            ])
            ->toArray();

        // Get top users
        $top_users = UserLoginLog::select('user_id')
            ->selectRaw('COUNT(*) as login_count')
            ->whereNotNull('user_id')
            ->groupBy('user_id')
            ->orderBy('login_count', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                $user = User::select('id', 'first_name', 'last_name', 'email', 'username')
                    ->find($item->user_id);
                
                return [
                    'user' => $user ? [
                        'id' => $user->id,
                        'name' => $user->first_name . ' ' . $user->last_name,
                        'first_name' => $user->first_name,
                        'last_name' => $user->last_name,
                        'email' => $user->email,
                        'username' => $user->username,
                    ] : null,
                    'login_count' => $item->login_count
                ];
            })
            ->toArray();

        return Inertia::render('admin/Reports/LoginLogs', [
            'logs' => $logs,
            'filters' => $filters,
            'browsers' => $browsers,
            'devices' => $devices,
            'users' => $users,
            'stats' => $stats,
            'recent_logins' => $recent_logins,
            'login_summary' => $login_summary,
            'browser_summary' => $browser_summary,
            'device_summary' => $device_summary,
            'top_users' => $top_users,
        ]);
    }
    /**
     * Show individual login log details.
     */
   public function show($id)
    {
        $log = UserLoginLog::with('user')->findOrFail($id);
        
        // Get related logs (same user)
        $related_logs = $log->user_id 
            ? UserLoginLog::with('user')
                ->where('user_id', $log->user_id)
                ->where('id', '!=', $id)
                ->orderBy('login_at', 'desc')
                ->limit(5)
                ->get()
            : collect();

        return Inertia::render('admin/Reports/LoginLogShow', [
            'log' => $log,
            'related_logs' => $related_logs,
        ]);
    }
    /**
     * Delete a login log.
     */
    public function destroy(UserLoginLog $log)
    {
        $log->delete();
        
        return redirect()->route('admin.login-logs.index')
            ->with('success', 'Login log deleted successfully!');
    }
    
    /**
     * Bulk delete login logs.
     */
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'log_ids' => 'required|array',
            'log_ids.*' => 'exists:user_login_logs,id',
        ]);
        
        UserLoginLog::whereIn('id', $request->log_ids)->delete();
        
        return redirect()->back()
            ->with('success', count($request->log_ids) . ' login logs deleted successfully!');
    }
    
    /**
     * Export login logs.
     */
    public function export(Request $request)
    {
        $logs = UserLoginLog::with(['user'])->get();
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="login_logs_' . date('Y-m-d') . '.csv"',
        ];
        
        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');
            
            // Headers
            fputcsv($file, [
                'ID', 'User', 'Email', 'IP Address', 'Browser', 'Device', 'Platform',
                'Login Time', 'Logout Time', 'Duration (min)', 'Status', 'Failure Reason', 'Created At'
            ]);
            
            // Data
            foreach ($logs as $log) {
                $duration = null;
                if ($log->login_at && $log->logout_at) {
                    $duration = Carbon::parse($log->login_at)->diffInMinutes(Carbon::parse($log->logout_at));
                }
                
                fputcsv($file, [
                    $log->id,
                    $log->user ? trim($log->user->first_name . ' ' . $log->user->last_name) : 'N/A',
                    $log->user ? $log->user->email : 'N/A',
                    $log->ip_address,
                    $log->browser,
                    $log->device_type,
                    $log->platform,
                    $log->login_at ? $log->login_at->format('Y-m-d H:i:s') : 'N/A',
                    $log->logout_at ? $log->logout_at->format('Y-m-d H:i:s') : 'N/A',
                    $duration ?? 'N/A',
                    $log->is_successful ? 'Success' : 'Failed',
                    $log->failure_reason ?? 'N/A',
                    $log->created_at->format('Y-m-d H:i:s'),
                ]);
            }
            
            fclose($file);
        };
        
        return response()->stream($callback, 200, $headers);
    }
    
    /**
     * Helper: Format duration in minutes to readable format.
     */
    private function formatDuration(int $minutes): string
    {
        if ($minutes < 60) {
            return $minutes . ' min';
        }
        
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;
        
        if ($remainingMinutes === 0) {
            return $hours . ' hr';
        }
        
        return $hours . ' hr ' . $remainingMinutes . ' min';
    }
    
    /**
     * Helper: Parse user agent string.
     */
    private function parseUserAgent(?string $userAgent): array
    {
        if (!$userAgent) {
            return [
                'browser' => 'Unknown',
                'os' => 'Unknown',
                'device' => 'Desktop',
                'full' => 'Unknown Device',
            ];
        }
        
        $userAgent = strtolower($userAgent);
        
        // Browser detection
        $browser = 'Unknown';
        if (strpos($userAgent, 'chrome') !== false && strpos($userAgent, 'edg') === false && strpos($userAgent, 'opr') === false) {
            $browser = 'Chrome';
        } elseif (strpos($userAgent, 'firefox') !== false) {
            $browser = 'Firefox';
        } elseif (strpos($userAgent, 'safari') !== false && strpos($userAgent, 'chrome') === false) {
            $browser = 'Safari';
        } elseif (strpos($userAgent, 'edg') !== false) {
            $browser = 'Edge';
        } elseif (strpos($userAgent, 'msie') !== false || strpos($userAgent, 'trident') !== false) {
            $browser = 'Internet Explorer';
        } elseif (strpos($userAgent, 'opera') !== false || strpos($userAgent, 'opr') !== false) {
            $browser = 'Opera';
        } elseif (strpos($userAgent, 'brave') !== false) {
            $browser = 'Brave';
        }
        
        // OS detection
        $os = 'Unknown';
        if (strpos($userAgent, 'windows') !== false) {
            $os = 'Windows';
        } elseif (strpos($userAgent, 'mac') !== false || strpos($userAgent, 'macintosh') !== false) {
            $os = 'macOS';
        } elseif (strpos($userAgent, 'linux') !== false) {
            $os = 'Linux';
        } elseif (strpos($userAgent, 'android') !== false) {
            $os = 'Android';
        } elseif (strpos($userAgent, 'iphone') !== false || strpos($userAgent, 'ipad') !== false) {
            $os = 'iOS';
        }
        
        // Device type
        $device = 'Desktop';
        if (strpos($userAgent, 'mobile') !== false) {
            $device = 'Mobile';
        } elseif (strpos($userAgent, 'tablet') !== false || strpos($userAgent, 'ipad') !== false) {
            $device = 'Tablet';
        }
        
        return [
            'browser' => $browser,
            'os' => $os,
            'device' => $device,
            'full' => "$browser on $os ($device)",
        ];
    }
}
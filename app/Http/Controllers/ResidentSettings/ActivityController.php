<?php

namespace App\Http\Controllers\ResidentSettings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\Log;

class ActivityController extends Controller
{
    /**
     * Display activities from your database tables AND Spatie activity log.
     */
    public function index(Request $request)
    {
        Log::channel('daily')->info('========== PAGE LOAD STARTED ==========');
        Log::channel('daily')->info('Timestamp: ' . now()->toDateTimeString());
        Log::channel('daily')->info('URL: ' . $request->fullUrl());
        Log::channel('daily')->info('Method: ' . $request->method());
        
        $user = auth()->user();
        $residentId = $user->resident_id;
        
        Log::channel('daily')->info('User authenticated', [
            'user_id' => $user->id,
            'username' => $user->username,
            'resident_id' => $residentId
        ]);
        
        $type = $request->get('type', 'all');
        $timeRange = $request->get('timeRange', 'all');
        $search = $request->get('search', '');
        $page = $request->get('page', 1);
        
        Log::channel('daily')->info('Filters applied', [
            'type' => $type,
            'timeRange' => $timeRange,
            'search' => $search,
            'page' => $page
        ]);
        
        $activities = $this->getAllActivities($user->id, $residentId, $type, $timeRange, $search);
        $stats = $this->getStats($user->id, $residentId);
        
        $perPage = 20;
        $currentPage = (int)$page;
        $currentItems = $activities->slice(($currentPage - 1) * $perPage, $perPage)->values();
        
        $paginator = new LengthAwarePaginator(
            $currentItems,
            $activities->count(),
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()]
        );
        
        Log::channel('daily')->info('Returning activities: ' . $currentItems->count() . ' items');
        
        return Inertia::render('residentsettings/activities', [
            'activities' => $currentItems,
            'stats' => $stats,
            'filters' => [
                'type' => $type,
                'timeRange' => $timeRange,
                'search' => $search,
            ],
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ],
        ]);
    }
    
    /**
     * Display single activity details
     */
    public function show($id)
    {
        $user = auth()->user();
        $residentId = $user->resident_id;
        
        $parts = explode('_', $id);
        $source = $parts[0];
        $actualId = $parts[1] ?? null;
        
        $activity = null;
        
        switch ($source) {
            case 'login':
                $activity = DB::table('user_login_logs')
                    ->where('id', $actualId)
                    ->where('user_id', $user->id)
                    ->first();
                break;
                
            case 'payment':
                $activity = DB::table('payments')
                    ->where('id', $actualId)
                    ->where(function($q) use ($user, $residentId) {
                        $q->where('recorded_by', $user->id)
                          ->orWhere('payer_id', $residentId);
                    })
                    ->first();
                break;
                
            case 'document':
                $activity = DB::table('resident_documents')
                    ->where('id', $actualId)
                    ->where(function($q) use ($user, $residentId) {
                        $q->where('uploaded_by', $user->id)
                          ->orWhere('resident_id', $residentId);
                    })
                    ->first();
                break;
                
            case 'clearance':
                $activity = DB::table('clearance_requests')
                    ->where('id', $actualId)
                    ->where('resident_id', $residentId)
                    ->first();
                break;
                
            case 'spatie':
                $activity = Activity::where('id', $actualId)
                    ->where('causer_id', $user->id)
                    ->where('causer_type', 'App\Models\User')
                    ->first();
                break;
        }
        
        if (!$activity) {
            return redirect()->back()->with('error', 'Activity not found');
        }
        
        $formattedActivity = $this->formatSingleActivity($activity, $source, $id);
        
        return Inertia::render('residentsettings/activity-details', [
            'activity' => $formattedActivity
        ]);
    }
    
    /**
     * Report an issue with an activity
     */
    public function report(Request $request)
    {
        $request->validate([
            'id' => 'required|string',
            'reason' => 'sometimes|string|max:500'
        ]);
        
        $user = auth()->user();
        
        Log::channel('daily')->warning('Activity reported', [
            'user_id' => $user->id,
            'activity_id' => $request->id,
            'reason' => $request->reason ?? 'No reason provided'
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Thank you for your report. We will investigate this activity.'
        ]);
    }
    
    /**
 * Export activities to CSV
 */
public function export(Request $request)
{
    $request->validate([
        'format' => 'required|in:csv,json'
    ]);
    
    $user = auth()->user();
    $residentId = $user->resident_id;
    $type = $request->input('filters.type', 'all');
    $timeRange = $request->input('filters.timeRange', 'all');
    $format = $request->input('format', 'csv'); // Get format from input, not property
    
    $activities = $this->getAllActivities($user->id, $residentId, $type, $timeRange, '');
    
    if ($format === 'json') {
        return response()->json([
            'activities' => $activities,
            'exported_at' => now()->toDateTimeString(),
            'total' => $activities->count()
        ]);
    }
    
    return $this->exportToCsv($activities);
}
    
    /**
     * Get ALL activities from database tables
     */
    private function getAllActivities($userId, $residentId, $type, $timeRange, $search): Collection
    {
        $activities = collect();
        
        if ($type === 'all' || $type === 'login') {
            $loginActivities = $this->getLoginActivities($userId, $timeRange, $search);
            $activities = $activities->concat($loginActivities);
        }
        
        if ($type === 'all' || $type === 'payment') {
            $paymentActivities = $this->getPaymentActivities($userId, $residentId, $timeRange, $search);
            $activities = $activities->concat($paymentActivities);
        }
        
        if ($type === 'all' || $type === 'document') {
            $documentActivities = $this->getDocumentActivities($userId, $residentId, $timeRange, $search);
            $activities = $activities->concat($documentActivities);
        }
        
        if ($type === 'all' || $type === 'clearance') {
            $clearanceActivities = $this->getClearanceActivities($residentId, $timeRange, $search);
            $activities = $activities->concat($clearanceActivities);
        }
        
        if ($type === 'all' || in_array($type, ['profile', 'security', 'settings', 'audit'])) {
            $spatieActivities = $this->getSpatieActivities($userId, $type, $timeRange, $search);
            $activities = $activities->concat($spatieActivities);
        }
        
        return $activities->sortByDesc('timestamp')->values();
    }
    
    /**
     * Get login activities
     */
    private function getLoginActivities($userId, $timeRange, $search): Collection
    {
        $query = DB::table('user_login_logs')
            ->where('user_id', $userId)
            ->orderBy('login_at', 'desc');
        
        if ($timeRange !== 'all') {
            $this->applyDateFilter($query, $timeRange, 'login_at');
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                  ->orWhere('user_agent', 'like', "%{$search}%")
                  ->orWhere('device_type', 'like', "%{$search}%");
            });
        }
        
        return $query->get()->map(function($log) {
            $deviceInfo = $this->parseUserAgent($log->user_agent ?? '');
            $isSuccessful = property_exists($log, 'is_successful') ? (int)$log->is_successful === 1 : true;
            $hasLogout = property_exists($log, 'logout_at') && !is_null($log->logout_at);
            
            $action = $hasLogout ? 'Logged out' : ($isSuccessful ? 'Logged in' : 'Failed login attempt');
            
            if ($hasLogout) {
                $description = "Logged out from system";
            } elseif ($isSuccessful) {
                $description = "Successfully logged in from {$deviceInfo['browser']} on {$deviceInfo['os']}";
            } else {
                $reason = property_exists($log, 'failure_reason') && $log->failure_reason 
                    ? ": {$log->failure_reason}" : '';
                $description = "Failed login attempt" . $reason;
            }
            
            return [
                'id' => 'login_' . $log->id,
                'type' => $hasLogout ? 'logout' : 'login',
                'action' => $action,
                'description' => $description,
                'timestamp' => $hasLogout ? $log->logout_at : $log->login_at,
                'status' => $isSuccessful ? 'success' : 'failed',
                'ip_address' => property_exists($log, 'ip_address') ? $log->ip_address : null,
                'device' => $deviceInfo['browser'] . ' / ' . $deviceInfo['os'],
                'location' => $this->getIpLocation($log->ip_address ?? null),
                'resource_type' => 'session',
                'resource_id' => null,
                'metadata' => [
                    'browser' => $deviceInfo['browser'],
                    'os' => $deviceInfo['os'],
                ],
            ];
        });
    }
    
    /**
     * Get payment activities
     */
    private function getPaymentActivities($userId, $residentId, $timeRange, $search): Collection
    {
        $query = DB::table('payments')
            ->where(function($q) use ($userId, $residentId) {
                $q->where('recorded_by', $userId)
                  ->orWhere('payer_id', $residentId);
            })
            ->orderBy('created_at', 'desc');
        
        if ($timeRange !== 'all') {
            $this->applyDateFilter($query, $timeRange, 'created_at');
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%");
            });
        }
        
        return $query->get()->map(function($payment) {
            $statusMap = [
                'completed' => 'success',
                'pending' => 'pending',
                'failed' => 'failed',
                'refunded' => 'success',
                'cancelled' => 'failed'
            ];
            
            $actionMap = [
                'completed' => 'Payment completed',
                'pending' => 'Payment pending',
                'failed' => 'Payment failed',
                'refunded' => 'Payment refunded',
                'cancelled' => 'Payment cancelled'
            ];
            
            $status = $statusMap[$payment->status] ?? 'pending';
            $action = $actionMap[$payment->status] ?? 'Payment ' . ucfirst($payment->status);
            $amount = property_exists($payment, 'total_amount') ? (float)$payment->total_amount : 0;
            $purpose = property_exists($payment, 'purpose') && $payment->purpose ? $payment->purpose : 'Payment';
            
            return [
                'id' => 'payment_' . $payment->id,
                'type' => 'payment',
                'action' => $action,
                'description' => $purpose . ' - ₱' . number_format($amount, 2),
                'timestamp' => property_exists($payment, 'payment_date') && $payment->payment_date ? $payment->payment_date : $payment->created_at,
                'status' => $status,
                'ip_address' => null,
                'device' => (property_exists($payment, 'collection_type') && $payment->collection_type === 'online') ? 'Online' : 'Barangay Hall',
                'location' => null,
                'resource_type' => 'payment',
                'resource_id' => property_exists($payment, 'or_number') && $payment->or_number ? $payment->or_number : null,
                'metadata' => [
                    'amount' => $amount,
                    'or_number' => $payment->or_number ?? null,
                ],
            ];
        });
    }
    
    /**
     * Get document activities
     */
    private function getDocumentActivities($userId, $residentId, $timeRange, $search): Collection
    {
        $query = DB::table('resident_documents')
            ->where(function($q) use ($userId, $residentId) {
                $q->where('uploaded_by', $userId)
                  ->orWhere('resident_id', $residentId);
            })
            ->orderBy('created_at', 'desc');
        
        if ($timeRange !== 'all') {
            $this->applyDateFilter($query, $timeRange, 'created_at');
        }
        
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }
        
        return $query->get()->map(function($doc) {
            $isUpdate = property_exists($doc, 'updated_at') && $doc->updated_at && 
                        property_exists($doc, 'created_at') && $doc->created_at != $doc->updated_at;
            
            return [
                'id' => 'document_' . $doc->id,
                'type' => 'document',
                'action' => $isUpdate ? 'Document updated' : 'Document uploaded',
                'description' => $doc->name,
                'timestamp' => property_exists($doc, 'updated_at') && $doc->updated_at ? $doc->updated_at : $doc->created_at,
                'status' => 'success',
                'ip_address' => null,
                'device' => 'System',
                'location' => null,
                'resource_type' => 'document',
                'resource_id' => property_exists($doc, 'reference_number') && $doc->reference_number ? $doc->reference_number : $doc->id,
                'metadata' => [],
            ];
        });
    }
    
    /**
     * Get clearance activities
     */
    private function getClearanceActivities($residentId, $timeRange, $search): Collection
    {
        $query = DB::table('clearance_requests')
            ->where('resident_id', $residentId)
            ->orderBy('created_at', 'desc');
        
        if ($timeRange !== 'all') {
            $this->applyDateFilter($query, $timeRange, 'created_at');
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%");
            });
        }
        
        return $query->get()->map(function($request) {
            $statusMap = [
                'paid' => 'success',
                'completed' => 'success',
                'issued' => 'success',
                'approved' => 'success',
                'pending' => 'pending',
                'rejected' => 'failed',
                'cancelled' => 'failed'
            ];
            
            $status = $statusMap[$request->status] ?? 'pending';
            $purpose = property_exists($request, 'purpose') && $request->purpose ? $request->purpose : 'Clearance';
            
            $referenceNumber = null;
            if (property_exists($request, 'clearance_number') && $request->clearance_number) {
                $referenceNumber = $request->clearance_number;
            } elseif (property_exists($request, 'reference_number') && $request->reference_number) {
                $referenceNumber = $request->reference_number;
            }
            
            return [
                'id' => 'clearance_' . $request->id,
                'type' => 'clearance',
                'action' => 'Clearance ' . ucfirst($request->status),
                'description' => "Clearance request for: " . $purpose,
                'timestamp' => (property_exists($request, 'issue_date') && $request->issue_date) 
                    ? $request->issue_date 
                    : (property_exists($request, 'updated_at') && $request->updated_at ? $request->updated_at : $request->created_at),
                'status' => $status,
                'ip_address' => null,
                'device' => 'System',
                'location' => null,
                'resource_type' => 'clearance',
                'resource_id' => $referenceNumber,
                'metadata' => [
                    'purpose' => $purpose,
                ],
            ];
        });
    }
    
    /**
     * Get Spatie activities
     */
    private function getSpatieActivities($userId, $type, $timeRange, $search): Collection
    {
        $query = Activity::query()
            ->where('causer_id', $userId)
            ->where('causer_type', 'App\Models\User')
            ->orderBy('created_at', 'desc');
        
        if ($type !== 'all') {
            switch ($type) {
                case 'profile':
                    $query->whereIn('log_name', ['profile', 'user']);
                    break;
                case 'security':
                    $query->whereIn('log_name', ['auth', 'authentication', 'security']);
                    break;
                case 'settings':
                    $query->whereIn('log_name', ['settings', 'preferences']);
                    break;
                case 'audit':
                    $query->where('log_name', 'audit');
                    break;
            }
        }
        
        if ($timeRange !== 'all') {
            $this->applySpatieDateFilter($query, $timeRange);
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('properties', 'like', "%{$search}%");
            });
        }
        
        return $query->get()->map(function($activity) {
            $properties = $activity->properties ?? [];
            $event = $activity->event ?? 'updated';
            $type = $this->mapSpatieLogToType($activity->log_name ?? '');
            $ipAddress = $properties['ip_address'] ?? null;
            $userAgent = $properties['user_agent'] ?? null;
            $deviceInfo = $this->parseUserAgent($userAgent ?? '');
            
            return [
                'id' => 'spatie_' . $activity->id,
                'type' => $type,
                'action' => $this->formatSpatieAction($activity->log_name ?? '', $event),
                'description' => $activity->description ?? ucfirst($event) . " " . str_replace(['-', '_'], ' ', $activity->log_name ?? 'record'),
                'timestamp' => $activity->created_at->toISOString(),
                'status' => $event === 'failed' ? 'failed' : 'success',
                'ip_address' => $ipAddress,
                'device' => $deviceInfo['browser'] . ' / ' . $deviceInfo['os'],
                'location' => $this->getIpLocation($ipAddress),
                'resource_type' => $activity->log_name,
                'resource_id' => $this->extractResourceId($properties),
                'metadata' => [
                    'event' => $event,
                    'log_name' => $activity->log_name,
                ],
            ];
        });
    }
    
    /**
     * Format single activity for display
     */
    private function formatSingleActivity($activity, $source, $fullId)
    {
        switch ($source) {
            case 'login':
                $deviceInfo = $this->parseUserAgent($activity->user_agent ?? '');
                return [
                    'id' => $fullId,
                    'type' => $activity->logout_at ? 'logout' : 'login',
                    'action' => $activity->logout_at ? 'Logged out' : ($activity->is_successful ? 'Logged in' : 'Failed login'),
                    'description' => $activity->logout_at 
                        ? 'Logged out from system'
                        : ($activity->is_successful 
                            ? "Login from {$deviceInfo['browser']} on {$deviceInfo['os']}"
                            : "Failed login attempt" . ($activity->failure_reason ? ": {$activity->failure_reason}" : '')),
                    'timestamp' => $activity->logout_at ?? $activity->login_at,
                    'status' => $activity->is_successful ? 'success' : 'failed',
                    'ip_address' => $activity->ip_address,
                    'device' => "{$deviceInfo['browser']} / {$deviceInfo['os']}",
                    'location' => $this->getIpLocation($activity->ip_address),
                    'resource_type' => 'session',
                    'resource_id' => null,
                    'metadata' => [
                        'browser' => $deviceInfo['browser'],
                        'os' => $deviceInfo['os'],
                        'user_agent' => $activity->user_agent,
                        'session_id' => $activity->session_id,
                    ],
                ];
                
            case 'payment':
                return [
                    'id' => $fullId,
                    'type' => 'payment',
                    'action' => 'Payment ' . ucfirst($activity->status),
                    'description' => $activity->purpose ?? "Payment of ₱" . number_format($activity->total_amount, 2),
                    'timestamp' => $activity->payment_date ?? $activity->created_at,
                    'status' => $activity->status === 'completed' ? 'success' : ($activity->status === 'pending' ? 'pending' : 'failed'),
                    'ip_address' => null,
                    'device' => $activity->collection_type === 'online' ? 'Online' : 'Barangay Hall',
                    'location' => null,
                    'resource_type' => 'payment',
                    'resource_id' => $activity->or_number,
                    'metadata' => [
                        'or_number' => $activity->or_number,
                        'amount' => $activity->total_amount,
                        'payment_method' => $activity->payment_method,
                        'reference_number' => $activity->reference_number,
                    ],
                ];
                
            case 'document':
                return [
                    'id' => $fullId,
                    'type' => 'document',
                    'action' => $activity->created_at == $activity->updated_at ? 'Document uploaded' : 'Document updated',
                    'description' => $activity->name,
                    'timestamp' => $activity->updated_at ?? $activity->created_at,
                    'status' => 'success',
                    'ip_address' => null,
                    'device' => 'System',
                    'location' => null,
                    'resource_type' => 'document',
                    'resource_id' => $activity->reference_number ?? $activity->id,
                    'metadata' => [
                        'file_name' => $activity->file_name,
                        'file_size' => $activity->file_size_human ?? $activity->file_size,
                        'mime_type' => $activity->mime_type,
                    ],
                ];
                
            case 'clearance':
                return [
                    'id' => $fullId,
                    'type' => 'clearance',
                    'action' => 'Clearance ' . ucfirst($activity->status),
                    'description' => "Clearance request for: " . ($activity->purpose ?? 'General purposes'),
                    'timestamp' => $activity->issue_date ?? $activity->updated_at ?? $activity->created_at,
                    'status' => in_array($activity->status, ['paid', 'completed', 'issued', 'approved']) ? 'success' : 'pending',
                    'ip_address' => null,
                    'device' => 'System',
                    'location' => null,
                    'resource_type' => 'clearance',
                    'resource_id' => $activity->clearance_number ?? $activity->reference_number,
                    'metadata' => [
                        'purpose' => $activity->purpose,
                        'reference_number' => $activity->reference_number,
                        'fee_amount' => $activity->fee_amount,
                    ],
                ];
                
            case 'spatie':
                $properties = $activity->properties ?? [];
                return [
                    'id' => $fullId,
                    'type' => $this->mapSpatieLogToType($activity->log_name ?? ''),
                    'action' => $this->formatSpatieAction($activity->log_name ?? '', $activity->event ?? ''),
                    'description' => $activity->description ?? 'System activity',
                    'timestamp' => $activity->created_at->toISOString(),
                    'status' => $activity->event === 'failed' ? 'failed' : 'success',
                    'ip_address' => $properties['ip_address'] ?? null,
                    'device' => isset($properties['user_agent']) ? $this->parseUserAgent($properties['user_agent'])['browser'] . ' / ' . $this->parseUserAgent($properties['user_agent'])['os'] : 'System',
                    'location' => $this->getIpLocation($properties['ip_address'] ?? null),
                    'resource_type' => $activity->log_name,
                    'resource_id' => $this->extractResourceId($properties),
                    'metadata' => $properties,
                ];
                
            default:
                return [];
        }
    }
    
    /**
     * Get statistics
     */
    private function getStats($userId, $residentId): array
    {
        $todayStart = now()->startOfDay();
        $todayEnd = now()->endOfDay();
        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();
        
        // Login stats
        $totalLogins = DB::table('user_login_logs')->where('user_id', $userId)->count();
        $successfulLogins = DB::table('user_login_logs')->where('user_id', $userId)->where('is_successful', true)->count();
        $failedLogins = DB::table('user_login_logs')->where('user_id', $userId)->where('is_successful', false)->count();
        
        $todayLogins = DB::table('user_login_logs')
            ->where('user_id', $userId)
            ->whereBetween('login_at', [$todayStart, $todayEnd])
            ->count();
        
        $weekLogins = DB::table('user_login_logs')
            ->where('user_id', $userId)
            ->whereBetween('login_at', [$weekStart, $weekEnd])
            ->count();
        
        $monthLogins = DB::table('user_login_logs')
            ->where('user_id', $userId)
            ->whereBetween('login_at', [$monthStart, $monthEnd])
            ->count();
        
        // Payment stats
        $totalPayments = DB::table('payments')
            ->where(function($q) use ($userId, $residentId) {
                $q->where('recorded_by', $userId)->orWhere('payer_id', $residentId);
            })->count();
        
        $successfulPayments = DB::table('payments')
            ->where(function($q) use ($userId, $residentId) {
                $q->where('recorded_by', $userId)->orWhere('payer_id', $residentId);
            })->where('status', 'completed')->count();
        
        $pendingPayments = DB::table('payments')
            ->where(function($q) use ($userId, $residentId) {
                $q->where('recorded_by', $userId)->orWhere('payer_id', $residentId);
            })->where('status', 'pending')->count();
        
        $failedPayments = DB::table('payments')
            ->where(function($q) use ($userId, $residentId) {
                $q->where('recorded_by', $userId)->orWhere('payer_id', $residentId);
            })->whereIn('status', ['failed', 'cancelled'])->count();
        
        // Document stats
        $totalDocuments = DB::table('resident_documents')
            ->where(function($q) use ($userId, $residentId) {
                $q->where('uploaded_by', $userId)->orWhere('resident_id', $residentId);
            })->count();
        
        // Clearance stats
        $totalClearances = DB::table('clearance_requests')
            ->where('resident_id', $residentId)
            ->count();
        
        $successfulClearances = DB::table('clearance_requests')
            ->where('resident_id', $residentId)
            ->whereIn('status', ['paid', 'completed', 'issued', 'approved'])
            ->count();
        
        $pendingClearances = DB::table('clearance_requests')
            ->where('resident_id', $residentId)
            ->where('status', 'pending')
            ->count();
        
        // Spatie stats
        $spatieProfile = Activity::where('causer_id', $userId)
            ->whereIn('log_name', ['profile', 'user'])->count();
        
        $spatieSecurity = Activity::where('causer_id', $userId)
            ->whereIn('log_name', ['auth', 'authentication', 'security'])->count();
        
        $spatieSettings = Activity::where('causer_id', $userId)
            ->whereIn('log_name', ['settings', 'preferences'])->count();
        
        $spatieAudit = Activity::where('causer_id', $userId)
            ->where('log_name', 'audit')->count();
        
        $totalSpatie = $spatieProfile + $spatieSecurity + $spatieSettings + $spatieAudit;
        
        return [
            'total' => $totalLogins + $totalPayments + $totalDocuments + $totalClearances + $totalSpatie,
            'successful' => $successfulLogins + $successfulPayments + $totalDocuments + $successfulClearances + $totalSpatie,
            'pending' => $pendingPayments + $pendingClearances,
            'failed' => $failedLogins + $failedPayments,
            'logins' => $totalLogins,
            'loginSuccess' => $successfulLogins,
            'loginFailed' => $failedLogins,
            'payments' => $totalPayments,
            'paymentSuccess' => $successfulPayments,
            'paymentPending' => $pendingPayments,
            'paymentFailed' => $failedPayments,
            'documents' => $totalDocuments,
            'audits' => $spatieAudit,
            'access' => 0,
            'clearances' => $totalClearances,
            'reports' => 0,
            'announcements' => 0,
            'profile' => $spatieProfile,
            'security' => $spatieSecurity,
            'settings' => $spatieSettings,
            'today' => $todayLogins,
            'thisWeek' => $weekLogins,
            'thisMonth' => $monthLogins,
        ];
    }
    
    /**
     * Apply date filter to query builder
     */
    private function applyDateFilter($query, $timeRange, $column)
    {
        $now = now();
        
        switch ($timeRange) {
            case 'today':
                $query->where($column, '>=', $now->copy()->startOfDay());
                break;
            case 'week':
                $query->where($column, '>=', $now->copy()->startOfWeek());
                break;
            case 'month':
                $query->where($column, '>=', $now->copy()->startOfMonth());
                break;
            case 'year':
                $query->where($column, '>=', $now->copy()->startOfYear());
                break;
        }
    }
    
    /**
     * Apply date filter to Spatie query
     */
    private function applySpatieDateFilter($query, $timeRange)
    {
        $now = now();
        
        switch ($timeRange) {
            case 'today':
                $query->whereDate('created_at', '>=', $now->copy()->startOfDay());
                break;
            case 'week':
                $query->whereDate('created_at', '>=', $now->copy()->startOfWeek());
                break;
            case 'month':
                $query->whereDate('created_at', '>=', $now->copy()->startOfMonth());
                break;
            case 'year':
                $query->whereDate('created_at', '>=', $now->copy()->startOfYear());
                break;
        }
    }
    
    /**
     * Parse user agent string
     */
    private function parseUserAgent($userAgent): array
    {
        $browser = 'Unknown';
        $os = 'Unknown';
        $device = 'Desktop';
        
        if (!$userAgent) {
            return ['browser' => $browser, 'os' => $os, 'device' => $device];
        }
        
        $ua = strtolower($userAgent);
        
        if (strpos($ua, 'chrome') !== false && strpos($ua, 'edg') === false) $browser = 'Chrome';
        elseif (strpos($ua, 'firefox') !== false) $browser = 'Firefox';
        elseif (strpos($ua, 'safari') !== false && strpos($ua, 'chrome') === false) $browser = 'Safari';
        elseif (strpos($ua, 'edg') !== false) $browser = 'Edge';
        elseif (strpos($ua, 'opera') !== false) $browser = 'Opera';
        
        if (strpos($ua, 'windows') !== false) $os = 'Windows';
        elseif (strpos($ua, 'mac') !== false) $os = 'macOS';
        elseif (strpos($ua, 'linux') !== false) $os = 'Linux';
        elseif (strpos($ua, 'android') !== false) { $os = 'Android'; $device = 'Mobile'; }
        elseif (strpos($ua, 'iphone') !== false) { $os = 'iOS'; $device = 'Mobile'; }
        elseif (strpos($ua, 'ipad') !== false) { $os = 'iOS'; $device = 'Tablet'; }
        
        return ['browser' => $browser, 'os' => $os, 'device' => $device];
    }
    
    /**
     * Get IP location (mock)
     */
    private function getIpLocation($ip): ?string
    {
        if (!$ip || $ip === '127.0.0.1' || $ip === '::1') return null;
        
        $mockLocations = [
            '192.168.' => 'Local Network',
            '10.0.' => 'Local Network',
            '172.16.' => 'Local Network',
            '203.177.' => 'Philippines',
        ];
        
        foreach ($mockLocations as $prefix => $location) {
            if (strpos($ip, $prefix) === 0) return $location;
        }
        
        return null;
    }
    
    /**
     * Map Spatie log name to frontend type
     */
    private function mapSpatieLogToType($logName): string
    {
        $typeMap = [
            'auth' => 'security', 'authentication' => 'security', 'security' => 'security',
            'profile' => 'profile', 'user' => 'profile',
            'settings' => 'settings', 'preferences' => 'settings',
            'audit' => 'audit',
        ];
        
        return $typeMap[$logName] ?? 'audit';
    }
    
    /**
     * Format Spatie action for display
     */
    private function formatSpatieAction($logName, $event): string
    {
        $actionMap = [
            'login' => 'Logged In', 'logout' => 'Logged Out',
            'created' => 'Created', 'updated' => 'Updated',
            'deleted' => 'Deleted', 'viewed' => 'Viewed',
        ];
        
        $action = $actionMap[$event] ?? ucfirst($event);
        $context = ucfirst(str_replace(['-', '_'], ' ', $logName));
        
        return "$context $action";
    }
    
    /**
     * Extract resource ID from properties
     */
    private function extractResourceId($properties): ?string
    {
        $attributes = $properties['attributes'] ?? $properties['changes'] ?? [];
        $idFields = ['id', 'or_number', 'reference_number', 'clearance_number', 'document_id', 'payment_id'];
        
        foreach ($idFields as $field) {
            if (isset($attributes[$field])) return (string)$attributes[$field];
        }
        
        return null;
    }
    
    /**
     * Export to CSV
     */
    private function exportToCsv(Collection $activities)
    {
        $filename = 'activities-' . now()->format('Y-m-d-His') . '.csv';
        $handle = fopen('php://temp', 'w+');
        
        fputs($handle, "\xEF\xBB\xBF");
        
        fputcsv($handle, ['ID', 'Type', 'Action', 'Description', 'Date & Time', 'Status', 'IP Address', 'Device', 'Reference ID']);
        
        foreach ($activities as $activity) {
            fputcsv($handle, [
                $activity['id'], $activity['type'], $activity['action'], $activity['description'],
                $activity['timestamp'], $activity['status'] ?? 'success', $activity['ip_address'] ?? '',
                $activity['device'] ?? '', $activity['resource_id'] ?? '',
            ]);
        }
        
        rewind($handle);
        $content = stream_get_contents($handle);
        fclose($handle);
        
        return response($content)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
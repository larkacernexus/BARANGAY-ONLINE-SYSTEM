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
        // LOG 1: Page load started
        Log::channel('daily')->info('========== PAGE LOAD STARTED ==========');
        Log::channel('daily')->info('Timestamp: ' . now()->toDateTimeString());
        Log::channel('daily')->info('URL: ' . $request->fullUrl());
        Log::channel('daily')->info('Method: ' . $request->method());
        Log::channel('daily')->info('IP: ' . $request->ip());
        Log::channel('daily')->info('User Agent: ' . $request->userAgent());
        
        // LOG 2: User info
        $user = auth()->user();
        $residentId = $user->resident_id;
        
        Log::channel('daily')->info('User authenticated', [
            'user_id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'resident_id' => $residentId
        ]);
        
        // LOG 3: Request parameters
        Log::channel('daily')->info('Request parameters', [
            'all' => $request->all(),
            'query' => $request->query(),
            'input' => $request->input()
        ]);
        
        // Get filters
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
        
        // LOG 4: Check if tables exist
        Log::channel('daily')->info('Checking if tables exist:');
        $tables = [
            'user_login_logs' => DB::getSchemaBuilder()->hasTable('user_login_logs'),
            'payments' => DB::getSchemaBuilder()->hasTable('payments'),
            'resident_documents' => DB::getSchemaBuilder()->hasTable('resident_documents'),
            'clearance_requests' => DB::getSchemaBuilder()->hasTable('clearance_requests'),
            'activity_log' => DB::getSchemaBuilder()->hasTable('activity_log'),
        ];
        Log::channel('daily')->info('Tables exist', $tables);
        
        // LOG 5: Raw counts before any filtering
        Log::channel('daily')->info('RAW COUNTS (no filters):');
        
        $rawLoginCount = DB::table('user_login_logs')->where('user_id', $user->id)->count();
        Log::channel('daily')->info('user_login_logs count for user ' . $user->id . ': ' . $rawLoginCount);
        
        if ($rawLoginCount > 0) {
            $sampleLogin = DB::table('user_login_logs')->where('user_id', $user->id)->first();
            Log::channel('daily')->info('Sample login record:', (array)$sampleLogin);
        }
        
        $rawPaymentCount = DB::table('payments')
            ->where(function($q) use ($user, $residentId) {
                $q->where('recorded_by', $user->id)->orWhere('payer_id', $residentId);
            })->count();
        Log::channel('daily')->info('payments count for user ' . $user->id . '/resident ' . $residentId . ': ' . $rawPaymentCount);
        
        if ($rawPaymentCount > 0) {
            $samplePayment = DB::table('payments')
                ->where(function($q) use ($user, $residentId) {
                    $q->where('recorded_by', $user->id)->orWhere('payer_id', $residentId);
                })->first();
            Log::channel('daily')->info('Sample payment record:', (array)$samplePayment);
        }
        
        $rawDocumentCount = DB::table('resident_documents')
            ->where(function($q) use ($user, $residentId) {
                $q->where('uploaded_by', $user->id)->orWhere('resident_id', $residentId);
            })->count();
        Log::channel('daily')->info('resident_documents count: ' . $rawDocumentCount);
        
        if ($rawDocumentCount > 0) {
            $sampleDoc = DB::table('resident_documents')
                ->where(function($q) use ($user, $residentId) {
                    $q->where('uploaded_by', $user->id)->orWhere('resident_id', $residentId);
                })->first();
            Log::channel('daily')->info('Sample document record:', (array)$sampleDoc);
        }
        
        $rawClearanceCount = DB::table('clearance_requests')
            ->where('resident_id', $residentId)->count();
        Log::channel('daily')->info('clearance_requests count: ' . $rawClearanceCount);
        
        if ($rawClearanceCount > 0) {
            $sampleClearance = DB::table('clearance_requests')
                ->where('resident_id', $residentId)->first();
            Log::channel('daily')->info('Sample clearance record:', (array)$sampleClearance);
        }
        
        $rawSpatieCount = Activity::where('causer_id', $user->id)
            ->where('causer_type', 'App\Models\User')->count();
        Log::channel('daily')->info('spatie activity_log count: ' . $rawSpatieCount);
        
        if ($rawSpatieCount > 0) {
            $sampleSpatie = Activity::where('causer_id', $user->id)
                ->where('causer_type', 'App\Models\User')->first();
            Log::channel('daily')->info('Sample spatie record:', $sampleSpatie ? $sampleSpatie->toArray() : []);
        }
        
        $totalRaw = $rawLoginCount + $rawPaymentCount + $rawDocumentCount + $rawClearanceCount + $rawSpatieCount;
        Log::channel('daily')->info('TOTAL RAW RECORDS AVAILABLE: ' . $totalRaw);
        
        // LOG 6: Now get filtered activities
        Log::channel('daily')->info('Calling getAllActivities with filters...');
        $activities = $this->getAllActivities($user->id, $residentId, $type, $timeRange, $search);
        
        Log::channel('daily')->info('getAllActivities returned', [
            'count' => $activities->count(),
            'isEmpty' => $activities->isEmpty() ? 'YES' : 'NO'
        ]);
        
        // LOG 7: If activities found, show first few
        if ($activities->isNotEmpty()) {
            Log::channel('daily')->info('First 3 activities:');
            $activities->take(3)->each(function($activity, $index) {
                Log::channel('daily')->info('Activity #' . ($index + 1), $activity);
            });
        } else {
            Log::channel('daily')->warning('NO ACTIVITIES FOUND after filtering!');
            Log::channel('daily')->info('This is why frontend shows mock data - empty collection');
        }
        
        // LOG 8: Get stats
        Log::channel('daily')->info('Calling getStats...');
        $stats = $this->getStats($user->id, $residentId);
        Log::channel('daily')->info('getStats returned:', $stats);
        
        // Manual pagination
        $perPage = 20;
        $currentPage = (int)$page;
        $currentItems = $activities->slice(($currentPage - 1) * $perPage, $perPage)->values();
        
        Log::channel('daily')->info('Pagination', [
            'total' => $activities->count(),
            'perPage' => $perPage,
            'currentPage' => $currentPage,
            'itemsOnCurrentPage' => $currentItems->count()
        ]);
        
        $paginator = new LengthAwarePaginator(
            $currentItems,
            $activities->count(),
            $perPage,
            $currentPage,
            ['path' => $request->url(), 'query' => $request->query()]
        );
        
        Log::channel('daily')->info('========== PAGE LOAD COMPLETED ==========');
        
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
     * Get REAL activities from database tables
     */
    private function getAllActivities($userId, $residentId, $type, $timeRange, $search): Collection
    {
        Log::channel('daily')->info('  --- INSIDE getAllActivities ---');
        Log::channel('daily')->info('  Parameters:', [
            'userId' => $userId,
            'residentId' => $residentId,
            'type' => $type,
            'timeRange' => $timeRange,
            'search' => $search
        ]);
        
        $activities = collect();
        
        // 1. LOGIN ACTIVITIES
        if ($type === 'all' || $type === 'login') {
            Log::channel('daily')->info('  Fetching login activities...');
            $loginActivities = $this->getLoginActivities($userId, $timeRange, $search);
            Log::channel('daily')->info('  Login activities returned: ' . $loginActivities->count());
            $activities = $activities->concat($loginActivities);
        }
        
        // 2. PAYMENT ACTIVITIES
        if ($type === 'all' || $type === 'payment') {
            Log::channel('daily')->info('  Fetching payment activities...');
            $paymentActivities = $this->getPaymentActivities($userId, $residentId, $timeRange, $search);
            Log::channel('daily')->info('  Payment activities returned: ' . $paymentActivities->count());
            $activities = $activities->concat($paymentActivities);
        }
        
        // 3. DOCUMENT ACTIVITIES
        if ($type === 'all' || $type === 'document') {
            Log::channel('daily')->info('  Fetching document activities...');
            $documentActivities = $this->getDocumentActivities($userId, $residentId, $timeRange, $search);
            Log::channel('daily')->info('  Document activities returned: ' . $documentActivities->count());
            $activities = $activities->concat($documentActivities);
        }
        
        // 4. CLEARANCE ACTIVITIES
        if ($type === 'all' || $type === 'clearance') {
            Log::channel('daily')->info('  Fetching clearance activities...');
            $clearanceActivities = $this->getClearanceActivities($residentId, $timeRange, $search);
            Log::channel('daily')->info('  Clearance activities returned: ' . $clearanceActivities->count());
            $activities = $activities->concat($clearanceActivities);
        }
        
        // 5. SPATIE ACTIVITIES
        if ($type === 'all' || in_array($type, ['profile', 'security', 'settings', 'audit'])) {
            Log::channel('daily')->info('  Fetching spatie activities...');
            $spatieActivities = $this->getSpatieActivities($userId, $type, $timeRange, $search);
            Log::channel('daily')->info('  Spatie activities returned: ' . $spatieActivities->count());
            $activities = $activities->concat($spatieActivities);
        }
        
        $totalCount = $activities->count();
        Log::channel('daily')->info('  TOTAL activities collected in getAllActivities: ' . $totalCount);
        
        if ($activities->isEmpty()) {
            Log::channel('daily')->warning('  getAllActivities returning EMPTY collection');
        }
        
        // Sort by timestamp
        $sorted = $activities->sortByDesc('timestamp')->values();
        Log::channel('daily')->info('  After sorting: ' . $sorted->count());
        
        return $sorted;
    }
    
    /**
     * Get login activities from user_login_logs table
     */
    private function getLoginActivities($userId, $timeRange, $search): Collection
    {
        Log::channel('daily')->info('    --- INSIDE getLoginActivities ---');
        
        $query = DB::table('user_login_logs')
            ->where('user_id', $userId)
            ->orderBy('login_at', 'desc');
        
        Log::channel('daily')->info('    Base query: ' . $query->toSql());
        Log::channel('daily')->info('    Base bindings: ', $query->getBindings());
        
        // Apply time range filter
        if ($timeRange !== 'all') {
            Log::channel('daily')->info('    Applying timeRange filter: ' . $timeRange);
            $this->applyDateFilter($query, $timeRange, 'login_at');
            Log::channel('daily')->info('    After time filter: ' . $query->toSql());
            Log::channel('daily')->info('    After time bindings: ', $query->getBindings());
        }
        
        // Apply search filter
        if ($search) {
            Log::channel('daily')->info('    Applying search filter: ' . $search);
            $query->where(function($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                  ->orWhere('user_agent', 'like', "%{$search}%")
                  ->orWhere('device_type', 'like', "%{$search}%");
            });
            Log::channel('daily')->info('    After search filter: ' . $query->toSql());
            Log::channel('daily')->info('    After search bindings: ', $query->getBindings());
        }
        
        $results = $query->get();
        $count = $results->count();
        Log::channel('daily')->info('    FINAL login results count: ' . $count);
        
        if ($count > 0) {
            Log::channel('daily')->info('    First login result:', (array)$results->first());
        } else {
            Log::channel('daily')->warning('    NO login results found');
        }
        
        return $results->map(function($log) {
            $deviceInfo = $this->parseUserAgent($log->user_agent ?? '');
            $isSuccessful = property_exists($log, 'is_successful') ? (int)$log->is_successful === 1 : true;
            $hasLogout = property_exists($log, 'logout_at') && !is_null($log->logout_at);
            
            $action = $hasLogout ? 'Logged out' : ($isSuccessful ? 'Logged in' : 'Failed login attempt');
            
            if ($hasLogout) {
                $description = "Logged out from system";
            } elseif ($isSuccessful) {
                $browser = $deviceInfo['browser'] !== 'Unknown' ? $deviceInfo['browser'] : 'browser';
                $os = $deviceInfo['os'] !== 'Unknown' ? $deviceInfo['os'] : 'device';
                $description = "Successfully logged in from {$browser} on {$os}";
            } else {
                $reason = property_exists($log, 'failure_reason') && $log->failure_reason 
                    ? ": {$log->failure_reason}" 
                    : '';
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
     * Get payment activities from payments table
     */
    private function getPaymentActivities($userId, $residentId, $timeRange, $search): Collection
    {
        Log::channel('daily')->info('    --- INSIDE getPaymentActivities ---');
        
        $query = DB::table('payments')
            ->where(function($q) use ($userId, $residentId) {
                $q->where('recorded_by', $userId)
                  ->orWhere('payer_id', $residentId);
            })
            ->orderBy('created_at', 'desc');
        
        Log::channel('daily')->info('    Base query: ' . $query->toSql());
        Log::channel('daily')->info('    Base bindings: ', $query->getBindings());
        
        if ($timeRange !== 'all') {
            Log::channel('daily')->info('    Applying timeRange filter: ' . $timeRange);
            $this->applyDateFilter($query, $timeRange, 'created_at');
        }
        
        if ($search) {
            Log::channel('daily')->info('    Applying search filter: ' . $search);
            $query->where(function($q) use ($search) {
                $q->where('or_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%");
            });
        }
        
        Log::channel('daily')->info('    Final query: ' . $query->toSql());
        Log::channel('daily')->info('    Final bindings: ', $query->getBindings());
        
        $results = $query->get();
        $count = $results->count();
        Log::channel('daily')->info('    FINAL payment results count: ' . $count);
        
        if ($count > 0) {
            Log::channel('daily')->info('    First payment result:', (array)$results->first());
        } else {
            Log::channel('daily')->warning('    NO payment results found');
        }
        
        return $results->map(function($payment) {
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
     * Get document activities from resident_documents table
     */
    private function getDocumentActivities($userId, $residentId, $timeRange, $search): Collection
    {
        Log::channel('daily')->info('    --- INSIDE getDocumentActivities ---');
        
        $query = DB::table('resident_documents')
            ->where(function($q) use ($userId, $residentId) {
                $q->where('uploaded_by', $userId)
                  ->orWhere('resident_id', $residentId);
            })
            ->orderBy('created_at', 'desc');
        
        Log::channel('daily')->info('    Base query: ' . $query->toSql());
        Log::channel('daily')->info('    Base bindings: ', $query->getBindings());
        
        if ($timeRange !== 'all') {
            Log::channel('daily')->info('    Applying timeRange filter: ' . $timeRange);
            $this->applyDateFilter($query, $timeRange, 'created_at');
        }
        
        if ($search) {
            Log::channel('daily')->info('    Applying search filter: ' . $search);
            $query->where('name', 'like', "%{$search}%");
        }
        
        Log::channel('daily')->info('    Final query: ' . $query->toSql());
        Log::channel('daily')->info('    Final bindings: ', $query->getBindings());
        
        $results = $query->get();
        $count = $results->count();
        Log::channel('daily')->info('    FINAL document results count: ' . $count);
        
        if ($count > 0) {
            Log::channel('daily')->info('    First document result:', (array)$results->first());
        } else {
            Log::channel('daily')->warning('    NO document results found');
        }
        
        return $results->map(function($doc) {
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
     * Get clearance activities from clearance_requests table
     */
    private function getClearanceActivities($residentId, $timeRange, $search): Collection
    {
        Log::channel('daily')->info('    --- INSIDE getClearanceActivities ---');
        
        $query = DB::table('clearance_requests')
            ->where('resident_id', $residentId)
            ->orderBy('created_at', 'desc');
        
        Log::channel('daily')->info('    Base query: ' . $query->toSql());
        Log::channel('daily')->info('    Base bindings: ', $query->getBindings());
        
        if ($timeRange !== 'all') {
            Log::channel('daily')->info('    Applying timeRange filter: ' . $timeRange);
            $this->applyDateFilter($query, $timeRange, 'created_at');
        }
        
        if ($search) {
            Log::channel('daily')->info('    Applying search filter: ' . $search);
            $query->where(function($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                  ->orWhere('purpose', 'like', "%{$search}%");
            });
        }
        
        Log::channel('daily')->info('    Final query: ' . $query->toSql());
        Log::channel('daily')->info('    Final bindings: ', $query->getBindings());
        
        $results = $query->get();
        $count = $results->count();
        Log::channel('daily')->info('    FINAL clearance results count: ' . $count);
        
        if ($count > 0) {
            Log::channel('daily')->info('    First clearance result:', (array)$results->first());
        } else {
            Log::channel('daily')->warning('    NO clearance results found');
        }
        
        return $results->map(function($request) {
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
     * Get Spatie activity log activities
     */
    private function getSpatieActivities($userId, $type, $timeRange, $search): Collection
    {
        Log::channel('daily')->info('    --- INSIDE getSpatieActivities ---');
        
        $query = Activity::query()
            ->where('causer_id', $userId)
            ->where('causer_type', 'App\Models\User')
            ->orderBy('created_at', 'desc');
        
        Log::channel('daily')->info('    Base query: ' . $query->toSql());
        
        if ($type !== 'all') {
            Log::channel('daily')->info('    Applying type filter: ' . $type);
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
            Log::channel('daily')->info('    Applying timeRange filter: ' . $timeRange);
            $this->applySpatieDateFilter($query, $timeRange);
        }
        
        if ($search) {
            Log::channel('daily')->info('    Applying search filter: ' . $search);
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('properties', 'like', "%{$search}%");
            });
        }
        
        Log::channel('daily')->info('    Final query: ' . $query->toSql());
        Log::channel('daily')->info('    Final bindings: ', $query->getBindings());
        
        $results = $query->get();
        $count = $results->count();
        Log::channel('daily')->info('    FINAL spatie results count: ' . $count);
        
        if ($count > 0) {
            Log::channel('daily')->info('    First spatie result:', $results->first()->toArray());
        } else {
            Log::channel('daily')->warning('    NO spatie results found');
        }
        
        return $results->map(function($activity) {
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
     * Get REAL statistics from database
     */
    private function getStats($userId, $residentId): array
    {
        Log::channel('daily')->info('    --- INSIDE getStats ---');
        
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
        
        $stats = [
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
        
        Log::channel('daily')->info('    Stats calculated', $stats);
        
        return $stats;
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
     * Export activities to CSV
     */
    public function export(Request $request)
    {
        $request->validate(['format' => 'required|in:csv']);
        
        $user = auth()->user();
        $residentId = $user->resident_id;
        $type = $request->input('filters.type', 'all');
        $timeRange = $request->input('filters.timeRange', 'all');
        
        $activities = $this->getAllActivities($user->id, $residentId, $type, $timeRange, '');
        
        return $this->exportToCsv($activities);
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
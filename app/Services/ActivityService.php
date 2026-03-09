<?php
// app/Services/ActivityService.php

namespace App\Services;

use App\Models\UserLoginLog;
use App\Models\AccessLog;
use App\Models\Activity;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Models\CommunityReport;
use App\Models\SupportTicket;
use App\Models\Incident;
use App\Models\ResidentDocument;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ActivityService
{
    protected $userId;
    protected $residentId;

    public function __construct($userId, $residentId)
    {
        $this->userId = $userId;
        $this->residentId = $residentId;
    }

    /**
     * Get all activities with filters
     */
    public function getAllActivities(string $type = 'all', string $timeRange = 'all', string $search = ''): Collection
    {
        $activities = collect();

        // Define activity sources
        $sources = $this->getActivitySources();

        foreach ($sources as $sourceType => $source) {
            if ($type === 'all' || $type === $sourceType) {
                $sourceActivities = $this->fetchFromSource($source, $timeRange, $search);
                $activities = $activities->concat($sourceActivities);
            }
        }

        return $activities->sortByDesc('timestamp')->values();
    }

    /**
     * Define all activity sources
     */
    protected function getActivitySources(): array
    {
        return [
            'login' => [
                'model' => UserLoginLog::class,
                'query' => function ($query) {
                    return $query->where('user_id', $this->userId);
                },
                'mapper' => [$this, 'mapLoginLog'],
                'timestamp_field' => 'login_at',
                'search_fields' => ['ip_address', 'user_agent', 'device_type', 'browser', 'platform'],
            ],
            
            'payment' => [
                'model' => Payment::class,
                'query' => function ($query) {
                    return $query->where(function($q) {
                        $q->where('recorded_by', $this->userId)
                          ->orWhere('payer_id', $this->residentId);
                    });
                },
                'mapper' => [$this, 'mapPayment'],
                'timestamp_field' => 'payment_date',
                'search_fields' => ['or_number', 'reference_number', 'purpose'],
            ],
            
            'document' => [
                'model' => ResidentDocument::class,
                'query' => function ($query) {
                    return $query->where(function($q) {
                        $q->where('uploaded_by', $this->userId)
                          ->orWhere('resident_id', $this->residentId);
                    });
                },
                'mapper' => [$this, 'mapDocument'],
                'timestamp_field' => 'created_at',
                'search_fields' => ['name'],
            ],
            
            'clearance' => [
                'model' => ClearanceRequest::class,
                'query' => function ($query) {
                    return $query->where(function($q) {
                        $q->where('resident_id', $this->residentId)
                          ->orWhere('requested_by_user_id', $this->userId);
                    });
                },
                'mapper' => [$this, 'mapClearance'],
                'timestamp_field' => 'created_at',
                'search_fields' => ['reference_number', 'clearance_number'],
            ],
            
            'report' => [
                'model' => CommunityReport::class,
                'query' => function ($query) {
                    return $query->where('user_id', $this->userId);
                },
                'mapper' => [$this, 'mapReport'],
                'timestamp_field' => 'created_at',
                'search_fields' => ['title'],
            ],
            
            'support' => [
                'model' => SupportTicket::class,
                'query' => function ($query) {
                    return $query->where('resident_id', $this->residentId);
                },
                'mapper' => [$this, 'mapSupportTicket'],
                'timestamp_field' => 'created_at',
                'search_fields' => ['ticket_number', 'subject'],
            ],
            
            'incident' => [
                'model' => Incident::class,
                'query' => function ($query) {
                    return $query->where(function($q) {
                        $q->where('user_id', $this->userId)
                          ->orWhere('resident_id', $this->residentId);
                    });
                },
                'mapper' => [$this, 'mapIncident'],
                'timestamp_field' => 'created_at',
                'search_fields' => ['title'],
            ],
            
            'view' => [
                'model' => AccessLog::class,
                'query' => function ($query) {
                    return $query->where('user_id', $this->userId);
                },
                'mapper' => [$this, 'mapAccessLog'],
                'timestamp_field' => 'accessed_at',
                'search_fields' => ['url', 'description'],
            ],
        ];
    }

    /**
     * Fetch from a specific source with filters
     */
    protected function fetchFromSource(array $source, string $timeRange, string $search): Collection
    {
        $query = $source['model']::query();
        
        // Apply user-specific query
        $query = $source['query']($query);
        
        // Apply time range filter
        if ($timeRange !== 'all') {
            $this->applyTimeRangeFilter($query, $source['timestamp_field'], $timeRange);
        }
        
        // Apply search filter
        if (!empty($search)) {
            $query->where(function ($q) use ($source, $search) {
                foreach ($source['search_fields'] as $field) {
                    $q->orWhere($field, 'like', "%{$search}%");
                }
            });
        }
        
        // Apply ordering and limit
        $results = $query->orderBy($source['timestamp_field'], 'desc')
            ->limit(500)
            ->get();
        
        // Map to standard format
        return $results->map(fn($item) => $source['mapper']($item));
    }

    /**
     * Map login log to activity format
     */
    protected function mapLoginLog($log): array
    {
        $isLogout = !is_null($log->logout_at ?? null);
        $isSuccess = $log->is_successful ?? true;
        
        return [
            'id' => 'login_' . $log->id,
            'type' => $isLogout ? 'logout' : 'login',
            'action' => $isLogout ? 'Logged out' : ($isSuccess ? 'Logged in' : 'Failed login'),
            'description' => $isLogout 
                ? "Logged out" 
                : ($isSuccess ? "Logged in" : "Failed login attempt: " . ($log->failure_reason ?? 'Unknown reason')),
            'timestamp' => $log->logout_at ?? $log->login_at,
            'status' => $isSuccess ? 'success' : 'failed',
            'ip_address' => $log->ip_address ?? null,
            'device' => $this->formatDevice($log),
            'location' => $log->location ?? null,
            'resource_type' => 'session',
            'resource_id' => null,
            'metadata' => [
                'browser' => $log->browser,
                'platform' => $log->platform,
                'device_type' => $log->device_type,
                'session_id' => $log->session_id,
            ],
        ];
    }

    /**
     * Map payment to activity format
     */
    protected function mapPayment($payment): array
    {
        $status = $payment->status === 'completed' ? 'success' 
                : ($payment->status === 'pending' ? 'pending' : 'failed');
        
        return [
            'id' => 'payment_' . $payment->id,
            'type' => 'payment',
            'action' => 'Payment ' . ucfirst($payment->status),
            'description' => $payment->purpose ?? "Payment of ₱" . number_format($payment->total_amount, 2),
            'timestamp' => $payment->payment_date ?? $payment->created_at,
            'status' => $status,
            'ip_address' => null,
            'device' => $payment->collection_type === 'online' ? 'Online' : 'Barangay Hall',
            'location' => null,
            'resource_type' => 'payment',
            'resource_id' => $payment->or_number,
            'metadata' => [
                'amount' => $payment->total_amount,
                'or_number' => $payment->or_number,
                'reference_number' => $payment->reference_number,
                'payment_method' => $payment->payment_method,
            ],
        ];
    }

    /**
     * Map document to activity format
     */
    protected function mapDocument($doc): array
    {
        return [
            'id' => 'document_' . $doc->id,
            'type' => 'document',
            'action' => 'Document ' . ($doc->created_at == $doc->updated_at ? 'Uploaded' : 'Updated'),
            'description' => $doc->name,
            'timestamp' => $doc->created_at,
            'status' => 'success',
            'ip_address' => null,
            'device' => 'System',
            'location' => null,
            'resource_type' => 'document',
            'resource_id' => $doc->reference_number ?? $doc->id,
            'metadata' => [
                'file_type' => $doc->file_type ?? null,
                'size' => $doc->file_size ?? null,
            ],
        ];
    }

    /**
     * Map clearance to activity format
     */
    protected function mapClearance($request): array
    {
        $status = $request->status === 'issued' ? 'success' : 'pending';
        
        return [
            'id' => 'clearance_' . $request->id,
            'type' => 'clearance',
            'action' => 'Clearance ' . ucfirst($request->status),
            'description' => 'Clearance request for ' . ($request->purpose ?? 'general purpose'),
            'timestamp' => $request->issue_date ?? $request->created_at,
            'status' => $status,
            'ip_address' => null,
            'device' => 'System',
            'location' => null,
            'resource_type' => 'clearance',
            'resource_id' => $request->clearance_number ?? $request->reference_number,
            'metadata' => [
                'purpose' => $request->purpose,
                'fee' => $request->fee_amount,
            ],
        ];
    }

    /**
     * Map report to activity format
     */
    protected function mapReport($report): array
    {
        $status = $report->status === 'resolved' ? 'success' : 'pending';
        
        return [
            'id' => 'report_' . $report->id,
            'type' => 'report',
            'action' => 'Report ' . ucfirst($report->status),
            'description' => $report->title,
            'timestamp' => $report->resolved_at ?? $report->created_at,
            'status' => $status,
            'ip_address' => null,
            'device' => 'System',
            'location' => $report->location,
            'resource_type' => 'report',
            'resource_id' => $report->report_number,
            'metadata' => [
                'priority' => $report->priority,
                'category' => $report->category,
            ],
        ];
    }

    /**
     * Map support ticket to activity format
     */
    protected function mapSupportTicket($ticket): array
    {
        $status = $ticket->status === 'resolved' ? 'success' : 'pending';
        
        return [
            'id' => 'ticket_' . $ticket->id,
            'type' => 'support',
            'action' => 'Ticket ' . ucfirst($ticket->status),
            'description' => $ticket->subject,
            'timestamp' => $ticket->resolved_at ?? $ticket->created_at,
            'status' => $status,
            'ip_address' => null,
            'device' => 'System',
            'location' => null,
            'resource_type' => 'ticket',
            'resource_id' => $ticket->ticket_number,
            'metadata' => [
                'priority' => $ticket->priority,
                'category' => $ticket->category,
            ],
        ];
    }

    /**
     * Map incident to activity format
     */
    protected function mapIncident($incident): array
    {
        $status = $incident->status === 'resolved' ? 'success' : 'pending';
        
        return [
            'id' => 'incident_' . $incident->id,
            'type' => 'incident',
            'action' => ucfirst($incident->type) . ' ' . ucfirst($incident->status),
            'description' => $incident->title,
            'timestamp' => $incident->updated_at ?? $incident->created_at,
            'status' => $status,
            'ip_address' => null,
            'device' => 'System',
            'location' => $incident->location,
            'resource_type' => $incident->type,
            'resource_id' => $incident->incident_number ?? $incident->id,
            'metadata' => [
                'severity' => $incident->severity,
                'reported_by' => $incident->reported_by,
            ],
        ];
    }

    /**
     * Map access log to activity format
     */
    protected function mapAccessLog($log): array
    {
        return [
            'id' => 'access_' . $log->id,
            'type' => 'view',
            'action' => $log->action_type ?? 'Page viewed',
            'description' => $log->description ?? 'Visited ' . ($log->route_name ?? 'page'),
            'timestamp' => $log->accessed_at,
            'status' => ($log->status_code ?? 200) < 400 ? 'success' : 'failed',
            'ip_address' => $log->ip_address,
            'device' => $this->parseUserAgent($log->user_agent ?? '')['full'] ?? 'Unknown',
            'location' => null,
            'resource_type' => $log->resource_type,
            'resource_id' => $log->resource_id,
            'metadata' => [
                'method' => $log->method,
                'route' => $log->route_name,
                'response_time' => $log->response_time,
            ],
        ];
    }

    /**
     * Get statistics
     */
    public function getStats(): array
    {
        return [
            'total' => $this->getTotalCount(),
            'successful' => $this->getSuccessfulCount(),
            'pending' => $this->getPendingCount(),
            'failed' => $this->getFailedCount(),
            'logins' => $this->getLoginStats(),
            'payments' => $this->getPaymentStats(),
            'documents' => $this->getDocumentCount(),
            'access' => $this->getAccessCount(),
            'clearances' => $this->getClearanceCount(),
            'reports' => $this->getReportCount(),
            'announcements' => $this->getAnnouncementViewCount(),
            'today' => $this->getTodayCount(),
            'thisWeek' => $this->getWeekCount(),
            'thisMonth' => $this->getMonthCount(),
        ];
    }

    /**
     * Format device info from login log
     */
    protected function formatDevice($log): string
    {
        $parts = [];
        if ($log->browser) $parts[] = $log->browser;
        if ($log->platform) $parts[] = $log->platform;
        
        return !empty($parts) ? implode(' / ', $parts) : ($log->device_type ?? 'Unknown');
    }

    /**
     * Parse user agent (from SecurityController)
     */
    protected function parseUserAgent($userAgent): array
    {
        $browser = 'Unknown';
        $os = 'Unknown';
        $device = 'Desktop';
        
        if (!$userAgent) {
            return ['browser' => $browser, 'os' => $os, 'device' => $device, 'full' => 'Unknown'];
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
            $device = 'Mobile';
        } elseif (strpos($ua, 'iphone') !== false) {
            $os = 'iOS';
            $device = 'Mobile';
        } elseif (strpos($ua, 'ipad') !== false) {
            $os = 'iOS';
            $device = 'Tablet';
        }
        
        if (strpos($ua, 'mobile') !== false) {
            $device = 'Mobile';
        } elseif (strpos($ua, 'tablet') !== false) {
            $device = 'Tablet';
        }
        
        return [
            'browser' => $browser,
            'os' => $os,
            'device' => $device,
            'full' => "$browser / $os",
        ];
    }

    /**
     * Apply time range filter
     */
    protected function applyTimeRangeFilter($query, $field, $timeRange): void
    {
        $now = now();
        
        switch ($timeRange) {
            case 'today':
                $query->where($field, '>=', $now->copy()->startOfDay());
                break;
            case 'week':
                $query->where($field, '>=', $now->copy()->startOfWeek());
                break;
            case 'month':
                $query->where($field, '>=', $now->copy()->startOfMonth());
                break;
            case 'year':
                $query->where($field, '>=', $now->copy()->startOfYear());
                break;
        }
    }

    // ========== STATISTICS METHODS ==========

    protected function getTotalCount(): int
    {
        return UserLoginLog::where('user_id', $this->userId)->count()
            + Payment::where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId)->count()
            + ResidentDocument::where('uploaded_by', $this->userId)->orWhere('resident_id', $this->residentId)->count()
            + AccessLog::where('user_id', $this->userId)->count()
            + ClearanceRequest::where('resident_id', $this->residentId)->orWhere('requested_by_user_id', $this->userId)->count()
            + CommunityReport::where('user_id', $this->userId)->count()
            + $this->getAnnouncementViewCount();
    }

    protected function getSuccessfulCount(): int
    {
        return UserLoginLog::where('user_id', $this->userId)->where('is_successful', true)->count()
            + Payment::where(function($q) { $q->where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId); })
                ->where('status', 'completed')->count()
            + ResidentDocument::where('uploaded_by', $this->userId)->orWhere('resident_id', $this->residentId)->count()
            + AccessLog::where('user_id', $this->userId)->where('status_code', '<', 400)->count()
            + ClearanceRequest::where('resident_id', $this->residentId)->orWhere('requested_by_user_id', $this->userId)
                ->where('status', 'issued')->count()
            + $this->getAnnouncementViewCount();
    }

    protected function getPendingCount(): int
    {
        return Payment::where(function($q) { $q->where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId); })
            ->where('status', 'pending')->count()
            + ClearanceRequest::where('resident_id', $this->residentId)->orWhere('requested_by_user_id', $this->userId)
                ->whereIn('status', ['pending', 'processing'])->count()
            + CommunityReport::where('user_id', $this->userId)->where('status', '!=', 'resolved')->count();
    }

    protected function getFailedCount(): int
    {
        return UserLoginLog::where('user_id', $this->userId)->where('is_successful', false)->count()
            + Payment::where(function($q) { $q->where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId); })
                ->where('status', 'failed')->count()
            + AccessLog::where('user_id', $this->userId)->where('status_code', '>=', 400)->count();
    }

    protected function getLoginStats(): array
    {
        return [
            'total' => UserLoginLog::where('user_id', $this->userId)->count(),
            'success' => UserLoginLog::where('user_id', $this->userId)->where('is_successful', true)->count(),
            'failed' => UserLoginLog::where('user_id', $this->userId)->where('is_successful', false)->count(),
        ];
    }

    protected function getPaymentStats(): array
    {
        return [
            'total' => Payment::where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId)->count(),
            'success' => Payment::where(function($q) { $q->where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId); })
                ->where('status', 'completed')->count(),
            'pending' => Payment::where(function($q) { $q->where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId); })
                ->where('status', 'pending')->count(),
        ];
    }

    protected function getDocumentCount(): int
    {
        return ResidentDocument::where('uploaded_by', $this->userId)->orWhere('resident_id', $this->residentId)->count();
    }

    protected function getAccessCount(): int
    {
        return AccessLog::where('user_id', $this->userId)->count();
    }

    protected function getClearanceCount(): int
    {
        return ClearanceRequest::where('resident_id', $this->residentId)->orWhere('requested_by_user_id', $this->userId)->count();
    }

    protected function getReportCount(): int
    {
        return CommunityReport::where('user_id', $this->userId)->count();
    }

    protected function getAnnouncementViewCount(): int
    {
        return DB::table('announcement_views')->where('user_id', $this->userId)->count()
            + DB::table('announcement_view_logs')->where('user_id', $this->userId)->count();
    }

    protected function getTodayCount(): int
    {
        $today = now()->startOfDay();
        
        return UserLoginLog::where('user_id', $this->userId)->where('login_at', '>=', $today)->count()
            + Payment::where(function($q) { $q->where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId); })
                ->where('created_at', '>=', $today)->count()
            + AccessLog::where('user_id', $this->userId)->where('accessed_at', '>=', $today)->count();
    }

    protected function getWeekCount(): int
    {
        $week = now()->startOfWeek();
        
        return UserLoginLog::where('user_id', $this->userId)->where('login_at', '>=', $week)->count()
            + Payment::where(function($q) { $q->where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId); })
                ->where('created_at', '>=', $week)->count()
            + AccessLog::where('user_id', $this->userId)->where('accessed_at', '>=', $week)->count();
    }

    protected function getMonthCount(): int
    {
        $month = now()->startOfMonth();
        
        return UserLoginLog::where('user_id', $this->userId)->where('login_at', '>=', $month)->count()
            + Payment::where(function($q) { $q->where('recorded_by', $this->userId)->orWhere('payer_id', $this->residentId); })
                ->where('created_at', '>=', $month)->count()
            + AccessLog::where('user_id', $this->userId)->where('accessed_at', '>=', $month)->count();
    }
}
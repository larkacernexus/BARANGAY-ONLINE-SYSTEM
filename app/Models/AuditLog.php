<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AuditLog extends Model
{
    protected $table = 'audit_logs';
    
    protected $fillable = [
        'user_id',
        'user_name',
        'user_position',
        'event_type',
        'event_category',
        'event',
        'description',
        'subject_type',
        'subject_id',
        'subject_name',
        'barangay_id',
        'office',
        'document_number',
        'old_values',
        'new_values',
        'properties',
        'severity',
        'status',
        'ip_address',
        'user_agent',
        'device_type',
        'platform',
        'browser',
        'or_number',
        'amount',
        'transaction_type',
        'logged_at',
    ];
    
    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'properties' => 'array',
        'logged_at' => 'datetime',
        'amount' => 'decimal:2',
    ];
    
    protected $dates = [
        'logged_at',
        'created_at',
        'updated_at',
    ];
    
    /**
     * Event categories specific to barangay system
     */
    const CATEGORY_FINANCIAL = 'financial';
    const CATEGORY_RESIDENT = 'resident';
    const CATEGORY_DOCUMENT = 'document';
    const CATEGORY_BLOTTER = 'blotter';
    const CATEGORY_SYSTEM = 'system';
    const CATEGORY_SECURITY = 'security';
    const CATEGORY_USER = 'user';
    
    /**
     * Event types
     */
    const TYPE_CREATED = 'created';
    const TYPE_UPDATED = 'updated';
    const TYPE_DELETED = 'deleted';
    const TYPE_VIEWED = 'viewed';
    const TYPE_EXPORTED = 'exported';
    const TYPE_PRINTED = 'printed';
    const TYPE_APPROVED = 'approved';
    const TYPE_REJECTED = 'rejected';
    const TYPE_LOGIN = 'login';
    const TYPE_LOGOUT = 'logout';
    const TYPE_FAILED_LOGIN = 'failed_login';
    
    /**
     * Severity levels
     */
    const SEVERITY_INFO = 'info';
    const SEVERITY_WARNING = 'warning';
    const SEVERITY_ERROR = 'error';
    const SEVERITY_CRITICAL = 'critical';
    
    /**
     * Relationships
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function financialTrail(): HasOne
    {
        return $this->hasOne(FinancialAuditTrail::class);
    }
    
    public function subject()
    {
        return $this->morphTo();
    }
    
    /**
     * Scope for barangay-specific logs
     */
    public function scopeForBarangay($query, $barangayId = null)
    {
        if ($barangayId) {
            return $query->where('barangay_id', $barangayId);
        }
        
        // If system is for single barangay, use default
        return $query->where('barangay_id', config('barangay.id'));
    }
    
    /**
     * Scope for financial transactions
     */
    public function scopeFinancial($query)
    {
        return $query->where('event_category', self::CATEGORY_FINANCIAL);
    }
    
    /**
     * Scope for today's logs
     */
    public function scopeToday($query)
    {
        return $query->whereDate('logged_at', today());
    }
    
    /**
     * Scope for specific office/section
     */
    public function scopeOffice($query, $office)
    {
        return $query->where('office', $office);
    }
    
    /**
     * Helper method to log barangay activities
     */
    public static function logBarangayActivity(
        $event,
        $description,
        $category = self::CATEGORY_SYSTEM,
        $subject = null,
        $properties = [],
        $severity = self::SEVERITY_INFO
    ) {
        $user = auth()->user();
        
        return self::create([
            'user_id' => $user ? $user->id : null,
            'user_name' => $user ? $user->name : 'System',
            'user_position' => $user ? $user->position : null,
            'event_type' => self::getEventType($event),
            'event_category' => $category,
            'event' => $event,
            'description' => $description,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject ? $subject->id : null,
            'subject_name' => $subject ? self::getSubjectName($subject) : null,
            'barangay_id' => config('barangay.id'),
            'office' => $user ? $user->office : null,
            'old_values' => $properties['old'] ?? null,
            'new_values' => $properties['new'] ?? null,
            'properties' => $properties,
            'severity' => $severity,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'device_type' => self::detectDevice(),
            'platform' => self::detectPlatform(),
            'browser' => self::detectBrowser(),
            'logged_at' => now(),
        ]);
    }
    
    /**
     * Helper to log financial transactions (COA compliance)
     */
    public static function logFinancialTransaction(
        $description,
        $amount,
        $orNumber,
        $transactionType,
        $details = []
    ) {
        $log = self::logBarangayActivity(
            event: 'payment_' . $transactionType,
            description: $description,
            category: self::CATEGORY_FINANCIAL,
            properties: $details,
            severity: $transactionType === 'refund' ? self::SEVERITY_WARNING : self::SEVERITY_INFO
        );
        
        $log->update([
            'or_number' => $orNumber,
            'amount' => $amount,
            'transaction_type' => $transactionType,
        ]);
        
        // Create financial trail for COA compliance
        if ($log->exists) {
            FinancialAuditTrail::create([
                'audit_log_id' => $log->id,
                'fund_source' => $details['fund_source'] ?? 'General Fund',
                'account_code' => $details['account_code'] ?? null,
                'particulars' => $description,
                'payee' => $details['payee'] ?? null,
                'voucher_number' => $details['voucher_number'] ?? null,
                'transaction_date' => now(),
                'debit' => in_array($transactionType, ['collection', 'receipt']) ? $amount : null,
                'credit' => in_array($transactionType, ['disbursement', 'refund']) ? $amount : null,
                'or_number' => $orNumber,
                'approved_by' => $details['approved_by'] ?? null,
                'received_by' => $details['received_by'] ?? null,
            ]);
        }
        
        return $log;
    }
    
    /**
     * Helper to log document issuance
     */
    public static function logDocumentIssuance(
        $documentType,
        $documentNumber,
        $residentName,
        $details = []
    ) {
        return self::logBarangayActivity(
            event: $documentType . '_issued',
            description: "Issued {$documentType} #{$documentNumber} to {$residentName}",
            category: self::CATEGORY_DOCUMENT,
            properties: array_merge($details, [
                'document_number' => $documentNumber,
                'resident_name' => $residentName,
            ])
        );
    }
    
    /**
     * Private helper methods
     */
    private static function getEventType($event): string
    {
        if (str_contains($event, 'created')) return self::TYPE_CREATED;
        if (str_contains($event, 'updated')) return self::TYPE_UPDATED;
        if (str_contains($event, 'deleted')) return self::TYPE_DELETED;
        if (str_contains($event, 'viewed')) return self::TYPE_VIEWED;
        if (str_contains($event, 'exported')) return self::TYPE_EXPORTED;
        if (str_contains($event, 'printed')) return self::TYPE_PRINTED;
        if (str_contains($event, 'approved')) return self::TYPE_APPROVED;
        if (str_contains($event, 'rejected')) return self::TYPE_REJECTED;
        if (str_contains($event, 'login')) return self::TYPE_LOGIN;
        if (str_contains($event, 'logout')) return self::TYPE_LOGOUT;
        
        return self::TYPE_CREATED;
    }
    
    private static function getSubjectName($subject): ?string
    {
        if (method_exists($subject, 'getName')) {
            return $subject->getName();
        }
        
        if (isset($subject->name)) {
            return $subject->name;
        }
        
        if (isset($subject->title)) {
            return $subject->title;
        }
        
        if (isset($subject->document_number)) {
            return $subject->document_number;
        }
        
        return null;
    }
    
    private static function detectDevice(): string
    {
        $agent = request()->userAgent();
        
        if (strpos($agent, 'Mobile') !== false) {
            return 'Mobile';
        }
        
        if (strpos($agent, 'Tablet') !== false) {
            return 'Tablet';
        }
        
        return 'Desktop';
    }
    
    private static function detectPlatform(): string
    {
        $agent = strtolower(request()->userAgent());
        
        if (strpos($agent, 'windows') !== false) return 'Windows';
        if (strpos($agent, 'mac os') !== false) return 'macOS';
        if (strpos($agent, 'linux') !== false) return 'Linux';
        if (strpos($agent, 'android') !== false) return 'Android';
        if (strpos($agent, 'iphone') !== false || strpos($agent, 'ipad') !== false) return 'iOS';
        
        return 'Unknown';
    }
    
    private static function detectBrowser(): string
    {
        $agent = strtolower(request()->userAgent());
        
        if (strpos($agent, 'chrome') !== false) return 'Chrome';
        if (strpos($agent, 'firefox') !== false) return 'Firefox';
        if (strpos($agent, 'safari') !== false && strpos($agent, 'chrome') === false) return 'Safari';
        if (strpos($agent, 'edge') !== false) return 'Edge';
        if (strpos($agent, 'opera') !== false) return 'Opera';
        
        return 'Unknown';
    }
}
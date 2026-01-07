<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'complaint_number',
        'type',
        'subject',
        'description',
        'location',
        'incident_date',
        'priority',
        'status',
        'is_anonymous',
        'evidence_files',
        'admin_notes',
        'resolved_at'
    ];

    protected $casts = [
        'incident_date' => 'datetime',
        'resolved_at' => 'datetime',
        'is_anonymous' => 'boolean',
        'evidence_files' => 'array'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($complaint) {
            $complaint->complaint_number = 'COMP-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
        });
    }

    public function getPriorityColorAttribute()
    {
        return [
            'low' => 'green',
            'medium' => 'amber',
            'high' => 'red'
        ][$this->priority] ?? 'gray';
    }

    public function getStatusColorAttribute()
    {
        return [
            'pending' => 'yellow',
            'under_review' => 'blue',
            'resolved' => 'green',
            'dismissed' => 'gray'
        ][$this->status] ?? 'gray';
    }
}
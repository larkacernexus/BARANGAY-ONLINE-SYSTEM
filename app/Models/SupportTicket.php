<?php
// app/Models/SupportTicket.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'resident_id',
        'ticket_number',
        'subject',
        'category',
        'priority',
        'message',
        'attachment',
        'status',
        'resolved_at',
        'closed_at',
    ];
    
    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
    ];
    
    public function resident()
    {
        return $this->belongsTo(Resident::class);
    }
    
    public function replies()
    {
        return $this->hasMany(TicketReply::class);
    }
}
<?php
// app/Models/TicketReply.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketReply extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'ticket_id',
        'user_id',
        'message',
        'attachment',
        'is_staff',
        'staff_name',
    ];
    
    protected $casts = [
        'is_staff' => 'boolean',
    ];
    
    public function ticket()
    {
        return $this->belongsTo(SupportTicket::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
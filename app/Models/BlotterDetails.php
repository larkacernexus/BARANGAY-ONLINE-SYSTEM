<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlotterDetails extends Model
{
    protected $fillable = [
        'incident_id',
        'respondent_name',
        'hearing_date',
    ];

    protected $casts = [
        'hearing_date' => 'datetime',
    ];

    /**
     * Get the incident associated with the blotter details.
     */
    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }
}
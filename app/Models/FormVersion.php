<?php
// app/Models/FormVersion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormVersion extends Model
{
    protected $fillable = [
        'form_id',
        'version_number',
        'file_path',
        'release_notes',
        'uploaded_by',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(Form::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
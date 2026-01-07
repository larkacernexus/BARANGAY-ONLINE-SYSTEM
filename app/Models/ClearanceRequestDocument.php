<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClearanceRequestDocument extends Model
{    protected $fillable = [
        'clearance_request_id',
        'document_type_id',
        'description',
        'is_verified',
        'file_path',
        'file_name',
        'original_name',
        'file_size',
        'file_type',
        'mime_type',
    ];

    protected $guarded = [];
    
    protected $casts = [
        'file_size' => 'integer',
    ];
    
    protected $appends = [
        'full_url',
        'file_size_formatted',
        'file_extension'
    ];
    
    public function getFullUrlAttribute()
    {
        return $this->file_path ? asset('storage/' . $this->file_path) : null;
    }
    
    public function getFileSizeFormattedAttribute()
    {
        $bytes = $this->file_size;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
    
    public function getFileExtensionAttribute()
    {
        return strtolower(pathinfo($this->file_name, PATHINFO_EXTENSION));
    }
    
    public function clearanceRequest(): BelongsTo
    {
        return $this->belongsTo(ClearanceRequest::class);
    }
    
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }
    
    public function isImage()
    {
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        return in_array($this->file_extension, $imageExtensions);
    }
    
    public function isPdf()
    {
        return $this->file_extension === 'pdf';
    }
    
    public function isDocument()
    {
        $docExtensions = ['doc', 'docx', 'txt', 'rtf'];
        return in_array($this->file_extension, $docExtensions);
    }
    
    // Helper to check if document is verified
    public function isVerified()
    {
        // Since 'is_verified' column doesn't exist in your DB schema,
        // you can implement verification logic differently
        return false; // Or implement based on your business logic
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentRequirement extends Model
{
    protected $fillable = [
        'clearance_type_id',
        'document_type_id',
        'is_required',
        'sort_order'
    ];
    
    protected $casts = [
        'is_required' => 'boolean',
        'sort_order' => 'integer'
    ];
    
    protected $appends = [
        'document_type_name',
        'clearance_type_name'
    ];
    
    public function clearanceType()
    {
        return $this->belongsTo(ClearanceType::class);
    }
    
    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }
    
    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }
    
    public function scopeOptional($query)
    {
        return $query->where('is_required', false);
    }
    
    public function scopeForClearanceType($query, $clearanceTypeId)
    {
        return $query->where('clearance_type_id', $clearanceTypeId);
    }
    
    public function scopeForDocumentType($query, $documentTypeId)
    {
        return $query->where('document_type_id', $documentTypeId);
    }
    
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order', 'asc');
    }
    
    public function getDocumentTypeNameAttribute()
    {
        return $this->documentType->name ?? 'Unknown Document';
    }
    
    public function getClearanceTypeNameAttribute()
    {
        return $this->clearanceType->name ?? 'Unknown Clearance Type';
    }
    
    public function isFulfilledBy(array $uploadedDocumentTypeIds): bool
    {
        return in_array($this->document_type_id, $uploadedDocumentTypeIds);
    }
    
    public static function getRequirementsForClearanceType($clearanceTypeId)
    {
        return self::with('documentType')
            ->where('clearance_type_id', $clearanceTypeId)
            ->ordered()
            ->get();
    }
    
    public static function getRequiredDocumentIds($clearanceTypeId): array
    {
        return self::where('clearance_type_id', $clearanceTypeId)
            ->required()
            ->pluck('document_type_id')
            ->toArray();
    }
}
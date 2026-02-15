<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentType extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'document_category_id',
        'is_required',
        'is_active',
        'accepted_formats',
        'max_file_size',
        'sort_order'
    ];

    protected $casts = [
        'accepted_formats' => 'array',
        'is_active' => 'boolean',
        'is_required' => 'boolean',
        'max_file_size' => 'integer',
        'sort_order' => 'integer'
    ];

    protected $appends = [
        'accepted_formats_list',
        'max_file_size_mb'
    ];

    /**
     * Get the category that owns the document type.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(DocumentCategory::class, 'document_category_id');
    }

    public function clearanceRequirements(): HasMany
    {
        return $this->hasMany(DocumentRequirement::class);
    }

    public function requiredByClearanceTypes()
    {
        return $this->hasManyThrough(
            ClearanceType::class,
            DocumentRequirement::class,
            'document_type_id',
            'id',
            'id',
            'clearance_type_id'
        )->where('document_requirements.is_required', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRequired($query)
    {
        return $this->clearanceRequirements()->where('is_required', true);
    }

    public function scopeOptional($query)
    {
        return $this->clearanceRequirements()->where('is_required', false);
    }

    // Changed from ByCategory to ByCategoryId
    public function scopeByCategoryId($query, $categoryId)
    {
        return $query->where('document_category_id', $categoryId);
    }

    // Helper method for backward compatibility
    public function scopeByCategorySlug($query, $categorySlug)
    {
        return $query->whereHas('category', function($q) use ($categorySlug) {
            $q->where('slug', $categorySlug);
        });
    }

    public function getAcceptedFormatsListAttribute()
    {
        return $this->accepted_formats ? implode(', ', $this->accepted_formats) : 'All formats';
    }

    public function getMaxFileSizeMbAttribute()
    {
        return round($this->max_file_size / 1024, 2);
    }

    public function isRequiredForClearanceType($clearanceTypeId): bool
    {
        $requirement = DocumentRequirement::where('document_type_id', $this->id)
            ->where('clearance_type_id', $clearanceTypeId)
            ->first();
            
        return $requirement ? $requirement->is_required : false;
    }

    public function getSortOrderForClearanceType($clearanceTypeId): int
    {
        $requirement = DocumentRequirement::where('document_type_id', $this->id)
            ->where('clearance_type_id', $clearanceTypeId)
            ->first();
            
        return $requirement ? $requirement->sort_order : 0;
    }

    public function getClearanceTypeRequirement($clearanceTypeId)
    {
        return DocumentRequirement::where('document_type_id', $this->id)
            ->where('clearance_type_id', $clearanceTypeId)
            ->first();
    }

    /**
     * Get the category name (for backward compatibility)
     */
    public function getCategoryNameAttribute()
    {
        return $this->category ? $this->category->name : null;
    }

    /**
     * Get the category slug (for backward compatibility)
     */
    public function getCategorySlugAttribute()
    {
        return $this->category ? $this->category->slug : null;
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;

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
        'max_file_size_mb',
        'category_name',
        'category_slug'
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

    public function scopeByCategoryId($query, $categoryId)
    {
        return $query->where('document_category_id', $categoryId);
    }

    public function scopeByCategorySlug($query, $categorySlug)
    {
        return $query->whereHas('category', function($q) use ($categorySlug) {
            $q->where('slug', $categorySlug);
        });
    }

    /**
     * Get accepted formats as a formatted string
     */
    public function getAcceptedFormatsListAttribute()
    {
        try {
            $formats = $this->accepted_formats;
            
            // Case 1: It's already an array (from cast)
            if (is_array($formats)) {
                return !empty($formats) ? implode(', ', $formats) : 'All formats';
            }
            
            // Case 2: It's null or empty
            if (empty($formats)) {
                return 'All formats';
            }
            
            // Case 3: It's a string (legacy data or double-encoded)
            if (is_string($formats)) {
                // Try to decode JSON
                $decoded = json_decode($formats, true);
                
                if (is_array($decoded)) {
                    // Valid JSON array
                    return !empty($decoded) ? implode(', ', $decoded) : 'All formats';
                }
                
                // Check if it's a comma-separated string
                if (str_contains($formats, ',')) {
                    $parts = array_map('trim', explode(',', $formats));
                    return implode(', ', $parts);
                }
                
                // Single format string
                return $formats;
            }
            
            return 'All formats';
            
        } catch (\Exception $e) {
            // Log error for debugging
            Log::error('Error in accepted_formats_list accessor', [
                'document_type_id' => $this->id ?? null,
                'error' => $e->getMessage()
            ]);
            
            return 'All formats';
        }
    }

    public function getMaxFileSizeMbAttribute()
    {
        try {
            if (empty($this->max_file_size)) {
                return 0;
            }
            return round($this->max_file_size / 1024, 2);
        } catch (\Exception $e) {
            return 0;
        }
    }

    public function isRequiredForClearanceType($clearanceTypeId): bool
    {
        try {
            $requirement = DocumentRequirement::where('document_type_id', $this->id)
                ->where('clearance_type_id', $clearanceTypeId)
                ->first();
                
            return $requirement ? $requirement->is_required : false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getSortOrderForClearanceType($clearanceTypeId): int
    {
        try {
            $requirement = DocumentRequirement::where('document_type_id', $this->id)
                ->where('clearance_type_id', $clearanceTypeId)
                ->first();
                
            return $requirement ? $requirement->sort_order : 0;
        } catch (\Exception $e) {
            return 0;
        }
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

    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();

        // Clean up accepted_formats before saving
        static::saving(function ($model) {
            if (isset($model->attributes['accepted_formats'])) {
                $formats = $model->attributes['accepted_formats'];
                
                // If it's a string but not JSON, convert to proper JSON array
                if (is_string($formats) && !self::isJson($formats)) {
                    if (str_contains($formats, ',')) {
                        $parts = array_map('trim', explode(',', $formats));
                        $model->attributes['accepted_formats'] = json_encode($parts);
                    } else {
                        $model->attributes['accepted_formats'] = json_encode([$formats]);
                    }
                }
            }
        });
    }

    /**
     * Check if string is valid JSON
     */
    private static function isJson($string)
    {
        if (!is_string($string)) {
            return false;
        }
        
        json_decode($string);
        return json_last_error() === JSON_ERROR_NONE;
    }
}
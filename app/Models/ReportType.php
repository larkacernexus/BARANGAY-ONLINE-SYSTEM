<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReportType  extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'icon',
        'color',
        'priority_level',
        'resolution_days',
        'is_active',
        'requires_immediate_action',
        'requires_evidence',
        'allows_anonymous',
        'required_fields',
        'resolution_steps',
        'assigned_to_roles',
    ];

    protected $casts = [
        'priority_level' => 'integer',
        'resolution_days' => 'integer',
        'is_active' => 'boolean',
        'requires_immediate_action' => 'boolean',
        'requires_evidence' => 'boolean',
        'allows_anonymous' => 'boolean',
        'required_fields' => 'array',
        'resolution_steps' => 'array',
        'assigned_to_roles' => 'array',
    ];

    protected $appends = [
        'priority_label',
        'expected_resolution_date',
        'formatted_required_fields',
    ];

    /**
     * Priority level labels
     */
    const PRIORITY_LABELS = [
        1 => ['label' => 'Critical', 'color' => '#DC2626', 'icon' => 'alert-triangle'],
        2 => ['label' => 'High', 'color' => '#F97316', 'icon' => 'alert-circle'],
        3 => ['label' => 'Medium', 'color' => '#EAB308', 'icon' => 'clock'],
        4 => ['label' => 'Low', 'color' => '#10B981', 'icon' => 'info'],
    ];

    /**
     * Common complaint types for barangay
     */
    const COMMON_TYPES = [
        'NOISE_POLLUTION' => [
            'name' => 'Noise Pollution',
            'code' => 'NOISE_POLLUTION',
            'description' => 'Excessive noise from neighbors, establishments, or events',
            'icon' => 'volume-2',
            'color' => '#3B82F6',
            'priority_level' => 3,
            'resolution_days' => 3,
            'requires_evidence' => true,
            'allows_anonymous' => true,
        ],
        'WASTE_MANAGEMENT' => [
            'name' => 'Waste Management',
            'code' => 'WASTE_MANAGEMENT',
            'description' => 'Improper garbage disposal, uncollected trash, or illegal dumping',
            'icon' => 'trash-2',
            'color' => '#10B981',
            'priority_level' => 2,
            'resolution_days' => 2,
            'requires_immediate_action' => true,
        ],
        'PUBLIC_NUISANCE' => [
            'name' => 'Public Nuisance',
            'code' => 'PUBLIC_NUISANCE',
            'description' => 'Obstruction of public roads, sidewalks, or common areas',
            'icon' => 'alert-octagon',
            'color' => '#8B5CF6',
            'priority_level' => 3,
            'resolution_days' => 5,
        ],
        'ANIMAL_NUISANCE' => [
            'name' => 'Animal Nuisance',
            'code' => 'ANIMAL_NUISANCE',
            'description' => 'Stray animals, barking dogs, or animal waste issues',
            'icon' => 'paw-print',
            'color' => '#F59E0B',
            'priority_level' => 3,
            'resolution_days' => 3,
            'requires_evidence' => true,
        ],
        'WATER_PROBLEM' => [
            'name' => 'Water Problem',
            'code' => 'WATER_PROBLEM',
            'description' => 'Water supply issues, leaks, or drainage problems',
            'icon' => 'droplets',
            'color' => '#0EA5E9',
            'priority_level' => 2,
            'resolution_days' => 2,
            'requires_immediate_action' => true,
        ],
        'ELECTRICAL_HAZARD' => [
            'name' => 'Electrical Hazard',
            'code' => 'ELECTRICAL_HAZARD',
            'description' => 'Exposed wires, faulty street lights, or electrical hazards',
            'icon' => 'zap',
            'color' => '#F59E0B',
            'priority_level' => 1,
            'resolution_days' => 1,
            'requires_immediate_action' => true,
            'requires_evidence' => true,
        ],
        'ROAD_MAINTENANCE' => [
            'name' => 'Road Maintenance',
            'code' => 'ROAD_MAINTENANCE',
            'description' => 'Potholes, damaged roads, or street cleaning issues',
            'icon' => 'road',
            'color' => '#6B7280',
            'priority_level' => 2,
            'resolution_days' => 7,
        ],
        'PEACE_AND_ORDER' => [
            'name' => 'Peace and Order',
            'code' => 'PEACE_ORDER',
            'description' => 'Disturbance of peace, fights, or suspicious activities',
            'icon' => 'shield-alert',
            'color' => '#DC2626',
            'priority_level' => 1,
            'resolution_days' => 1,
            'requires_immediate_action' => true,
            'requires_evidence' => false,
        ],
        'NEIGHBOR_DISPUTE' => [
            'name' => 'Neighbor Dispute',
            'code' => 'NEIGHBOR_DISPUTE',
            'description' => 'Boundary disputes, property conflicts, or neighbor issues',
            'icon' => 'users',
            'color' => '#8B5CF6',
            'priority_level' => 3,
            'resolution_days' => 14,
            'requires_evidence' => true,
            'allows_anonymous' => false,
        ],
        'HEALTH_SANITATION' => [
            'name' => 'Health and Sanitation',
            'code' => 'HEALTH_SANITATION',
            'description' => 'Unsanitary conditions, disease prevention, or health hazards',
            'icon' => 'heart-pulse',
            'color' => '#EC4899',
            'priority_level' => 2,
            'resolution_days' => 3,
            'requires_immediate_action' => true,
        ],
        'ILLEGAL_STRUCTURE' => [
            'name' => 'Illegal Structure',
            'code' => 'ILLEGAL_STRUCTURE',
            'description' => 'Unauthorized construction, encroachments, or illegal buildings',
            'icon' => 'building',
            'color' => '#F97316',
            'priority_level' => 2,
            'resolution_days' => 10,
            'requires_evidence' => true,
        ],
        'TRAFFIC_VIOLATION' => [
            'name' => 'Traffic Violation',
            'code' => 'TRAFFIC_VIOLATION',
            'description' => 'Illegal parking, speeding, or traffic rule violations',
            'icon' => 'car',
            'color' => '#3B82F6',
            'priority_level' => 3,
            'resolution_days' => 5,
            'requires_evidence' => true,
            'allows_anonymous' => true,
        ],
        'WATERWAYS_CLOGGED' => [
            'name' => 'Clogged Waterways',
            'code' => 'WATERWAYS_CLOGGED',
            'description' => 'Blocked canals, drainage, or flood-causing obstructions',
            'icon' => 'waves',
            'color' => '#0EA5E9',
            'priority_level' => 2,
            'resolution_days' => 3,
            'requires_immediate_action' => true,
        ],
        'ILLEGAL_VENDORS' => [
            'name' => 'Illegal Vendors',
            'code' => 'ILLEGAL_VENDORS',
            'description' => 'Unauthorized street vendors or illegal businesses',
            'icon' => 'store',
            'color' => '#10B981',
            'priority_level' => 3,
            'resolution_days' => 5,
        ],
        'PUBLIC_SAFETY' => [
            'name' => 'Public Safety Hazard',
            'code' => 'PUBLIC_SAFETY',
            'description' => 'Unsafe conditions, fire hazards, or dangerous structures',
            'icon' => 'alert-triangle',
            'color' => '#DC2626',
            'priority_level' => 1,
            'resolution_days' => 1,
            'requires_immediate_action' => true,
            'requires_evidence' => true,
        ],
    ];

    /**
     * Relationship with Complaints
     */
    public function complaints()
    {
        return $this->hasMany(Complaint::class);
    }

    /**
     * Scope active complaint types
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by priority level
     */
    public function scopeByPriority($query, $level)
    {
        return $query->where('priority_level', $level);
    }

    /**
     * Scope types that require immediate action
     */
    public function scopeRequiresImmediateAction($query)
    {
        return $query->where('requires_immediate_action', true);
    }

    /**
     * Scope types that allow anonymous complaints
     */
    public function scopeAllowsAnonymous($query)
    {
        return $query->where('allows_anonymous', true);
    }

    /**
     * Get priority label attribute
     */
    public function getPriorityLabelAttribute()
    {
        return self::PRIORITY_LABELS[$this->priority_level]['label'] ?? 'Unknown';
    }

    /**
     * Get priority color attribute
     */
    public function getPriorityColorAttribute()
    {
        return self::PRIORITY_LABELS[$this->priority_level]['color'] ?? '#6B7280';
    }

    /**
     * Get priority icon attribute
     */
    public function getPriorityIconAttribute()
    {
        return self::PRIORITY_LABELS[$this->priority_level]['icon'] ?? 'alert-circle';
    }

    /**
     * Get expected resolution date attribute
     */
    public function getExpectedResolutionDateAttribute()
    {
        return now()->addWeekdays($this->resolution_days)->format('F j, Y');
    }

    /**
     * Get formatted required fields
     */
    public function getFormattedRequiredFieldsAttribute()
    {
        if (empty($this->required_fields)) {
            return $this->getDefaultRequiredFields();
        }

        return $this->required_fields;
    }

    /**
     * Get default required fields based on complaint type
     */
    private function getDefaultRequiredFields(): array
    {
        $defaultFields = [
            'complainant_name' => ['required' => true, 'type' => 'text', 'label' => 'Full Name'],
            'complainant_contact' => ['required' => true, 'type' => 'tel', 'label' => 'Contact Number'],
            'complainant_address' => ['required' => true, 'type' => 'text', 'label' => 'Address'],
            'incident_location' => ['required' => true, 'type' => 'text', 'label' => 'Incident Location'],
            'incident_date' => ['required' => true, 'type' => 'date', 'label' => 'Date of Incident'],
            'incident_time' => ['required' => true, 'type' => 'time', 'label' => 'Time of Incident'],
            'detailed_description' => ['required' => true, 'type' => 'textarea', 'label' => 'Detailed Description'],
        ];

        if ($this->requires_evidence) {
            $defaultFields['evidence_files'] = ['required' => false, 'type' => 'file', 'label' => 'Evidence (Photos/Videos)'];
        }

        return $defaultFields;
    }

    /**
     * Get assigned roles for this complaint type
     */
    public function getAssignedRolesAttribute()
    {
        if (empty($this->assigned_to_roles)) {
            return $this->getDefaultAssignedRoles();
        }

        return $this->assigned_to_roles;
    }

    /**
     * Get default assigned roles based on complaint type
     */
    private function getDefaultAssignedRoles(): array
    {
        // Default role assignments based on complaint type
        $roleAssignments = [
            'PEACE_ORDER' => ['barangay_tanod', 'barangay_captain'],
            'ELECTRICAL_HAZARD' => ['barangay_engineer', 'barangay_tanod'],
            'WATER_PROBLEM' => ['barangay_engineer', 'barangay_utility'],
            'ROAD_MAINTENANCE' => ['barangay_engineer', 'barangay_utility'],
            'HEALTH_SANITATION' => ['barangay_health_worker', 'barangay_sanitation'],
            'NEIGHBOR_DISPUTE' => ['barangay_captain', 'barangay_secretary', 'lupon'],
            'ILLEGAL_STRUCTURE' => ['barangay_engineer', 'barangay_tanod', 'barangay_captain'],
            'WASTE_MANAGEMENT' => ['barangay_sanitation', 'barangay_utility'],
        ];

        return $roleAssignments[$this->code] ?? ['barangay_secretary', 'barangay_tanod'];
    }

    /**
     * Get resolution steps for this complaint type
     */
    public function getResolutionStepsListAttribute()
    {
        if (empty($this->resolution_steps)) {
            return $this->getDefaultResolutionSteps();
        }

        return $this->resolution_steps;
    }

    /**
     * Get default resolution steps
     */
    private function getDefaultResolutionSteps(): array
    {
        return [
            ['step' => 1, 'action' => 'Complaint Received', 'description' => 'Complaint has been submitted and logged'],
            ['step' => 2, 'action' => 'Initial Assessment', 'description' => 'Complaint is being reviewed and assigned'],
            ['step' => 3, 'action' => 'Field Investigation', 'description' => 'Assigned personnel will conduct site visit'],
            ['step' => 4, 'action' => 'Resolution Planning', 'description' => 'Developing solution and action plan'],
            ['step' => 5, 'action' => 'Implementation', 'description' => 'Executing the resolution plan'],
            ['step' => 6, 'action' => 'Follow-up', 'description' => 'Monitoring and ensuring issue is resolved'],
            ['step' => 7, 'action' => 'Case Closed', 'description' => 'Complaint has been successfully resolved'],
        ];
    }

    /**
     * Check if complaint type allows anonymous submission
     */
    public function canBeAnonymous(): bool
    {
        return $this->allows_anonymous;
    }

    /**
     * Check if evidence is required for this complaint type
     */
    public function requiresEvidence(): bool
    {
        return $this->requires_evidence;
    }

    /**
     * Get the next step in resolution process
     */
    public function getNextStep($currentStep = 0): array
    {
        $steps = $this->resolution_steps_list;
        
        if ($currentStep >= count($steps)) {
            return ['step' => count($steps), 'action' => 'Completed', 'description' => 'All steps completed'];
        }

        return $steps[$currentStep];
    }
}
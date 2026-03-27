<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ReportType;
use Carbon\Carbon;

class ReportTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $reportTypes = [
            // ==================== MOST COMMON COMPLAINTS ====================
            [
                'name' => 'Noise Complaint',
                'code' => 'NOISE_COMPLAINT',
                'category' => 'complaint',
                'subcategory' => 'neighbor',
                'description' => 'Excessive noise from neighbors, parties, karaoke, or events',
                'icon' => 'volume-2',
                'color' => '#F59E0B',
                'priority_level' => 3,
                'resolution_days' => 3,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'noise_level' => ['required' => true, 'type' => 'select', 'label' => 'Noise Level', 'options' => ['low', 'moderate', 'high', 'extreme']],
                    'noise_type' => ['required' => true, 'type' => 'select', 'label' => 'Type of Noise', 'options' => ['karaoke', 'construction', 'vehicles', 'animals', 'people', 'machinery']],
                    'time_of_day' => ['required' => true, 'type' => 'select', 'label' => 'Time of Day', 'options' => ['morning', 'afternoon', 'evening', 'night', 'midnight']],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Initial Warning', 'description' => 'Verbal warning to the involved party'],
                    ['step' => 2, 'action' => 'Written Notice', 'description' => 'Formal written notice if issue persists'],
                    ['step' => 3, 'action' => 'Mediation', 'description' => 'Arrange mediation between parties'],
                    ['step' => 4, 'action' => 'Penalty Assessment', 'description' => 'Assess penalties for non-compliance'],
                ],
                'assigned_to_roles' => ['barangay_tanod', 'lupon_member'],
            ],
            [
                'name' => 'Neighbor Dispute',
                'code' => 'NEIGHBOR_DISPUTE',
                'category' => 'complaint',
                'subcategory' => 'neighbor',
                'description' => 'Conflicts with neighbors regarding boundaries, property, or behavior',
                'icon' => 'users',
                'color' => '#8B5CF6',
                'priority_level' => 3,
                'resolution_days' => 7,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => false,
                'allows_anonymous' => false,
                'required_fields' => [
                    'dispute_type' => ['required' => true, 'type' => 'select', 'label' => 'Type of Dispute', 'options' => ['boundary', 'property_damage', 'behavior', 'trespassing']],
                    'preferred_resolution' => ['required' => false, 'type' => 'select', 'label' => 'Preferred Resolution', 'options' => ['mediation', 'warning', 'formal_complaint']],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Initial Assessment', 'description' => 'Review complaint details'],
                    ['step' => 2, 'action' => 'Schedule Mediation', 'description' => 'Arrange mediation meeting'],
                    ['step' => 3, 'action' => 'Mediation Session', 'description' => 'Facilitate discussion and agreement'],
                    ['step' => 4, 'action' => 'Follow-up Monitoring', 'description' => 'Monitor compliance with agreement'],
                ],
                'assigned_to_roles' => ['lupon_member', 'barangay_captain'],
            ],
            [
                'name' => 'Barking Dogs',
                'code' => 'BARKING_DOGS',
                'category' => 'complaint',
                'subcategory' => 'animals',
                'description' => 'Excessive barking from dogs disturbing neighbors',
                'icon' => 'dog',
                'color' => '#D97706',
                'priority_level' => 3,
                'resolution_days' => 3,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'duration_hours' => ['required' => true, 'type' => 'number', 'label' => 'Daily Duration (hours)'],
                    'time_of_day' => ['required' => true, 'type' => 'select', 'label' => 'Worst Time', 'options' => ['morning', 'afternoon', 'evening', 'night', 'all_day']],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Owner Identification', 'description' => 'Identify and locate dog owner'],
                    ['step' => 2, 'action' => 'Owner Notification', 'description' => 'Notify owner of the complaint'],
                    ['step' => 3, 'action' => 'Compliance Period', 'description' => 'Allow time for owner to address issue'],
                ],
                'assigned_to_roles' => ['barangay_tanod', 'barangay_health_worker'],
            ],
            [
                'name' => 'Illegal Parking',
                'code' => 'ILLEGAL_PARKING',
                'category' => 'complaint',
                'subcategory' => 'parking',
                'description' => 'Vehicles parked illegally blocking roads or driveways',
                'icon' => 'car',
                'color' => '#0EA5E9',
                'priority_level' => 3,
                'resolution_days' => 2,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'parking_location' => ['required' => true, 'type' => 'select', 'label' => 'Location', 'options' => ['street', 'private_property', 'driveway', 'fire_lane']],
                    'duration_hours' => ['required' => true, 'type' => 'number', 'label' => 'Blocking Duration (hours)'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Warning Notice', 'description' => 'Place warning notice on vehicle'],
                    ['step' => 2, 'action' => 'Owner Contact', 'description' => 'Attempt to contact vehicle owner'],
                    ['step' => 3, 'action' => 'Towing Arrangement', 'description' => 'Arrange for towing if unresolved'],
                ],
                'assigned_to_roles' => ['barangay_tanod', 'traffic_enforcer'],
            ],
            [
                'name' => 'Public Drunkenness',
                'code' => 'PUBLIC_DRUNKENNESS',
                'category' => 'complaint',
                'subcategory' => 'public-nuisance',
                'description' => 'Drunk individuals causing disturbance in public areas',
                'icon' => 'wine',
                'color' => '#EC4899',
                'priority_level' => 2,
                'resolution_days' => 1,
                'is_active' => true,
                'requires_immediate_action' => true,
                'requires_evidence' => false,
                'allows_anonymous' => true,
                'required_fields' => [
                    'behavior_type' => ['required' => true, 'type' => 'select', 'label' => 'Behavior Type', 'options' => ['loud', 'violent', 'disorderly', 'sleeping_public']],
                    'location_type' => ['required' => true, 'type' => 'select', 'label' => 'Location', 'options' => ['street', 'park', 'alley', 'sari-sari_store']],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Immediate Response', 'description' => 'Send barangay tanod to location'],
                    ['step' => 2, 'action' => 'Sobering Assistance', 'description' => 'Assist individual to sober up'],
                    ['step' => 3, 'action' => 'Family Contact', 'description' => 'Contact family members if needed'],
                ],
                'assigned_to_roles' => ['barangay_tanod', 'barangay_captain'],
            ],
            [
                'name' => 'Boundary Dispute',
                'code' => 'BOUNDARY_DISPUTE',
                'category' => 'complaint',
                'subcategory' => 'property',
                'description' => 'Disagreement over property boundaries between neighbors',
                'icon' => 'map-pin',
                'color' => '#DC2626',
                'priority_level' => 3,
                'resolution_days' => 14,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => false,
                'required_fields' => [
                    'property_documents' => ['required' => true, 'type' => 'checkbox', 'label' => 'I have property documents'],
                    'dispute_duration' => ['required' => true, 'type' => 'select', 'label' => 'How long', 'options' => ['days', 'weeks', 'months', 'years']],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Document Review', 'description' => 'Review property documents'],
                    ['step' => 2, 'action' => 'Site Survey', 'description' => 'Conduct site measurement'],
                    ['step' => 3, 'action' => 'Mediation Meeting', 'description' => 'Facilitate resolution between parties'],
                    ['step' => 4, 'action' => 'Boundary Marking', 'description' => 'Mark agreed boundaries'],
                ],
                'assigned_to_roles' => ['barangay_engineer', 'lupon_member', 'barangay_captain'],
            ],

            // ==================== MOST COMMON COMMUNITY ISSUES ====================
            [
                'name' => 'Clogged Drainage',
                'code' => 'DRAINAGE_CLOGGED',
                'category' => 'issue',
                'subcategory' => 'drainage',
                'description' => 'Blocked canals or drainage causing flood risks',
                'icon' => 'droplets',
                'color' => '#0EA5E9',
                'priority_level' => 2,
                'resolution_days' => 2,
                'is_active' => true,
                'requires_immediate_action' => true,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'severity' => ['required' => true, 'type' => 'select', 'label' => 'Severity Level', 'options' => ['low', 'medium', 'high', 'critical']],
                    'flood_risk' => ['required' => true, 'type' => 'checkbox', 'label' => 'Flooding occurring'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Immediate Assessment', 'description' => 'Send team to assess blockage'],
                    ['step' => 2, 'action' => 'Debris Removal', 'description' => 'Clear debris and blockage'],
                    ['step' => 3, 'action' => 'Drainage Cleaning', 'description' => 'Thorough cleaning of drainage'],
                ],
                'assigned_to_roles' => ['barangay_utility', 'barangay_engineer'],
            ],
            [
                'name' => 'Street Light Problem',
                'code' => 'STREET_LIGHT',
                'category' => 'issue',
                'subcategory' => 'infrastructure',
                'description' => 'Non-functional, flickering, or damaged street lights',
                'icon' => 'lamp',
                'color' => '#F59E0B',
                'priority_level' => 2,
                'resolution_days' => 3,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'light_condition' => ['required' => true, 'type' => 'select', 'label' => 'Condition', 'options' => ['not_working', 'flickering', 'damaged']],
                    'safety_concern' => ['required' => true, 'type' => 'checkbox', 'label' => 'Safety concern in area'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Electrical Inspection', 'description' => 'Check electrical connections'],
                    ['step' => 2, 'action' => 'Repair/Replacement', 'description' => 'Replace faulty components'],
                    ['step' => 3, 'action' => 'Testing', 'description' => 'Test repaired street light'],
                ],
                'assigned_to_roles' => ['barangay_engineer', 'electrician'],
            ],
            [
                'name' => 'Road Potholes',
                'code' => 'ROAD_POTHOLES',
                'category' => 'issue',
                'subcategory' => 'infrastructure',
                'description' => 'Potholes or damaged road surfaces',
                'icon' => 'road',
                'color' => '#6B7280',
                'priority_level' => 2,
                'resolution_days' => 5,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'pothole_count' => ['required' => true, 'type' => 'number', 'label' => 'Number of potholes'],
                    'traffic_hazard' => ['required' => true, 'type' => 'checkbox', 'label' => 'Traffic hazard'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Safety Measures', 'description' => 'Place warning signs'],
                    ['step' => 2, 'action' => 'Assessment', 'description' => 'Assess damage and materials'],
                    ['step' => 3, 'action' => 'Repair Work', 'description' => 'Perform road repair'],
                ],
                'assigned_to_roles' => ['barangay_engineer', 'barangay_utility'],
            ],
            [
                'name' => 'Garbage Not Collected',
                'code' => 'WASTE_COLLECTION',
                'category' => 'issue',
                'subcategory' => 'sanitation',
                'description' => 'Missed garbage collection or overflowing bins',
                'icon' => 'trash-2',
                'color' => '#10B981',
                'priority_level' => 2,
                'resolution_days' => 1,
                'is_active' => true,
                'requires_immediate_action' => true,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'issue_type' => ['required' => true, 'type' => 'select', 'label' => 'Issue Type', 'options' => ['missed_collection', 'overflowing', 'scattered_waste']],
                    'health_risk' => ['required' => true, 'type' => 'checkbox', 'label' => 'Health/smell concern'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Immediate Cleanup', 'description' => 'Dispatch cleanup team'],
                    ['step' => 2, 'action' => 'Collection Coordination', 'description' => 'Coordinate with garbage collectors'],
                    ['step' => 3, 'action' => 'Schedule Review', 'description' => 'Review collection schedule'],
                ],
                'assigned_to_roles' => ['barangay_sanitation', 'barangay_utility'],
            ],
            [
                'name' => 'Water Supply Issue',
                'code' => 'WATER_SUPPLY',
                'category' => 'issue',
                'subcategory' => 'utilities',
                'description' => 'No water, low water pressure, or water quality issues',
                'icon' => 'droplet',
                'color' => '#3B82F6',
                'priority_level' => 2,
                'resolution_days' => 2,
                'is_active' => true,
                'requires_immediate_action' => true,
                'requires_evidence' => false,
                'allows_anonymous' => true,
                'required_fields' => [
                    'problem_type' => ['required' => true, 'type' => 'select', 'label' => 'Problem Type', 'options' => ['no_water', 'low_pressure', 'brown_water']],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Water District Contact', 'description' => 'Contact water service provider'],
                    ['step' => 2, 'action' => 'Line Inspection', 'description' => 'Inspect water lines'],
                    ['step' => 3, 'action' => 'Repair Coordination', 'description' => 'Coordinate repairs'],
                ],
                'assigned_to_roles' => ['barangay_engineer', 'water_district_liaison'],
            ],
            [
                'name' => 'Stray Animals',
                'code' => 'STRAY_ANIMALS',
                'category' => 'issue',
                'subcategory' => 'animals',
                'description' => 'Dangerous or excessive stray animals in the area',
                'icon' => 'cat',
                'color' => '#D97706',
                'priority_level' => 3,
                'resolution_days' => 3,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'animal_type' => ['required' => true, 'type' => 'select', 'label' => 'Animal Type', 'options' => ['dogs', 'cats', 'poultry', 'others']],
                    'danger_level' => ['required' => true, 'type' => 'select', 'label' => 'Danger Level', 'options' => ['low', 'medium', 'high']],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Animal Control Contact', 'description' => 'Contact animal control'],
                    ['step' => 2, 'action' => 'Rescue Arrangement', 'description' => 'Arrange for animal rescue'],
                    ['step' => 3, 'action' => 'Community Advisory', 'description' => 'Issue community advisory'],
                ],
                'assigned_to_roles' => ['barangay_health_worker', 'barangay_tanod'],
            ],
            [
                'name' => 'Illegal Dumping',
                'code' => 'ILLEGAL_DUMPING',
                'category' => 'issue',
                'subcategory' => 'sanitation',
                'description' => 'Illegal garbage dumping in vacant lots or public areas',
                'icon' => 'trash',
                'color' => '#10B981',
                'priority_level' => 2,
                'resolution_days' => 3,
                'is_active' => true,
                'requires_immediate_action' => true,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'dump_size' => ['required' => true, 'type' => 'select', 'label' => 'Size of Dump', 'options' => ['small', 'medium', 'large', 'very_large']],
                    'toxic_materials' => ['required' => true, 'type' => 'checkbox', 'label' => 'Contains toxic materials'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Immediate Cleanup', 'description' => 'Arrange for cleanup'],
                    ['step' => 2, 'action' => 'Investigation', 'description' => 'Investigate source of dumping'],
                    ['step' => 3, 'action' => 'Warning Signs', 'description' => 'Install no dumping signs'],
                ],
                'assigned_to_roles' => ['barangay_sanitation', 'barangay_tanod'],
            ],
            [
                'name' => 'Sidewalk Obstruction',
                'code' => 'SIDEWALK_OBSTRUCTION',
                'category' => 'issue',
                'subcategory' => 'infrastructure',
                'description' => 'Sidewalks blocked by vendors, parked vehicles, or structures',
                'icon' => 'walking',
                'color' => '#6B7280',
                'priority_level' => 3,
                'resolution_days' => 2,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'obstruction_type' => ['required' => true, 'type' => 'select', 'label' => 'Obstruction Type', 'options' => ['vendor', 'vehicle', 'construction', 'personal_property']],
                    'accessibility_issue' => ['required' => true, 'type' => 'checkbox', 'label' => 'Blocks pedestrian access'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Warning Notice', 'description' => 'Issue warning to remove obstruction'],
                    ['step' => 2, 'action' => 'Removal Assistance', 'description' => 'Assist with removal if needed'],
                    ['step' => 3, 'action' => 'Follow-up Inspection', 'description' => 'Verify obstruction cleared'],
                ],
                'assigned_to_roles' => ['barangay_tanod', 'barangay_utility'],
            ],
            [
                'name' => 'Overgrown Grass/Weeds',
                'code' => 'OVERGROWN_GRASS',
                'category' => 'issue',
                'subcategory' => 'environment',
                'description' => 'Overgrown grass or weeds in public areas or vacant lots',
                'icon' => 'grass',
                'color' => '#10B981',
                'priority_level' => 3,
                'resolution_days' => 5,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'area_size' => ['required' => true, 'type' => 'select', 'label' => 'Area Size', 'options' => ['small', 'medium', 'large']],
                    'fire_hazard' => ['required' => true, 'type' => 'checkbox', 'label' => 'Fire hazard concern'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Owner Notification', 'description' => 'Notify property owner if private'],
                    ['step' => 2, 'action' => 'Cleaning Schedule', 'description' => 'Schedule grass cutting'],
                    ['step' => 3, 'action' => 'Cleaning Execution', 'description' => 'Cut grass and clear area'],
                ],
                'assigned_to_roles' => ['barangay_utility', 'barangay_engineer'],
            ],
            [
                'name' => 'Vandalism',
                'code' => 'VANDALISM',
                'category' => 'issue',
                'subcategory' => 'vandalism',
                'description' => 'Graffiti or damage to public property',
                'icon' => 'spray',
                'color' => '#8B5CF6',
                'priority_level' => 3,
                'resolution_days' => 3,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => true,
                'allows_anonymous' => true,
                'required_fields' => [
                    'location_type' => ['required' => true, 'type' => 'select', 'label' => 'Location Type', 'options' => ['public_wall', 'private_property', 'monument', 'other']],
                    'offensive_content' => ['required' => true, 'type' => 'checkbox', 'label' => 'Contains offensive content'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Documentation', 'description' => 'Photograph and document damage'],
                    ['step' => 2, 'action' => 'Cleanup Arrangement', 'description' => 'Arrange for cleanup/repainting'],
                    ['step' => 3, 'action' => 'Cleanup Execution', 'description' => 'Clean or paint over damage'],
                ],
                'assigned_to_roles' => ['barangay_utility', 'barangay_tanod'],
            ],

            // ==================== OTHERS CATEGORY ====================
            [
                'name' => 'Other Complaint',
                'code' => 'OTHER_COMPLAINT',
                'category' => 'complaint',
                'subcategory' => 'other',
                'description' => 'Other types of complaints not listed above',
                'icon' => 'alert-circle',
                'color' => '#6B7280',
                'priority_level' => 3,
                'resolution_days' => 10,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => false,
                'allows_anonymous' => true,
                'required_fields' => [
                    'complaint_details' => ['required' => true, 'type' => 'textarea', 'label' => 'Detailed description of complaint'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Initial Assessment', 'description' => 'Review complaint details'],
                    ['step' => 2, 'action' => 'Category Assignment', 'description' => 'Assign to appropriate category'],
                    ['step' => 3, 'action' => 'Resolution Process', 'description' => 'Follow standard resolution process'],
                ],
                'assigned_to_roles' => ['barangay_secretary', 'barangay_captain'],
            ],
            [
                'name' => 'Other Issue',
                'code' => 'OTHER_ISSUE',
                'category' => 'issue',
                'subcategory' => 'other',
                'description' => 'Other types of community issues not listed above',
                'icon' => 'help-circle',
                'color' => '#6B7280',
                'priority_level' => 3,
                'resolution_days' => 10,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => false,
                'allows_anonymous' => true,
                'required_fields' => [
                    'issue_details' => ['required' => true, 'type' => 'textarea', 'label' => 'Detailed description of issue'],
                ],
                'resolution_steps' => [
                    ['step' => 1, 'action' => 'Initial Assessment', 'description' => 'Review issue details'],
                    ['step' => 2, 'action' => 'Category Assignment', 'description' => 'Assign to appropriate category'],
                    ['step' => 3, 'action' => 'Resolution Process', 'description' => 'Follow standard resolution process'],
                ],
                'assigned_to_roles' => ['barangay_secretary', 'barangay_captain'],
            ],
        ];

        foreach ($reportTypes as $type) {
            // Add timestamps if not present
            if (!isset($type['created_at'])) {
                $type['created_at'] = Carbon::now();
                $type['updated_at'] = Carbon::now();
            }

            // Add default fields if not specified
            $defaults = [
                'priority_level' => 3,
                'resolution_days' => 7,
                'is_active' => true,
                'requires_immediate_action' => false,
                'requires_evidence' => false,
                'allows_anonymous' => true,
                'required_fields' => [],
                'resolution_steps' => [],
                'assigned_to_roles' => [],
            ];

            $type = array_merge($defaults, $type);

            // Check if report type already exists
            $existing = ReportType::where('code', $type['code'])->first();
            
            if ($existing) {
                // Update existing record
                $existing->update($type);
                $this->command->info("Updated report type: {$type['name']}");
            } else {
                // Create new record
                ReportType::create($type);
                $this->command->info("Created report type: {$type['name']}");
            }
        }

        $this->command->info('Report types seeded successfully!');
        $this->command->info('Total: ' . count($reportTypes) . ' report types');
        $this->command->info('Complaints: ' . collect($reportTypes)->where('category', 'complaint')->count());
        $this->command->info('Issues: ' . collect($reportTypes)->where('category', 'issue')->count());
        $this->command->info('Others: ' . collect($reportTypes)->where('subcategory', 'other')->count());
    }
}
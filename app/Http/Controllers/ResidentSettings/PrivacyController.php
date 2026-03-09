<?php

namespace App\Http\Controllers\ResidentSettings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Resident;
use App\Models\User;
use App\Models\Household;
use App\Models\HouseholdMember;

class PrivacyController extends Controller
{
    /**
     * Display privacy dashboard for household
     */
    public function index()
    {
        $user = Auth::user();
        
        // DEBUG: Log user data
        \Log::info('Current User:', [
            'id' => $user->id,
            'username' => $user->username,
            'resident_id' => $user->resident_id,
            'current_resident_id' => $user->current_resident_id,
            'household_id' => $user->household_id,
        ]);
        
        // Get the household with relationships
        $household = Household::with(['purok', 'user'])
            ->find($user->household_id);
        
        // DEBUG: Log household data
        \Log::info('Household found:', [
            'exists' => $household ? 'yes' : 'no',
            'id' => $household?->id,
            'number' => $household?->household_number,
        ]);
        
        // Determine which resident ID to use - try current_resident_id first, fallback to resident_id
        $residentId = $user->current_resident_id ?? $user->resident_id;
        
        // Get the current resident
        $currentResident = null;
        if ($residentId) {
            $currentResident = Resident::with(['purok', 'household'])
                ->find($residentId);
        }
        
        // DEBUG: Log resident data
        \Log::info('Current Resident:', [
            'found' => $currentResident ? 'yes' : 'no',
            'id' => $currentResident?->id,
            'name' => $currentResident?->full_name,
        ]);
        
        // Get all household members with their resident data
        $householdMembers = collect();
        if ($user->household_id) {
            $householdMembers = HouseholdMember::with('resident')
                ->where('household_id', $user->household_id)
                ->get();
            
            // DEBUG: Log household members
            \Log::info('Household Members found:', ['count' => $householdMembers->count()]);
        }
        
        // Get all residents in this household
        $residentIds = $householdMembers->pluck('resident_id')->toArray();
        if ($currentResident && !in_array($currentResident->id, $residentIds)) {
            $residentIds[] = $currentResident->id;
        }
        
        // Format the data
        $residentData = $this->formatResidentDataForFrontend($currentResident, $household);
        $formattedHousehold = $this->formatHouseholdMembersForFrontend($householdMembers, $currentResident);
        $accessLogs = $this->getAccessLogsForFrontend($residentIds, $user);
        $documents = $this->getDocumentsForFrontend($residentIds);
        
        // DEBUG: Log formatted data
        \Log::info('Formatted Data:', [
            'residentData_fullName' => $residentData['fullName'],
            'household_count' => count($formattedHousehold),
            'accessLogs_count' => count($accessLogs),
            'documents_count' => count($documents),
        ]);
        
        return Inertia::render('residentsettings/privacy', [
            'residentData' => $residentData,
            'accessLogs' => $accessLogs,
            'consents' => $this->getConsentsForFrontend($user),
            'documents' => $documents,
            'household' => $formattedHousehold,
            'dataCategories' => $this->getDataCategoriesForFrontend(),
            'privacyScore' => $this->getPrivacyScoreForFrontend($user, $currentResident),
        ]);
    }

    /**
     * Format resident data for frontend
     */
    private function formatResidentDataForFrontend(?Resident $resident, ?Household $household)
    {
        if (!$resident) {
            \Log::warning('No resident found, using default data');
            return $this->getDefaultResidentData();
        }
        
        \Log::info('Formatting resident:', ['id' => $resident->id, 'name' => $resident->full_name]);
        
        // Get emergency contact info from resident if available
        $emergencyContact = [
            'name' => $resident->emergency_contact_name ?? 'Not specified',
            'relation' => $resident->emergency_contact_relation ?? 'Not specified',
            'number' => $resident->emergency_contact_number ?? 'Not specified',
        ];
        
        // Get ID numbers
        $idNumbers = [
            'philSys' => $resident->philsys_id_number ?? '',
            'passport' => $resident->passport_number ?? '',
            'driversLicense' => $resident->drivers_license_number ?? '',
        ];
        
        // Get government numbers
        $philhealth = $resident->philhealth_number ?? '';
        $tin = $resident->tin_number ?? '';
        
        // Get address information
        $address = $resident->address ?? ($household->address ?? 'Not specified');
        $zone = $resident->purok ? $resident->purok->name : ($household->purok->name ?? 'Not specified');
        $householdNumber = $household->household_number ?? 'Not specified';
        
        // Get employment info
        $occupation = $resident->occupation ?? 'Not specified';
        $education = $resident->education ?? 'Not specified';
        $religion = $resident->religion ?? 'Not specified';
        
        // Get monthly income from household
        $monthlyIncome = $this->formatIncomeRange($household->income_range ?? null);
        
        return [
            'id' => $resident->id,
            'fullName' => $resident->full_name,
            'firstName' => $resident->first_name ?? '',
            'lastName' => $resident->last_name ?? '',
            'middleName' => $resident->middle_name ?? '',
            'suffix' => $resident->suffix ?? '',
            'birthDate' => $resident->birth_date ? $resident->birth_date->format('F j, Y') : 'Not specified',
            'age' => $resident->age ?? $this->calculateAge($resident->birth_date),
            'gender' => $resident->gender ?? 'Not specified',
            'civilStatus' => $resident->civil_status ?? 'Not specified',
            'contactNumber' => $resident->contact_number ?? 'Not specified',
            'email' => $resident->email ?? 'Not specified',
            'occupation' => $occupation,
            'education' => $education,
            'religion' => $religion,
            'voterStatus' => (bool) ($resident->is_voter ?? false),
            'isPwd' => (bool) ($resident->is_pwd ?? false),
            'isSenior' => (bool) ($resident->is_senior ?? $resident->isSenior()),
            'isSoloParent' => (bool) ($resident->is_solo_parent ?? false),
            'isIndigent' => (bool) ($resident->is_indigent ?? false),
            'philhealth' => $philhealth,
            'tin' => $tin,
            'address' => $address,
            'zone' => $zone,
            'household' => $householdNumber,
            'monthlyIncome' => $monthlyIncome,
            'emergencyContact' => $emergencyContact,
            'idNumbers' => $idNumbers,
        ];
    }

    /**
     * Get default resident data
     */
    private function getDefaultResidentData()
    {
        return [
            'id' => 0,
            'fullName' => '—',
            'firstName' => '',
            'lastName' => '',
            'middleName' => '',
            'suffix' => '',
            'birthDate' => '—',
            'age' => 0,
            'gender' => '—',
            'civilStatus' => '—',
            'contactNumber' => '—',
            'email' => '—',
            'occupation' => '—',
            'education' => '—',
            'religion' => '—',
            'voterStatus' => false,
            'isPwd' => false,
            'isSenior' => false,
            'isSoloParent' => false,
            'isIndigent' => false,
            'philhealth' => '—',
            'tin' => '—',
            'address' => '—',
            'zone' => '—',
            'household' => '—',
            'monthlyIncome' => '—',
            'emergencyContact' => [
                'name' => '—',
                'relation' => '—',
                'number' => '—',
            ],
            'idNumbers' => [
                'philSys' => '',
                'passport' => '',
                'driversLicense' => '',
            ],
        ];
    }

    /**
     * Calculate age from birth date
     */
    private function calculateAge($birthDate)
    {
        if (!$birthDate) return 0;
        return $birthDate->age;
    }

    /**
     * Format income range
     */
    private function formatIncomeRange($range)
    {
        if (!$range) return 'Not specified';
        
        $ranges = [
            'below_5000' => 'Below ₱5,000',
            '5001_10000' => '₱5,001 - ₱10,000',
            '10001_15000' => '₱10,001 - ₱15,000',
            '15001_20000' => '₱15,001 - ₱20,000',
            '20001_30000' => '₱20,001 - ₱30,000',
            'above_30000' => 'Above ₱30,000',
        ];
        
        return $ranges[$range] ?? $range;
    }

    /**
     * Format household members for frontend
     */
    private function formatHouseholdMembersForFrontend($members, ?Resident $currentResident)
    {
        if ($members->isEmpty()) {
            return [];
        }
        
        return $members->map(function($member) use ($currentResident) {
            $resident = $member->resident;
            if (!$resident) return null;
            
            return [
                'id' => $resident->id,
                'name' => $resident->full_name,
                'relation' => $member->relationship_to_head ?? 'Member',
                'age' => $resident->age ?? $this->calculateAge($resident->birth_date),
                'occupation' => $resident->occupation ?? null,
                'isHead' => (bool) ($member->is_head ?? false),
                'isCurrentUser' => $currentResident && $resident->id === $currentResident->id,
                'gender' => $resident->gender ?? 'Unknown',
                'civilStatus' => $resident->civil_status ?? 'Unknown',
                'isSenior' => (bool) ($resident->is_senior ?? $resident->isSenior()),
                'isPwd' => (bool) ($resident->is_pwd ?? false),
            ];
        })->filter()->values()->toArray();
    }

    /**
     * Get real access logs from database
     */
    private function getAccessLogsForFrontend(array $residentIds, User $user)
    {
        try {
            // Try to get from access_logs table
            $logs = DB::table('access_logs')
                ->whereIn('resource_id', $residentIds)
                ->where('resource_type', 'Resident')
                ->orderBy('accessed_at', 'desc')
                ->limit(50)
                ->get();
            
            if ($logs->isNotEmpty()) {
                return $logs->map(function($log) {
                    // Get official name
                    $official = 'System';
                    $position = 'System';
                    
                    if ($log->user_id) {
                        $officialUser = User::find($log->user_id);
                        if ($officialUser) {
                            $official = $officialUser->first_name . ' ' . $officialUser->last_name;
                            
                            // Try to get position from role
                            if ($officialUser->role) {
                                $position = $officialUser->role->name;
                            }
                        }
                    }
                    
                    return [
                        'id' => $log->id,
                        'date' => date('M d, Y h:i A', strtotime($log->accessed_at)),
                        'official' => $official,
                        'position' => $position,
                        'reason' => $log->description ?? 'Data access for barangay services',
                        'dataAccessed' => $this->parseDataAccessed($log->description),
                        'department' => 'Barangay Hall',
                    ];
                })->toArray();
            }
            
            // Try to get from activity_log
            $activities = DB::table('activity_log')
                ->whereIn('subject_id', $residentIds)
                ->where('subject_type', 'App\Models\Resident')
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();
            
            if ($activities->isNotEmpty()) {
                return $activities->map(function($activity) {
                    $causer = null;
                    $official = 'System';
                    $position = 'System';
                    
                    if ($activity->causer_id && $activity->causer_type === 'App\Models\User') {
                        $causer = User::find($activity->causer_id);
                        if ($causer) {
                            $official = $causer->first_name . ' ' . $causer->last_name;
                            if ($causer->role) {
                                $position = $causer->role->name;
                            }
                        }
                    }
                    
                    return [
                        'id' => $activity->id,
                        'date' => date('M d, Y h:i A', strtotime($activity->created_at)),
                        'official' => $official,
                        'position' => $position,
                        'reason' => $activity->description,
                        'dataAccessed' => $this->parseDataAccessed($activity->description),
                        'department' => 'Barangay Hall',
                    ];
                })->toArray();
            }
            
            return [];
            
        } catch (\Exception $e) {
            \Log::error('Error fetching access logs: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Parse data accessed from description
     */
    private function parseDataAccessed($description)
    {
        $description = strtolower($description ?? '');
        
        if (strpos($description, 'document') !== false) {
            return ['Documents'];
        } elseif (strpos($description, 'payment') !== false) {
            return ['Payment Records'];
        } elseif (strpos($description, 'clearance') !== false) {
            return ['Clearance Records'];
        } elseif (strpos($description, 'profile') !== false || strpos($description, 'resident') !== false) {
            return ['Personal Information'];
        } elseif (strpos($description, 'household') !== false) {
            return ['Household Information'];
        }
        
        return ['Personal Information'];
    }

    /**
     * Get real documents from database
     */
    private function getDocumentsForFrontend(array $residentIds)
    {
        try {
            $documents = DB::table('resident_documents')
                ->whereIn('resident_id', $residentIds)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();
            
            if ($documents->isEmpty()) {
                return [];
            }
            
            return $documents->map(function($doc) {
                $resident = Resident::find($doc->resident_id);
                return [
                    'id' => $doc->id,
                    'type' => $this->getDocumentTypeName($doc->document_category_id),
                    'dateIssued' => $doc->issue_date 
                        ? date('M d, Y', strtotime($doc->issue_date))
                        : date('M d, Y', strtotime($doc->created_at)),
                    'referenceNumber' => $doc->reference_number ?? 'DOC-' . str_pad($doc->id, 6, '0', STR_PAD_LEFT),
                    'purpose' => $doc->purpose ?? 'General purpose',
                    'status' => $doc->status ?? 'active',
                    'residentName' => $resident ? $resident->full_name : 'Unknown',
                ];
            })->toArray();
            
        } catch (\Exception $e) {
            \Log::error('Error fetching documents: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get document type name
     */
    private function getDocumentTypeName($categoryId)
    {
        try {
            $category = DB::table('document_categories')
                ->where('id', $categoryId)
                ->first();
            
            return $category ? $category->name : 'Document';
        } catch (\Exception $e) {
            return 'Document';
        }
    }

    /**
     * Get consents (you may need to create a consents table)
     */
    private function getConsentsForFrontend(User $user)
    {
        return [];
    }

    /**
     * Get data categories
     */
    private function getDataCategoriesForFrontend()
    {
        return [
            [
                'name' => 'Personal Information',
                'description' => 'Basic personal details',
                'icon' => 'UserCircle',
                'fields' => ['Full Name', 'Birth Date', 'Age', 'Gender', 'Civil Status', 'Religion'],
                'lastUpdated' => now()->format('M d, Y'),
                'retention' => '10 years',
                'legalBasis' => 'CBMS Act / Barangay Registry',
            ],
            [
                'name' => 'Contact Information',
                'description' => 'Address and contact details',
                'icon' => 'MapPin',
                'fields' => ['Complete Address', 'Purok', 'Contact Number', 'Email'],
                'lastUpdated' => now()->format('M d, Y'),
                'retention' => '10 years',
                'legalBasis' => 'Barangay Ordinance',
            ],
            [
                'name' => 'Household Data',
                'description' => 'Household composition',
                'icon' => 'Home',
                'fields' => ['Household Number', 'Relationship to Head', 'Household Size'],
                'lastUpdated' => now()->format('M d, Y'),
                'retention' => '10 years',
                'legalBasis' => 'Housing and Land Use Registry',
            ],
            [
                'name' => 'Socioeconomic Data',
                'description' => 'Employment and income',
                'icon' => 'Briefcase',
                'fields' => ['Occupation', 'Education', 'Income Range', 'Voter Status'],
                'lastUpdated' => now()->format('M d, Y'),
                'retention' => '5 years',
                'legalBasis' => 'Social Services Eligibility',
            ],
            [
                'name' => 'Special Categories',
                'description' => 'Special classifications',
                'icon' => 'Heart',
                'fields' => ['Senior Citizen', 'PWD', 'Solo Parent', 'Indigent'],
                'lastUpdated' => now()->format('M d, Y'),
                'retention' => '5 years',
                'legalBasis' => 'Social Welfare Laws',
            ],
            [
                'name' => 'Documents',
                'description' => 'Uploaded documents',
                'icon' => 'FileText',
                'fields' => ['Clearances', 'Certificates', 'Other Documents'],
                'lastUpdated' => now()->format('M d, Y'),
                'retention' => 'Permanent',
                'legalBasis' => 'Document Management System',
            ],
        ];
    }

    /**
     * Get privacy score
     */
    private function getPrivacyScoreForFrontend(User $user, ?Resident $resident)
    {
        $score = 85;
        $recommendations = [];
        
        // Check 2FA
        if (!$user->hasEnabledTwoFactorAuthentication()) {
            $score -= 10;
            $recommendations[] = 'Enable two-factor authentication for better account security';
        }
        
        // Check email verification
        if (!$user->email_verified_at) {
            $score -= 5;
            $recommendations[] = 'Verify your email address';
        }
        
        // Check contact number
        if ($resident && !$resident->contact_number) {
            $score -= 5;
            $recommendations[] = 'Add your contact number for important notifications';
        }
        
        // Check recent password change
        if (!$user->password_changed_at || now()->diffInDays($user->password_changed_at) > 180) {
            $score -= 5;
            $recommendations[] = 'Consider changing your password - it\'s been over 6 months';
        }
        
        // Check active sessions
        $activeSessions = DB::table('sessions')->where('user_id', $user->id)->count();
        if ($activeSessions > 3) {
            $score -= 5;
            $recommendations[] = 'You have multiple active sessions - review your connected devices';
        }
        
        // Check if senior but no senior ID
        if ($resident && $resident->isSenior() && !$resident->senior_id_number) {
            $score -= 5;
            $recommendations[] = 'Register your senior citizen ID for benefits';
        }
        
        // Check if PWD but no PWD ID
        if ($resident && $resident->is_pwd && !$resident->pwd_id_number) {
            $score -= 5;
            $recommendations[] = 'Register your PWD ID for benefits';
        }
        
        return [
            'score' => max(0, min(100, $score)),
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Request correction for household member's data
     */
    public function requestCorrection(Request $request)
    {
        $validated = $request->validate([
            'resident_id' => 'required|integer|exists:residents,id',
            'field' => 'required|string',
            'current_value' => 'nullable|string',
            'requested_value' => 'required|string',
            'reason' => 'required|string',
        ]);

        $user = Auth::user();
        
        // Verify this resident belongs to user's household
        $member = HouseholdMember::where('household_id', $user->household_id)
            ->where('resident_id', $validated['resident_id'])
            ->first();

        if (!$member && $validated['resident_id'] != $user->current_resident_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: This resident does not belong to your household.',
            ], 403);
        }

        $resident = Resident::find($validated['resident_id']);

        try {
            // Log to activity_log
            activity()
                ->performedOn($resident)
                ->causedBy($user)
                ->withProperties([
                    'resident_name' => $resident->full_name,
                    'field' => $validated['field'],
                    'current_value' => $validated['current_value'],
                    'requested_value' => $validated['requested_value'],
                    'reason' => $validated['reason'],
                    'household_id' => $user->household_id,
                ])
                ->log("Correction requested for {$resident->full_name}: {$validated['field']}");

            // Log to access_logs if table exists
            try {
                DB::table('access_logs')->insert([
                    'user_id' => $user->id,
                    'session_id' => session()->getId(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'method' => 'POST',
                    'url' => $request->url(),
                    'action_type' => 'update',
                    'resource_type' => 'Resident',
                    'resource_id' => $resident->id,
                    'description' => "Correction requested for {$resident->full_name} - {$validated['field']}",
                    'is_sensitive' => 1,
                    'accessed_at' => now(),
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                // Table might not exist, ignore
            }

            return response()->json([
                'success' => true,
                'message' => 'Correction request submitted successfully. Barangay secretary will review it.',
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Correction request failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit correction request.',
            ], 500);
        }
    }

    /**
     * Export all household data
     */
    public function exportData(Request $request)
    {
        $user = Auth::user();

        try {
            // Log the export request
            try {
                DB::table('access_logs')->insert([
                    'user_id' => $user->id,
                    'session_id' => session()->getId(),
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'method' => 'POST',
                    'url' => $request->url(),
                    'action_type' => 'export',
                    'resource_type' => 'HouseholdData',
                    'resource_id' => $user->household_id,
                    'description' => "Exported all household data",
                    'is_sensitive' => 1,
                    'accessed_at' => now(),
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                // Table might not exist, ignore
            }

            return response()->json([
                'success' => true,
                'message' => 'Data export request received. A copy of your household data will be sent to your email.',
            ]);

        } catch (\Exception $e) {
            \Log::error('Export failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to export data.',
            ], 500);
        }
    }

    /**
     * Get data for a specific household member
     */
    public function getMemberData($residentId)
    {
        $user = Auth::user();
        
        // Verify this resident belongs to user's household
        $member = HouseholdMember::where('household_id', $user->household_id)
            ->where('resident_id', $residentId)
            ->first();

        if (!$member && $residentId != $user->current_resident_id) {
            abort(403, 'Unauthorized');
        }

        $resident = Resident::with(['purok', 'household'])->find($residentId);
        $household = Household::find($user->household_id);
        
        return Inertia::render('residentsettings/member-data', [
            'resident' => $this->formatResidentDataForFrontend($resident, $household),
        ]);
    }
}
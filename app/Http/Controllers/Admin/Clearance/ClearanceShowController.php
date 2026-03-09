<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClearanceShowController extends Controller
{
    public function __invoke(ClearanceRequest $clearance)
    {
        // Load all necessary relationships
        $clearance->load([
            'clearanceType',
            'contactPurok',
            'issuingOfficer',
            'processedBy',
            'requestedBy',
            'payment',
            'paymentItems',
            'documents',
            'activities' => function ($query) {
                $query->with('causer')->orderBy('created_at', 'desc');
            }
        ]);
        
        // Load payer based on type
        $this->loadPayerRelationships($clearance);

        // Get activity logs
        $activityLogs = $this->formatActivityLogs($clearance);

        // Determine permissions
        $permissions = $this->getPermissions($clearance);

        return Inertia::render('admin/Clearances/Show', [
            'clearance' => $clearance,
            'activityLogs' => $activityLogs,
            ...$permissions,
        ]);
    }

    /**
     * Print clearance certificate.
     */
    public function print(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'issued') {
            return redirect()->back()->with('error', 'Cannot print clearance that is not issued.');
        }

        $clearance->load(['clearanceType', 'resident', 'issuingOfficer']);

        return Inertia::render('admin/Clearances/Print', [
            'clearance' => $clearance,
        ]);
    }

    /**
     * Download clearance certificate.
     */
    public function download(ClearanceRequest $clearance)
    {
        if ($clearance->status !== 'issued') {
            return redirect()->back()->with('error', 'Cannot download clearance that is not issued.');
        }

        // TODO: Implement PDF generation
        return redirect()->back()->with('info', 'Download functionality to be implemented.');
    }

    protected function loadPayerRelationships(ClearanceRequest $clearance): void
    {
        if ($clearance->payer_type === 'resident') {
            $clearance->load('resident.purok');
        } elseif ($clearance->payer_type === 'household') {
            $clearance->load(['household' => function ($query) {
                $query->with(['householdMembers.resident', 'purok', 'user']);
            }]);
        } elseif ($clearance->payer_type === 'business') {
            $clearance->load(['business' => function ($query) {
                $query->with(['owner', 'purok']);
            }]);
        }
    }

    protected function formatActivityLogs(ClearanceRequest $clearance): array
    {
        return $clearance->activities->map(function ($activity) {
            return [
                'id' => $activity->id,
                'description' => $activity->description,
                'event' => $activity->event,
                'user' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'name' => $activity->causer->name,
                ] : null,
                'created_at' => $activity->created_at->toDateTimeString(),
                'formatted_date' => $activity->created_at->format('F j, Y g:i A'),
                'properties' => $activity->properties,
            ];
        })->toArray();
    }

    protected function getPermissions(ClearanceRequest $clearance): array
    {
        $user = auth()->user();
        
        return [
            'canEdit' => in_array($clearance->status, ['pending', 'pending_payment', 'processing']) && 
                        $user->can('manage-clearances'),
            'canDelete' => in_array($clearance->status, ['pending', 'pending_payment']) && 
                          $user->can('manage-clearances'),
            'canProcess' => in_array($clearance->status, ['pending', 'pending_payment']) && 
                           $user->can('process-clearances'),
            'canIssue' => $clearance->status === 'approved' && $user->can('issue-clearances'),
            'canApprove' => $clearance->status === 'processing' && $user->can('approve-clearances'),
            'canPrint' => $clearance->status === 'issued' && $user->can('print-clearances'),
        ];
    }
}
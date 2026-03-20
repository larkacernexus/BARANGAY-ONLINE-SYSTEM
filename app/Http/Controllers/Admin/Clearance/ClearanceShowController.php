<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ClearanceShowController extends Controller
{
    public function show(ClearanceRequest $clearance)
    {
        $clearance->load([
            'clearanceType',
            'contactPurok',
            'issuingOfficer',
            'processedBy',
            'requestedBy',
            'payment',
            'paymentItems',
            'documents',
            'activities' => fn($q) => $q->with('causer')->orderBy('created_at', 'desc')
        ]);
        
        // Load payer based on type
        if ($clearance->payer_type === 'resident') {
            $clearance->load('resident.purok');
        } elseif ($clearance->payer_type === 'household') {
            $clearance->load(['household' => fn($q) => $q->with(['householdMembers.resident', 'purok', 'user'])]);
        } elseif ($clearance->payer_type === 'business') {
            $clearance->load(['business' => fn($q) => $q->with(['owner', 'purok'])]);
        }

        $activityLogs = $clearance->activities->map(fn($a) => [
            'id' => $a->id,
            'description' => $a->description,
            'event' => $a->event,
            'user' => $a->causer ? ['id' => $a->causer->id, 'name' => $a->causer->name] : null,
            'created_at' => $a->created_at->toDateTimeString(),
            'formatted_date' => $a->created_at->format('F j, Y g:i A'),
            'properties' => $a->properties,
        ]);

        $user = Auth::user();
        $permissions = $this->getPermissions($clearance, $user);

        return Inertia::render('admin/Clearances/Show', [
            'clearance' => $clearance,
            'activityLogs' => $activityLogs,
            ...$permissions,
        ]);
    }

    private function getPermissions($clearance, $user)
    {
        return [
            'canEdit' => in_array($clearance->status, ['pending', 'pending_payment', 'processing']) && $user->can('manage-clearances'),
            'canDelete' => in_array($clearance->status, ['pending', 'pending_payment']) && $user->can('manage-clearances'),
            'canProcess' => in_array($clearance->status, ['pending', 'pending_payment']) && $user->can('process-clearances'),
            'canIssue' => $clearance->status === 'approved' && $user->can('issue-clearances'),
            'canApprove' => $clearance->status === 'processing' && $user->can('approve-clearances'),
            'canPrint' => $clearance->status === 'issued' && $user->can('print-clearances'),
        ];
    }
}
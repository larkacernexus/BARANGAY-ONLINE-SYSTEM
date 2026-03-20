<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Resident;
use App\Models\Privilege;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ResidentBulkController extends BaseResidentController
{
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|string|in:delete,activate,deactivate,update_status,update_purok,add_privilege,remove_privilege,export',
            'resident_ids' => 'required|array|min:1',
            'resident_ids.*' => 'exists:residents,id',
            'status' => 'required_if:action,update_status|in:active,inactive',
            'purok_id' => 'required_if:action,update_purok|exists:puroks,id',
            'privilege_id' => 'required_if:action,add_privilege,remove_privilege|exists:privileges,id',
        ]);

        $action = $request->action;
        $residentIds = $request->resident_ids;

        DB::beginTransaction();
        
        try {
            $result = match($action) {
                'delete' => $this->bulkDelete($residentIds),
                'activate' => $this->bulkActivate($residentIds),
                'deactivate' => $this->bulkDeactivate($residentIds),
                'update_status' => $this->bulkUpdateStatus($residentIds, $request->status),
                'update_purok' => $this->bulkUpdatePurok($residentIds, $request->purok_id),
                'add_privilege' => $this->bulkAddPrivilege($residentIds, $request->privilege_id),
                'remove_privilege' => $this->bulkRemovePrivilege($residentIds, $request->privilege_id),
                'export' => $this->bulkExport($residentIds),
                default => throw new \Exception('Invalid action'),
            };

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => $result['data'] ?? null
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk action failed: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to perform bulk action: ' . $e->getMessage()
            ], 500);
        }
    }

    private function bulkDelete(array $residentIds): array
    {
        $count = 0;
        foreach ($residentIds as $id) {
            $resident = Resident::find($id);
            if ($resident) {
                // Remove from household
                $membership = $resident->householdMemberships()->first();
                if ($membership) {
                    $household = $membership->household;
                    $membership->delete();
                    $household?->updateMemberCount();
                }
                
                // Delete privileges
                $resident->residentPrivileges()->delete();
                
                // Delete photo
                if ($resident->photo_path && Storage::exists('public/' . $resident->photo_path)) {
                    Storage::delete('public/' . $resident->photo_path);
                }
                
                $resident->delete();
                $count++;
            }
        }
        
        return ['message' => "{$count} residents deleted successfully"];
    }

    private function bulkActivate(array $residentIds): array
    {
        $count = Resident::whereIn('id', $residentIds)->update(['status' => 'active']);
        return ['message' => "{$count} residents activated successfully"];
    }

    private function bulkDeactivate(array $residentIds): array
    {
        $count = Resident::whereIn('id', $residentIds)->update(['status' => 'inactive']);
        return ['message' => "{$count} residents deactivated successfully"];
    }

    private function bulkUpdateStatus(array $residentIds, string $status): array
    {
        $count = Resident::whereIn('id', $residentIds)->update(['status' => $status]);
        return ['message' => "{$count} residents status updated to {$status}"];
    }

    private function bulkUpdatePurok(array $residentIds, int $purokId): array
    {
        $count = Resident::whereIn('id', $residentIds)->update(['purok_id' => $purokId]);
        return ['message' => "{$count} residents purok updated successfully"];
    }

    private function bulkAddPrivilege(array $residentIds, int $privilegeId): array
    {
        $privilege = Privilege::find($privilegeId);
        $count = 0;
        
        foreach ($residentIds as $id) {
            $resident = Resident::find($id);
            if ($resident && !$resident->residentPrivileges()->where('privilege_id', $privilegeId)->exists()) {
                $expiresAt = $privilege && $privilege->validity_years 
                    ? now()->addYears($privilege->validity_years) 
                    : null;

                $resident->residentPrivileges()->create([
                    'privilege_id' => $privilegeId,
                    'verified_at' => null,
                    'expires_at' => $expiresAt,
                    'remarks' => 'Added via bulk action',
                    'discount_percentage' => $privilege?->default_discount_percentage,
                ]);
                $count++;
            }
        }
        
        return ['message' => "{$count} residents received the privilege"];
    }

    private function bulkRemovePrivilege(array $residentIds, int $privilegeId): array
    {
        $count = 0;
        foreach ($residentIds as $id) {
            $resident = Resident::find($id);
            if ($resident) {
                $deleted = $resident->residentPrivileges()->where('privilege_id', $privilegeId)->delete();
                $count += $deleted;
            }
        }
        
        return ['message' => "Privilege removed from {$count} residents"];
    }

    private function bulkExport(array $residentIds): array
    {
        // This would typically generate a CSV file
        // For now, return a message
        return ['message' => 'Export functionality to be implemented'];
    }
}
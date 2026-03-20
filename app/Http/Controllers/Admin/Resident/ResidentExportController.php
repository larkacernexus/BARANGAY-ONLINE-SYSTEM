<?php

namespace App\Http\Controllers\Admin\Resident;

use App\Models\Resident;
use Illuminate\Http\Request;

class ResidentExportController extends BaseResidentController
{
    public function export(Request $request)
    {
        $query = Resident::with([
            'purok', 
            'residentPrivileges.privilege', 
            'householdMemberships.household'
        ]);

        // Apply filters
        $this->applyFilters($query, $request);

        $residents = $query->get();

        $headers = $this->getExportHeaders();
        $csvData = $this->prepareExportData($residents);

        return $this->generateCsvResponse($csvData, $headers);
    }

    private function applyFilters($query, Request $request): void
    {
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('contact_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('purok_id') && $request->purok_id !== 'all') {
            $query->where('purok_id', $request->purok_id);
        }

        if ($request->has('privilege_id') && $request->privilege_id !== 'all') {
            $query->whereHas('residentPrivileges', fn($q) => $q->where('privilege_id', $request->privilege_id));
        }
    }

    private function getExportHeaders(): array
    {
        return [
            'Resident ID',
            'Full Name',
            'Birth Date',
            'Age',
            'Gender',
            'Civil Status',
            'Contact Number',
            'Email',
            'Address',
            'Purok',
            'Occupation',
            'Education',
            'Religion',
            'Is Voter',
            'Place of Birth',
            'Household Number',
            'Is Head of Household',
            'Status',
            'Privileges (Code:ID Number)',
            'Created At',
            'Updated At',
        ];
    }

    private function prepareExportData($residents): array
    {
        $csvData = [];
        
        foreach ($residents as $resident) {
            $privileges = $resident->residentPrivileges->map(function($rp) {
                $code = $rp->privilege->code;
                $idNumber = $rp->id_number ? " ({$rp->id_number})" : '';
                $status = $rp->isActive() ? 'Active' : 'Inactive';
                return "{$code}{$idNumber}[{$status}]";
            })->implode('|');

            $householdNumber = $resident->householdMemberships->first()?->household?->household_number ?? 'N/A';
            $isHead = $resident->householdMemberships->first()?->is_head ? 'Yes' : 'No';

            $csvData[] = [
                $resident->resident_id,
                $resident->full_name,
                $resident->birth_date?->format('Y-m-d') ?: '',
                $resident->age,
                $resident->gender,
                $resident->civil_status,
                $resident->contact_number ?? '',
                $resident->email ?? '',
                $resident->address ?? '',
                $resident->purok?->name ?? '',
                $resident->occupation ?? '',
                $resident->education ?? '',
                $resident->religion ?? '',
                $resident->is_voter ? 'Yes' : 'No',
                $resident->place_of_birth ?? '',
                $householdNumber,
                $isHead,
                $resident->status,
                $privileges,
                $resident->created_at->format('Y-m-d H:i:s'),
                $resident->updated_at->format('Y-m-d H:i:s'),
            ];
        }

        return $csvData;
    }

    private function generateCsvResponse(array $csvData, array $headers)
    {
        $callback = function() use ($headers, $csvData) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);

            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        $filename = 'residents_export_' . now()->format('Y-m-d_His') . '.csv';

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
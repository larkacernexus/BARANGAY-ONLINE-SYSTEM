<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\User;
use Illuminate\Support\Facades\Log;

abstract class BaseClearanceController extends Controller
{
    /**
     * Get payer model based on type and ID.
     */
    protected function getPayer(string $type, int $id)
    {
        return match($type) {
            'resident' => Resident::with(['purok', 'household', 'householdMemberships'])->find($id),
            'household' => Household::with(['purok', 'user', 'householdMembers.resident'])->find($id),
            'business' => Business::with(['owner', 'purok'])->find($id),
            default => null,
        };
    }

    /**
     * Get contact information from payer.
     */
    protected function getContactInfoFromPayer($payer, string $type): array
    {
        $contactInfo = [
            'name' => null,
            'contact_number' => null,
            'address' => null,
            'purok_id' => null,
            'purok' => null,
            'email' => null,
        ];

        if (!$payer) {
            return $contactInfo;
        }

        if ($type === 'resident') {
            $contactInfo['name'] = $payer->full_name;
            $contactInfo['contact_number'] = $payer->contact_number;
            $contactInfo['address'] = $payer->address;
            $contactInfo['purok_id'] = $payer->purok_id;
            $contactInfo['purok'] = $payer->purok?->name;
            $contactInfo['email'] = $payer->email;
        } elseif ($type === 'household') {
            $headMember = $payer->householdMembers()
                ->where('is_head', true)
                ->with('resident')
                ->first();
                
            if ($headMember && $headMember->resident) {
                $contactInfo['name'] = $headMember->resident->full_name;
                $contactInfo['contact_number'] = $headMember->resident->contact_number ?? $payer->contact_number;
                $contactInfo['email'] = $headMember->resident->email ?? $payer->email;
            } else {
                $contactInfo['name'] = 'Household ' . $payer->household_number;
                $contactInfo['contact_number'] = $payer->contact_number;
                $contactInfo['email'] = $payer->email;
            }
            
            $contactInfo['address'] = $payer->address;
            $contactInfo['purok_id'] = $payer->purok_id;
            $contactInfo['purok'] = $payer->purok?->name;
        } elseif ($type === 'business') {
            $contactInfo['name'] = $payer->business_name;
            $contactInfo['contact_number'] = $payer->contact_number;
            $contactInfo['address'] = $payer->address;
            $contactInfo['purok_id'] = $payer->purok_id;
            $contactInfo['purok'] = $payer->purok_name;
            
            if ($payer->owner_id && $payer->owner) {
                $contactInfo['email'] = $payer->owner->email;
            }
        }

        return $contactInfo;
    }

    /**
     * Get requested by user ID if payer has user account.
     */
    protected function getRequestedByUserId($payer, string $type): ?int
    {
        if (!$payer) {
            return null;
        }

        if ($type === 'resident') {
            if ($payer->household_id) {
                $isHeadOfHousehold = $payer->householdMemberships()
                    ->where('is_head', true)
                    ->exists();
                    
                if ($isHeadOfHousehold) {
                    $user = User::where('household_id', $payer->household_id)
                        ->where('current_resident_id', $payer->id)
                        ->where('status', 'active')
                        ->first();
                        
                    return $user?->id;
                }
            }
        }
        
        if ($type === 'household') {
            if ($payer->user_id) {
                $user = User::find($payer->user_id);
                if ($user && $user->status === 'active') {
                    return $user->id;
                }
            }
        }
        
        if ($type === 'business' && $payer->owner_id) {
            $owner = Resident::with('household')->find($payer->owner_id);
            
            if ($owner && $owner->household_id) {
                $user = User::where('household_id', $owner->household_id)
                    ->where('current_resident_id', $owner->id)
                    ->where('status', 'active')
                    ->first();
                    
                return $user?->id;
            }
        }
        
        return null;
    }

    /**
     * Generate a unique reference number.
     */
    protected function generateReferenceNumber(): string
    {
        $prefix = 'CLR-' . date('Ymd') . '-';
        $lastRequest = ClearanceRequest::where('reference_number', 'like', $prefix . '%')
            ->orderBy('reference_number', 'desc')
            ->first();

        if ($lastRequest) {
            $lastNumber = (int) str_replace($prefix, '', $lastRequest->reference_number);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $newNumber;
    }

    /**
     * Get users associated with a payer.
     */
    protected function getPayerUsers($payer, string $payerType): \Illuminate\Support\Collection
    {
        $users = collect();

        if (!$payer) {
            return $users;
        }

        if ($payerType === 'resident') {
            if ($payer->household_id) {
                $household = Household::with('user')->find($payer->household_id);
                
                if ($household && $household->user) {
                    if ($household->user->current_resident_id === $payer->id) {
                        $users->push($household->user);
                    }
                }
                
                $householdUsers = User::where('household_id', $payer->household_id)
                    ->where('status', 'active')
                    ->get();
                
                foreach ($householdUsers as $user) {
                    if (!$users->contains('id', $user->id)) {
                        $users->push($user);
                    }
                }
            }
            
            $isHeadOfHousehold = $payer->householdMemberships()
                ->where('is_head', true)
                ->exists();
                
            if ($isHeadOfHousehold && $payer->household_id) {
                $headUser = User::where('household_id', $payer->household_id)
                    ->where('current_resident_id', $payer->id)
                    ->where('status', 'active')
                    ->first();
                    
                if ($headUser && !$users->contains('id', $headUser->id)) {
                    $users->push($headUser);
                }
            }
            
        } elseif ($payerType === 'household') {
            if ($payer->user_id) {
                $user = User::find($payer->user_id);
                if ($user && $user->status === 'active') {
                    $users->push($user);
                }
            }
            
            $householdUsers = User::where('household_id', $payer->id)
                ->where('status', 'active')
                ->get();
        
            foreach ($householdUsers as $user) {
                if (!$users->contains('id', $user->id)) {
                    $users->push($user);
                }
            }
            
        } elseif ($payerType === 'business') {
            if ($payer->owner_id) {
                $owner = Resident::with('household')->find($payer->owner_id);
                
                if ($owner && $owner->household_id) {
                    $ownerUser = User::where('household_id', $owner->household_id)
                        ->where('current_resident_id', $owner->id)
                        ->where('status', 'active')
                        ->first();
                        
                    if ($ownerUser) {
                        $users->push($ownerUser);
                    }
                }
            }
        }

        return $users->unique('id');
    }

    /**
     * Get payer users from clearance request.
     */
    protected function getPayerUsersFromClearance(ClearanceRequest $clearance): \Illuminate\Support\Collection
    {
        $users = collect();

        if (!$clearance->payer_id || !$clearance->payer_type) {
            return $users;
        }

        $payer = $this->getPayer($clearance->payer_type, $clearance->payer_id);
        
        if ($payer) {
            $users = $this->getPayerUsers($payer, $clearance->payer_type);
        }

        if ($clearance->contact_email) {
            $userByEmail = User::where('email', $clearance->contact_email)
                ->where('status', 'active')
                ->first();
            
            if ($userByEmail && !$users->contains('id', $userByEmail->id)) {
                $users->push($userByEmail);
            }
        }

        return $users->unique('id');
    }
}
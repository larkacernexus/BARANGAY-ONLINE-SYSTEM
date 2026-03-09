<?php

namespace App\Http\Controllers\Admin\Clearance\Traits;

use App\Models\User;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Business;
use App\Models\ClearanceRequest;
use App\Models\Document;
use App\Models\Payment;
use App\Notifications\ClearanceRequestCreated;
use App\Notifications\ClearanceStatusUpdated;
use App\Notifications\ClearancePaymentNotification;
use App\Notifications\ClearanceDocumentNotification;
use App\Notifications\ClearanceDocumentRequest;
use App\Notifications\ClearancePaymentRequest;
use App\Notifications\ClearancePaymentReminder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;

trait ClearanceNotificationTrait
{
    /**
     * Send notifications when clearance request is created.
     */
    protected function sendClearanceCreatedNotifications(ClearanceRequest $clearance, $payer, string $payerType): void
    {
        try {
            Log::info('Sending clearance created notifications', [
                'clearance_id' => $clearance->id,
                'reference' => $clearance->reference_number
            ]);

            // 1. Notify the payer
            $payerUsers = $this->getPayerUsers($payer, $payerType);
            
            $this->logUserSearch('clearance_created_payer', $payer, $payerType, $payerUsers);
            
            foreach ($payerUsers as $user) {
                $user->notify(new ClearanceRequestCreated($clearance, 'created', 'payer'));
            }

            // 2. Notify all admins
            $admins = $this->getAdminUsers();

            foreach ($admins as $admin) {
                $admin->notify(new ClearanceRequestCreated($clearance, 'created', 'admin'));
            }

            Log::info('Clearance created notifications completed', [
                'payers_notified' => $payerUsers->count(),
                'admins_notified' => $admins->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send clearance created notifications', [
                'clearance_id' => $clearance->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send notification when clearance status changes.
     */
    protected function sendClearanceStatusNotification(ClearanceRequest $clearance, string $oldStatus, string $newStatus, ?string $remarks = null): void
    {
        try {
            // Notify the payer
            $payerUsers = $this->getPayerUsersFromClearance($clearance);
            
            foreach ($payerUsers as $user) {
                $user->notify(new ClearanceStatusUpdated($clearance, $oldStatus, $newStatus, $remarks));
            }

            // Notify admins for certain status changes
            if (in_array($newStatus, ['pending_payment', 'processing', 'approved', 'issued'])) {
                $admins = $this->getAdminUsers();
                foreach ($admins as $admin) {
                    $admin->notify(new ClearanceStatusUpdated($clearance, $oldStatus, $newStatus, $remarks));
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to send clearance status notifications', [
                'clearance_id' => $clearance->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send payment notification for clearance.
     */
    protected function sendPaymentNotification(ClearanceRequest $clearance, Payment $payment, string $action = 'received'): void
    {
        try {
            // Notify payer
            $payerUsers = $this->getPayerUsersFromClearance($clearance);
            
            foreach ($payerUsers as $user) {
                $user->notify(new ClearancePaymentNotification($clearance, $payment, $action));
            }

            // Notify treasurers/admins
            $admins = User::whereHas('role', function ($query) {
                $query->whereIn('name', ['Administrator', 'admin', 'super-admin', 'treasurer']);
            })->where('status', 'active')->get();

            foreach ($admins as $admin) {
                $admin->notify(new ClearancePaymentNotification($clearance, $payment, $action));
            }

        } catch (\Exception $e) {
            Log::error('Failed to send payment notification', [
                'clearance_id' => $clearance->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send document notification for clearance.
     */
    protected function sendDocumentNotification(ClearanceRequest $clearance, Document $document, string $action = 'uploaded'): void
    {
        try {
            // Notify admins
            $admins = $this->getAdminUsers();
            foreach ($admins as $admin) {
                $admin->notify(new ClearanceDocumentNotification($clearance, $document, $action));
            }

            // If document is verified/rejected, notify payer
            if (in_array($action, ['verified', 'rejected'])) {
                $payerUsers = $this->getPayerUsersFromClearance($clearance);
                foreach ($payerUsers as $user) {
                    $user->notify(new ClearanceDocumentNotification($clearance, $document, $action));
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to send document notification', [
                'clearance_id' => $clearance->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get users associated with a payer.
     */
    protected function getPayerUsers($payer, string $payerType): Collection
    {
        $users = collect();

        if (!$payer) {
            return $users;
        }

        if ($payerType === 'resident') {
            $users = $this->getResidentUsers($payer);
        } elseif ($payerType === 'household') {
            $users = $this->getHouseholdUsers($payer);
        } elseif ($payerType === 'business') {
            $users = $this->getBusinessUsers($payer);
        }

        return $users->unique('id');
    }

    /**
     * Get users from resident.
     */
    protected function getResidentUsers(Resident $resident): Collection
    {
        $users = collect();

        // Direct user lookup
        $directUser = User::where('resident_id', $resident->id)
            ->where('status', 'active')
            ->first();
        if ($directUser) {
            $users->push($directUser);
        }

        // Current resident user
        $currentUser = User::where('current_resident_id', $resident->id)
            ->where('status', 'active')
            ->first();
        if ($currentUser && !$users->contains('id', $currentUser->id)) {
            $users->push($currentUser);
        }

        // Household users
        if ($resident->household_id) {
            $householdUsers = User::where('household_id', $resident->household_id)
                ->where('status', 'active')
                ->get();
            $users = $users->merge($householdUsers);
        }

        return $users;
    }

    /**
     * Get users from household.
     */
    protected function getHouseholdUsers(Household $household): Collection
    {
        $users = collect();

        // Household's direct user
        if ($household->user && $household->user->status === 'active') {
            $users->push($household->user);
        }

        // Get all resident IDs in this household
        $residentIds = $household->householdMembers()->pluck('resident_id')->toArray();

        // Users by resident_id
        $residentUsers = User::whereIn('resident_id', $residentIds)
            ->where('status', 'active')
            ->get();
        $users = $users->merge($residentUsers);

        // Users by current_resident_id
        $currentUsers = User::whereIn('current_resident_id', $residentIds)
            ->where('status', 'active')
            ->get();
        $users = $users->merge($currentUsers);

        return $users;
    }

    /**
     * Get users from business.
     */
    protected function getBusinessUsers(Business $business): Collection
    {
        $users = collect();

        if (!$business->owner_id) {
            return $users;
        }

        // Owner by resident_id
        $ownerUser = User::where('resident_id', $business->owner_id)
            ->where('status', 'active')
            ->first();
        if ($ownerUser) {
            $users->push($ownerUser);
        }

        // Owner by current_resident_id
        $ownerCurrentUser = User::where('current_resident_id', $business->owner_id)
            ->where('status', 'active')
            ->first();
        if ($ownerCurrentUser && !$users->contains('id', $ownerCurrentUser->id)) {
            $users->push($ownerCurrentUser);
        }

        return $users;
    }

    /**
     * Get payer users from clearance request.
     */
    protected function getPayerUsersFromClearance(ClearanceRequest $clearance): Collection
    {
        $users = collect();

        if (!$clearance->payer_id || !$clearance->payer_type) {
            return $users;
        }

        $payer = $this->getPayer($clearance->payer_type, $clearance->payer_id);
        
        if ($payer) {
            $users = $this->getPayerUsers($payer, $clearance->payer_type);
        }

        // Check contact email
        if ($clearance->contact_email) {
            $userByEmail = User::where('email', $clearance->contact_email)
                ->where('status', 'active')
                ->first();
            if ($userByEmail && !$users->contains('id', $userByEmail->id)) {
                $users->push($userByEmail);
            }
        }

        // Check contact number
        if ($clearance->contact_number) {
            $userByContact = User::where('contact_number', $clearance->contact_number)
                ->where('status', 'active')
                ->first();
            if ($userByContact && !$users->contains('id', $userByContact->id)) {
                $users->push($userByContact);
            }
        }

        return $users->unique('id');
    }

    /**
     * Get admin users.
     */
    protected function getAdminUsers(): Collection
    {
        return User::whereHas('role', function ($query) {
            $query->whereIn('name', ['Administrator', 'admin', 'super-admin', 'treasurer', 'secretary']);
        })->where('status', 'active')->get();
    }

    /**
     * Get payer model based on type and ID.
     */
    protected function getPayer(string $type, int $id)
    {
        return match($type) {
            'resident' => Resident::with(['purok', 'household'])->find($id),
            'household' => Household::with(['householdMembers.resident', 'purok', 'user'])->find($id),
            'business' => Business::with(['owner', 'purok'])->find($id),
            default => null,
        };
    }

    /**
     * Log user search results for debugging.
     */
    protected function logUserSearch(string $context, $payer, string $payerType, Collection $users): void
    {
        if (!app()->environment('local')) {
            return;
        }
        
        Log::info('User search result', [
            'context' => $context,
            'payer_type' => $payerType,
            'payer_id' => $payer?->id,
            'users_found' => $users->count(),
            'user_ids' => $users->pluck('id')->toArray(),
        ]);
    }
}
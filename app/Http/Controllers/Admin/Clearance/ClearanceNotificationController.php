<?php

namespace App\Http\Controllers\Admin\Clearance;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\User;
use App\Models\Document;
use App\Notifications\ClearanceRequestCreated;
use App\Notifications\ClearanceStatusUpdated;
use App\Notifications\ClearancePaymentNotification;
use App\Notifications\ClearanceDocumentNotification;
use Illuminate\Support\Facades\Log;

class ClearanceNotificationController extends BaseClearanceController
{
    /**
     * Send notifications when clearance request is created.
     */
    public function sendCreatedNotifications(ClearanceRequest $clearance, $payer, string $payerType): void
    {
        try {
            Log::info('Sending clearance created notifications', [
                'clearance_id' => $clearance->id,
                'reference' => $clearance->reference_number
            ]);

            $payerUsers = $this->getPayerUsers($payer, $payerType);
            
            foreach ($payerUsers as $user) {
                $user->notify(new ClearanceRequestCreated($clearance, 'created', 'payer'));
            }

            $admins = User::whereHas('role', fn($q) => $q->whereIn('name', ['admin', 'super-admin', 'treasurer', 'secretary']))
                ->where('status', 'active')
                ->get();

            foreach ($admins as $admin) {
                $admin->notify(new ClearanceRequestCreated($clearance, 'created', 'admin'));
            }

            Log::info('Clearance created notifications completed');

        } catch (\Exception $e) {
            Log::error('Failed to send clearance created notifications', [
                'clearance_id' => $clearance->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notification when clearance status changes.
     */
    public function sendStatusNotification(ClearanceRequest $clearance, string $oldStatus, string $newStatus, ?string $remarks = null): void
    {
        try {
            Log::info('Sending clearance status notification', [
                'clearance_id' => $clearance->id,
                'old_status' => $oldStatus,
                'new_status' => $newStatus
            ]);

            $payerUsers = $this->getPayerUsersFromClearance($clearance);
            
            foreach ($payerUsers as $user) {
                $user->notify(new ClearanceStatusUpdated($clearance, $oldStatus, $newStatus, $remarks));
            }

            if (in_array($newStatus, ['pending_payment', 'processing', 'approved', 'issued'])) {
                $admins = User::whereHas('role', fn($q) => $q->whereIn('name', ['admin', 'super-admin', 'treasurer', 'secretary']))
                    ->where('status', 'active')
                    ->get();

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
    public function sendPaymentNotification(ClearanceRequest $clearance, $payment, string $action = 'received'): void
    {
        try {
            $payerUsers = $this->getPayerUsersFromClearance($clearance);
            
            foreach ($payerUsers as $user) {
                $user->notify(new ClearancePaymentNotification($clearance, $payment, $action));
            }

            $admins = User::whereHas('role', fn($q) => $q->whereIn('name', ['admin', 'super-admin', 'treasurer']))
                ->where('status', 'active')
                ->get();

            foreach ($admins as $admin) {
                $admin->notify(new ClearancePaymentNotification($clearance, $payment, $action));
            }

            Log::info('Payment notification sent', [
                'clearance_id' => $clearance->id,
                'payment_id' => $payment->id,
                'action' => $action
            ]);

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
    public function sendDocumentNotification(ClearanceRequest $clearance, Document $document, string $action = 'uploaded', ?string $remarks = null): void
    {
        try {
            $admins = User::whereHas('role', fn($q) => $q->whereIn('name', ['admin', 'super-admin', 'secretary']))
                ->where('status', 'active')
                ->get();

            foreach ($admins as $admin) {
                $admin->notify(new ClearanceDocumentNotification($clearance, $document, $action, $remarks));
            }

            if (in_array($action, ['verified', 'rejected'])) {
                $payerUsers = $this->getPayerUsersFromClearance($clearance);
                
                foreach ($payerUsers as $user) {
                    $user->notify(new ClearanceDocumentNotification($clearance, $document, $action, $remarks));
                }
            }

            Log::info('Document notification sent', [
                'clearance_id' => $clearance->id,
                'document_id' => $document->id,
                'action' => $action
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send document notification', [
                'clearance_id' => $clearance->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
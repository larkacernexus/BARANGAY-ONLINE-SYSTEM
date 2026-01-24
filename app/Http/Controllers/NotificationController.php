<?php

namespace App\Http\Controllers;

use App\Models\Fee;
use App\Models\Payment;
use App\Models\ClearanceRequest;
use App\Notifications\FeePaymentReminderNotification;
use App\Notifications\PaymentReceiptNotification;
use App\Notifications\ClearanceRequestStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of notifications.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $type = $request->input('type');
        $status = $request->input('status', 'all'); // all, read, unread
        
        $notifications = $user->notifications()
            ->when($type, function ($query, $type) {
                return $query->where('data->type', 'like', '%' . $type . '%');
            })
            ->when($status === 'read', function ($query) {
                return $query->whereNotNull('read_at');
            })
            ->when($status === 'unread', function ($query) {
                return $query->whereNull('read_at');
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? 'unknown',
                    'title' => $notification->data['title'] ?? 'Notification',
                    'message' => $notification->data['message'] ?? '',
                    'icon' => $notification->data['icon'] ?? 'bell',
                    'color' => $notification->data['color'] ?? 'primary',
                    'action_url' => $notification->data['action_url'] ?? null,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'created_at_raw' => $notification->created_at,
                ];
            });
        
        $unreadCount = $user->unreadNotifications()->count();
        
        // For Inertia, return a component with props
        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filters' => [
                'type' => $type,
                'status' => $status,
            ],
            'stats' => [
                'total' => $user->notifications()->count(),
                'unread' => $unreadCount,
                'read' => $user->notifications()->whereNotNull('read_at')->count(),
            ],
        ]);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($id);
        
        $notification->markAsRead();
        
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Notification marked as read',
                'notification' => $notification
            ]);
        }
        
        return redirect()->back()->with('success', 'Notification marked as read');
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $user = Auth::user();
        $user->unreadNotifications()->update(['read_at' => now()]);
        
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'All notifications marked as read',
                'unread_count' => 0
            ]);
        }
        
        return redirect()->back()->with('success', 'All notifications marked as read');
    }

    /**
     * Delete a notification.
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        $notification = $user->notifications()->findOrFail($id);
        
        $notification->delete();
        
        if ($request->wantsJson()) {
            return response()->json(['message' => 'Notification deleted']);
        }
        
        return redirect()->back()->with('success', 'Notification deleted');
    }

    /**
     * Clear all notifications.
     */
    public function clearAll(Request $request)
    {
        $user = Auth::user();
        $user->notifications()->delete();
        
        if ($request->wantsJson()) {
            return response()->json(['message' => 'All notifications cleared']);
        }
        
        return redirect()->back()->with('success', 'All notifications cleared');
    }

    /**
     * Send payment reminder for a specific fee.
     */
    public function sendFeeReminder(Request $request, Fee $fee)
    {
        $request->validate([
            'type' => 'in:reminder,due_today,overdue'
        ]);
        
        $type = $request->type ?? 'reminder';
        
        // Send notification to fee (if fee has contact info)
        $fee->notify(new FeePaymentReminderNotification($fee, $type));
        
        // Also send to resident if exists
        if ($fee->resident && $fee->resident->user) {
            $fee->resident->user->notify(new FeePaymentReminderNotification($fee, $type));
        }
        
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Payment reminder sent successfully',
                'type' => $type,
                'fee' => $fee->load('resident.user')
            ]);
        }
        
        return redirect()->back()->with('success', 'Payment reminder sent successfully');
    }

    /**
     * Send payment receipt notification.
     */
    public function sendPaymentReceipt(Request $request, Payment $payment)
    {
        // Send to payment record
        $payment->notify(new PaymentReceiptNotification($payment));
        
        // Send to payer if they have user account
        if ($payment->payer_type === 'resident' && $payment->resident && $payment->resident->user) {
            $payment->resident->user->notify(new PaymentReceiptNotification($payment));
        }
        
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Payment receipt sent successfully',
                'payment' => $payment->load('resident.user')
            ]);
        }
        
        return redirect()->back()->with('success', 'Payment receipt sent successfully');
    }

    /**
     * Send clearance status notification.
     */
    public function sendClearanceStatus(Request $request, ClearanceRequest $clearanceRequest)
    {
        $clearanceRequest->notify(new ClearanceRequestStatusNotification($clearanceRequest));
        
        // Send to resident user
        if ($clearanceRequest->resident && $clearanceRequest->resident->user) {
            $clearanceRequest->resident->user->notify(new ClearanceRequestStatusNotification($clearanceRequest));
        }
        
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Clearance status notification sent',
                'clearance_request' => $clearanceRequest->load('resident.user')
            ]);
        }
        
        return redirect()->back()->with('success', 'Clearance status notification sent');
    }

    /**
     * Bulk send payment reminders for overdue fees.
     */
    public function sendBulkReminders(Request $request)
    {
        $request->validate([
            'type' => 'required|in:overdue,due_soon,all',
            'days_before_due' => 'integer|min:1|max:30'
        ]);
        
        $type = $request->type;
        $daysBefore = $request->days_before_due ?? 3;
        $sentCount = 0;
        $errors = [];
        
        $query = Fee::where('status', '!=', 'paid')
            ->where('status', '!=', 'cancelled');
        
        if ($type === 'overdue') {
            $query->where('due_date', '<', now());
        } elseif ($type === 'due_soon') {
            $query->whereBetween('due_date', [now(), now()->addDays($daysBefore)]);
        }
        
        $fees = $query->with('resident.user')->get();
        
        foreach ($fees as $fee) {
            try {
                $messageType = $fee->due_date->isPast() ? 'overdue' : 'reminder';
                
                $fee->notify(new FeePaymentReminderNotification($fee, $messageType));
                
                if ($fee->resident && $fee->resident->user) {
                    $fee->resident->user->notify(new FeePaymentReminderNotification($fee, $messageType));
                }
                
                $sentCount++;
                
            } catch (\Exception $e) {
                $errors[] = [
                    'fee_id' => $fee->id,
                    'error' => $e->getMessage()
                ];
            }
        }
        
        if ($request->wantsJson()) {
            return response()->json([
                'message' => 'Bulk reminders sent',
                'sent_count' => $sentCount,
                'total_fees' => $fees->count(),
                'errors' => $errors
            ]);
        }
        
        return redirect()->back()->with('success', "Sent {$sentCount} reminders successfully");
    }

    /**
     * Get notification statistics (API endpoint).
     */
    public function getStats(Request $request)
    {
        $user = Auth::user();
        
        $stats = [
            'total' => $user->notifications()->count(),
            'unread' => $user->unreadNotifications()->count(),
            'read' => $user->notifications()->whereNotNull('read_at')->count(),
            'by_type' => $user->notifications()
                ->get()
                ->groupBy(function ($notification) {
                    return $notification->data['type'] ?? 'unknown';
                })
                ->map->count()
                ->toArray(),
            'recent_30_days' => $user->notifications()
                ->where('created_at', '>=', now()->subDays(30))
                ->count(),
        ];
        
        return response()->json($stats);
    }

    /**
     * Get unread notifications count (for navbar/badge).
     */
    public function getUnreadCount(Request $request)
    {
        $user = Auth::user();
        $count = $user->unreadNotifications()->count();
        
        return response()->json([
            'count' => $count,
            'notifications' => $user->unreadNotifications()
                ->take(5)
                ->get()
                ->map(function ($notification) {
                    return [
                        'id' => $notification->id,
                        'title' => $notification->data['title'] ?? 'Notification',
                        'message' => $notification->data['message'] ?? '',
                        'icon' => $notification->data['icon'] ?? 'bell',
                        'color' => $notification->data['color'] ?? 'primary',
                        'action_url' => $notification->data['action_url'] ?? null,
                        'created_at' => $notification->created_at->diffForHumans(),
                    ];
                })
        ]);
    }
}
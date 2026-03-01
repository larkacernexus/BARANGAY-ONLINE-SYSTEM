<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get user notifications for the dropdown
     */
    public function getRecent()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'notifications' => [],
                    'unreadCount' => 0
                ]);
            }

            $notifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();
            
            $unreadCount = $user->unreadNotifications()->count();
            
            return response()->json([
                'notifications' => $notifications,
                'unreadCount' => $unreadCount
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch notifications', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'notifications' => [],
                'unreadCount' => 0
            ]);
        }
    }

    /**
     * Get unread count only
     */
    public function unreadCount()
    {
        try {
            $count = Auth::user()->unreadNotifications()->count();
            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            return response()->json(['count' => 0]);
        }
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead($id)
    {
        try {
            $user = Auth::user();
            $notification = $user->notifications()->findOrFail($id);
            $notification->markAsRead();
            
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        try {
            Auth::user()->unreadNotifications->markAsRead();
            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 500);
        }
    }

    /**
     * Get all notifications page
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            
            $notifications = $user->notifications()
                ->orderBy('created_at', 'desc')
                ->paginate(20);
            
            $unreadCount = $user->unreadNotifications()->count();

            return Inertia::render('Notifications/Index', [
                'notifications' => $notifications,
                'unreadCount' => $unreadCount
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to load notifications page', [
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to load notifications');
        }
    }
}
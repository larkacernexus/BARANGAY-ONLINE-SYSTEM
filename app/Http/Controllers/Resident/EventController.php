<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\EventCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $resident = auth()->user()->residentProfile;
        $category = $request->input('category', 'upcoming');
        $search = $request->input('search');
        
        $query = Event::where('status', 'published')
            ->with(['category', 'organizer'])
            ->orderBy('date', 'asc');
        
        if ($category === 'upcoming') {
            $query->where('date', '>=', now()->startOfDay());
        } elseif ($category === 'past') {
            $query->where('date', '<', now()->startOfDay());
        } elseif ($category === 'registered') {
            $registeredIds = EventRegistration::where('resident_id', $resident->id)
                ->pluck('event_id')
                ->toArray();
            $query->whereIn('id', $registeredIds);
        }
        
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }
        
        $events = $query->paginate(12);
        
        // Get registration status for each event
        $registeredEventIds = EventRegistration::where('resident_id', $resident->id)
            ->whereIn('event_id', $events->pluck('id'))
            ->pluck('event_id')
            ->toArray();
        
        $categories = EventCategory::all();
        
        // Get stats
        $stats = [
            'upcoming' => Event::where('status', 'published')
                ->where('date', '>=', now()->startOfDay())
                ->count(),
            'registered' => EventRegistration::where('resident_id', $resident->id)->count(),
            'this_month' => Event::where('status', 'published')
                ->whereMonth('date', now()->month)
                ->whereYear('date', now()->year)
                ->count(),
            'total_participants' => EventRegistration::count(),
        ];
        
        // Get featured event
        $featuredEvent = Event::where('status', 'published')
            ->where('is_featured', true)
            ->where('date', '>=', now()->startOfDay())
            ->orderBy('date', 'asc')
            ->first();
        
        return Inertia::render('Resident/Events/Index', [
            'events' => $events,
            'categories' => $categories,
            'stats' => $stats,
            'registeredEventIds' => $registeredEventIds,
            'featuredEvent' => $featuredEvent,
            'filters' => [
                'category' => $category,
                'search' => $search,
            ],
        ]);
    }
    
    public function show(Event $event)
    {
        if ($event->status !== 'published') {
            abort(404);
        }
        
        $resident = auth()->user()->residentProfile;
        
        $event->load(['category', 'organizer', 'registrations']);
        
        // Check if resident is registered
        $isRegistered = EventRegistration::where('event_id', $event->id)
            ->where('resident_id', $resident->id)
            ->exists();
        
        // Get registration status
        $registration = $isRegistered ? 
            EventRegistration::where('event_id', $event->id)
                ->where('resident_id', $resident->id)
                ->first() : null;
        
        // Get similar events
        $similarEvents = Event::where('status', 'published')
            ->where('category_id', $event->category_id)
            ->where('id', '!=', $event->id)
            ->where('date', '>=', now()->startOfDay())
            ->orderBy('date', 'asc')
            ->limit(4)
            ->get();
        
        return Inertia::render('Resident/Events/Show', [
            'event' => $event,
            'isRegistered' => $isRegistered,
            'registration' => $registration,
            'similarEvents' => $similarEvents,
        ]);
    }
    
    public function register(Event $event, Request $request)
    {
        if ($event->status !== 'published') {
            return back()->with('error', 'Event is not available for registration.');
        }
        
        if ($event->date < now()->startOfDay()) {
            return back()->with('error', 'Event has already passed.');
        }
        
        $resident = auth()->user()->residentProfile;
        
        // Check if already registered
        $existingRegistration = EventRegistration::where('event_id', $event->id)
            ->where('resident_id', $resident->id)
            ->first();
        
        if ($existingRegistration) {
            return back()->with('error', 'You are already registered for this event.');
        }
        
        // Check capacity
        $registeredCount = EventRegistration::where('event_id', $event->id)->count();
        if ($event->capacity > 0 && $registeredCount >= $event->capacity) {
            return back()->with('error', 'Event is already full.');
        }
        
        $validated = $request->validate([
            'guests' => 'nullable|integer|min:0|max:' . $event->max_guests,
            'special_requirements' => 'nullable|string|max:500',
        ]);
        
        $registration = EventRegistration::create([
            'event_id' => $event->id,
            'resident_id' => $resident->id,
            'guests_count' => $validated['guests'] ?? 0,
            'special_requirements' => $validated['special_requirements'] ?? null,
            'status' => 'confirmed',
            'registered_at' => now(),
        ]);
        
        // If event has fee, create payment
        if ($event->fee > 0) {
            // Create payment record
            // This would integrate with payment system
        }
        
        // Send confirmation email
        // Mail::to($resident->user->email)->send(new EventRegistrationConfirmation($registration));
        
        return back()->with('success', 'Successfully registered for the event.');
    }
    
    public function cancel(Event $event)
    {
        $resident = auth()->user()->residentProfile;
        
        $registration = EventRegistration::where('event_id', $event->id)
            ->where('resident_id', $resident->id)
            ->first();
        
        if (!$registration) {
            return back()->with('error', 'You are not registered for this event.');
        }
        
        // Check cancellation policy
        $cancellationDeadline = $event->date->subDays($event->cancellation_days);
        if (now() > $cancellationDeadline) {
            return back()->with('error', 'Cancellation period has ended.');
        }
        
        $registration->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
        
        // Refund if applicable
        if ($event->fee > 0 && $event->refund_policy === 'full') {
            // Process refund
        }
        
        return back()->with('success', 'Registration cancelled successfully.');
    }
    
    public function toggleAlerts(Request $request)
    {
        $resident = auth()->user()->residentProfile;
        $alerts = $request->boolean('alerts', true);
        
        $resident->update([
            'event_alerts' => $alerts,
        ]);
        
        $status = $alerts ? 'enabled' : 'disabled';
        
        return back()->with('success', "Event alerts {$status}.");
    }
}
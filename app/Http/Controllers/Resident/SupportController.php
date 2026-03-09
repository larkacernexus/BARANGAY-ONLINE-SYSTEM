<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Models\SupportTicket;
use App\Models\Faq;
use App\Models\SupportCategory;
use App\Models\TicketReply;
use Illuminate\Support\Facades\Log;

class SupportController extends Controller
{
    /**
     * Display the support center main page
     */
    public function index()
    {
        try {
            $user = Auth::user();
            $residentId = $user->resident_id;
            
            // Get user's recent tickets
            $tickets = SupportTicket::where('resident_id', $residentId)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($ticket) {
                    return [
                        'id' => $ticket->id,
                        'ticket_number' => $ticket->ticket_number,
                        'subject' => $ticket->subject,
                        'status' => $ticket->status,
                        'priority' => $ticket->priority,
                        'category' => $ticket->category,
                        'last_update' => $ticket->updated_at ? $ticket->updated_at->format('Y-m-d H:i:s') : null,
                        'created_at' => $ticket->created_at ? $ticket->created_at->format('Y-m-d H:i:s') : null,
                    ];
                });
            
            // Get FAQs
            $faqs = Faq::where('is_active', true)
                ->orderBy('order')
                ->get()
                ->map(function ($faq) {
                    return [
                        'id' => $faq->id,
                        'question' => $faq->question,
                        'answer' => $faq->answer,
                        'category' => $faq->category,
                        'views' => $faq->views,
                        'helpful_count' => $faq->helpful_count,
                    ];
                });
            
            // Get categories - with fallback if table doesn't exist
            $categories = [];
            try {
                $categories = SupportCategory::where('is_active', true)
                    ->orderBy('order')
                    ->pluck('name')
                    ->toArray();
            } catch (\Exception $e) {
                // Fallback categories if table doesn't exist
                $categories = ['Technical', 'Billing', 'Account', 'Document Requests', 'General', 'Feedback', 'Other'];
                Log::warning('SupportCategory table not found, using fallback categories');
            }
            
            // Contact information (from config or settings)
            $contactInfo = [
                'email' => config('app.support_email', 'support@barangay.gov.ph'),
                'phone' => config('app.support_phone', '(02) 1234-5678'),
                'hours' => config('app.support_hours', 'Monday - Friday, 8:00 AM - 5:00 PM'),
                'address' => config('app.barangay_address', 'Barangay Hall, City Hall Complex'),
            ];
            
            return Inertia::render('resident/Support/Index', [
                'tickets' => $tickets,
                'faqs' => $faqs,
                'categories' => $categories,
                'contactInfo' => $contactInfo,
                'filters' => [
                    'search' => request('search', ''),
                    'category' => request('category', 'all'),
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Support index error: ' . $e->getMessage());
            
            return Inertia::render('Resident/Support/Index', [
                'tickets' => [],
                'faqs' => [],
                'categories' => ['Technical', 'Billing', 'Account', 'Document Requests', 'General', 'Feedback', 'Other'],
                'contactInfo' => [
                    'email' => config('app.support_email', 'support@barangay.gov.ph'),
                    'phone' => config('app.support_phone', '(02) 1234-5678'),
                    'hours' => config('app.support_hours', 'Monday - Friday, 8:00 AM - 5:00 PM'),
                    'address' => config('app.barangay_address', 'Barangay Hall, City Hall Complex'),
                ],
                'filters' => [
                    'search' => request('search', ''),
                    'category' => request('category', 'all'),
                ],
                'error' => 'Unable to load support data. Please try again later.',
            ]);
        }
    }
    
    /**
     * Display a specific ticket
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            $residentId = $user->resident_id;
            
            $ticket = SupportTicket::with(['replies' => function($query) {
                    $query->orderBy('created_at', 'asc');
                }])
                ->where('id', $id)
                ->where('resident_id', $residentId)
                ->firstOrFail();
            
            return Inertia::render('Resident/Support/Show', [
                'ticket' => [
                    'id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'subject' => $ticket->subject,
                    'status' => $ticket->status,
                    'priority' => $ticket->priority,
                    'category' => $ticket->category,
                    'message' => $ticket->message,
                    'attachment' => $ticket->attachment ? Storage::url($ticket->attachment) : null,
                    'attachment_name' => $ticket->attachment ? basename($ticket->attachment) : null,
                    'created_at' => $ticket->created_at ? $ticket->created_at->format('Y-m-d H:i:s') : null,
                    'created_at_formatted' => $ticket->created_at ? $ticket->created_at->diffForHumans() : null,
                    'replies' => $ticket->replies->map(function ($reply) {
                        return [
                            'id' => $reply->id,
                            'message' => $reply->message,
                            'is_staff' => $reply->is_staff,
                            'staff_name' => $reply->staff_name,
                            'attachment' => $reply->attachment ? Storage::url($reply->attachment) : null,
                            'attachment_name' => $reply->attachment ? basename($reply->attachment) : null,
                            'created_at' => $reply->created_at ? $reply->created_at->format('Y-m-d H:i:s') : null,
                            'created_at_formatted' => $reply->created_at ? $reply->created_at->diffForHumans() : null,
                        ];
                    }),
                ],
            ]);
            
        } catch (\Exception $e) {
            Log::error('Support show error: ' . $e->getMessage());
            return redirect()->route('portal.support.index')
                ->with('error', 'Ticket not found or you do not have permission to view it.');
        }
    }
    
    /**
     * Store a new support ticket
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            $residentId = $user->resident_id;
            
            $validated = $request->validate([
                'subject' => 'required|string|max:255',
                'category' => 'required|string|max:100',
                'priority' => 'required|in:low,medium,high,urgent',
                'message' => 'required|string',
                'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,txt',
            ]);
            
            // Generate ticket number
            $lastTicket = SupportTicket::orderBy('id', 'desc')->first();
            $nextId = $lastTicket ? $lastTicket->id + 1 : 1;
            $ticketNumber = 'TKT-' . date('Ymd') . '-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            
            // Handle file upload
            $attachmentPath = null;
            $attachmentName = null;
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $attachmentName = $file->getClientOriginalName();
                $attachmentPath = $file->store('support-attachments/' . date('Y/m'), 'public');
            }
            
            $ticket = SupportTicket::create([
                'resident_id' => $residentId,
                'ticket_number' => $ticketNumber,
                'subject' => $validated['subject'],
                'category' => $validated['category'],
                'priority' => $validated['priority'],
                'message' => $validated['message'],
                'attachment' => $attachmentPath,
                'attachment_name' => $attachmentName,
                'status' => 'open',
            ]);
            
            // TODO: Send notification to admins
            // Notification::send($admins, new NewSupportTicketNotification($ticket));
            
            return redirect()->route('portal.support.index')
                ->with('success', 'Support ticket created successfully. Ticket #' . $ticketNumber . ' has been submitted.');
                
        } catch (\Exception $e) {
            Log::error('Support ticket creation error: ' . $e->getMessage());
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create support ticket. Please try again.');
        }
    }
    
    /**
     * Reply to a ticket
     */
    public function reply(Request $request, $id)
    {
        try {
            $user = Auth::user();
            $residentId = $user->resident_id;
            
            $ticket = SupportTicket::where('id', $id)
                ->where('resident_id', $residentId)
                ->firstOrFail();
            
            // Check if ticket is closed
            if ($ticket->status === 'closed') {
                return redirect()->back()
                    ->with('error', 'Cannot reply to a closed ticket.');
            }
            
            $validated = $request->validate([
                'message' => 'required|string',
                'attachment' => 'nullable|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,txt',
            ]);
            
            // Handle file upload
            $attachmentPath = null;
            $attachmentName = null;
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $attachmentName = $file->getClientOriginalName();
                $attachmentPath = $file->store('support-replies/' . date('Y/m'), 'public');
            }
            
            $reply = TicketReply::create([
                'ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'message' => $validated['message'],
                'attachment' => $attachmentPath,
                'attachment_name' => $attachmentName,
                'is_staff' => false,
            ]);
            
            // Update ticket status to in_progress if it was open
            if ($ticket->status === 'open') {
                $ticket->update(['status' => 'in_progress']);
            }
            
            return redirect()->back()
                ->with('success', 'Reply added successfully.');
                
        } catch (\Exception $e) {
            Log::error('Support reply error: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Failed to add reply. Please try again.');
        }
    }
    
    /**
     * Search FAQs (API endpoint)
     */
    public function searchFaqs(Request $request)
    {
        try {
            $query = $request->get('q');
            $category = $request->get('category');
            
            $faqs = Faq::where('is_active', true)
                ->when($query, function ($q) use ($query) {
                    $q->where(function ($sub) use ($query) {
                        $sub->where('question', 'like', "%{$query}%")
                            ->orWhere('answer', 'like', "%{$query}%");
                    });
                })
                ->when($category && $category !== 'all', function ($q) use ($category) {
                    $q->where('category', $category);
                })
                ->orderBy('order')
                ->limit(20)
                ->get(['id', 'question', 'answer', 'category', 'views', 'helpful_count']);
            
            return response()->json([
                'success' => true,
                'faqs' => $faqs,
            ]);
            
        } catch (\Exception $e) {
            Log::error('FAQ search error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to search FAQs',
                'faqs' => [],
            ], 500);
        }
    }
    
    /**
     * Rate a FAQ as helpful
     */
    public function rate(Request $request, $id)
    {
        try {
            $faq = Faq::findOrFail($id);
            $faq->increment('helpful_count');
            
            return response()->json([
                'success' => true,
                'message' => 'Thank you for your feedback!',
            ]);
            
        } catch (\Exception $e) {
            Log::error('FAQ rating error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit feedback',
            ], 500);
        }
    }
    
    /**
     * Download attachment
     */
    public function downloadAttachment($id, $type, $replyId = null)
    {
        try {
            $user = Auth::user();
            $residentId = $user->resident_id;
            
            $ticket = SupportTicket::where('id', $id)
                ->where('resident_id', $residentId)
                ->firstOrFail();
            
            $filePath = null;
            $fileName = null;
            
            if ($type === 'ticket' && $ticket->attachment) {
                $filePath = $ticket->attachment;
                $fileName = $ticket->attachment_name ?? basename($ticket->attachment);
            } elseif ($type === 'reply' && $replyId) {
                $reply = TicketReply::where('id', $replyId)
                    ->where('ticket_id', $id)
                    ->firstOrFail();
                
                if ($reply->attachment) {
                    $filePath = $reply->attachment;
                    $fileName = $reply->attachment_name ?? basename($reply->attachment);
                }
            }
            
            if (!$filePath || !Storage::disk('public')->exists($filePath)) {
                return redirect()->back()->with('error', 'File not found.');
            }
            
            return Storage::disk('public')->download($filePath, $fileName);
            
        } catch (\Exception $e) {
            Log::error('Attachment download error: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to download attachment.');
        }
    }
    
    /**
     * Display guides page
     */
    public function guides()
    {
        return Inertia::render('resident/Support/Guides', [
            'guides' => [], // Fetch from database
        ]);
    }
    
    /**
     * Display video tutorials page
     */
    public function videos()
    {
        return Inertia::render('resident/Support/Videos', [
            'videos' => [], // Fetch from database
        ]);
    }
}
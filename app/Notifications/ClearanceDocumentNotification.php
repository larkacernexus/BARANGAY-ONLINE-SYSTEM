<?php

namespace App\Notifications;

use App\Models\ClearanceRequest;
use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ClearanceDocumentNotification extends Notification
{
    use Queueable;

    protected $clearance;
    protected $document;
    protected $action;

    public function __construct(ClearanceRequest $clearance, Document $document, string $action = 'uploaded')
    {
        $this->clearance = $clearance;
        $this->document = $document;
        $this->action = $action;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'clearance_id' => $this->clearance->id,
            'reference_number' => $this->clearance->reference_number,
            'document_id' => $this->document->id,
            'document_name' => $this->document->original_name ?? $this->document->name,
            'action' => $this->action,
            'message' => $this->getMessage(),
            'created_at' => now()->toDateTimeString(),
        ];
    }

    protected function getMessage(): string
    {
        $documentName = $this->document->original_name ?? $this->document->name;
        
        $actionMessages = [
            'uploaded' => "New document '{$documentName}' uploaded for clearance #{$this->clearance->reference_number}",
            'verified' => "Document '{$documentName}' has been verified",
            'rejected' => "Document '{$documentName}' has been rejected",
        ];

        return $actionMessages[$this->action] ?? "Document update for clearance #{$this->clearance->reference_number}";
    }
}
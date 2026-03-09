<?php
// app/Notifications/FormUploadedNotification.php

namespace App\Notifications;

use App\Models\Form;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class FormUploadedNotification extends Notification
{
    use Queueable;

    protected $form;
    protected $action;

    public function __construct(Form $form, string $action = 'uploaded')
    {
        $this->form = $form;
        $this->action = $action;
    }

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        // Extract form data
        $formTitle = $this->form->title;
        $formId = $this->form->id;
        $formSlug = $this->form->slug;
        $category = $this->form->category ?? 'General';
        $issuingAgency = $this->form->issuing_agency ?? 'Barangay';
        $fileType = $this->form->file_type;
        $fileSize = $this->form->file_size;
        $formattedFileSize = $this->form->formatted_file_size;
        $description = $this->form->description;
        
        // Determine file icon based on mime type
        $fileIcon = $this->getFileIcon($fileType);
        
        // Create action-specific messages
        $actionMessages = [
            'uploaded' => 'New form available',
            'updated' => 'Form updated',
            'updated_with_new_file' => 'Form updated with new file',
            'featured' => 'Featured form',
            'activated' => 'Form now available',
        ];
        
        $actionTitles = [
            'uploaded' => 'New Form Uploaded',
            'updated' => 'Form Updated',
            'updated_with_new_file' => 'Form Updated',
            'featured' => 'Featured Form',
            'activated' => 'Form Now Available',
        ];
        
        $actionLabel = $actionMessages[$this->action] ?? 'Form notification';
        $title = $actionTitles[$this->action] ?? 'Form Notification';
        
        // Create the message
        $message = "{$actionLabel}: {$formTitle}";

        return [
            'type' => 'form',
            'action' => $this->action,
            
            // Form details
            'form_id' => $formId,
            'form_title' => $formTitle,
            'form_slug' => $formSlug,
            'category' => $category,
            'issuing_agency' => $issuingAgency,
            'description' => $description,
            
            // File details
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'formatted_file_size' => $formattedFileSize,
            'file_icon' => $fileIcon,
            'file_extension' => pathinfo($this->form->file_name, PATHINFO_EXTENSION),
            'file_name' => $this->form->file_name,
            
            // Form status
            'is_featured' => $this->form->is_featured,
            'is_public' => $this->form->is_public,
            'requires_login' => $this->form->requires_login,
            
            // Notification metadata
            'title' => $title,
            'message' => $message,
            'target_roles' => ['household_head', 'household_member'],
            'excluded_roles' => [],
            'created_at' => now()->toDateTimeString(),
            'created_by' => $this->form->created_by,
            'created_by_name' => $this->form->creator?->name ?? 'System',
            
            // URLs - USING ID NOT SLUG for portal
            'url' => '/portal/forms/' . $formId,  // Changed from slug to ID
            'link' => '/portal/forms/' . $formId, // Changed from slug to ID
            'download_url' => '/storage/' . $this->form->file_path,
            'preview_url' => '/admin/forms/' . $formId . '/preview',
            'admin_url' => '/admin/forms/' . $formId,
            'portal_url' => '/portal/forms/' . $formId, // Changed from slug to ID
            'storage_path' => '/storage/' . $this->form->file_path,
        ];
    }

    private function getFileIcon($mimeType): string
    {
        if (str_contains($mimeType, 'pdf')) {
            return 'file-pdf';
        } elseif (str_contains($mimeType, 'word') || str_contains($mimeType, 'document')) {
            return 'file-word';
        } elseif (str_contains($mimeType, 'excel') || str_contains($mimeType, 'spreadsheet')) {
            return 'file-excel';
        } elseif (str_contains($mimeType, 'image')) {
            return 'file-image';
        } elseif (str_contains($mimeType, 'text')) {
            return 'file-text';
        } else {
            return 'file';
        }
    }
}
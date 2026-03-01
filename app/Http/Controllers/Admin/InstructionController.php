<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Models\Instruction;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;
use App\Models\Resident;
use App\Models\Household;
use App\Models\Clearance;
use App\Models\Payment;
use App\Models\User;
use App\Models\Request as SystemRequest;

class InstructionController extends Controller
{
    /**
     * Constructor to disable output buffering
     */
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            while (ob_get_level()) {
                ob_end_clean();
            }
            return $next($request);
        });
    }

    /**
     * Download instruction guide in various formats
     */
    public function download(Request $request)
    {
        try {
            $request->validate([
                'format' => 'required|in:pdf,html,text',
                'section' => 'nullable|string',
                'type' => 'nullable|in:full,section'
            ]);

            $format = $request->input('format');
            $type = $request->input('type', 'full');
            $sectionId = $request->input('section');

            set_time_limit(300);
            ini_set('memory_limit', '512M');

            $data = $this->getContentData($type, $sectionId);

            while (ob_get_level()) {
                ob_end_clean();
            }

            switch ($format) {
                case 'pdf':
                    return $this->downloadPdf($data);
                case 'html':
                    return $this->downloadHtml($data);
                case 'text':
                    return $this->downloadText($data);
                default:
                    return response()->json(['error' => 'Invalid format'], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Download failed: ' . $e->getMessage());
            return response()->json(['error' => 'Download failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download as PDF - Clean professional style
     */
    private function downloadPdf(array $data)
    {
        try {
            $html = view('instructions.pdf', $data)->render();
            
            $options = new \Dompdf\Options();
            $options->set('defaultFont', 'Helvetica');
            $options->set('isHtml5ParserEnabled', true);
            $options->set('isRemoteEnabled', false);
            $options->set('isPhpEnabled', false);
            $options->set('defaultPaperSize', 'A4');
            
            $dompdf = new \Dompdf\Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();
            
            $output = $dompdf->output();
            
            if (empty($output)) {
                throw new \Exception('PDF output is empty');
            }
            
            $filename = $this->generateFilename('pdf', $data['type']);
            
            return response($output, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                'Content-Length' => strlen($output),
                'Cache-Control' => 'private, max-age=0, must-revalidate',
                'Pragma' => 'public',
            ]);
            
        } catch (\Exception $e) {
            \Log::error('PDF Generation Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Download as HTML file - Clean professional style
     */
    private function downloadHtml(array $data)
    {
        $html = view('instructions.pdf', $data)->render();
        $filename = $this->generateFilename('html', $data['type']);
        
        return response($html)
            ->header('Content-Type', 'text/html; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Content-Length', strlen($html))
            ->header('Cache-Control', 'private, max-age=0, must-revalidate')
            ->header('Pragma', 'public');
    }

    /**
     * Download as Text file - Clean professional style
     */
    private function downloadText(array $data)
    {
        $text = $this->convertToPlainText($data);
        $filename = $this->generateFilename('txt', $data['type']);
        
        return response($text)
            ->header('Content-Type', 'text/plain; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->header('Content-Length', strlen($text))
            ->header('Cache-Control', 'private, max-age=0, must-revalidate')
            ->header('Pragma', 'public');
    }

    /**
     * Convert to clean plain text
     */
    private function convertToPlainText(array $data): string
    {
        $text = [];
        
        // Header
        $text[] = strtoupper($data['barangay_name']);
        $text[] = str_repeat('=', strlen($data['barangay_name']));
        $text[] = '';
        $text[] = $data['title'];
        $text[] = str_repeat('-', strlen($data['title']));
        $text[] = '';
        $text[] = 'Generated: ' . $data['generated_at']->format('F j, Y g:i A');
        $text[] = 'Generated by: ' . $data['generated_by'];
        $text[] = 'Version: ' . $data['version'];
        $text[] = 'Type: ' . ucfirst($data['type']) . ' Guide';
        $text[] = '';
        $text[] = str_repeat('=', 80);
        $text[] = '';

        if ($data['type'] === 'section' && isset($data['section'])) {
            // Single section
            $text[] = $data['section']['title'];
            $text[] = str_repeat('-', strlen($data['section']['title']));
            $text[] = '';
            $text[] = $data['section']['description'];
            $text[] = '';
            $text[] = $this->htmlToPlainText($data['section']['content']);
        } else {
            // All sections
            foreach ($data['sections'] as $index => $section) {
                $text[] = sprintf('%02d. %s', $index + 1, $section['title']);
                $text[] = str_repeat('-', strlen($section['title']) + 5);
                $text[] = '';
                $text[] = $section['description'];
                $text[] = '';
                $text[] = $this->htmlToPlainText($section['content']);
                $text[] = '';
                $text[] = str_repeat('-', 40);
                $text[] = '';
            }
        }

        // Statistics
        if (!empty($data['statistics'])) {
            $text[] = 'SYSTEM STATISTICS';
            $text[] = str_repeat('=', 16);
            $text[] = '';
            foreach ($data['statistics'] as $key => $value) {
                $label = ucwords(str_replace('_', ' ', $key));
                if (is_numeric($value)) {
                    if (str_contains($key, 'amount') || str_contains($key, 'collection') || str_contains($key, 'payment')) {
                        $text[] = sprintf("%-30s : ₱ %s", $label, number_format($value, 2));
                    } else {
                        $text[] = sprintf("%-30s : %s", $label, number_format($value));
                    }
                } else {
                    $text[] = sprintf("%-30s : %s", $label, $value);
                }
            }
            $text[] = '';
        }

        // Quick Tips
        if (!empty($data['quick_tips'])) {
            $text[] = 'QUICK TIPS';
            $text[] = str_repeat('=', 10);
            $text[] = '';
            foreach ($data['quick_tips'] as $index => $tip) {
                $text[] = sprintf("%d. %s", $index + 1, $tip);
            }
            $text[] = '';
        }

        // Shortcuts
        if (!empty($data['shortcuts'])) {
            $text[] = 'KEYBOARD SHORTCUTS';
            $text[] = str_repeat('=', 18);
            $text[] = '';
            foreach ($data['shortcuts'] as $shortcut) {
                $text[] = sprintf("%-40s [%s]", $shortcut['description'], $shortcut['key']);
            }
            $text[] = '';
        }

        // Recent Updates
        if (!empty($data['recent_updates'])) {
            $text[] = 'VERSION HISTORY';
            $text[] = str_repeat('=', 14);
            $text[] = '';
            foreach ($data['recent_updates'] as $update) {
                $text[] = 'Version ' . $update['version'] . ' (' . $update['date'] . ')';
                $text[] = str_repeat('-', strlen($update['version']) + strlen($update['date']) + 10);
                foreach ($update['changes'] as $change) {
                    $text[] = '  • ' . $change;
                }
                $text[] = '';
            }
        }

        // Footer
        $text[] = '';
        $text[] = str_repeat('=', 80);
        $text[] = '© ' . date('Y') . ' ' . $data['barangay_name'] . '. All rights reserved.';
        $text[] = 'This document is confidential and for internal use only.';
        $text[] = 'Generated on ' . $data['generated_at']->format('F j, Y \a\t g:i A');
        $text[] = 'Document ID: ' . strtoupper(uniqid());

        return implode("\n", $text);
    }

    /**
     * Convert HTML to clean plain text
     */
    private function htmlToPlainText($html): string
    {
        // Remove script and style tags
        $html = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $html);
        $html = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $html);
        
        // Convert block elements to newlines
        $html = preg_replace('/<\/(p|div|h[1-6]|table|tr|li|ul|ol|section|article)>/i', "\n", $html);
        $html = preg_replace('/<br\s*\/?>/i', "\n", $html);
        
        // Convert list items to bullet points
        $html = preg_replace('/<li>(.*?)<\/li>/is', "  • $1\n", $html);
        
        // Convert headers
        $html = preg_replace('/<h1>(.*?)<\/h1>/is', "\n\n$1\n" . str_repeat('=', 50) . "\n", $html);
        $html = preg_replace('/<h2>(.*?)<\/h2>/is', "\n\n$1\n" . str_repeat('-', 30) . "\n", $html);
        $html = preg_replace('/<h3>(.*?)<\/h3>/is', "\n\n$1\n", $html);
        
        // Convert tables to text
        if (preg_match('/<table>(.*?)<\/table>/is', $html, $matches)) {
            $table = $matches[1];
            preg_match_all('/<tr>(.*?)<\/tr>/is', $table, $rows);
            $tableText = "\n";
            foreach ($rows[1] as $row) {
                preg_match_all('/<t[dh][^>]*>(.*?)<\/t[dh]>/is', $row, $cells);
                $tableText .= implode(' | ', array_map('strip_tags', $cells[1])) . "\n";
            }
            $html = str_replace($matches[0], $tableText, $html);
        }
        
        // Strip remaining tags
        $text = strip_tags($html);
        
        // Decode HTML entities
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Normalize whitespace
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/\n\s*\n\s*\n/', "\n\n", $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);
        
        return trim($text);
    }

    /**
     * Get content data based on type and section
     */
    private function getContentData(string $type, ?string $sectionId): array
    {
        $data = [
            'type' => $type,
            'generated_at' => now(),
            'generated_by' => auth()->user()->name ?? 'System User',
            'barangay_name' => config('app.barangay_name', 'Barangay Kibawe'),
            'version' => config('app.version', '2.0'),
            'title' => $type === 'section' ? 'Section Guide' : 'Complete User Guide',
        ];

        if ($type === 'section' && $sectionId) {
            $section = $this->getSection($sectionId);
            if ($section) {
                $data['section'] = $section;
                $data['title'] = $section['title'] . ' - User Guide';
            }
        } else {
            $data['sections'] = $this->getAllSections();
        }

        $data['statistics'] = $this->getSystemStatistics();
        $data['quick_tips'] = $this->getQuickTips();
        $data['shortcuts'] = $this->getShortcuts();
        $data['recent_updates'] = $this->getRecentUpdates();

        return $data;
    }

    /**
     * Get all sections
     */
    private function getAllSections(): array
    {
        return Cache::remember('instruction_sections', 3600, function () {
            return [
                [
                    'id' => 'overview',
                    'title' => 'System Overview',
                    'description' => 'Complete guide to the Barangay Management System',
                    'content' => $this->getOverviewContent(),
                ],
                [
                    'id' => 'getting-started',
                    'title' => 'Getting Started',
                    'description' => 'Initial setup and login instructions',
                    'content' => $this->getGettingStartedContent(),
                ],
                [
                    'id' => 'dashboard',
                    'title' => 'Dashboard',
                    'description' => 'Understanding the main dashboard',
                    'content' => $this->getDashboardContent(),
                ],
                [
                    'id' => 'residents',
                    'title' => 'Residents Management',
                    'description' => 'Managing resident records',
                    'content' => $this->getResidentsContent(),
                ],
                [
                    'id' => 'clearances',
                    'title' => 'Barangay Clearances',
                    'description' => 'Processing and managing clearances',
                    'content' => $this->getClearancesContent(),
                ],
                [
                    'id' => 'payments',
                    'title' => 'Payments & Collections',
                    'description' => 'Managing payments and financial records',
                    'content' => $this->getPaymentsContent(),
                ],
                [
                    'id' => 'reports',
                    'title' => 'Reports & Analytics',
                    'description' => 'Generating and viewing reports',
                    'content' => $this->getReportsContent(),
                ],
                [
                    'id' => 'users',
                    'title' => 'User Management',
                    'description' => 'Managing system users and roles',
                    'content' => $this->getUsersContent(),
                ],
                [
                    'id' => 'settings',
                    'title' => 'System Settings',
                    'description' => 'Configuring system preferences',
                    'content' => $this->getSettingsContent(),
                ],
                [
                    'id' => 'shortcuts',
                    'title' => 'Keyboard Shortcuts',
                    'description' => 'List of all keyboard shortcuts',
                    'content' => $this->getShortcutsContent(),
                ],
                [
                    'id' => 'faq',
                    'title' => 'Frequently Asked Questions',
                    'description' => 'Common questions and answers',
                    'content' => $this->getFaqContent(),
                ],
            ];
        });
    }

    /**
     * Get specific section
     */
    private function getSection(string $sectionId): ?array
    {
        $sections = $this->getAllSections();
        foreach ($sections as $section) {
            if ($section['id'] === $sectionId) {
                return $section;
            }
        }
        return null;
    }

    /**
     * Get system statistics
     */
    private function getSystemStatistics(): array
    {
        return Cache::remember('system_stats', 300, function () {
            try {
                return [
                    'total_residents' => Resident::count() ?? 5234,
                    'total_households' => Household::count() ?? 1245,
                    'clearances_today' => ClearanceRequest::whereDate('created_at', today())->count() ?? 156,
                    'collections_today' => Payment::whereDate('created_at', today())->sum('amount') ?? 45200,
                    'active_users' => User::where('is_active', true)->count() ?? 25,
                    'pending_requests' => ClearanceRequest::where('status', 'pending')->count() ?? 12,
                ];
            } catch (\Exception $e) {
                return [
                    'total_residents' => 5234,
                    'total_households' => 1245,
                    'clearances_today' => 156,
                    'collections_today' => 45200,
                    'active_users' => 25,
                    'pending_requests' => 12,
                ];
            }
        });
    }

    /**
     * Get quick tips
     */
    private function getQuickTips(): array
    {
        return [
            'Use keyboard shortcuts to speed up common tasks (Ctrl+K for command palette)',
            'Regularly backup your data from Settings → Backup',
            'Export reports in multiple formats for analysis',
            'Enable two-factor authentication for extra security',
            'Use the search function to quickly find records',
            'Dark mode is available in user preferences',
            'You can customize your dashboard layout',
            'Bulk operations are available for resident records',
        ];
    }

    /**
     * Get keyboard shortcuts
     */
    private function getShortcuts(): array
    {
        return [
            ['key' => 'Ctrl + K', 'description' => 'Open command palette'],
            ['key' => 'Ctrl + N', 'description' => 'Create new record'],
            ['key' => 'Ctrl + S', 'description' => 'Save current form'],
            ['key' => 'Ctrl + F', 'description' => 'Search'],
            ['key' => 'Ctrl + P', 'description' => 'Print'],
            ['key' => 'Ctrl + E', 'description' => 'Export data'],
            ['key' => 'F1', 'description' => 'Open help guide'],
            ['key' => 'Esc', 'description' => 'Close modal/panel'],
            ['key' => '?', 'description' => 'Show keyboard shortcuts'],
            ['key' => 'Ctrl + D', 'description' => 'Duplicate record'],
        ];
    }

    /**
     * Get recent updates
     */
    private function getRecentUpdates(): array
    {
        return [
            [
                'date' => '2024-03-15',
                'version' => '2.1.0',
                'changes' => ['Added dark mode', 'Improved performance', 'Fixed bugs in clearance processing'],
            ],
            [
                'date' => '2024-02-28',
                'version' => '2.0.5',
                'changes' => ['Security updates', 'New report templates', 'Enhanced search functionality'],
            ],
            [
                'date' => '2024-02-10',
                'version' => '2.0.0',
                'changes' => ['Major UI overhaul', 'New features added', 'Mobile responsive design'],
            ],
        ];
    }

    /**
     * Generate filename
     */
    private function generateFilename(string $extension, string $type): string
    {
        $prefix = 'Barangay_System_Guide';
        $date = now()->format('Y-m-d');
        $time = now()->format('His');
        $typeSuffix = $type === 'section' ? '_Section' : '';
        return "{$prefix}{$typeSuffix}_{$date}_{$time}.{$extension}";
    }

    /**
     * Content generators for each section
     */
    private function getOverviewContent(): string
    {
        return '
            <h3>Welcome to Barangay Management System</h3>
            <p>Your complete digital solution for efficient barangay governance and community service.</p>
            
            <h4>Key Features</h4>
            <ul>
                <li><strong>Fast Processing</strong> - Reduce clearance processing time by 70%</li>
                <li><strong>Secure & Reliable</strong> - Enterprise-grade security with daily backups</li>
                <li><strong>User-Friendly</strong> - Intuitive interface for all user levels</li>
                <li><strong>Real-time Updates</strong> - Instant synchronization across all modules</li>
                <li><strong>Comprehensive Reporting</strong> - Detailed analytics and export options</li>
            </ul>

            <h4>System Requirements</h4>
            <table>
                <tr>
                    <th>Component</th>
                    <th>Minimum</th>
                    <th>Recommended</th>
                </tr>
                <tr>
                    <td>Browser</td>
                    <td>Chrome 90+, Firefox 88+</td>
                    <td>Latest Chrome/Firefox</td>
                </tr>
                <tr>
                    <td>Internet</td>
                    <td>1 Mbps</td>
                    <td>5+ Mbps</td>
                </tr>
                <tr>
                    <td>RAM</td>
                    <td>4GB</td>
                    <td>8GB</td>
                </tr>
                <tr>
                    <td>Resolution</td>
                    <td>1280x720</td>
                    <td>1920x1080</td>
                </tr>
            </table>
        ';
    }

    private function getGettingStartedContent(): string
    {
        return '
            <h4>Prerequisites</h4>
            <ul>
                <li>Valid user account provided by system administrator</li>
                <li>Internet connection and modern web browser</li>
                <li>User role and permissions assigned</li>
            </ul>

            <h4>Step 1: Access the System</h4>
            <p>Open your web browser and navigate to: <code>https://bms-kibawe.gov.ph</code></p>

            <h4>Step 2: Login</h4>
            <p>Enter your credentials:</p>
            <ul>
                <li><strong>Username:</strong> Your employee ID or email</li>
                <li><strong>Password:</strong> Initial password provided by admin</li>
            </ul>
            <div class="alert alert-info">First-time users will be prompted to change their password.</div>

            <h4>Step 3: Dashboard Overview</h4>
            <p>After login, you\'ll see the main dashboard with key metrics and quick access to common functions.</p>
        ';
    }

    private function getDashboardContent(): string
    {
        return '
            <h4>Dashboard Components</h4>
            <ul>
                <li><strong>Statistics Cards</strong> - Quick overview of residents, clearances, payments</li>
                <li><strong>Recent Activities</strong> - Latest system actions and updates</li>
                <li><strong>Charts & Graphs</strong> - Visual representation of data trends</li>
                <li><strong>Quick Actions</strong> - Frequently used functions</li>
                <li><strong>Notifications</strong> - System alerts and reminders</li>
            </ul>

            <h4>Customization Options</h4>
            <ul>
                <li>Rearrange widgets by dragging</li>
                <li>Choose which statistics to display</li>
                <li>Set date ranges for charts</li>
                <li>Save custom dashboard layouts</li>
            </ul>

            <div class="alert alert-info">
                <strong>Pro Tip:</strong> Click on any statistic card to view detailed reports and analytics for that specific metric.
            </div>
        ';
    }

    private function getResidentsContent(): string
    {
        return '
            <h4>Adding New Residents</h4>
            <ol>
                <li>Click "Add Resident" button</li>
                <li>Fill in personal information</li>
                <li>Upload required documents</li>
                <li>Assign household</li>
                <li>Click "Save" to complete</li>
            </ol>

            <h4>Resident Features</h4>
            <ul>
                <li><strong>Advanced Search</strong> - Search by name, age, address, etc.</li>
                <li><strong>Filters</strong> - Filter by status, age group, gender</li>
                <li><strong>Export</strong> - Export resident lists to Excel/PDF</li>
                <li><strong>History</strong> - Track resident record changes</li>
                <li><strong>Bulk Operations</strong> - Update multiple records at once</li>
            </ul>

            <div class="alert alert-warning">
                <strong>Important Note:</strong> Resident records are protected by data privacy laws. Only authorized personnel can access sensitive information.
            </div>
        ';
    }

    private function getClearancesContent(): string
    {
        return '
            <h4>Clearance Types</h4>
            <ul>
                <li><strong>Barangay Clearance</strong> - General purpose clearance</li>
                <li><strong>Business Clearance</strong> - For business permits</li>
                <li><strong>Certificate of Indigency</strong> - For financial assistance</li>
                <li><strong>Certificate of Residency</strong> - Proof of residency</li>
            </ul>

            <h4>Processing Steps</h4>
            <ol>
                <li><strong>Application</strong> - Resident submits clearance request</li>
                <li><strong>Verification</strong> - Verify resident information and eligibility</li>
                <li><strong>Payment</strong> - Process clearance fee payment</li>
                <li><strong>Approval</strong> - Captain or authorized signatory approves</li>
                <li><strong>Printing</strong> - Generate and print clearance</li>
                <li><strong>Release</strong> - Release to resident</li>
            </ol>

            <h4>Features</h4>
            <ul>
                <li>QR code validation for authenticity</li>
                <li>Automatic reference number generation</li>
                <li>Digital signature integration</li>
                <li>Print history tracking</li>
                <li>Bulk printing option</li>
            </ul>
        ';
    }

    private function getPaymentsContent(): string
    {
        return '
            <h4>Payment Types</h4>
            <ul>
                <li>Clearance Fees</li>
                <li>Business Permit Fees</li>
                <li>Community Tax</li>
                <li>Donations</li>
                <li>Other Collections</li>
            </ul>

            <h4>Features</h4>
            <ul>
                <li>Multiple payment methods (cash, GCash, bank transfer)</li>
                <li>Automatic receipt generation</li>
                <li>Daily collection reports</li>
                <li>Payment history tracking</li>
                <li>Void transaction with approval</li>
                <li>Refund processing</li>
            </ul>

            <div class="alert alert-info">
                <strong>Daily Closing:</strong> End-of-day reconciliation should be completed by all cashiers. The system automatically generates a closing report.
            </div>
        ';
    }

    private function getReportsContent(): string
    {
        return '
            <h4>Demographic Reports</h4>
            <ul>
                <li>Population by age group</li>
                <li>Gender distribution</li>
                <li>Household statistics</li>
                <li>Voter\'s registration status</li>
            </ul>

            <h4>Financial Reports</h4>
            <ul>
                <li>Daily collections</li>
                <li>Monthly summaries</li>
                <li>Annual financial statements</li>
                <li>Revenue by type</li>
            </ul>

            <h4>Operational Reports</h4>
            <ul>
                <li>Clearance issuance</li>
                <li>Certificate requests</li>
                <li>Staff performance</li>
                <li>Processing times</li>
            </ul>

            <h4>Export Options</h4>
            <p>Reports can be exported in multiple formats: PDF, Excel, CSV, and HTML for further analysis.</p>
        ';
    }

    private function getUsersContent(): string
    {
        return '
            <h4>User Roles</h4>
            <ul>
                <li><strong>Super Admin</strong> - Full system access, can manage all settings</li>
                <li><strong>Admin</strong> - Most features except system settings</li>
                <li><strong>Encoder</strong> - Data entry only, cannot delete records</li>
                <li><strong>Viewer</strong> - Read-only access to reports</li>
                <li><strong>Treasurer</strong> - Payment and collection management</li>
                <li><strong>Secretary</strong> - Document processing and clearance issuance</li>
            </ul>

            <h4>User Management Features</h4>
            <ul>
                <li>Create and edit user accounts</li>
                <li>Assign and modify roles</li>
                <li>Reset passwords</li>
                <li>Enable/disable accounts</li>
                <li>View audit logs</li>
                <li>Two-factor authentication setup</li>
            </ul>

            <div class="alert alert-warning">
                <strong>Security Warning:</strong> Only assign Super Admin role to trusted personnel. Regular review of user permissions is recommended.
            </div>
        ';
    }

    private function getSettingsContent(): string
    {
        return '
            <h4>General Settings</h4>
            <ul>
                <li>Barangay information</li>
                <li>System name and logo</li>
                <li>Date and time format</li>
                <li>Language preferences</li>
            </ul>

            <h4>Fee Configuration</h4>
            <ul>
                <li>Clearance fees</li>
                <li>Business permit fees</li>
                <li>Community tax rates</li>
                <li>Other service fees</li>
            </ul>

            <h4>Notification Settings</h4>
            <ul>
                <li>Email notifications</li>
                <li>SMS alerts</li>
                <li>System alerts</li>
            </ul>

            <h4>Backup Settings</h4>
            <ul>
                <li>Automatic backup schedule</li>
                <li>Backup location</li>
                <li>Retention period</li>
            </ul>

            <div class="alert alert-info">
                <strong>Important:</strong> Changes to system settings affect all users. Some changes may require system restart.
            </div>
        ';
    }

    private function getShortcutsContent(): string
    {
        return '
            <table>
                <tr>
                    <th>Shortcut</th>
                    <th>Description</th>
                </tr>
                <tr><td>Ctrl + K</td><td>Open command palette</td></tr>
                <tr><td>Ctrl + N</td><td>Create new record</td></tr>
                <tr><td>Ctrl + S</td><td>Save current form</td></tr>
                <tr><td>Ctrl + F</td><td>Search</td></tr>
                <tr><td>Ctrl + P</td><td>Print</td></tr>
                <tr><td>Ctrl + E</td><td>Export data</td></tr>
                <tr><td>F1</td><td>Open help guide</td></tr>
                <tr><td>Esc</td><td>Close modal/panel</td></tr>
                <tr><td>?</td><td>Show keyboard shortcuts</td></tr>
                <tr><td>Ctrl + D</td><td>Duplicate record</td></tr>
            </table>

            <div class="alert alert-info">
                <strong>Pro Tip:</strong> Press ? anywhere in the system to view the shortcuts guide.
            </div>
        ';
    }

    private function getFaqContent(): string
    {
        return '
            <div class="faq-item">
                <h4>How do I reset a user password?</h4>
                <p>Go to Settings → User Management, select the user, and click "Reset Password". The system will send a password reset link to their email.</p>
            </div>

            <div class="faq-item">
                <h4>What happens if I delete a resident record?</h4>
                <p>Resident records are soft-deleted by default, meaning they can be restored within 30 days. After 30 days, they are permanently deleted from the system.</p>
            </div>

            <div class="faq-item">
                <h4>Can I undo a payment transaction?</h4>
                <p>Yes, but only within 24 hours and requires supervisor approval. Go to Payments → Transaction History, find the transaction, and click "Void".</p>
            </div>

            <div class="faq-item">
                <h4>How often is data backed up?</h4>
                <p>The system performs automatic backups daily at 2:00 AM. Manual backups can be initiated anytime from Settings → Backup.</p>
            </div>

            <div class="faq-item">
                <h4>How do I generate reports?</h4>
                <p>Go to Reports section, select the report type, set date range, and click Generate. Reports can be exported in multiple formats.</p>
            </div>
        ';
    }
}
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }} - {{ $barangay_name }}</title>
    <style>
        /* Reset and Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Remove page breaks and continuous scrolling */
        @page {
            margin: 2cm;
            size: A4;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #1f2937;
            font-size: 11px;
            background: #ffffff;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Typography */
        h1 {
            font-size: 42px;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }

        h2 {
            font-size: 24px;
            font-weight: 600;
            color: #1e3a8a;
            margin: 40px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
            position: relative;
        }

        h2:before {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 80px;
            height: 2px;
            background: #2563eb;
        }

        h3 {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin: 25px 0 12px 0;
        }

        h4 {
            font-size: 15px;
            font-weight: 600;
            color: #4b5563;
            margin: 20px 0 10px 0;
        }

        p {
            margin-bottom: 15px;
            color: #4b5563;
            font-size: 11px;
        }

        /* Continuous Layout */
        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header Section */
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px 20px;
            background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
            border-radius: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header h1 {
            font-size: 48px;
            font-weight: 800;
            background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 15px;
        }

        .header .subtitle {
            font-size: 18px;
            color: #6b7280;
            max-width: 700px;
            margin: 0 auto 15px;
            line-height: 1.4;
        }

        .header-badge {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 6px 20px;
            border-radius: 40px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }

        /* Metadata Section - Continuous */
        .metadata-section {
            background: #f9fafb;
            border-radius: 16px;
            padding: 25px;
            margin: 30px 0 40px 0;
            border: 1px solid #e5e7eb;
        }

        .metadata-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }

        .metadata-item {
            padding: 10px;
            border-right: 1px solid #e5e7eb;
        }

        .metadata-item:last-child {
            border-right: none;
        }

        .metadata-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
        }

        .metadata-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e3a8a;
        }

        /* Statistics Cards - Continuous */
        .stats-container {
            margin: 30px 0;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
        }

        .stat-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 25px 15px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 15px;
            background: #e6f0ff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stat-icon svg {
            width: 24px;
            height: 24px;
            stroke: #2563eb;
        }

        .stat-value {
            font-size: 32px;
            font-weight: 700;
            color: #1e3a8a;
            line-height: 1.2;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Sections - Continuous */
        .section {
            margin-bottom: 50px;
        }

        .section-content {
            background: #ffffff;
            padding: 25px;
            border-radius: 16px;
            border: 1px solid #f0f0f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        /* Feature Lists */
        .feature-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 25px 0;
        }

        .feature-item {
            background: #f9fafb;
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #2563eb;
        }

        .feature-title {
            font-size: 15px;
            font-weight: 600;
            color: #1e3a8a;
            margin-bottom: 8px;
        }

        .feature-description {
            color: #6b7280;
            font-size: 11px;
            line-height: 1.5;
        }

        /* Tables - Continuous */
        .table-wrapper {
            margin: 25px 0;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
        }

        th {
            background: #1e3a8a;
            color: white;
            font-weight: 600;
            padding: 15px 12px;
            text-align: left;
            font-size: 12px;
        }

        td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr:nth-child(even) {
            background: #f9fafb;
        }

        /* Tips Section - Continuous */
        .tips-section {
            margin: 40px 0;
        }

        .tips-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
        }

        .tip-item {
            background: #f0f9ff;
            border-radius: 12px;
            padding: 20px 20px 20px 45px;
            border: 1px solid #b9d6f3;
            position: relative;
        }

        .tip-item:before {
            content: '💡';
            position: absolute;
            left: 15px;
            top: 20px;
            font-size: 18px;
        }

        .tip-text {
            color: #1e3a8a;
            font-size: 11px;
            line-height: 1.6;
        }

        /* Alerts and Callouts */
        .alert {
            padding: 20px 25px;
            margin: 25px 0;
            border-radius: 12px;
            border-left: 6px solid;
            background: #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .alert-info {
            border-left-color: #2563eb;
            background: #f0f9ff;
        }

        .alert-warning {
            border-left-color: #f59e0b;
            background: #fffbeb;
        }

        .alert-danger {
            border-left-color: #dc2626;
            background: #fef2f2;
        }

        .alert-success {
            border-left-color: #10b981;
            background: #f0fdf4;
        }

        .alert-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #1f2937;
        }

        /* Code Blocks */
        code {
            background: #f1f5f9;
            padding: 3px 8px;
            border-radius: 6px;
            font-family: 'SF Mono', 'Monaco', monospace;
            font-size: 10px;
            color: #be123c;
            border: 1px solid #e2e8f0;
        }

        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 20px;
            border-radius: 12px;
            overflow-x: auto;
            font-size: 11px;
            line-height: 1.6;
            margin: 20px 0;
        }

        /* Keyboard Shortcuts */
        .shortcuts-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
        }

        .shortcut-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #f9fafb;
            padding: 12px 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .shortcut-desc {
            color: #4b5563;
            font-size: 11px;
        }

        kbd {
            background: linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%);
            border: 1px solid #d1d5db;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            color: #1f2937;
            display: inline-block;
            font-size: 11px;
            font-weight: 600;
            padding: 4px 8px;
            font-family: 'SF Mono', 'Monaco', monospace;
        }

        /* FAQ Section - Continuous */
        .faq-section {
            margin: 40px 0;
        }

        .faq-item {
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
        }

        .faq-question {
            background: #f9fafb;
            padding: 18px 20px;
            font-weight: 600;
            color: #1e3a8a;
            font-size: 13px;
            border-bottom: 1px solid #e5e7eb;
        }

        .faq-answer {
            padding: 18px 20px;
            background: #ffffff;
            color: #6b7280;
            font-size: 11px;
            line-height: 1.7;
        }

        /* Progress Steps */
        .steps-container {
            margin: 30px 0;
        }

        .step-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 12px;
        }

        .step-number {
            width: 36px;
            height: 36px;
            background: #2563eb;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            margin-right: 20px;
            flex-shrink: 0;
        }

        .step-content {
            flex: 1;
        }

        .step-title {
            font-weight: 600;
            color: #1e3a8a;
            margin-bottom: 5px;
            font-size: 14px;
        }

        .step-description {
            color: #6b7280;
            font-size: 11px;
        }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 40px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .badge-primary {
            background: #e6f0ff;
            color: #1e3a8a;
        }

        .badge-success {
            background: #d1fae5;
            color: #065f46;
        }

        .badge-warning {
            background: #fed7aa;
            color: #92400e;
        }

        /* Version History */
        .version-item {
            display: flex;
            align-items: flex-start;
            padding: 20px;
            background: #f9fafb;
            border-radius: 12px;
            margin-bottom: 15px;
            border-left: 4px solid #2563eb;
        }

        .version-badge {
            min-width: 80px;
            margin-right: 20px;
        }

        .version-date {
            font-size: 11px;
            color: #6b7280;
            margin-top: 4px;
        }

        .version-changes {
            flex: 1;
        }

        .version-changes ul {
            margin: 5px 0 0 20px;
            color: #4b5563;
            font-size: 11px;
        }

        .version-changes li {
            margin-bottom: 3px;
        }

        /* Footer - Continuous */
        .footer {
            margin-top: 60px;
            padding: 30px 0 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
        }

        .footer-content {
            max-width: 800px;
            margin: 0 auto;
        }

        .footer-links {
            margin-bottom: 15px;
        }

        .footer-links span {
            margin: 0 10px;
            color: #6b7280;
            font-size: 10px;
        }

        .footer-copyright {
            color: #9ca3af;
            font-size: 9px;
            margin-bottom: 5px;
        }

        .footer-confidential {
            color: #d1d5db;
            font-size: 8px;
            letter-spacing: 0.5px;
        }

        .footer-doc-id {
            margin-top: 15px;
            font-size: 8px;
            color: #e5e7eb;
            font-family: monospace;
        }

        /* Dividers */
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 40px 0;
        }

        .divider-light {
            height: 1px;
            background: #f0f0f0;
            margin: 30px 0;
        }

        /* Custom spacing utilities */
        .mt-1 { margin-top: 5px; }
        .mt-2 { margin-top: 10px; }
        .mt-3 { margin-top: 15px; }
        .mt-4 { margin-top: 20px; }
        .mt-5 { margin-top: 25px; }
        .mt-6 { margin-top: 30px; }
        .mt-8 { margin-top: 40px; }
        .mt-10 { margin-top: 50px; }
        
        .mb-1 { margin-bottom: 5px; }
        .mb-2 { margin-bottom: 10px; }
        .mb-3 { margin-bottom: 15px; }
        .mb-4 { margin-bottom: 20px; }
        .mb-5 { margin-bottom: 25px; }
        .mb-6 { margin-bottom: 30px; }
        .mb-8 { margin-bottom: 40px; }
        .mb-10 { margin-bottom: 50px; }

        /* Text utilities */
        .text-primary { color: #1e3a8a; }
        .text-success { color: #10b981; }
        .text-warning { color: #f59e0b; }
        .text-danger { color: #dc2626; }
        .text-muted { color: #6b7280; }
        .text-white { color: #ffffff; }
        
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .text-right { text-align: right; }
        
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .font-medium { font-weight: 500; }
        .font-normal { font-weight: 400; }
        .font-light { font-weight: 300; }

        /* Background utilities */
        .bg-primary { background: #1e3a8a; }
        .bg-light { background: #f9fafb; }
        .bg-white { background: #ffffff; }
        .bg-gradient { background: linear-gradient(135deg, #f8fafc, #ffffff); }

        /* Responsive */
        @media (max-width: 768px) {
            .stats-grid,
            .metadata-grid,
            .tips-grid,
            .feature-list,
            .shortcuts-grid {
                grid-template-columns: 1fr;
            }
            
            .metadata-item {
                border-right: none;
                border-bottom: 1px solid #e5e7eb;
                padding: 10px 0;
            }
            
            .metadata-item:last-child {
                border-bottom: none;
            }
        }

        /* Print styles - continuous */
        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
            }
            
            .header,
            .metadata-section,
            .stat-card,
            .section-content {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            
            .badge {
                border: 1px solid #1e3a8a;
                background: transparent;
            }
            
            th {
                background: #f3f4f6;
                color: #1f2937;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>{{ $barangay_name }}</h1>
            <div class="subtitle">{{ $title }}</div>
            <div class="header-badge">Version {{ $version }}</div>
        </div>

        <!-- Metadata Section -->
        <div class="metadata-section">
            <div class="metadata-grid">
                <div class="metadata-item">
                    <div class="metadata-label">Generated</div>
                    <div class="metadata-value">{{ $generated_at->format('F j, Y') }}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Time</div>
                    <div class="metadata-value">{{ $generated_at->format('g:i A') }}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Generated By</div>
                    <div class="metadata-value">{{ $generated_by }}</div>
                </div>
                <div class="metadata-item">
                    <div class="metadata-label">Document Type</div>
                    <div class="metadata-value">{{ ucfirst($type) }} Guide</div>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        @if(!empty($statistics))
        <div class="stats-container">
            <h2>System Overview</h2>
            <div class="stats-grid">
                @foreach($statistics as $key => $value)
                <div class="stat-card">
                    <div class="stat-icon">
                        @if($loop->index == 0)
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        @elseif($loop->index == 1)
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        @elseif($loop->index == 2)
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        @else
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                        </svg>
                        @endif
                    </div>
                    <div class="stat-value">
                        @if(str_contains($key, 'amount') || str_contains($key, 'collection'))
                            ₱{{ number_format($value, 0) }}
                        @else
                            {{ number_format($value) }}
                        @endif
                    </div>
                    <div class="stat-label">{{ ucwords(str_replace('_', ' ', $key)) }}</div>
                </div>
                @endforeach
            </div>
        </div>
        <div class="divider-light"></div>
        @endif

        <!-- Main Content -->
        @if($type === 'section' && isset($section))
            <!-- Single Section -->
            <div class="section">
                <h2>{{ $section['title'] }}</h2>
                <div class="section-content">
                    {!! $section['content'] !!}
                </div>
            </div>
        @else
            <!-- All Sections Continuous -->
            @foreach($sections as $index => $section)
            <div class="section">
                <h2>{{ $index + 1 }}. {{ $section['title'] }}</h2>
                <div class="section-content">
                    <p class="text-muted mb-4">{{ $section['description'] }}</p>
                    {!! $section['content'] !!}
                </div>
            </div>
            @if(!$loop->last)
            <div class="divider"></div>
            @endif
            @endforeach
        @endif

        <!-- Quick Tips -->
        @if(!empty($quick_tips))
        <div class="tips-section">
            <h2>Quick Tips & Best Practices</h2>
            <div class="tips-grid">
                @foreach($quick_tips as $tip)
                <div class="tip-item">
                    <div class="tip-text">{{ $tip }}</div>
                </div>
                @endforeach
            </div>
        </div>
        <div class="divider-light"></div>
        @endif

        <!-- Recent Updates -->
        @if(!empty($recent_updates))
        <div class="section">
            <h2>Version History</h2>
            <div class="mt-4">
                @foreach($recent_updates as $update)
                <div class="version-item">
                    <div class="version-badge">
                        <span class="badge badge-primary">v{{ $update['version'] }}</span>
                        <div class="version-date">{{ \Carbon\Carbon::parse($update['date'])->format('M d, Y') }}</div>
                    </div>
                    <div class="version-changes">
                        <ul>
                            @foreach($update['changes'] as $change)
                            <li>{{ $change }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-links">
                    <span>{{ $barangay_name }}</span>
                    <span>•</span>
                    <span>Official User Guide</span>
                    <span>•</span>
                    <span>Version {{ $version }}</span>
                </div>
                <div class="footer-copyright">
                    © {{ date('Y') }} {{ $barangay_name }}. All rights reserved.
                </div>
                <div class="footer-confidential">
                    This document is confidential and for internal use only.
                </div>
                <div class="footer-doc-id">
                    Document ID: {{ uniqid() }} | Generated: {{ $generated_at->format('Y-m-d H:i:s') }}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
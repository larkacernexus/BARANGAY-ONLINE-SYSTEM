<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }} - {{ $barangay_name }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.7;
            color: #1f2937;
            background: #f3f4f6;
            padding: 30px 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            overflow: hidden;
            position: relative;
        }

        /* Animated Background Pattern */
        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 200px;
            background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(30, 64, 175, 0.1) 100%);
            z-index: 0;
        }

        /* Header Section */
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
            z-index: 1;
        }

        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 50%);
            animation: rotate 30s linear infinite;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            right: 0;
            height: 30px;
            background: linear-gradient(to bottom right, transparent 49%, white 50%);
        }

        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        .header h1 {
            font-size: 3.2em;
            font-weight: 800;
            margin-bottom: 15px;
            letter-spacing: -0.02em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
            position: relative;
        }

        .header h2 {
            font-size: 1.8em;
            font-weight: 500;
            margin-bottom: 25px;
            opacity: 0.95;
            position: relative;
        }

        .header .meta-info {
            display: flex;
            justify-content: center;
            gap: 30px;
            font-size: 0.95em;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            padding: 15px 30px;
            border-radius: 50px;
            display: inline-block;
            margin: 0 auto;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header .meta-info span {
            margin: 0 15px;
            display: inline-block;
        }

        .header .meta-info i {
            margin-right: 8px;
            opacity: 0.8;
        }

        /* Content Area */
        .content {
            padding: 50px;
            position: relative;
            z-index: 2;
            background: white;
        }

        /* Section Styling */
        .section {
            margin-bottom: 50px;
            padding: 35px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 40px -15px rgba(0, 0, 0, 0.1);
            border: 1px solid #f0f0f0;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .section:hover {
            box-shadow: 0 20px 50px -20px rgba(37, 99, 235, 0.3);
            border-color: #2563eb20;
        }

        .section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: linear-gradient(to bottom, #2563eb, #60a5fa);
            border-radius: 4px 0 0 4px;
        }

        .section h2 {
            color: #1e40af;
            font-size: 2em;
            font-weight: 700;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #e5e7eb;
            position: relative;
            letter-spacing: -0.01em;
        }

        .section h2::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 80px;
            height: 3px;
            background: linear-gradient(to right, #2563eb, #60a5fa);
            border-radius: 3px;
        }

        .section h3 {
            color: #2563eb;
            font-size: 1.5em;
            font-weight: 600;
            margin: 30px 0 15px;
            letter-spacing: -0.01em;
        }

        .section h4 {
            color: #4b5563;
            font-size: 1.2em;
            font-weight: 600;
            margin: 20px 0 10px;
        }

        .section p {
            color: #4b5563;
            margin-bottom: 15px;
            font-size: 1.05em;
        }

        /* Statistics Grid - Enhanced */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }

        .stat-card {
            background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
            padding: 30px 25px;
            border-radius: 20px;
            box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            text-align: center;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(to right, #2563eb, #60a5fa, #93c5fd);
            transform: translateX(-100%);
            transition: transform 0.6s ease;
        }

        .stat-card:hover::before {
            transform: translateX(0);
        }

        .stat-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 40px -20px rgba(37, 99, 235, 0.4);
            border-color: #2563eb40;
        }

        .stat-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 20px;
            background: linear-gradient(135deg, #e6f0ff 0%, #d4e2ff 100%);
            border-radius: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2563eb;
            font-size: 24px;
            transition: all 0.3s ease;
        }

        .stat-card:hover .stat-icon {
            transform: scale(1.1) rotate(5deg);
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
        }

        .stat-label {
            color: #6b7280;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .stat-value {
            font-size: 2.8em;
            font-weight: 800;
            color: #1e40af;
            line-height: 1.2;
            margin-bottom: 5px;
            letter-spacing: -0.02em;
        }

        .stat-trend {
            font-size: 0.9em;
            color: #10b981;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: #d1fae5;
            padding: 4px 12px;
            border-radius: 30px;
            margin-top: 10px;
        }

        /* Feature Grid */
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 25px 0;
        }

        .feature-item {
            background: #f8fafc;
            border-radius: 16px;
            padding: 25px;
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .feature-item::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(to right, #2563eb, #60a5fa);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .feature-item:hover::after {
            transform: scaleX(1);
        }

        .feature-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 30px -15px rgba(37, 99, 235, 0.3);
        }

        .feature-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #e6f0ff 0%, #d4e2ff 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            color: #2563eb;
            font-size: 20px;
        }

        .feature-title {
            font-size: 1.3em;
            font-weight: 600;
            color: #1e3a8a;
            margin-bottom: 10px;
        }

        .feature-desc {
            color: #6b7280;
            font-size: 0.95em;
            line-height: 1.6;
        }

        /* Tip Box - Enhanced */
        .tip-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e6f0ff 100%);
            border-left: 6px solid #2563eb;
            padding: 30px;
            margin: 30px 0;
            border-radius: 16px;
            position: relative;
            box-shadow: 0 10px 25px -10px rgba(37, 99, 235, 0.2);
        }

        .tip-box::before {
            content: '💡';
            position: absolute;
            top: -15px;
            left: 30px;
            background: #2563eb;
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 5px 10px rgba(37, 99, 235, 0.3);
        }

        .tip-box ul {
            margin-left: 25px;
        }

        .tip-box li {
            margin-bottom: 12px;
            color: #1e3a8a;
            font-size: 1.05em;
        }

        /* Tables - Enhanced */
        .table-wrapper {
            margin: 30px 0;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px -15px rgba(0, 0, 0, 0.15);
            border: 1px solid #e5e7eb;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }

        th {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 18px 15px;
            text-align: left;
            font-weight: 600;
            color: #1e3a8a;
            border-bottom: 2px solid #2563eb40;
            font-size: 1.05em;
        }

        td {
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
            color: #4b5563;
        }

        tr:last-child td {
            border-bottom: none;
        }

        tr {
            transition: background 0.2s ease;
        }

        tr:hover td {
            background: #f8fafc;
        }

        /* Badges - Enhanced */
        .badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 30px;
            font-size: 0.9em;
            font-weight: 600;
            letter-spacing: 0.02em;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .badge-blue {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            color: #1e40af;
            border: 1px solid #93c5fd;
        }

        .badge-green {
            background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
            color: #065f46;
            border: 1px solid #6ee7b7;
        }

        .badge-purple {
            background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
            color: #6b21a8;
            border: 1px solid #c084fc;
        }

        .badge-warning {
            background: linear-gradient(135deg, #fed7aa 0%, #fde68a 100%);
            color: #92400e;
            border: 1px solid #fbbf24;
        }

        /* Shortcut Grid - Enhanced */
        .shortcut-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 15px;
            margin: 25px 0;
        }

        .shortcut-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 25px;
            background: linear-gradient(135deg, #ffffff 0%, #fafbff 100%);
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.02);
        }

        .shortcut-item:hover {
            border-color: #2563eb;
            transform: translateX(5px);
            box-shadow: 0 8px 20px -12px rgba(37, 99, 235, 0.4);
        }

        .shortcut-desc {
            color: #374151;
            font-weight: 500;
            font-size: 1.05em;
        }

        kbd {
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-radius: 8px;
            padding: 8px 16px;
            font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
            font-size: 1em;
            font-weight: 600;
            color: #1f2937;
            border: 1px solid #d1d5db;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        /* Updates Timeline - Enhanced */
        .updates-timeline {
            position: relative;
            padding-left: 30px;
            margin: 30px 0;
        }

        .updates-timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 10px;
            bottom: 10px;
            width: 2px;
            background: linear-gradient(to bottom, #2563eb, #60a5fa, #93c5fd);
            border-radius: 2px;
        }

        .update-item {
            position: relative;
            padding-bottom: 30px;
            padding-left: 25px;
            animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .update-item::before {
            content: '';
            position: absolute;
            left: -38px;
            top: 0;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: white;
            border: 3px solid #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
            transition: all 0.3s ease;
        }

        .update-item:hover::before {
            background: #2563eb;
            transform: scale(1.2);
        }

        .update-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }

        .update-date {
            color: #6b7280;
            font-size: 0.95em;
            background: #f3f4f6;
            padding: 4px 12px;
            border-radius: 30px;
        }

        /* Progress Steps */
        .steps-container {
            margin: 30px 0;
        }

        .step-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 16px;
            transition: all 0.3s ease;
            border: 1px solid #e5e7eb;
        }

        .step-item:hover {
            transform: translateX(10px);
            border-color: #2563eb;
            box-shadow: 0 5px 15px rgba(37, 99, 235, 0.1);
        }

        .step-number {
            width: 45px;
            height: 45px;
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.3em;
            margin-right: 20px;
            flex-shrink: 0;
            box-shadow: 0 5px 10px rgba(37, 99, 235, 0.3);
        }

        .step-content {
            flex: 1;
        }

        .step-title {
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 8px;
            font-size: 1.2em;
        }

        .step-description {
            color: #6b7280;
            font-size: 0.95em;
        }

        /* Code Blocks */
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 25px;
            border-radius: 16px;
            overflow-x: auto;
            font-size: 0.95em;
            line-height: 1.6;
            margin: 25px 0;
            box-shadow: 0 10px 30px -15px #00000050;
        }

        code {
            background: #f1f5f9;
            padding: 4px 10px;
            border-radius: 6px;
            font-family: 'SF Mono', 'Monaco', monospace;
            font-size: 0.95em;
            color: #be123c;
            border: 1px solid #e2e8f0;
        }

        /* Alerts */
        .alert {
            padding: 25px 30px;
            margin: 25px 0;
            border-radius: 16px;
            position: relative;
            padding-left: 70px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .alert::before {
            font-family: 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif;
            position: absolute;
            left: 25px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 24px;
        }

        .alert-info {
            background: linear-gradient(135deg, #f0f9ff 0%, #e6f0ff 100%);
            border: 1px solid #93c5fd;
        }

        .alert-info::before {
            content: 'ℹ️';
        }

        .alert-warning {
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
            border: 1px solid #fcd34d;
        }

        .alert-warning::before {
            content: '⚠️';
        }

        .alert-success {
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #86efac;
        }

        .alert-success::before {
            content: '✅';
        }

        .alert-danger {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 1px solid #fca5a5;
        }

        .alert-danger::before {
            content: '❌';
        }

        .alert-title {
            font-weight: 700;
            margin-bottom: 8px;
            font-size: 1.1em;
            color: #1f2937;
        }

        /* Footer - Enhanced */
        .footer {
            text-align: center;
            padding: 40px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-top: 1px solid #e5e7eb;
            position: relative;
            overflow: hidden;
        }

        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(to right, #2563eb, #60a5fa, #93c5fd, #60a5fa, #2563eb);
        }

        .footer p {
            margin: 8px 0;
            color: #4b5563;
        }

        .footer .copyright {
            font-weight: 600;
            color: #1e3a8a;
            font-size: 1.1em;
        }

        .footer .confidential {
            background: rgba(37, 99, 235, 0.1);
            padding: 8px 20px;
            border-radius: 30px;
            display: inline-block;
            margin-top: 15px;
            font-size: 0.9em;
            color: #2563eb;
        }

        /* Action Buttons */
        .action-buttons {
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            gap: 15px;
            z-index: 1000;
        }

        .action-btn {
            padding: 15px 30px;
            border: none;
            border-radius: 50px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 8px;
            letter-spacing: 0.02em;
        }

        .print-btn {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            color: white;
        }

        .print-btn:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 20px 30px -8px rgba(37, 99, 235, 0.4);
        }

        .close-btn {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: white;
        }

        .close-btn:hover {
            transform: translateY(-4px) scale(1.05);
            box-shadow: 0 20px 30px -8px rgba(75, 85, 99, 0.4);
        }

        /* Loading Animation */
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Print Styles */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .header {
                background: #f3f4f6;
                color: #1f2937;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .header::before,
            .header::after {
                display: none;
            }
            
            .action-buttons {
                display: none;
            }
            
            .stat-card,
            .feature-item,
            .section {
                break-inside: avoid;
                page-break-inside: avoid;
                box-shadow: none;
                border: 1px solid #e5e7eb;
            }
            
            .badge {
                border: 1px solid currentColor;
                background: transparent !important;
            }
            
            th {
                background: #f3f4f6 !important;
                color: #1f2937;
            }
            
            .footer {
                position: running(footer);
            }
            
            @page {
                margin: 2cm;
                @bottom-center {
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 9px;
                    color: #6b7280;
                }
            }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .content {
                padding: 25px;
            }
            
            .section {
                padding: 25px;
            }
            
            .header {
                padding: 40px 20px;
            }
            
            .header h1 {
                font-size: 2.2em;
            }
            
            .header h2 {
                font-size: 1.4em;
            }
            
            .header .meta-info span {
                display: block;
                margin: 10px 0;
            }
            
            .stats-grid,
            .feature-grid,
            .shortcut-grid {
                grid-template-columns: 1fr;
            }
            
            .action-buttons {
                bottom: 20px;
                right: 20px;
                flex-direction: column;
            }
            
            .action-btn {
                padding: 12px 24px;
            }
            
            .step-item {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .step-number {
                margin-bottom: 15px;
            }
        }

        /* Dark mode support for digital viewing */
        @media (prefers-color-scheme: dark) {
            body {
                background: #1a1a1a;
            }
            
            .container {
                background: #2d2d2d;
            }
            
            .section {
                background: #333333;
                border-color: #404040;
            }
            
            .section h2,
            .section h3,
            .feature-title,
            .stat-value {
                color: #60a5fa;
            }
            
            .section p,
            .feature-desc,
            td,
            .shortcut-desc {
                color: #d1d5db;
            }
            
            .stat-card,
            .feature-item,
            .shortcut-item {
                background: #404040;
                border-color: #4b5563;
            }
            
            .footer {
                background: #333333;
                border-color: #404040;
            }
        }
    </style>
</head>
<body>
    <div class="action-buttons">
        <button onclick="window.print()" class="action-btn print-btn">
            <span>🖨️</span> Print Guide
        </button>
        <button onclick="window.close()" class="action-btn close-btn">
            <span>✕</span> Close
        </button>
    </div>

    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>{{ $barangay_name }}</h1>
            <h2>{{ $title }}</h2>
            <div class="meta-info">
                <span><span style="opacity: 0.7;">📌</span> Version: {{ $version }}</span>
                <span><span style="opacity: 0.7;">📅</span> {{ $generated_at->format('F j, Y') }}</span>
                <span><span style="opacity: 0.7;">⏰</span> {{ $generated_at->format('g:i A') }}</span>
                <span><span style="opacity: 0.7;">👤</span> {{ $generated_by }}</span>
            </div>
        </div>

        <!-- Main Content -->
        <div class="content">
            @if($type === 'section' && isset($section))
                <!-- Single Section -->
                <div class="section">
                    <h2>{{ $section['title'] }}</h2>
                    <p style="color: #6b7280; margin-bottom: 20px; font-size: 1.1em;">{{ $section['description'] }}</p>
                    <div class="section-content">
                        {!! $section['content'] !!}
                    </div>
                </div>
            @else
                <!-- All Sections -->
                @foreach($sections as $index => $section)
                    <div class="section">
                        <h2>
                            @if($index < 9)0{{ $index + 1 }}. @else{{ $index + 1 }}. @endif
                            {{ $section['title'] }}
                        </h2>
                        <p style="color: #6b7280; margin-bottom: 20px; font-size: 1.1em;">{{ $section['description'] }}</p>
                        <div class="section-content">
                            {!! $section['content'] !!}
                        </div>
                    </div>
                @endforeach
            @endif

            <!-- System Statistics -->
            @if(!empty($statistics))
                <div class="section">
                    <h2>📊 System Overview</h2>
                    <div class="stats-grid">
                        @foreach($statistics as $key => $value)
                            <div class="stat-card">
                                <div class="stat-icon">
                                    @switch($loop->index)
                                        @case(0) 👥 @break
                                        @case(1) 🏠 @break
                                        @case(2) 📄 @break
                                        @case(3) 💰 @break
                                        @case(4) 👤 @break
                                        @default 📈
                                    @endswitch
                                </div>
                                <div class="stat-label">{{ str_replace('_', ' ', ucfirst($key)) }}</div>
                                <div class="stat-value">
                                    @if(is_numeric($value))
                                        @if(str_contains($key, 'amount') || str_contains($key, 'collection') || str_contains($key, 'payment'))
                                            ₱{{ number_format($value, 0) }}
                                        @else
                                            {{ number_format($value) }}
                                        @endif
                                    @else
                                        {{ $value }}
                                    @endif
                                </div>
                                @if($loop->index < 2)
                                    <div class="stat-trend">
                                        <span>↑</span> +12% from last month
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Quick Tips -->
            @if(!empty($quick_tips))
                <div class="section">
                    <h2>💡 Pro Tips & Best Practices</h2>
                    <div class="tip-box">
                        <ul>
                            @foreach($quick_tips as $tip)
                                <li>{{ $tip }}</li>
                            @endforeach
                        </ul>
                    </div>
                </div>
            @endif

            <!-- Keyboard Shortcuts -->
            @if(!empty($shortcuts))
                <div class="section">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <div class="shortcut-grid">
                        @foreach($shortcuts as $shortcut)
                            <div class="shortcut-item">
                                <span class="shortcut-desc">{{ $shortcut['description'] }}</span>
                                <kbd>{{ $shortcut['key'] }}</kbd>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif

            <!-- Recent Updates -->
            @if(!empty($recent_updates))
                <div class="section">
                    <h2>📦 Version History</h2>
                    <div class="updates-timeline">
                        @foreach($recent_updates as $update)
                            <div class="update-item">
                                <div class="update-header">
                                    <span class="badge badge-blue">Version {{ $update['version'] }}</span>
                                    <span class="update-date">{{ $update['date'] }}</span>
                                </div>
                                <ul style="margin-left: 20px; color: #4b5563;">
                                    @foreach($update['changes'] as $change)
                                        <li style="margin-bottom: 8px;">{{ $change }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endforeach
                    </div>
                </div>
            @endif
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="copyright">© {{ date('Y') }} {{ $barangay_name }}. All rights reserved.</p>
            <p style="font-size: 0.95em;">Empowering Barangay Governance Through Technology</p>
            <p style="font-size: 0.9em; color: #6b7280;">Document generated on {{ $generated_at->format('F j, Y \a\t g:i A') }}</p>
            <div class="confidential">
                🔒 CONFIDENTIAL - For internal use only
            </div>
            <p style="font-size: 0.8em; color: #9ca3af; margin-top: 15px;">
                Document ID: {{ strtoupper(uniqid()) }} | Version: {{ $version }} | Hash: {{ substr(md5($generated_at . $barangay_name), 0, 8) }}
            </p>
        </div>
    </div>

    <script>
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Print handling
        window.onbeforeprint = function() {
            const buttons = document.querySelector('.action-buttons');
            if (buttons) buttons.style.display = 'none';
        };

        window.onafterprint = function() {
            const buttons = document.querySelector('.action-buttons');
            if (buttons) buttons.style.display = 'flex';
        };

        // Add loading animation to print button
        document.querySelector('.print-btn')?.addEventListener('click', function(e) {
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="loading"></span> Preparing PDF...';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 1000);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl+P for print
            if (e.ctrlKey && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
            // Esc to close
            if (e.key === 'Escape') {
                if (confirm('Close this document?')) {
                    window.close();
                }
            }
        });

        // Add copy functionality for code blocks
        document.querySelectorAll('pre').forEach(block => {
            block.addEventListener('dblclick', function() {
                const text = this.innerText;
                navigator.clipboard.writeText(text).then(() => {
                    const toast = document.createElement('div');
                    toast.textContent = '📋 Copied to clipboard!';
                    toast.style.cssText = `
                        position: fixed;
                        bottom: 100px;
                        right: 30px;
                        background: #2563eb;
                        color: white;
                        padding: 12px 24px;
                        border-radius: 50px;
                        font-size: 14px;
                        box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
                        z-index: 1001;
                        animation: slideIn 0.3s ease;
                    `;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 2000);
                });
            });
        });

        // Table of contents generator
        document.addEventListener('DOMContentLoaded', function() {
            const sections = document.querySelectorAll('.section h2');
            if (sections.length > 5) {
                const toc = document.createElement('div');
                toc.className = 'section';
                toc.innerHTML = '<h2>📑 Table of Contents</h2><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;"></div>';
                
                sections.forEach((section, index) => {
                    const link = document.createElement('a');
                    link.href = `#section-${index}`;
                    link.textContent = section.textContent;
                    link.style.cssText = `
                        display: block;
                        padding: 8px 12px;
                        color: #2563eb;
                        text-decoration: none;
                        border-radius: 6px;
                        transition: background 0.2s;
                    `;
                    link.onmouseover = () => link.style.background = '#f3f4f6';
                    link.onmouseout = () => link.style.background = 'transparent';
                    
                    section.id = `section-${index}`;
                    toc.querySelector('div').appendChild(link);
                });
                
                document.querySelector('.content').insertBefore(toc, document.querySelector('.content').firstChild);
            }
        });
    </script>
</body>
</html>
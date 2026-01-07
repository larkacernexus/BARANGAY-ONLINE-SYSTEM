<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Official Receipt #{{ $fee->fee_code }}</title>
    <style>
        /* Base Styles */
        @page { margin: 0; }
        body { 
            font-family: 'Arial', 'Helvetica', sans-serif; 
            font-size: 12px; 
            line-height: 1.4;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 15mm;
        }
        
        /* Header */
        .receipt-header {
            text-align: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
        }
        
        .header-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
        }
        
        .header-subtitle {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 5px 0;
        }
        
        .header-info {
            font-size: 11px;
            color: #555;
            margin: 5px 0;
        }
        
        /* Receipt Info */
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        
        .info-left, .info-right {
            width: 48%;
        }
        
        /* Section */
        .section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 14px;
            font-weight: bold;
            background: #2c3e50;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            margin-bottom: 12px;
        }
        
        /* Table */
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .table th {
            background: #ecf0f1;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #bdc3c7;
        }
        
        .table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
        }
        
        .table tr:last-child td {
            border-bottom: none;
        }
        
        .table .text-right {
            text-align: right;
        }
        
        .table .total-row td {
            font-weight: bold;
            background: #f8f9fa;
            border-top: 2px solid #bdc3c7;
        }
        
        /* Payment Status */
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-paid { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-overdue { background: #f8d7da; color: #721c24; }
        .status-partial { background: #cce5ff; color: #004085; }
        
        /* Amount Box */
        .amount-box {
            background: #f8f9fa;
            border: 2px solid #ddd;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        
        .amount-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #ddd;
        }
        
        .amount-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 16px;
            color: #2c3e50;
        }
        
        .amount-row.total-row {
            border-top: 2px solid #2c3e50;
            margin-top: 10px;
            padding-top: 15px;
        }
        
        /* Signature Area */
        .signature-area {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        
        .signature-box {
            float: right;
            width: 250px;
            text-align: center;
        }
        
        .signature-line {
            display: inline-block;
            width: 200px;
            border-top: 1px solid #000;
            margin: 40px 0 5px 0;
        }
        
        /* Footer */
        .footer {
            margin-top: 60px;
            padding-top: 15px;
            border-top: 2px solid #000;
            text-align: center;
            font-size: 10px;
            color: #666;
            clear: both;
        }
        
        .footer-logo {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        /* Watermark */
        .watermark {
            position: absolute;
            opacity: 0.1;
            font-size: 100px;
            font-weight: bold;
            color: #ccc;
            transform: rotate(-45deg);
            top: 40%;
            left: 10%;
            z-index: -1;
        }
        
        /* Utility Classes */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-bold { font-weight: bold; }
        .mb-1 { margin-bottom: 5px; }
        .mb-2 { margin-bottom: 10px; }
        .mb-3 { margin-bottom: 15px; }
        .mt-1 { margin-top: 5px; }
        .mt-2 { margin-top: 10px; }
        .mt-3 { margin-top: 15px; }
        .border-bottom { border-bottom: 1px solid #eee; }
        
        /* Print-specific styles */
        @media print {
            body { padding: 10mm; }
            .no-print { display: none; }
            .receipt-info { break-inside: avoid; }
            .section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <!-- Watermark -->
    <div class="watermark">{{ $barangay['name'] }}</div>
    
    <!-- Header -->
    <div class="receipt-header">
        <h1 class="header-title">{{ config('app.name', 'Barangay Management System') }}</h1>
        <h2 class="header-subtitle">{{ $barangay['name'] }}</h2>
        <p class="header-info">{{ $barangay['address'] }}</p>
        <p class="header-info">Tel: {{ $barangay['contact'] }} | Email: {{ config('app.email', 'barangay@example.com') }}</p>
    </div>
    
    <!-- Receipt Information -->
    <div class="receipt-info">
        <div class="info-left">
            <div class="mb-1"><span class="text-bold">Official Receipt No:</span> {{ $fee->fee_code }}</div>
            <div class="mb-1"><span class="text-bold">Date Issued:</span> {{ now()->format('F j, Y') }}</div>
            <div class="mb-1"><span class="text-bold">Time:</span> {{ now()->format('h:i A') }}</div>
            @if($fee->or_number)
            <div class="mb-1"><span class="text-bold">OR Number:</span> {{ $fee->or_number }}</div>
            @endif
        </div>
        <div class="info-right">
            <div class="mb-1"><span class="text-bold">Status:</span> 
                @php
                    $statusClass = [
                        'paid' => 'status-paid',
                        'pending' => 'status-pending',
                        'overdue' => 'status-overdue',
                        'partially_paid' => 'status-partial',
                        'issued' => 'status-pending'
                    ][$fee->status] ?? 'status-pending';
                @endphp
                <span class="status-badge {{ $statusClass }}">{{ ucfirst(str_replace('_', ' ', $fee->status)) }}</span>
            </div>
            <div class="mb-1"><span class="text-bold">Printed By:</span> {{ $barangay['official'] }}</div>
            <div class="mb-1"><span class="text-bold">Print Date:</span> {{ $print_date }}</div>
        </div>
    </div>
    
    <!-- Fee Details -->
    <div class="section">
        <div class="section-title">Fee Information</div>
        <table class="table">
            <thead>
                <tr>
                    <th width="30%">Description</th>
                    <th width="20%">Category</th>
                    <th width="20%" class="text-right">Base Amount</th>
                    <th width="30%">Details</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="text-bold">{{ $fee->feeType->name }}</td>
                    <td>{{ ucfirst($fee->feeType->category) }}</td>
                    <td class="text-right">₱{{ number_format($fee->base_amount, 2) }}</td>
                    <td>
                        @if($fee->description)
                            {{ $fee->description }}<br>
                        @endif
                        @if($fee->billing_period)
                            Period: {{ $fee->billing_period }}
                        @endif
                    </td>
                </tr>
                @if($fee->certificate_number)
                <tr>
                    <td colspan="2" class="text-bold">Certificate Number:</td>
                    <td colspan="2">{{ $fee->certificate_number }}</td>
                </tr>
                @endif
            </tbody>
        </table>
    </div>
    
    <!-- Payer Information -->
    <div class="section">
        <div class="section-title">Payer Information</div>
        <div style="display: flex; gap: 40px;">
            <div style="flex: 1;">
                <div class="mb-1 border-bottom">
                    <span class="text-bold">Name:</span> {{ $fee->payer_name }}
                </div>
                <div class="mb-1 border-bottom">
                    <span class="text-bold">Type:</span> {{ ucfirst($fee->payer_type) }}
                </div>
                @if($fee->contact_number)
                <div class="mb-1 border-bottom">
                    <span class="text-bold">Contact No:</span> {{ $fee->contact_number }}
                </div>
                @endif
            </div>
            <div style="flex: 1;">
                @if($fee->address)
                <div class="mb-1 border-bottom">
                    <span class="text-bold">Address:</span> {{ $fee->address }}
                </div>
                @endif
                @if($fee->purok)
                <div class="mb-1 border-bottom">
                    <span class="text-bold">Purok:</span> {{ $fee->purok }}
                </div>
                @endif
                @if($fee->zone)
                <div class="mb-1 border-bottom">
                    <span class="text-bold">Zone:</span> {{ $fee->zone }}
                </div>
                @endif
            </div>
        </div>
    </div>
    
    <!-- Payment Details -->
    <div class="section">
        <div class="section-title">Payment Details</div>
        
        <!-- Amount Breakdown -->
        <div class="amount-box">
            <div class="amount-row">
                <span class="text-bold">Base Amount:</span>
                <span class="text-bold">₱{{ number_format($fee->base_amount, 2) }}</span>
            </div>
            
            @if($fee->surcharge_amount > 0)
            <div class="amount-row">
                <span>Surcharge:</span>
                <span>₱{{ number_format($fee->surcharge_amount, 2) }}</span>
            </div>
            @endif
            
            @if($fee->penalty_amount > 0)
            <div class="amount-row">
                <span>Penalty:</span>
                <span>₱{{ number_format($fee->penalty_amount, 2) }}</span>
            </div>
            @endif
            
            @if($fee->discount_amount > 0)
            <div class="amount-row">
                <span style="color: #28a745;">Discount ({{ $fee->discount_type ?? 'Discount' }}):</span>
                <span style="color: #28a745;">- ₱{{ number_format($fee->discount_amount, 2) }}</span>
            </div>
            @endif
            
            <div class="amount-row total-row">
                <span>TOTAL AMOUNT:</span>
                <span>₱{{ number_format($fee->total_amount, 2) }}</span>
            </div>
            
            <div class="amount-row">
                <span>Amount Paid:</span>
                <span style="color: #28a745;">₱{{ number_format($fee->amount_paid, 2) }}</span>
            </div>
            
            <div class="amount-row">
                <span>Remaining Balance:</span>
                <span style="color: #dc3545;">₱{{ number_format($fee->balance, 2) }}</span>
            </div>
        </div>
        
        <!-- Payment History -->
        @if($fee->paymentItems && $fee->paymentItems->count() > 0)
        <div class="mt-3">
            <div class="section-title">Payment History</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Payment Method</th>
                        <th>OR Number</th>
                        <th>Reference</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($fee->paymentItems as $paymentItem)
                    @php $payment = $paymentItem->payment; @endphp
                    <tr>
                        <td>{{ $payment->payment_date ? \Carbon\Carbon::parse($payment->payment_date)->format('M d, Y') : 'N/A' }}</td>
                        <td class="text-right">₱{{ number_format($paymentItem->amount, 2) }}</td>
                        <td>{{ ucfirst($payment->payment_method ?? 'Cash') }}</td>
                        <td>{{ $payment->or_number ?? 'N/A' }}</td>
                        <td>{{ $payment->reference_number ?? 'N/A' }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif
    </div>
    
    <!-- Validity Period -->
    @if($fee->valid_from && $fee->valid_until)
    <div class="section">
        <div class="section-title">Validity Period</div>
        <div style="text-align: center; padding: 15px; background: #f8f9fa; border-radius: 4px;">
            <span class="text-bold">Valid From:</span> {{ \Carbon\Carbon::parse($fee->valid_from)->format('F j, Y') }} 
            <span class="text-bold ml-3">Valid Until:</span> {{ \Carbon\Carbon::parse($fee->valid_until)->format('F j, Y') }}
        </div>
    </div>
    @endif
    
    <!-- Terms & Notes -->
    @if($fee->purpose || $fee->remarks)
    <div class="section">
        <div class="section-title">Notes & Remarks</div>
        <div style="padding: 15px; background: #f8f9fa; border-radius: 4px; min-height: 80px;">
            @if($fee->purpose)
                <p class="text-bold mb-1">Purpose:</p>
                <p class="mb-2">{{ $fee->purpose }}</p>
            @endif
            @if($fee->remarks)
                <p class="text-bold mb-1">Remarks:</p>
                <p>{{ $fee->remarks }}</p>
            @endif
        </div>
    </div>
    @endif
    
    <!-- Signature -->
    <div class="signature-area">
        <div class="signature-box">
            <div class="signature-line"></div>
            <div class="text-bold mt-1">{{ $barangay['official'] }}</div>
            <div>{{ $barangay['position'] }}</div>
            <div class="mt-1">Authorized Signature</div>
        </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
        <div class="footer-logo">{{ config('app.name', 'Barangay Management System') }}</div>
        <div class="mb-1">This is an official receipt. Please keep it for your records.</div>
        <div class="mb-1">Thank you for your payment!</div>
        <div>For inquiries, please contact: {{ $barangay['contact'] }} | Email: {{ config('app.email', 'barangay@example.com') }}</div>
    </div>
</body>
</html>
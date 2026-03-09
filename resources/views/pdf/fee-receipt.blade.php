<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fee Receipt - {{ $fee->fee_code }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #000;
        }
        .header p {
            margin: 5px 0;
            color: #666;
        }
        .title {
            text-align: center;
            margin: 30px 0;
        }
        .title h2 {
            margin: 0;
            font-size: 20px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .info-section {
            margin-bottom: 30px;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .info-item {
            margin-bottom: 10px;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            font-size: 12px;
            margin-bottom: 3px;
        }
        .info-value {
            font-size: 14px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th {
            background: #333;
            color: white;
            padding: 10px;
            text-align: left;
            font-size: 12px;
        }
        td {
            padding: 10px;
            border: 1px solid #ddd;
            font-size: 12px;
        }
        .amount-section {
            margin: 30px 0;
        }
        .amount-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .amount-row.total {
            font-weight: bold;
            font-size: 16px;
            border-bottom: 2px solid #333;
            padding: 15px 0;
        }
        .amount-row.grand-total {
            font-size: 18px;
            color: #000;
            border-top: 2px solid #333;
            border-bottom: none;
            padding-top: 15px;
        }
        .amount-label {
            color: #555;
        }
        .amount-value {
            font-weight: bold;
        }
        .amount-value.positive {
            color: #28a745;
        }
        .amount-value.negative {
            color: #dc3545;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 11px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .signatures {
            margin-top: 40px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
        }
        .signature-box {
            text-align: center;
        }
        .signature-line {
            margin-top: 40px;
            border-top: 1px solid #333;
            width: 80%;
            margin-left: auto;
            margin-right: auto;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
        }
        .badge-success {
            background: #28a745;
            color: white;
        }
        .badge-warning {
            background: #ffc107;
            color: #333;
        }
        .badge-danger {
            background: #dc3545;
            color: white;
        }
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60px;
            opacity: 0.1;
            color: #999;
            pointer-events: none;
            z-index: 1000;
        }
    </style>
</head>
<body>
    @if($type === 'duplicate')
        <div class="watermark">DUPLICATE</div>
    @elseif($type === 'triplicate')
        <div class="watermark">TRIPLICATE</div>
    @endif

    <div class="header">
        <h1>{{ $barangay['name'] }}</h1>
        <p>{{ $barangay['address'] }}</p>
        <p>Tel: {{ $barangay['contact'] }}</p>
    </div>

    <div class="title">
        <h2>{{ $type === 'receipt' ? 'OFFICIAL RECEIPT' : 'CERTIFICATE OF PAYMENT' }}</h2>
    </div>

    <div class="info-section">
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Receipt No.</div>
                <div class="info-value">{{ $fee->fee_code }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">OR Number</div>
                <div class="info-value">{{ $fee->or_number ?? 'N/A' }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Date Issued</div>
                <div class="info-value">{{ date('F d, Y', strtotime($fee->issue_date)) }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Payment Date</div>
                <div class="info-value">{{ $fee->payment_date ? date('F d, Y', strtotime($fee->payment_date)) : 'N/A' }}</div>
            </div>
        </div>
    </div>

    <div class="info-section">
        <h3 style="margin-top: 0;">Received from:</h3>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">{{ $payer_name }}</div>
            </div>
            @if($fee->address)
            <div class="info-item">
                <div class="info-label">Address</div>
                <div class="info-value">{{ $fee->address }}</div>
            </div>
            @endif
            @if($fee->contact_number)
            <div class="info-item">
                <div class="info-label">Contact No.</div>
                <div class="info-value">{{ $fee->contact_number }}</div>
            </div>
            @endif
        </div>
    </div>

    <div class="info-section">
        <h3 style="margin-top: 0;">Fee Details:</h3>
        <table>
            <thead>
                <tr>
                    <th>Particulars</th>
                    <th>Fee Code</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ $fee->feeType->name ?? 'Fee' }}</td>
                    <td>{{ $fee->fee_code }}</td>
                    <td>₱{{ number_format($fee->base_amount, 2) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="amount-section">
        <h3>Amount Summary:</h3>
        
        <div class="amount-row">
            <span class="amount-label">Base Amount:</span>
            <span class="amount-value">₱{{ number_format($fee->base_amount, 2) }}</span>
        </div>
        
        @if($fee->surcharge_amount > 0)
        <div class="amount-row">
            <span class="amount-label">Surcharge ({{ $fee->feeType->surcharge_percentage ?? 0 }}%):</span>
            <span class="amount-value">+ ₱{{ number_format($fee->surcharge_amount, 2) }}</span>
        </div>
        @endif
        
        @if($fee->penalty_amount > 0)
        <div class="amount-row">
            <span class="amount-label">Penalty ({{ $fee->feeType->penalty_percentage ?? 0 }}%):</span>
            <span class="amount-value">+ ₱{{ number_format($fee->penalty_amount, 2) }}</span>
        </div>
        @endif
        
        <div class="amount-row">
            <span class="amount-label">Subtotal:</span>
            <span class="amount-value">₱{{ number_format($fee->base_amount + $fee->surcharge_amount + $fee->penalty_amount, 2) }}</span>
        </div>
        
        @if($total_discounts > 0)
        <div class="amount-row">
            <span class="amount-label">Total Discounts:</span>
            <span class="amount-value negative">- ₱{{ number_format($total_discounts, 2) }}</span>
        </div>
        @endif
        
        <div class="amount-row total">
            <span class="amount-label">TOTAL AMOUNT:</span>
            <span class="amount-value">₱{{ number_format($fee->total_amount, 2) }}</span>
        </div>
        
        <div class="amount-row">
            <span class="amount-label">Amount Paid:</span>
            <span class="amount-value positive">₱{{ number_format($fee->amount_paid, 2) }}</span>
        </div>
        
        @if($fee->balance > 0)
        <div class="amount-row">
            <span class="amount-label">Balance Due:</span>
            <span class="amount-value negative">₱{{ number_format($fee->balance, 2) }}</span>
        </div>
        @endif
    </div>

    @if(count($discount_details) > 0)
    <div class="info-section">
        <h3 style="margin-top: 0;">Discount Details:</h3>
        <table>
            <thead>
                <tr>
                    <th>Discount Type</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                @foreach($discount_details as $discount)
                <tr>
                    <td>{{ $discount['rule'] }}</td>
                    <td>{{ $discount['formatted_amount'] }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    @if($fee->purpose)
    <div class="info-section">
        <div class="info-item">
            <div class="info-label">Purpose:</div>
            <div class="info-value">{{ $fee->purpose }}</div>
        </div>
    </div>
    @endif

    @if($fee->remarks)
    <div class="info-section">
        <div class="info-item">
            <div class="info-label">Remarks:</div>
            <div class="info-value">{{ $fee->remarks }}</div>
        </div>
    </div>
    @endif

    <div class="signatures">
        <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>{{ $issued_by_name }}</strong></p>
            <p style="font-size: 11px; color: #666;">{{ $barangay['position'] }}</p>
        </div>
        <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>HON. JUAN DELA CRUZ</strong></p>
            <p style="font-size: 11px; color: #666;">Barangay Captain</p>
        </div>
    </div>

    <div class="footer">
        <p>This is a computer-generated receipt. No signature required.</p>
        <p>Generated on {{ $print_date }} by {{ $issued_by_name }}</p>
        <p>{{ $barangay['name'] }} • {{ $barangay['address'] }}</p>
    </div>
</body>
</html>
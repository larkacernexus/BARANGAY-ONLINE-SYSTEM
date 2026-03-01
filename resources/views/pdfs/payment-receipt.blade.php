@php
function numberToWords($num) {
    $num = (float) $num;
    if ($num == 0) return 'Zero Pesos Only';
    
    $ones = array('', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine');
    $tens = array('', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety');
    $teens = array('Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen');

    $convert = function($n) use ($ones, $tens, $teens, &$convert) {
        if ($n < 10) return $ones[$n];
        if ($n < 20) return $teens[$n - 10];
        if ($n < 100) return $tens[floor($n / 10)] . ($n % 10 ? ' ' . $ones[$n % 10] : '');
        if ($n < 1000) return $ones[floor($n / 100)] . ' Hundred' . ($n % 100 ? ' ' . $convert($n % 100) : '');
        if ($n < 1000000) return $convert(floor($n / 1000)) . ' Thousand' . ($n % 1000 ? ' ' . $convert($n % 1000) : '');
        return '';
    };

    $whole = floor($num);
    $cents = round(($num - $whole) * 100);

    if ($cents == 0) {
        return $convert($whole) . ' Pesos Only';
    }
    return $convert($whole) . ' Pesos and ' . $convert($cents) . ' Centavos Only';
}
@endphp

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payment Receipt - {{ $payment->or_number }}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .receipt {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 30px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            color: #666;
            font-size: 12px;
        }
        .title {
            text-align: center;
            margin-bottom: 30px;
        }
        .title h2 {
            font-size: 20px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
            color: #333;
        }
        .title p {
            margin: 5px 0;
            font-size: 12px;
            color: #666;
        }
        .info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 20px;
            font-size: 12px;
        }
        .info div {
            flex: 1;
        }
        .info .text-right {
            text-align: right;
        }
        .payer {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .payer h3 {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 10px 0;
            color: #333;
        }
        .payer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        .payer p {
            margin: 5px 0;
            font-size: 12px;
        }
        .amount-words {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            border: 1px solid #ddd;
        }
        .amount-words p {
            margin: 0;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 12px;
        }
        th {
            background: #f3f4f6;
            padding: 10px;
            text-align: left;
            border: 1px solid #ddd;
            font-weight: bold;
        }
        td {
            padding: 8px 10px;
            border: 1px solid #ddd;
        }
        .text-right {
            text-align: right;
        }
        .total-row {
            background: #f3f4f6;
            font-weight: bold;
        }
        .payment-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
            font-size: 12px;
        }
        .payment-details h3 {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 10px 0;
            color: #333;
        }
        .payment-details p {
            margin: 5px 0;
        }
        .payment-summary {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
        }
        .payment-summary div {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .footer p {
            margin: 5px 0;
        }
        .badge {
            display: inline-block;
            padding: 3px 6px;
            font-size: 10px;
            font-weight: bold;
            color: #059669;
            background: #d1fae5;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>{{ $barangay['name'] }}</h1>
            <p>{{ $barangay['address'] }}</p>
            <p>Tel No: {{ $barangay['contact'] }} • Email: {{ $barangay['email'] }}</p>
        </div>

        <div class="title">
            <h2>{{ isset($receipt['receipt_type_label']) ? $receipt['receipt_type_label'] : 'OFFICIAL RECEIPT' }}</h2>
            <p><span class="badge">ORIGINAL COPY</span></p>
        </div>

        <div class="info">
            <div>
                <p><strong>Receipt No:</strong> {{ $receipt['receipt_number'] }}</p>
                @if(isset($receipt['or_number']) && !empty($receipt['or_number']))
                    <p><strong>OR No:</strong> {{ $receipt['or_number'] }}</p>
                @endif
            </div>
            <div class="text-right">
                <p><strong>Date Issued:</strong> {{ isset($receipt['formatted_issued_date']) ? $receipt['formatted_issued_date'] : now()->format('F d, Y h:i A') }}</p>
                <p><strong>Payment Date:</strong> {{ isset($receipt['formatted_payment_date']) ? $receipt['formatted_payment_date'] : $payment->payment_date->format('F d, Y h:i A') }}</p>
            </div>
        </div>

        <div class="payer">
            <h3>Received from:</h3>
            <div class="payer-grid">
                <div>
                    <p><strong>Name:</strong> {{ $receipt['payer_name'] }}</p>
                    @if(isset($receipt['payer_address']) && !empty($receipt['payer_address']))
                        <p><strong>Address:</strong> {{ $receipt['payer_address'] }}</p>
                    @endif
                </div>
                @if(isset($payment->contact_number) && !empty($payment->contact_number))
                <div>
                    <p><strong>Contact:</strong> {{ $payment->contact_number }}</p>
                </div>
                @endif
            </div>
        </div>

        <div class="amount-words">
            <p>Amount in Words: {{ numberToWords(isset($receipt['total_amount']) ? $receipt['total_amount'] : $payment->total_amount) }}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Particulars</th>
                    <th class="text-right">Amount</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $items = isset($receipt['fee_breakdown']) ? $receipt['fee_breakdown'] : $payment->items;
                @endphp
                @foreach($items as $fee)
                <tr>
                    <td>
                        {{ is_array($fee) ? ($fee['fee_name'] ?? 'Payment Item') : ($fee->fee_name ?? 'Payment Item') }}
                        @php
                            $feeCode = is_array($fee) ? ($fee['fee_code'] ?? null) : ($fee->fee_code ?? null);
                        @endphp
                        @if(!empty($feeCode))
                            <span style="color: #666; font-size: 10px; margin-left: 5px;">({{ $feeCode }})</span>
                        @endif
                    </td>
                    <td class="text-right">
                        ₱{{ number_format(
                            is_array($fee) ? ($fee['base_amount'] ?? 0) : ($fee->base_amount ?? 0), 
                            2
                        ) }}
                    </td>
                </tr>
                @endforeach
                
                <tr style="background: #f9f9f9;">
                    <td><strong>Subtotal</strong></td>
                    <td class="text-right"><strong>{{ isset($receipt['formatted_subtotal']) ? $receipt['formatted_subtotal'] : '₱' . number_format($payment->subtotal, 2) }}</strong></td>
                </tr>

                @php
                    $surcharge = isset($receipt['surcharge']) ? $receipt['surcharge'] : $payment->surcharge;
                @endphp
                @if($surcharge > 0)
                <tr>
                    <td>Surcharge</td>
                    <td class="text-right">{{ isset($receipt['formatted_surcharge']) ? $receipt['formatted_surcharge'] : '₱' . number_format($payment->surcharge, 2) }}</td>
                </tr>
                @endif
                
                @php
                    $penalty = isset($receipt['penalty']) ? $receipt['penalty'] : $payment->penalty;
                @endphp
                @if($penalty > 0)
                <tr>
                    <td>Penalty</td>
                    <td class="text-right">{{ isset($receipt['formatted_penalty']) ? $receipt['formatted_penalty'] : '₱' . number_format($payment->penalty, 2) }}</td>
                </tr>
                @endif
                
                @php
                    $discount = isset($receipt['discount']) ? $receipt['discount'] : $payment->discount;
                @endphp
                @if($discount > 0)
                <tr style="color: #059669;">
                    <td>Discount</td>
                    <td class="text-right">-{{ isset($receipt['formatted_discount']) ? $receipt['formatted_discount'] : '₱' . number_format($payment->discount, 2) }}</td>
                </tr>
                @endif

                <tr class="total-row">
                    <td><strong>TOTAL AMOUNT</strong></td>
                    <td class="text-right"><strong>{{ isset($receipt['formatted_total']) ? $receipt['formatted_total'] : '₱' . number_format($payment->total_amount, 2) }}</strong></td>
                </tr>
            </tbody>
        </table>

        <div class="payment-details">
            <div>
                <h3>Payment Method</h3>
                <p>{{ isset($receipt['payment_method_label']) ? $receipt['payment_method_label'] : ucfirst($payment->payment_method) }}</p>
                @php
                    $refNumber = isset($receipt['reference_number']) ? $receipt['reference_number'] : $payment->reference_number;
                @endphp
                @if(!empty($refNumber))
                    <p>Ref No: {{ $refNumber }}</p>
                @endif
            </div>
            <div>
                <h3>Payment Summary</h3>
                <div class="payment-summary">
                    <div>
                        <span>Amount Paid:</span>
                        <span style="color: #059669; font-weight: bold;">{{ isset($receipt['formatted_amount_paid']) ? $receipt['formatted_amount_paid'] : '₱' . number_format($payment->total_amount, 2) }}</span>
                    </div>
                    @php
                        $changeDue = isset($receipt['change_due']) ? $receipt['change_due'] : 0;
                    @endphp
                    @if($changeDue > 0)
                    <div>
                        <span>Change Due:</span>
                        <span style="color: #2563eb; font-weight: bold;">{{ isset($receipt['formatted_change']) ? $receipt['formatted_change'] : '₱0.00' }}</span>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        @php
            $notes = isset($receipt['notes']) ? $receipt['notes'] : $payment->remarks;
        @endphp
        @if(!empty($notes))
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 30px;">
            <p><strong>Notes:</strong></p>
            <p>{{ $notes }}</p>
        </div>
        @endif

        <div class="footer">
            <p>This is a computer-generated receipt. No signature required.</p>
            <p>Generated by {{ isset($receipt['issued_by']) ? $receipt['issued_by'] : 'System' }} • {{ $barangay['name'] }}</p>
        </div>
    </div>
</body>
</html>
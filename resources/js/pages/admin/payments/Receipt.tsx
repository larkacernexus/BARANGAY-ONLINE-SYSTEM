import AppLayout from '@/layouts/admin-app-layout';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    Printer,
    Download,
    Receipt as ReceiptIcon,
    DollarSign,
    CreditCard,
    FileText,
    User,
    Users,
    Building,
    Phone,
    MapPin,
    FileCheck,
    Calendar,
    Hash,
    CheckCircle,
    Shield,
    FileDigit,
    ClipboardList,
    BadgeCheck,
    QrCode,
    Info,
    AlertCircle
} from 'lucide-react';
import { Link, usePage, Head } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface PaymentItem {
    id: number;
    fee_name: string;
    fee_code: string;
    description?: string;
    base_amount: number;
    surcharge: number;
    penalty: number;
    total_amount: number;
    category: string;
}

interface Payment {
    id: number;
    or_number: string;
    payer_type: 'resident' | 'household';
    payer_id: number;
    payer_name: string;
    contact_number?: string;
    address?: string;
    household_number?: string;
    purok?: string;
    payment_date: string;
    formatted_date: string;
    payment_method: string;
    payment_method_display: string;
    reference_number?: string;
    subtotal: number;
    formatted_subtotal: string;
    surcharge: number;
    formatted_surcharge: string;
    penalty: number;
    formatted_penalty: string;
    discount: number;
    formatted_discount: string;
    total_amount: number;
    formatted_total: string;
    purpose?: string;
    remarks?: string;
    certificate_type?: string;
    certificate_type_display?: string;
    collection_type: string;
    status: string;
    recorded_by?: number;
    recorder?: {
        id: number;
        name: string;
    };
    items: PaymentItem[];
}

interface PageProps {
    payment: Payment;
    barangay: {
        name: string;
        logo?: string;
        address: string;
        contact: string;
    };
    officer: {
        name: string;
        position: string;
        signature?: string;
    };
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'paid':
        case 'approved':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'cancelled':
        case 'failed':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export default function PaymentReceipt() {
    const { payment, barangay, officer } = usePage<PageProps>().props;
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isPrinting, setIsPrinting] = useState(false);

const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
        if (receiptRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                // Clone the receipt content
                const content = receiptRef.current.cloneNode(true) as HTMLDivElement;
                
                // Remove no-print elements from cloned content
                content.querySelectorAll('.no-print').forEach(el => el.remove());
                
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Official Receipt - ${payment.or_number}</title>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');
                            
                            * {
                                margin: 0;
                                padding: 0;
                                box-sizing: border-box;
                            }
                            
                            body {
                                font-family: 'Inter', sans-serif;
                                line-height: 1.5;
                                color: #374151;
                                background: #ffffff;
                                font-size: 10pt;
                                padding: 0;
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            
                            .receipt-container {
                                width: 100%;
                                max-width: 100%;
                                margin: 0 auto;
                                background: #ffffff;
                                position: relative;
                                padding: 15px;
                                break-inside: avoid;
                                page-break-inside: avoid;
                            }
                            
                            /* Remove watermark for print */
                            .absolute.inset-0.pointer-events-none.opacity-5 {
                                display: none;
                            }
                            
                            /* Header styles - LIGHTER BACKGROUND for receipt title */
                            .text-center.border-b-2.border-gray-900 {
                                text-align: center;
                                border-bottom: 2px solid #1f2937;
                                padding-bottom: 12px;
                                margin-bottom: 15px;
                            }
                            
                            /* LIGHTEN the receipt title background */
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 {
                                background: linear-gradient(to right, #374151, #4b5563) !important;
                                position: relative;
                                border-radius: 8px;
                                padding: 12px !important;
                                margin-bottom: 15px;
                                overflow: hidden;
                            }
                            
                            /* MAKE TEXT WHITE FOR BETTER CONTRAST */
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 .text-white {
                                color: #ffffff !important;
                                text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                            }
                            
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 .text-gray-300 {
                                color: #e5e7eb !important;
                            }
                            
                            .flex.justify-center.mb-6 {
                                display: flex;
                                justify-content: center;
                                margin-bottom: 12px;
                            }
                            
                            .h-24.w-24.object-contain {
                                height: 4rem;
                                width: 4rem;
                                object-fit: contain;
                            }
                            
                            .text-3xl.font-black.uppercase {
                                font-size: 1.25rem;
                                font-weight: 900;
                                text-transform: uppercase;
                                color: #111827;
                            }
                            
                            .text-xs.tracking-widest.text-gray-500 {
                                font-size: 0.65rem;
                                letter-spacing: 0.05em;
                                color: #6b7280;
                            }
                            
                            /* Grid layouts */
                            .grid.grid-cols-1.md\\:grid-cols-2 {
                                display: grid;
                                grid-template-columns: 1fr;
                                gap: 12px;
                                margin-bottom: 12px;
                            }
                            
                            @media (min-width: 768px) {
                                .grid.grid-cols-1.md\\:grid-cols-2 {
                                    grid-template-columns: 1fr 1fr;
                                }
                            }
                            
                            /* Badge styles - lighter */
                            .inline-flex.items-center.rounded-full.border.px-2\\.5.py-0\\.5.text-xs {
                                display: inline-flex;
                                align-items: center;
                                border-radius: 9999px;
                                border-width: 1px;
                                padding: 0.15rem 0.4rem !important;
                                font-size: 0.6rem !important;
                                background-color: #f8fafc !important;
                                border-color: #e2e8f0 !important;
                                color: #334155 !important;
                            }
                            
                            /* Font mono for amounts */
                            .font-mono {
                                font-family: 'Roboto Mono', monospace;
                            }
                            
                            /* Table styles - lighter */
                            table.w-full {
                                width: 100%;
                                font-size: 9pt;
                            }
                            
                            .overflow-hidden.rounded-xl.border {
                                overflow: hidden;
                                border-radius: 6px;
                                border: 1px solid #e2e8f0;
                            }
                            
                            thead.bg-gray-50 {
                                background-color: #f8fafc !important;
                            }
                            
                            th, td {
                                padding: 6px 8px !important;
                                font-size: 9pt !important;
                            }
                            
                            th {
                                text-align: left;
                                font-weight: 600;
                                text-transform: uppercase;
                                color: #475569;
                                background-color: #f8fafc !important;
                                border-bottom: 2px solid #e2e8f0;
                            }
                            
                            .divide-y.divide-gray-200 > * + * {
                                border-top: 1px solid #f1f5f9;
                            }
                            
                            /* Lighter gradient backgrounds */
                            .bg-gradient-to-r.from-gray-50.to-gray-100 {
                                background: linear-gradient(to right, #f8fafc, #f1f5f9) !important;
                                border: 1px solid #e2e8f0 !important;
                            }
                            
                            .bg-gradient-to-br.from-blue-50.to-indigo-50 {
                                background: linear-gradient(135deg, #f0f9ff, #e0f7ff) !important;
                                border: 1px solid #bae6fd !important;
                            }
                            
                            .bg-gradient-to-r.from-green-50.to-emerald-50 {
                                background: linear-gradient(to right, #f0fdf4, #dcfce7) !important;
                                border: 1px solid #bbf7d0 !important;
                            }
                            
                            /* Remove QR code for print */
                            .mt-8.flex.justify-center {
                                display: none;
                            }
                            
                            /* Signature section */
                            .mt-12.pt-8.border-t {
                                margin-top: 20px !important;
                                padding-top: 15px !important;
                                border-top: 1px solid #cbd5e1;
                            }
                            
                            /* Force single column for print */
                            @media print {
                                .grid.grid-cols-1.md\\:grid-cols-2 {
                                    grid-template-columns: 1fr !important;
                                }
                                
                                .grid.grid-cols-2 {
                                    grid-template-columns: 1fr !important;
                                }
                            }
                            
                            /* Footer */
                            .mt-12.pt-8.border-t-2 {
                                margin-top: 20px !important;
                                padding-top: 15px !important;
                                border-top: 1px solid #cbd5e1;
                                font-size: 8pt;
                            }
                            
                            /* Force single page */
                            @page {
                                margin: 0.7cm;
                                size: A4;
                            }
                            
                            /* Ensure content stays on one page */
                            .receipt-container > * {
                                page-break-inside: avoid;
                                break-inside: avoid;
                            }
                            
                            /* Hide print-specific elements */
                            .no-print {
                                display: none !important;
                            }
                            
                            /* Adjust spacing for print */
                            .mb-8 {
                                margin-bottom: 12px !important;
                            }
                            
                            .mb-6 {
                                margin-bottom: 10px !important;
                            }
                            
                            .p-6, .p-8 {
                                padding: 10px !important;
                            }
                            
                            /* Reduce font sizes but ensure readability */
                            .text-2xl {
                                font-size: 1.1rem !important;
                            }
                            
                            .text-3xl {
                                font-size: 1.2rem !important;
                            }
                            
                            .text-4xl {
                                font-size: 1.3rem !important;
                            }
                            
                            /* Receipt title text - WHITE for contrast */
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 .text-4xl {
                                color: #ffffff !important;
                                font-size: 1.4rem !important;
                                font-weight: 900;
                            }
                            
                            .relative.bg-gradient-to-r.from-gray-900.to-gray-800 .text-sm {
                                color: #e5e7eb !important;
                                font-size: 0.7rem !important;
                            }
                            
                            /* Compact header */
                            .text-center.border-b-2.border-gray-900 {
                                padding-bottom: 10px !important;
                                margin-bottom: 12px !important;
                            }
                            
                            /* Reduce grid gaps */
                            .gap-6 {
                                gap: 8px !important;
                            }
                            
                            .gap-8 {
                                gap: 10px !important;
                            }
                            
                            /* Adjust signature section */
                            .mt-12.pt-8 {
                                margin-top: 15px !important;
                                padding-top: 10px !important;
                            }
                            
                            .mt-16.pt-12 {
                                margin-top: 12px !important;
                                padding-top: 10px !important;
                            }
                            
                            /* Print-specific adjustments */
                            @media print {
                                body {
                                    font-size: 9pt !important;
                                    color: #374151 !important;
                                }
                                
                                /* Lighten all text for better print contrast */
                                * {
                                    color: #374151 !important;
                                }
                                
                                /* Make sure white text stays white on dark backgrounds */
                                .text-white {
                                    color: #ffffff !important;
                                }
                                
                                /* Lighter text colors */
                                .text-gray-600, .text-gray-500, .text-gray-400 {
                                    color: #64748b !important;
                                }
                                
                                .text-gray-700, .text-gray-800, .text-gray-900 {
                                    color: #334155 !important;
                                }
                                
                                /* Reduce all margins and padding */
                                .receipt-container {
                                    padding: 10px !important;
                                }
                                
                                .receipt-container > div {
                                    margin-bottom: 8px !important;
                                }
                                
                                /* Make table more compact */
                                table {
                                    font-size: 8pt !important;
                                }
                                
                                th, td {
                                    padding: 4px 6px !important;
                                }
                                
                                /* Ensure everything fits */
                                .receipt-container {
                                    max-height: 27cm; /* A4 height minus margins */
                                    overflow: hidden;
                                }
                                
                                /* Stack everything in single column */
                                .grid {
                                    grid-template-columns: 1fr !important;
                                    gap: 6px !important;
                                }
                                
                                /* Lighten background colors for better ink usage */
                                .bg-gray-50, .bg-gray-100 {
                                    background-color: #f8fafc !important;
                                }
                                
                                /* Remove excessive shadows and effects */
                                .shadow, .shadow-xl, .shadow-lg {
                                    box-shadow: none !important;
                                }
                                
                                /* Ensure text is readable */
                                .font-black {
                                    font-weight: 800 !important;
                                }
                                
                                .font-bold {
                                    font-weight: 700 !important;
                                }
                                
                                .font-semibold {
                                    font-weight: 600 !important;
                                }
                                
                                /* Adjust the receipt title to be lighter but still visible */
                                .relative.bg-gradient-to-r.from-gray-900.to-gray-800 {
                                    background: linear-gradient(to right, #475569, #64748b) !important;
                                }
                            }
                            
                            /* Additional utility classes for print */
                            .print\\:text-black {
                                color: #000000 !important;
                            }
                            
                            .print\\:bg-white {
                                background-color: #ffffff !important;
                            }
                            
                            .print\\:border-gray-300 {
                                border-color: #d1d5db !important;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="receipt-container">
                            ${content.innerHTML}
                        </div>
                        <script>
                            setTimeout(() => {
                                window.print();
                                setTimeout(() => {
                                    window.close();
                                }, 500);
                            }, 250);
                        </script>
                    </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
        setIsPrinting(false);
    }, 100);
};

    const handleDownload = () => {
        window.location.href = `/payments/${payment.id}/receipt/pdf`;
    };

    const getMethodIcon = (method: string) => {
        switch (method) {
            case 'cash': return <DollarSign className="h-4 w-4" />;
            case 'gcash':
            case 'maya':
            case 'online':
                return <CreditCard className="h-4 w-4" />;
            case 'bank':
                return <Building className="h-4 w-4" />;
            case 'check':
                return <FileCheck className="h-4 w-4" />;
            default: return <CreditCard className="h-4 w-4" />;
        }
    };

    const getPaymentMethodColor = (method: string) => {
        switch (method) {
            case 'cash': return 'bg-green-50 text-green-700 border-green-200';
            case 'gcash': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'maya': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'online': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
            case 'bank': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            case 'check': return 'bg-amber-50 text-amber-700 border-amber-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getPayerIcon = (type: string) => {
        return type === 'resident' ? 
            <User className="h-4 w-4" /> : 
            <Users className="h-4 w-4" />;
    };

    const amountInWords = (amount: number) => {
        // Simple implementation - you might want to use a library for full conversion
        const units = ['', 'Thousand', 'Million', 'Billion'];
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        if (amount === 0) return 'Zero Pesos';
        
        let words = '';
        let num = Math.floor(amount);
        let unitIndex = 0;
        
        while (num > 0) {
            let chunk = num % 1000;
            if (chunk !== 0) {
                let chunkWords = '';
                
                if (chunk >= 100) {
                    chunkWords += ones[Math.floor(chunk / 100)] + ' Hundred ';
                    chunk %= 100;
                }
                
                if (chunk >= 20) {
                    chunkWords += tens[Math.floor(chunk / 10)] + ' ';
                    chunk %= 10;
                    if (chunk > 0) {
                        chunkWords += ones[chunk] + ' ';
                    }
                } else if (chunk >= 10) {
                    chunkWords += teens[chunk - 10] + ' ';
                } else if (chunk > 0) {
                    chunkWords += ones[chunk] + ' ';
                }
                
                chunkWords += units[unitIndex] + ' ';
                words = chunkWords + words;
            }
            
            num = Math.floor(num / 1000);
            unitIndex++;
        }
        
        words = words.trim();
        const centavos = Math.round((amount % 1) * 100);
        let centavosWords = '';
        
        if (centavos > 0) {
            if (centavos >= 20) {
                centavosWords += tens[Math.floor(centavos / 10)];
                if (centavos % 10 > 0) {
                    centavosWords += ' ' + ones[centavos % 10];
                }
            } else if (centavos >= 10) {
                centavosWords += teens[centavos - 10];
            } else if (centavos > 0) {
                centavosWords += ones[centavos];
            }
        }
        
        return `${words} Pesos${centavos > 0 ? ` and ${centavosWords} Centavos` : ''} Only`;
    };

    return (
        <>
            <Head title={`Official Receipt - ${payment.or_number}`} />
            <AppLayout
                title={`Official Receipt - ${payment.or_number}`}
                breadcrumbs={[
                    { title: 'Dashboard', href: '/dashboard' },
                    { title: 'Payments', href: '/payments' },
                    { title: `Payment #${payment.or_number}`, href: `/payments/${payment.id}` },
                    { title: 'Receipt', href: '#' }
                ]}
            >
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="container mx-auto px-4 py-8">
                        {/* Header with Actions */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 no-print">
                            <div className="flex items-center gap-4">
                                <Link href={`/payments/${payment.id}`}>
                                    <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Payment
                                    </Button>
                                </Link>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-gray-900">Official Receipt</h1>
                                        <Badge className={`${getStatusColor(payment.status)} font-semibold`}>
                                            {payment.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Hash className="h-3.5 w-3.5 mr-1.5" />
                                            <span className="font-semibold">{payment.or_number}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                            {payment.formatted_date}
                                        </div>
                                        <Badge className={getPaymentMethodColor(payment.payment_method)}>
                                            {getMethodIcon(payment.payment_method)}
                                            <span className="ml-1.5">{payment.payment_method_display}</span>
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={handleDownload}
                                    className="border-gray-300 hover:bg-gray-50"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                </Button>
                                <Button 
                                    onClick={handlePrint} 
                                    disabled={isPrinting}
                                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-sm"
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    {isPrinting ? 'Printing...' : 'Print Receipt'}
                                </Button>
                            </div>
                        </div>

                        {/* Receipt Preview Card */}
                        <div className="no-print mb-6">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <Info className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Receipt Preview</h3>
                                        <p className="text-sm text-gray-600">This is how your receipt will appear when printed</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <AlertCircle className="h-4 w-4" />
                                    Paper size: A4 • Print in landscape for best results
                                </div>
                            </div>
                        </div>

                        {/* Receipt Content */}
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                            <div ref={receiptRef} className="p-8">
                                {/* Watermark */}
                                <div className="absolute inset-0 pointer-events-none opacity-5 font-black text-8xl text-center rotate-45 flex items-center justify-center select-none">
                                    {barangay.name}
                                </div>

                                {/* Barangay Header */}
                                <div className="text-center border-b-2 border-gray-900 pb-8 mb-8 relative">
                                    {barangay.logo && (
                                        <div className="flex justify-center mb-6">
                                            <img 
                                                src={barangay.logo} 
                                                alt="Barangay Seal" 
                                                className="h-24 w-24 object-contain"
                                            />
                                        </div>
                                    )}
                                    <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 mb-2">
                                        {barangay.name}
                                    </h1>
                                    <div className="text-xs tracking-widest text-gray-500 mb-4">
                                        BARANGAY GOVERNMENT UNIT
                                    </div>
                                    <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center justify-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {barangay.address}
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            {barangay.contact}
                                        </div>
                                    </div>
                                </div>

                                {/* Receipt Title */}
                                <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 mb-8 text-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                                    <div className="relative">
                                        <div className="text-4xl font-black uppercase tracking-widest text-white mb-2">
                                            OFFICIAL RECEIPT
                                        </div>
                                        <div className="text-sm text-gray-300 tracking-widest">
                                            ORIGINAL COPY • VALID ONLY WITH OFFICIAL SEAL
                                        </div>
                                        <div className="absolute -top-2 -right-2 bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                                            BIR Reg. No. XXXX-XXXX-XXXX
                                        </div>
                                    </div>
                                </div>

                                {/* Receipt Information Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">
                                                Receipt Details
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">OR Number:</span>
                                                    <span className="font-mono font-bold text-gray-900">{payment.or_number}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Date Issued:</span>
                                                    <span className="font-medium text-gray-900">{payment.formatted_date}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Payment Method:</span>
                                                    <Badge className={`${getPaymentMethodColor(payment.payment_method)} font-semibold`}>
                                                        {getMethodIcon(payment.payment_method)}
                                                        <span className="ml-1.5">{payment.payment_method_display}</span>
                                                    </Badge>
                                                </div>
                                                {payment.reference_number && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Reference No:</span>
                                                        <span className="font-mono font-medium text-gray-900">{payment.reference_number}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <ClipboardList className="h-5 w-5 text-blue-600" />
                                            <div className="font-semibold text-gray-900">Transaction Summary</div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Subtotal</span>
                                                <span className="font-mono font-medium">{payment.formatted_subtotal}</span>
                                            </div>
                                            {payment.surcharge > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-amber-700">Surcharge</span>
                                                    <span className="font-mono font-medium text-amber-700">+{payment.formatted_surcharge}</span>
                                                </div>
                                            )}
                                            {payment.penalty > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-red-700">Penalty</span>
                                                    <span className="font-mono font-medium text-red-700">+{payment.formatted_penalty}</span>
                                                </div>
                                            )}
                                            {payment.discount > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-green-700">Discount</span>
                                                    <span className="font-mono font-medium text-green-700">-{payment.formatted_discount}</span>
                                                </div>
                                            )}
                                            <div className="border-t border-blue-200 pt-3 mt-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-gray-900">Total Amount</span>
                                                    <span className="text-2xl font-bold text-gray-900">{payment.formatted_total}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payer Information */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        {getPayerIcon(payment.payer_type)}
                                        <h3 className="text-lg font-semibold text-gray-900">PAYER INFORMATION</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                                                    Payer Details
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <div className="text-sm text-gray-600">Name</div>
                                                        <div className="font-semibold text-gray-900">{payment.payer_name}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm text-gray-600">Type</div>
                                                        <Badge className="bg-gray-100 text-gray-700">
                                                            {payment.payer_type === 'resident' ? 'Individual Resident' : 'Household Account'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                                                    Contact Information
                                                </div>
                                                <div className="space-y-2">
                                                    {payment.contact_number && (
                                                        <div>
                                                            <div className="text-sm text-gray-600">Contact Number</div>
                                                            <div className="font-medium text-gray-900">{payment.contact_number}</div>
                                                        </div>
                                                    )}
                                                    {payment.address && (
                                                        <div>
                                                            <div className="text-sm text-gray-600">Address</div>
                                                            <div className="font-medium text-gray-900">{payment.address}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Items Table */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <FileDigit className="h-5 w-5 text-gray-700" />
                                        <h3 className="text-lg font-semibold text-gray-900">PAYMENT BREAKDOWN</h3>
                                    </div>
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Description
                                                    </th>
                                                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Base Amount
                                                    </th>
                                                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Surcharge
                                                    </th>
                                                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Penalty
                                                    </th>
                                                    <th className="py-4 px-6 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {payment.items.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="py-4 px-6">
                                                            <div className="font-medium text-gray-900">{item.fee_name}</div>
                                                            {item.fee_code && (
                                                                <div className="mt-1">
                                                                    <Badge variant="outline" className="text-xs bg-gray-100">
                                                                        {item.fee_code}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                            {item.description && (
                                                                <div className="mt-2 text-sm text-gray-600">{item.description}</div>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-6 text-right font-mono font-medium">
                                                            {formatCurrency(item.base_amount)}
                                                        </td>
                                                        <td className="py-4 px-6 text-right font-mono">
                                                            {item.surcharge > 0 ? (
                                                                <span className="text-amber-700 font-medium">
                                                                    {formatCurrency(item.surcharge)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-6 text-right font-mono">
                                                            {item.penalty > 0 ? (
                                                                <span className="text-red-700 font-medium">
                                                                    {formatCurrency(item.penalty)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">-</span>
                                                            )}
                                                        </td>
                                                        <td className="py-4 px-6 text-right font-mono font-bold text-gray-900">
                                                            {formatCurrency(item.total_amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Amount in Words */}
                                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                    <div className="text-sm font-semibold text-gray-700 mb-2">Amount in Words:</div>
                                    <div className="font-medium text-gray-900 italic">
                                        "{amountInWords(payment.total_amount)}"
                                    </div>
                                </div>

                                {/* Payment Details */}
                                <div className="mb-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-gray-700" />
                                                <h4 className="font-semibold text-gray-900">Payment Details</h4>
                                            </div>
                                            <div className="space-y-3">
                                                {payment.purpose && (
                                                    <div>
                                                        <div className="text-sm text-gray-600">Purpose</div>
                                                        <div className="font-medium">{payment.purpose}</div>
                                                    </div>
                                                )}
                                                {payment.collection_type && (
                                                    <div>
                                                        <div className="text-sm text-gray-600">Collection Type</div>
                                                        <div className="font-medium">{payment.collection_type}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {payment.remarks && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <ClipboardList className="h-5 w-5 text-gray-700" />
                                                    <h4 className="font-semibold text-gray-900">Remarks</h4>
                                                </div>
                                                <div className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    {payment.remarks}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Certificate Information */}
                                {payment.certificate_type && (
                                    <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                        <div className="flex items-center gap-3 mb-4">
                                            <BadgeCheck className="h-5 w-5 text-green-600" />
                                            <h4 className="font-semibold text-green-900">CERTIFICATE ISSUED</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <div className="text-sm text-green-700 font-medium mb-1">Certificate Type</div>
                                                <div className="font-semibold text-green-900">{payment.certificate_type_display}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-green-700 font-medium mb-1">Status</div>
                                                <Badge className="bg-green-100 text-green-800 border-green-300 font-semibold">
                                                    Issued & Processed
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Signatures */}
                                <div className="mt-12 pt-8 border-t border-gray-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="text-center">
                                            <div className="mb-6">
                                                <div className="text-sm font-semibold text-gray-700 mb-1">
                                                    Prepared By:
                                                </div>
                                                {payment.recorder && (
                                                    <div className="font-bold text-gray-900">{payment.recorder.name}</div>
                                                )}
                                            </div>
                                            <div className="mt-16 pt-12 border-t border-gray-400 w-48 mx-auto">
                                                <div className="text-xs text-gray-600">Signature over Printed Name</div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center">
                                            <div className="mb-6">
                                                <div className="text-sm font-semibold text-gray-700 mb-1">
                                                    Received By:
                                                </div>
                                                <div className="font-bold text-gray-900">{officer.name}</div>
                                                <div className="text-sm text-gray-600">{officer.position}</div>
                                            </div>
                                            {officer.signature ? (
                                                <div className="mt-8">
                                                    <img 
                                                        src={officer.signature} 
                                                        alt="Signature" 
                                                        className="h-20 mx-auto mb-4"
                                                    />
                                                    <div className="border-t border-gray-400 w-48 mx-auto pt-2">
                                                        <div className="text-xs text-gray-600">Authorized Signature</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-16 pt-12 border-t border-gray-400 w-48 mx-auto">
                                                    <div className="text-xs text-gray-600">Signature over Printed Name</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Receipt Footer */}
                                <div className="mt-12 pt-8 border-t-2 border-gray-300 text-center">
                                    <div className="mb-4">
                                        <div className="font-semibold text-gray-900 mb-2">
                                            <Shield className="h-4 w-4 inline mr-2" />
                                            THIS IS AN OFFICIAL RECEIPT
                                        </div>
                                        <div className="text-sm text-gray-600 mb-4">
                                            Valid for accounting and legal purposes • Not valid for input tax credits
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-gray-500">
                                        <div>Transaction ID: {payment.or_number}</div>
                                        <div className="hidden sm:block">•</div>
                                        <div>Generated: {new Date().toLocaleDateString('en-PH')} {new Date().toLocaleTimeString()}</div>
                                        <div className="hidden sm:block">•</div>
                                        <div>Barangay Government Unit</div>
                                    </div>
                                    <div className="mt-4 text-xs text-gray-400 italic">
                                        Please keep this receipt for your records. Report discrepancies within 30 days.
                                    </div>
                                </div>

                                {/* QR Code Placeholder */}
                                <div className="mt-8 flex justify-center">
                                    <div className="bg-gray-100 p-4 rounded-lg inline-flex flex-col items-center">
                                        <QrCode className="h-24 w-24 text-gray-400" />
                                        <div className="mt-2 text-xs text-gray-500">
                                            Scan to verify authenticity
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="mt-8 no-print">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Info className="h-5 w-5 text-blue-600" />
                                        <h4 className="font-semibold text-gray-900">Transaction Details</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <div className="text-sm text-gray-600">Payment ID</div>
                                            <div className="font-mono font-medium">{payment.id}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Recorded By</div>
                                            <div className="font-medium">{payment.recorder?.name || 'System Generated'}</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Printer className="h-5 w-5 text-blue-600" />
                                        <h4 className="font-semibold text-gray-900">Print Instructions</h4>
                                    </div>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                            Use A4 or Letter size paper
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                            Enable "Background graphics" in print settings
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                            Set margins to "Default" or "Minimum"
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                            Print in color for best results
                                        </li>
                                    </ul>
                                </div>
                                
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow border border-blue-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertCircle className="h-5 w-5 text-blue-600" />
                                        <h4 className="font-semibold text-gray-900">Important Notes</h4>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <p>• This receipt serves as official proof of payment</p>
                                        <p>• Present this receipt when claiming certificates</p>
                                        <p>• Report any discrepancies immediately</p>
                                        <p>• Keep for tax and accounting purposes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </>
    );
}
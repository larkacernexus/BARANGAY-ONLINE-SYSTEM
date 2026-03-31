// components/admin/clearances/PrintableClearance.tsx

import React, { forwardRef } from 'react';
import { format } from 'date-fns';
import { ClearanceRequest, Resident, ClearanceType } from '@/types/admin/clearances/clearance-types';

interface PrintableClearanceProps {
    clearance: ClearanceRequest;
    barangayInfo?: {
        name: string;
        address: string;
        logo?: string;
        captain: string;
        secretary: string;
        treasurer: string;
    };
}

const PrintableClearance = forwardRef<HTMLDivElement, PrintableClearanceProps>(({ 
    clearance, 
    barangayInfo = {
        name: 'Barangay San Vicente',
        address: 'San Vicente, City of San Fernando, La Union',
        captain: 'Hon. Juan Dela Cruz',
        secretary: 'Maria Santos',
        treasurer: 'Pedro Reyes'
    }
}, ref) => {
    const formatDate = (dateString?: string): string => {
        if (!dateString) return '______________';
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch {
            return '______________';
        }
    };

    const resident = clearance.resident as Resident | undefined;
    const clearanceType = clearance.clearance_type as ClearanceType | undefined;

    // Generate clearance number
    const clearanceNumber = clearance.clearance_number || `CLR-${new Date().getFullYear()}-${String(clearance.id).padStart(4, '0')}`;

    return (
        <div ref={ref} className="bg-white p-12 max-w-4xl mx-auto font-serif">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                {barangayInfo.logo && (
                    <img 
                        src={barangayInfo.logo} 
                        alt={barangayInfo.name} 
                        className="h-24 w-24 mx-auto mb-4"
                    />
                )}
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">
                    Republic of the Philippines
                </h1>
                <h2 className="text-2xl font-semibold text-gray-800 mt-2">
                    Province of La Union
                </h2>
                <h3 className="text-xl font-semibold text-gray-800">
                    City of San Fernando
                </h3>
                <h4 className="text-2xl font-bold text-gray-900 mt-4 uppercase">
                    {barangayInfo.name}
                </h4>
                <p className="text-gray-600 mt-2">{barangayInfo.address}</p>
            </div>

            {/* Title */}
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wider border-b-2 border-gray-400 inline-block pb-2 px-8">
                    BARANGAY CLEARANCE
                </h1>
            </div>

            {/* Clearance Number */}
            <div className="text-right mb-8">
                <p className="text-sm font-mono">
                    Clearance No.: <span className="font-bold">{clearanceNumber}</span>
                </p>
                <p className="text-sm font-mono mt-1">
                    Date Issued: <span className="font-bold">{formatDate(clearance.issue_date || new Date().toISOString())}</span>
                </p>
            </div>

            {/* TO WHOM IT MAY CONCERN */}
            <div className="mb-6">
                <p className="text-lg font-bold uppercase tracking-wide">
                    TO WHOM IT MAY CONCERN:
                </p>
            </div>

            {/* Body */}
            <div className="text-justify leading-relaxed space-y-4">
                <p className="text-base">
                    This is to certify that{' '}
                    <span className="font-bold uppercase underline underline-offset-4 px-1">
                        {resident?.full_name || '____________________'}
                    </span>
                    , of legal age,{' '}
                    <span className="font-bold">{resident?.civil_status || '______'}</span>
                    , and a resident of{' '}
                    <span className="font-bold">
                        {resident?.address || '____________________'}
                    </span>
                    , is known to be of good moral character and a law-abiding citizen of this Barangay.
                </p>

                <p className="text-base">
                    This clearance is being issued upon the request of the above-named person for{' '}
                    <span className="font-bold italic underline underline-offset-4 px-1">
                        {clearance.purpose || '____________________'}
                    </span>
                    {clearance.specific_purpose && (
                        <span> - {clearance.specific_purpose}</span>
                    )}
                    .
                </p>

                <p className="text-base">
                    The bearer has no derogatory record on file and is not known to be a member of any
                    subversive organization nor has been involved in any activity contrary to law and
                    existing ordinances.
                </p>
            </div>

            {/* Issuance Info */}
            <div className="mt-8 text-sm text-gray-700">
                <p>
                    Issued this <span className="font-bold">{formatDate(clearance.issue_date || new Date().toISOString())}</span> at{' '}
                    <span className="font-bold">{barangayInfo.name}</span>,{' '}
                    {barangayInfo.address}.
                </p>
            </div>

            {/* Validity */}
            {clearance.valid_until && (
                <div className="mt-4 text-sm">
                    <p className="font-medium">
                        This clearance is valid until{' '}
                        <span className="font-bold">{formatDate(clearance.valid_until)}</span> unless
                        revoked earlier.
                    </p>
                </div>
            )}

            {/* Signature Lines */}
            <div className="mt-16 grid grid-cols-2 gap-16">
                {/* Left side - Prepared by / Secretary */}
                <div className="text-center">
                    <div className="h-16 mb-2"></div>
                    <p className="font-bold text-gray-800">{barangayInfo.secretary}</p>
                    <p className="text-sm text-gray-600">Barangay Secretary</p>
                </div>

                {/* Right side - Approved by / Captain */}
                <div className="text-center">
                    <div className="h-16 mb-2 border-b-2 border-gray-400 mx-auto w-48"></div>
                    <p className="font-bold text-gray-800 mt-2">{barangayInfo.captain}</p>
                    <p className="text-sm text-gray-600">Barangay Captain</p>
                </div>
            </div>

            {/* Not Valid Without Seal */}
            <div className="mt-8 text-center text-sm text-gray-500 italic">
                <p>Not valid without the official seal of the Barangay</p>
                <p className="mt-1">This is a computer-generated clearance. No signature required.</p>
            </div>

            {/* OR Number if paid */}
            {clearance.payment_status === 'paid' && clearance.or_number && (
                <div className="mt-4 text-right text-xs text-gray-500">
                    <p>OR No.: {clearance.or_number}</p>
                    <p>Paid on: {formatDate(clearance.payment_date)}</p>
                </div>
            )}
        </div>
    );
});

PrintableClearance.displayName = 'PrintableClearance';

export default PrintableClearance;
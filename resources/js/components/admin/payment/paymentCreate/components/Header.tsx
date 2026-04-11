// // resources/js/components/admin/payment/paymentCreate/components/Header.tsx - Ultra Minimal

// import React from 'react';
// import { Link } from '@inertiajs/react';
// import { ArrowLeft, FileText, Receipt, CreditCard } from 'lucide-react';
// import { route } from 'ziggy-js';

// interface HeaderProps {
//     isClearancePayment: boolean;
//     pre_filled_data?: any;
//     clearance_request?: any;
//     selected_fee_details?: any;
//     processing: boolean;
//     paymentItemsCount: number;
//     payerSource: 'residents' | 'households' | 'businesses' | 'clearance' | 'fees';
// }

// export default function Header({
//     isClearancePayment,
//     pre_filled_data,
//     clearance_request,
//     selected_fee_details,
//     processing,
//     paymentItemsCount,
//     payerSource
// }: HeaderProps) {
    
//     const config = (() => {
//         if (payerSource === 'fees' || pre_filled_data?.fee_id || selected_fee_details) {
//             return { icon: Receipt, title: 'Fee Payment', badge: 'Fee', color: 'blue' };
//         }
//         if (payerSource === 'clearance' || isClearancePayment || clearance_request || pre_filled_data?.clearance_request_id) {
//             return { icon: FileText, title: 'Clearance', badge: 'CLR', color: 'emerald' };
//         }
//         return { icon: CreditCard, title: 'Payment', badge: 'New', color: 'gray' };
//     })();
    
//     const Icon = config.icon;
//     const reference = selected_fee_details?.fee_code || clearance_request?.reference_number || null;
    
//     const colorClasses = {
//         blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
//         emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
//         gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
//     };
    
//     return (
//         <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
//             <div className="px-4 py-2.5 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                     <Link
//                         href={route('admin.payments.index')}
//                         className="p-1.5 -ml-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
//                     >
//                         <ArrowLeft className="w-4 h-4" />
//                     </Link>
                    
//                     <div className={`p-1.5 rounded-md ${colorClasses[config.color as keyof typeof colorClasses]}`}>
//                         <Icon className="w-3.5 h-3.5" />
//                     </div>
                    
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
//                                 {config.title}
//                             </h1>
//                             <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colorClasses[config.color as keyof typeof colorClasses]}`}>
//                                 {config.badge}
//                             </span>
//                             {processing && (
//                                 <div className="w-3 h-3 rounded-full border border-amber-500 border-t-transparent animate-spin" />
//                             )}
//                         </div>
//                         {reference && (
//                             <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5">
//                                 {reference}
//                             </div>
//                         )}
//                     </div>
//                 </div>
                
//                 <div className="flex items-baseline gap-1.5">
//                     <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
//                         {paymentItemsCount}
//                     </span>
//                     <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase">
//                         {paymentItemsCount === 1 ? 'item' : 'items'}
//                     </span>
//                 </div>
//             </div>
//         </div>
//     );
// }
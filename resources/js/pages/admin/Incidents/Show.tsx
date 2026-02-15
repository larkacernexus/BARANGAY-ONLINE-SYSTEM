// // resources/js/Pages/Admin/Incidents/Show.tsx
// import React, { useState } from 'react';
// import Layout from '@/Layouts/Layout';
// import { Link, usePage, useForm, router } from '@inertiajs/react';
// import { Incident } from '@/types/incident';

// interface ShowProps {
//     incident: Incident & {
//         blotter_details?: {
//             respondent_name: string;
//             hearing_date?: string;
//             hearing_location?: string;
//             mediator_notes?: string;
//         };
//         relatedIncidents: Incident[];
//     };
// }

// const AdminIncidentShow: React.FC<ShowProps> = ({ incident, relatedIncidents }) => {
//     const { url } = usePage();
//     const isEditingStatus = url.includes('edit=status');
//     const isEditingBlotter = url.includes('edit=blotter');

//     const { data: statusData, setData: setStatusData, put: updateStatus, processing: statusProcessing } = useForm({
//         status: incident.status,
//         notes: '',
//     });

//     const { data: blotterData, setData: setBlotterData, put: updateBlotter, processing: blotterProcessing } = useForm({
//         respondent_name: incident.blotter_details?.respondent_name || '',
//         hearing_date: incident.blotter_details?.hearing_date || '',
//         hearing_location: incident.blotter_details?.hearing_location || '',
//         mediator_notes: incident.blotter_details?.mediator_notes || '',
//     });

//     const handleStatusSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         updateStatus(route('admin.incidents.update-status', incident.id), {
//             onSuccess: () => {
//                 router.visit(route('admin.incidents.show', incident.id));
//             }
//         });
//     };

//     const handleBlotterSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//         updateBlotter(route('admin.blotters.update-details', incident.id), {
//             onSuccess: () => {
//                 router.visit(route('admin.incidents.show', incident.id));
//             }
//         });
//     };

//     const statusColors = {
//         pending: 'bg-yellow-100 text-yellow-800',
//         under_investigation: 'bg-blue-100 text-blue-800',
//         resolved: 'bg-green-100 text-green-800',
//         dismissed: 'bg-red-100 text-red-800',
//     };

//     const typeColors = {
//         complaint: 'bg-purple-100 text-purple-800',
//         blotter: 'bg-orange-100 text-orange-800',
//     };

//     const getStatusIcon = (status: string) => {
//         switch (status) {
//             case 'pending': return '⏳';
//             case 'under_investigation': return '🔍';
//             case 'resolved': return '✅';
//             case 'dismissed': return '❌';
//             default: return '📋';
//         }
//     };

//     return (
//         <Layout>
//             <div className="py-6">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     {/* Breadcrumb */}
//                     <nav className="mb-6">
//                         <ol className="flex items-center space-x-2 text-sm">
//                             <li>
//                                 <Link href={route('admin.dashboard')} className="text-blue-600 hover:text-blue-800">
//                                     Dashboard
//                                 </Link>
//                             </li>
//                             <li className="text-gray-400">/</li>
//                             {incident.type === 'complaint' ? (
//                                 <li>
//                                     <Link href={route('admin.complaints.index')} className="text-blue-600 hover:text-blue-800">
//                                         Complaints
//                                     </Link>
//                                 </li>
//                             ) : (
//                                 <li>
//                                     <Link href={route('admin.blotters.index')} className="text-blue-600 hover:text-blue-800">
//                                         Blotters
//                                     </Link>
//                                 </li>
//                             )}
//                             <li className="text-gray-400">/</li>
//                             <li className="text-gray-600">Case Details</li>
//                         </ol>
//                     </nav>

//                     {/* Header */}
//                     <div className="md:flex md:items-start md:justify-between mb-6">
//                         <div>
//                             <div className="flex items-center gap-2 mb-2">
//                                 <span className={`px-3 py-1 text-sm font-semibold rounded-full ${typeColors[incident.type]}`}>
//                                     {incident.type.toUpperCase()}
//                                 </span>
//                                 <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[incident.status]}`}>
//                                     {getStatusIcon(incident.status)} {incident.status.replace('_', ' ').toUpperCase()}
//                                 </span>
//                                 <span className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full">
//                                     {incident.type === 'complaint' 
//                                         ? `CMP-${incident.id.toString().padStart(6, '0')}`
//                                         : `BLT-${incident.id.toString().padStart(6, '0')}`}
//                                 </span>
//                             </div>
//                             <h1 className="text-2xl font-bold text-gray-900">{incident.title}</h1>
//                             <p className="mt-2 text-gray-600">
//                                 Filed on {new Date(incident.created_at).toLocaleDateString('en-PH', { 
//                                     year: 'numeric', 
//                                     month: 'long', 
//                                     day: 'numeric' 
//                                 })}
//                             </p>
//                         </div>
//                         <div className="mt-4 md:mt-0 flex space-x-3">
//                             <Link
//                                 href={incident.type === 'complaint' 
//                                     ? route('admin.complaints.index') 
//                                     : route('admin.blotters.index')}
//                                 className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
//                             >
//                                 ← Back
//                             </Link>
//                             <div className="relative">
//                                 <Link
//                                     href={`${route('admin.incidents.show', incident.id)}?edit=status`}
//                                     className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                                 >
//                                     Update Status
//                                 </Link>
//                                 {incident.type === 'blotter' && (
//                                     <Link
//                                         href={`${route('admin.incidents.show', incident.id)}?edit=blotter`}
//                                         className="ml-2 inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
//                                     >
//                                         Edit Blotter
//                                     </Link>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Status Update Form */}
//                     {isEditingStatus && (
//                         <div className="mb-6 bg-white rounded-lg shadow p-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-4">Update Case Status</h2>
//                             <form onSubmit={handleStatusSubmit} className="space-y-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         New Status
//                                     </label>
//                                     <select
//                                         value={statusData.status}
//                                         onChange={(e) => setStatusData('status', e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                     >
//                                         <option value="pending">Pending</option>
//                                         <option value="under_investigation">Under Investigation</option>
//                                         <option value="resolved">Resolved</option>
//                                         <option value="dismissed">Dismissed</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Notes (Optional)
//                                     </label>
//                                     <textarea
//                                         value={statusData.notes}
//                                         onChange={(e) => setStatusData('notes', e.target.value)}
//                                         rows={3}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                         placeholder="Add any notes about this status change..."
//                                     />
//                                 </div>
//                                 <div className="flex justify-end space-x-3">
//                                     <Link
//                                         href={route('admin.incidents.show', incident.id)}
//                                         className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                                     >
//                                         Cancel
//                                     </Link>
//                                     <button
//                                         type="submit"
//                                         disabled={statusProcessing}
//                                         className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
//                                     >
//                                         {statusProcessing ? 'Updating...' : 'Update Status'}
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     )}

//                     {/* Blotter Edit Form */}
//                     {isEditingBlotter && incident.type === 'blotter' && (
//                         <div className="mb-6 bg-white rounded-lg shadow p-6">
//                             <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Blotter Details</h2>
//                             <form onSubmit={handleBlotterSubmit} className="space-y-4">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Respondent Name *
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={blotterData.respondent_name}
//                                             onChange={(e) => setBlotterData('respondent_name', e.target.value)}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                                             required
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Hearing Date
//                                         </label>
//                                         <input
//                                             type="datetime-local"
//                                             value={blotterData.hearing_date}
//                                             onChange={(e) => setBlotterData('hearing_date', e.target.value)}
//                                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                                         />
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Hearing Location
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={blotterData.hearing_location}
//                                         onChange={(e) => setBlotterData('hearing_location', e.target.value)}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                                         placeholder="e.g., Barangay Hall, Conference Room"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Mediator Notes
//                                     </label>
//                                     <textarea
//                                         value={blotterData.mediator_notes}
//                                         onChange={(e) => setBlotterData('mediator_notes', e.target.value)}
//                                         rows={4}
//                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                                         placeholder="Notes from mediation sessions, agreements, or observations..."
//                                     />
//                                 </div>
//                                 <div className="flex justify-end space-x-3">
//                                     <Link
//                                         href={route('admin.incidents.show', incident.id)}
//                                         className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                                     >
//                                         Cancel
//                                     </Link>
//                                     <button
//                                         type="submit"
//                                         disabled={blotterProcessing}
//                                         className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
//                                     >
//                                         {blotterProcessing ? 'Updating...' : 'Save Changes'}
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     )}

//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                         {/* Main Content */}
//                         <div className="lg:col-span-2 space-y-6">
//                             {/* Incident Details */}
//                             <div className="bg-white rounded-lg shadow p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Details</h2>
//                                 <div className="space-y-4">
//                                     <div>
//                                         <h3 className="text-sm font-medium text-gray-500">Description</h3>
//                                         <p className="mt-1 text-gray-900 whitespace-pre-line bg-gray-50 p-4 rounded">
//                                             {incident.description}
//                                         </p>
//                                     </div>

//                                     {/* Blotter Specific Info */}
//                                     {incident.type === 'blotter' && incident.blotter_details && (
//                                         <div className="border-t pt-4">
//                                             <h3 className="text-sm font-medium text-gray-500">Blotter Information</h3>
//                                             <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
//                                                 <div>
//                                                     <p className="text-sm text-gray-600">Respondent</p>
//                                                     <p className="font-medium">{incident.blotter_details.respondent_name}</p>
//                                                 </div>
//                                                 {incident.blotter_details.hearing_date && (
//                                                     <div>
//                                                         <p className="text-sm text-gray-600">Hearing Schedule</p>
//                                                         <p className="font-medium">
//                                                             {new Date(incident.blotter_details.hearing_date).toLocaleString('en-PH', {
//                                                                 dateStyle: 'long',
//                                                                 timeStyle: 'short'
//                                                             })}
//                                                         </p>
//                                                         {incident.blotter_details.hearing_location && (
//                                                             <p className="text-sm text-gray-600">
//                                                                 Location: {incident.blotter_details.hearing_location}
//                                                             </p>
//                                                         )}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             {incident.blotter_details.mediator_notes && (
//                                                 <div className="mt-4">
//                                                     <p className="text-sm text-gray-600">Mediator Notes</p>
//                                                     <p className="mt-1 text-gray-900 whitespace-pre-line bg-yellow-50 p-3 rounded text-sm">
//                                                         {incident.blotter_details.mediator_notes}
//                                                     </p>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Reporter Information */}
//                             <div className="bg-white rounded-lg shadow p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Reporter Information</h2>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div>
//                                         <h3 className="text-sm font-medium text-gray-500">Filing Details</h3>
//                                         <dl className="mt-2 space-y-2">
//                                             <div>
//                                                 <dt className="text-sm text-gray-600">Filed As</dt>
//                                                 <dd className="font-medium">
//                                                     {incident.is_anonymous ? 'Anonymous' : incident.reported_as_name}
//                                                 </dd>
//                                             </div>
//                                             <div>
//                                                 <dt className="text-sm text-gray-600">Actual Resident</dt>
//                                                 <dd className="font-medium">{incident.resident?.full_name}</dd>
//                                             </div>
//                                             <div>
//                                                 <dt className="text-sm text-gray-600">Household</dt>
//                                                 <dd className="font-medium">{incident.household?.household_number}</dd>
//                                             </div>
//                                         </dl>
//                                     </div>
//                                     <div>
//                                         <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
//                                         <div className="mt-2 space-y-2">
//                                             <div className="flex items-center text-sm text-gray-600">
//                                                 <span className="mr-2">📧</span>
//                                                 <span>Email: {incident.user?.email || 'Not available'}</span>
//                                             </div>
//                                             <div className="flex items-center text-sm text-gray-600">
//                                                 <span className="mr-2">📱</span>
//                                                 <span>Phone: {incident.resident?.phone_number || 'Not available'}</span>
//                                             </div>
//                                             <div className="flex items-center text-sm text-gray-600">
//                                                 <span className="mr-2">🏠</span>
//                                                 <span>Address: {incident.household?.address || 'Not available'}</span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Timeline */}
//                             <div className="bg-white rounded-lg shadow p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Timeline</h2>
//                                 <div className="space-y-4">
//                                     <div className="flex">
//                                         <div className="flex-shrink-0">
//                                             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                                                 <span className="text-blue-600">📝</span>
//                                             </div>
//                                         </div>
//                                         <div className="ml-4">
//                                             <p className="text-sm font-medium text-gray-900">Report Filed</p>
//                                             <p className="text-sm text-gray-600">
//                                                 {new Date(incident.created_at).toLocaleString('en-PH', {
//                                                     dateStyle: 'long',
//                                                     timeStyle: 'short'
//                                                 })}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <div className="flex">
//                                         <div className="flex-shrink-0">
//                                             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                                                 <span className="text-green-600">📊</span>
//                                             </div>
//                                         </div>
//                                         <div className="ml-4">
//                                             <p className="text-sm font-medium text-gray-900">Status History</p>
//                                             <p className="text-sm text-gray-600">
//                                                 Last updated: {new Date(incident.updated_at).toLocaleDateString()}
//                                             </p>
//                                             <div className="mt-1">
//                                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[incident.status]}`}>
//                                                     Current: {incident.status.replace('_', ' ').toUpperCase()}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Sidebar */}
//                         <div className="space-y-6">
//                             {/* Case Management */}
//                             <div className="bg-white rounded-lg shadow p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Management</h2>
//                                 <div className="space-y-3">
//                                     <Link
//                                         href={`${route('admin.incidents.show', incident.id)}?edit=status`}
//                                         className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                                     >
//                                         Update Status
//                                     </Link>
//                                     {incident.type === 'blotter' && (
//                                         <Link
//                                             href={`${route('admin.incidents.show', incident.id)}?edit=blotter`}
//                                             className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
//                                         >
//                                             Edit Blotter Details
//                                         </Link>
//                                     )}
//                                     <button className="block w-full text-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
//                                         Add Internal Note
//                                     </button>
//                                     <button className="block w-full text-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition">
//                                         Escalate Case
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* Related Incidents */}
//                             {relatedIncidents.length > 0 && (
//                                 <div className="bg-white rounded-lg shadow p-6">
//                                     <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Incidents</h2>
//                                     <div className="space-y-3">
//                                         {relatedIncidents.map((related) => (
//                                             <Link
//                                                 key={related.id}
//                                                 href={route('admin.incidents.show', related.id)}
//                                                 className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
//                                             >
//                                                 <div className="flex justify-between items-start">
//                                                     <div>
//                                                         <p className="text-sm font-medium text-gray-900 line-clamp-1">
//                                                             {related.title}
//                                                         </p>
//                                                         <p className="text-xs text-gray-500 mt-1">
//                                                             {new Date(related.created_at).toLocaleDateString()}
//                                                         </p>
//                                                     </div>
//                                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full 
//                                                         ${related.type === 'complaint' 
//                                                             ? 'bg-purple-100 text-purple-800' 
//                                                             : 'bg-orange-100 text-orange-800'}`}>
//                                                         {related.type.charAt(0).toUpperCase()}
//                                                     </span>
//                                                 </div>
//                                             </Link>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Quick Stats */}
//                             <div className="bg-white rounded-lg shadow p-6">
//                                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Case Statistics</h2>
//                                 <div className="space-y-3">
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-sm text-gray-600">Days Open</span>
//                                         <span className="font-medium">
//                                             {Math.ceil((new Date().getTime() - new Date(incident.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-sm text-gray-600">Last Updated</span>
//                                         <span className="font-medium">
//                                             {Math.ceil((new Date().getTime() - new Date(incident.updated_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
//                                         </span>
//                                     </div>
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-sm text-gray-600">Report Type</span>
//                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[incident.type]}`}>
//                                             {incident.type.toUpperCase()}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </Layout>
//     );
// };

// export default AdminIncidentShow;
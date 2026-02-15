// import React, { useState } from 'react';
// import Layout from '@/Layouts/Layout';
// import { Link, usePage, router } from '@inertiajs/react';
// import { PaginatedData } from '@/types/pagination';
// import { Incident } from '@/types/incident';

// interface Props {
//     blotters: PaginatedData<Incident>;
//     filters: {
//         search?: string;
//     };
// }

// const AdminBlottersIndex: React.FC<Props> = ({ blotters, filters }) => {
//     const [search, setSearch] = useState(filters.search || '');

//     const handleSearch = (e: React.FormEvent) => {
//         e.preventDefault();
//         router.get(route('admin.blotters.index'), { search });
//     };

//     const statusColors = {
//         pending: 'bg-yellow-100 text-yellow-800',
//         under_investigation: 'bg-blue-100 text-blue-800',
//         resolved: 'bg-green-100 text-green-800',
//         dismissed: 'bg-red-100 text-red-800',
//     };

//     return (
//         <Layout>
//             <div className="py-6">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     {/* Header */}
//                     <div className="md:flex md:items-center md:justify-between mb-6">
//                         <div>
//                             <h1 className="text-2xl font-bold text-gray-900">Blotter Cases Management</h1>
//                             <p className="mt-1 text-sm text-gray-600">
//                                 Manage mediation cases and legal disputes
//                             </p>
//                         </div>
//                         <div className="mt-4 md:mt-0 flex space-x-3">
//                             <Link
//                                 href={route('admin.dashboard')}
//                                 className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
//                             >
//                                 ← Dashboard
//                             </Link>
//                             <Link
//                                 href={route('admin.incidents.index')}
//                                 className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
//                             >
//                                 View All Incidents
//                             </Link>
//                         </div>
//                     </div>

//                     {/* Stats */}
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                         <div className="bg-white rounded-lg shadow p-4">
//                             <div className="flex items-center">
//                                 <div className="flex-shrink-0">
//                                     <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
//                                         <span className="text-orange-600">⚖️</span>
//                                     </div>
//                                 </div>
//                                 <div className="ml-4">
//                                     <p className="text-sm font-medium text-gray-600">Total Blotters</p>
//                                     <p className="text-xl font-semibold text-gray-900">{blotters.total}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white rounded-lg shadow p-4">
//                             <div className="flex items-center">
//                                 <div className="flex-shrink-0">
//                                     <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
//                                         <span className="text-yellow-600">⏳</span>
//                                     </div>
//                                 </div>
//                                 <div className="ml-4">
//                                     <p className="text-sm font-medium text-gray-600">Scheduled Hearings</p>
//                                     <p className="text-xl font-semibold text-gray-900">
//                                         {blotters.data.filter(b => b.blotter_details?.hearing_date).length}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white rounded-lg shadow p-4">
//                             <div className="flex items-center">
//                                 <div className="flex-shrink-0">
//                                     <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                                         <span className="text-blue-600">🤝</span>
//                                     </div>
//                                 </div>
//                                 <div className="ml-4">
//                                     <p className="text-sm font-medium text-gray-600">Mediation Active</p>
//                                     <p className="text-xl font-semibold text-gray-900">
//                                         {blotters.data.filter(b => b.status === 'under_investigation').length}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="bg-white rounded-lg shadow p-4">
//                             <div className="flex items-center">
//                                 <div className="flex-shrink-0">
//                                     <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
//                                         <span className="text-green-600">✅</span>
//                                     </div>
//                                 </div>
//                                 <div className="ml-4">
//                                     <p className="text-sm font-medium text-gray-600">Settled</p>
//                                     <p className="text-xl font-semibold text-gray-900">
//                                         {blotters.data.filter(b => b.status === 'resolved').length}
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Search */}
//                     <div className="bg-white rounded-lg shadow p-4 mb-6">
//                         <form onSubmit={handleSearch} className="flex space-x-3">
//                             <div className="flex-1">
//                                 <input
//                                     type="text"
//                                     value={search}
//                                     onChange={(e) => setSearch(e.target.value)}
//                                     placeholder="Search blotters by title, respondent, or reporter..."
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
//                                 />
//                             </div>
//                             <button
//                                 type="submit"
//                                 className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
//                             >
//                                 Search
//                             </button>
//                             {search && (
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setSearch('');
//                                         router.get(route('admin.blotters.index'));
//                                     }}
//                                     className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
//                                 >
//                                     Clear
//                                 </button>
//                             )}
//                         </form>
//                     </div>

//                     {/* Blotters Table */}
//                     <div className="bg-white shadow-md rounded-lg overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-gray-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Case #
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Title & Parties
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Hearing Schedule
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Status
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Last Updated
//                                         </th>
//                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {blotters.data.map((blotter) => (
//                                         <tr key={blotter.id} className="hover:bg-gray-50">
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm font-medium text-gray-900">
//                                                     BLT-{blotter.id.toString().padStart(6, '0')}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <div className="text-sm font-medium text-gray-900">
//                                                     {blotter.title}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500">
//                                                     <div className="mt-1">
//                                                         <span className="font-medium">Complainant:</span>{' '}
//                                                         {blotter.is_anonymous ? 'Anonymous' : blotter.reported_as_name}
//                                                     </div>
//                                                     {blotter.blotter_details && (
//                                                         <div>
//                                                             <span className="font-medium">Respondent:</span>{' '}
//                                                             {blotter.blotter_details.respondent_name}
//                                                         </div>
//                                                     )}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 {blotter.blotter_details?.hearing_date ? (
//                                                     <div>
//                                                         <div className="text-sm font-medium text-gray-900">
//                                                             {new Date(blotter.blotter_details.hearing_date).toLocaleDateString()}
//                                                         </div>
//                                                         <div className="text-xs text-gray-500">
//                                                             {new Date(blotter.blotter_details.hearing_date).toLocaleTimeString([], { 
//                                                                 hour: '2-digit', 
//                                                                 minute: '2-digit' 
//                                                             })}
//                                                         </div>
//                                                     </div>
//                                                 ) : (
//                                                     <span className="text-sm text-gray-500">Not scheduled</span>
//                                                 )}
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[blotter.status]}`}>
//                                                     {blotter.status.replace('_', ' ').toUpperCase()}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm text-gray-900">
//                                                     {new Date(blotter.updated_at).toLocaleDateString()}
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                                 <Link
//                                                     href={route('admin.incidents.show', blotter.id)}
//                                                     className="text-orange-600 hover:text-orange-900 mr-3"
//                                                 >
//                                                     View
//                                                 </Link>
//                                                 <Link
//                                                     href={`${route('admin.incidents.show', blotter.id)}?edit=blotter`}
//                                                     className="text-blue-600 hover:text-blue-900"
//                                                 >
//                                                     Manage
//                                                 </Link>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>

//                         {/* Empty State */}
//                         {blotters.data.length === 0 && (
//                             <div className="px-6 py-12 text-center">
//                                 <div className="text-gray-400 text-5xl mb-4">⚖️</div>
//                                 <h3 className="text-lg font-medium text-gray-900 mb-2">No Blotter Cases Found</h3>
//                                 <p className="text-gray-600">
//                                     {search ? 'No blotter cases match your search.' : 'No blotter cases have been filed yet.'}
//                                 </p>
//                             </div>
//                         )}

//                         {/* Pagination */}
//                         {blotters.links && blotters.links.length > 3 && (
//                             <div className="px-6 py-4 border-t border-gray-200">
//                                 <nav className="flex items-center justify-between">
//                                     <div className="flex-1 flex justify-between sm:hidden">
//                                         <Link
//                                             href={blotters.prev_page_url || '#'}
//                                             className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md 
//                                                 ${!blotters.prev_page_url ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
//                                         >
//                                             Previous
//                                         </Link>
//                                         <Link
//                                             href={blotters.next_page_url || '#'}
//                                             className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md 
//                                                 ${!blotters.next_page_url ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
//                                         >
//                                             Next
//                                         </Link>
//                                     </div>
//                                     <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                                         <div>
//                                             <p className="text-sm text-gray-700">
//                                                 Showing <span className="font-medium">{blotters.from}</span> to{' '}
//                                                 <span className="font-medium">{blotters.to}</span> of{' '}
//                                                 <span className="font-medium">{blotters.total}</span> blotter cases
//                                             </p>
//                                         </div>
//                                         <div>
//                                             <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
//                                                 {blotters.links.map((link, index) => (
//                                                     <Link
//                                                         key={index}
//                                                         href={link.url || '#'}
//                                                         className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
//                                                             ${index === 0 ? 'rounded-l-md' : ''}
//                                                             ${index === blotters.links.length - 1 ? 'rounded-r-md' : ''}
//                                                             ${link.active
//                                                                 ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
//                                                                 : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
//                                                             }
//                                                             ${!link.url ? 'cursor-not-allowed bg-gray-100' : ''}`}
//                                                         dangerouslySetInnerHTML={{ __html: link.label }}
//                                                     />
//                                                 ))}
//                                             </nav>
//                                         </div>
//                                     </div>
//                                 </nav>
//                             </div>
//                         )}
//                     </div>

//                     {/* Upcoming Hearings */}
//                     <div className="mt-8">
//                         <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Hearings</h2>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                             {blotters.data
//                                 .filter(b => b.blotter_details?.hearing_date)
//                                 .sort((a, b) => new Date(a.blotter_details!.hearing_date!).getTime() - new Date(b.blotter_details!.hearing_date!).getTime())
//                                 .slice(0, 3)
//                                 .map((blotter) => (
//                                     <div key={blotter.id} className="bg-white rounded-lg shadow p-4">
//                                         <div className="flex justify-between items-start mb-3">
//                                             <div>
//                                                 <h3 className="font-medium text-gray-900">{blotter.title}</h3>
//                                                 <p className="text-sm text-gray-600 mt-1">
//                                                     Case: BLT-{blotter.id.toString().padStart(6, '0')}
//                                                 </p>
//                                             </div>
//                                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[blotter.status]}`}>
//                                                 {blotter.status.replace('_', ' ').toUpperCase()}
//                                             </span>
//                                         </div>
//                                         <div className="space-y-2">
//                                             <div className="flex items-center text-sm text-gray-600">
//                                                 <span className="mr-2">📅</span>
//                                                 <span>
//                                                     {new Date(blotter.blotter_details!.hearing_date!).toLocaleDateString('en-PH', {
//                                                         weekday: 'long',
//                                                         year: 'numeric',
//                                                         month: 'long',
//                                                         day: 'numeric'
//                                                     })}
//                                                 </span>
//                                             </div>
//                                             <div className="flex items-center text-sm text-gray-600">
//                                                 <span className="mr-2">⏰</span>
//                                                 <span>
//                                                     {new Date(blotter.blotter_details!.hearing_date!).toLocaleTimeString([], {
//                                                         hour: '2-digit',
//                                                         minute: '2-digit'
//                                                     })}
//                                                 </span>
//                                             </div>
//                                             <div className="flex items-center text-sm text-gray-600">
//                                                 <span className="mr-2">🤝</span>
//                                                 <span>Mediation Session</span>
//                                             </div>
//                                         </div>
//                                         <div className="mt-4">
//                                             <Link
//                                                 href={route('admin.incidents.show', blotter.id)}
//                                                 className="text-sm text-orange-600 hover:text-orange-800 font-medium"
//                                             >
//                                                 View Case Details →
//                                             </Link>
//                                         </div>
//                                     </div>
//                                 ))}
//                             {blotters.data.filter(b => b.blotter_details?.hearing_date).length === 0 && (
//                                 <div className="col-span-3 text-center py-8 text-gray-500">
//                                     No upcoming hearings scheduled
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </Layout>
//     );
// };

// export default AdminBlottersIndex;
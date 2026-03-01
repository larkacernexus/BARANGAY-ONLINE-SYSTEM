// resources/js/Components/InstructionsModal.tsx
import React, { useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  HelpCircle, 
  Video, 
  FileText, 
  Download,
  Search,
  Filter,
  Printer,
  Share2,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  Home,
  CreditCard,
  FileText as FileTextIcon,
  Keyboard,
  Bell,
  Settings,
  UserPlus,
  UserCheck,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Globe,
  Lock,
  Unlock,
  Database,
  HardDrive,
  Server,
  Network,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  module?: string;
  title?: string;
  customContent?: React.ReactNode;
  showQuickGuide?: boolean;
  userRole?: 'admin' | 'staff' | 'resident';
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  module = 'general',
  title,
  customContent,
  showQuickGuide = true,
  userRole = 'staff'
}) => {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Module-specific content for barangay system
  const getModuleContent = () => {
    const modules: Record<string, { title: string; content: React.ReactNode }> = {
      dashboard: {
        title: 'Dashboard Guide - Barangay Management System',
        content: (
          <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-300">
                <BarChart3 className="h-5 w-5" />
                Dashboard Overview
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-800 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4" />
                    Key Metrics
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-500" />
                      <span><strong>Total Residents:</strong> Current registered population</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                      <span><strong>Total Households:</strong> Number of family units</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
                      <span><strong>Today's Collections:</strong> Daily revenue from barangay fees</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-purple-500" />
                      <span><strong>Pending Clearances:</strong> Applications needing processing</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-800 dark:text-blue-400">
                    <Activity className="h-4 w-4" />
                    Quick Actions
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <UserPlus className="mt-0.5 h-3 w-3 flex-shrink-0 text-purple-500" />
                      <span><strong>Register Resident:</strong> Add new resident to database</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FileTextIcon className="mt-0.5 h-3 w-3 flex-shrink-0 text-blue-500" />
                      <span><strong>Request Clearance:</strong> Create new clearance application</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CreditCard className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                      <span><strong>Process Payment:</strong> Record barangay fee payments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-rose-500" />
                      <span><strong>Emergency Alert:</strong> Send urgent notifications</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dashboard Views */}
            <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Eye className="h-5 w-5" />
                Dashboard Views
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-300">
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Overview</span>
                    Default View
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quick glance at key metrics, recent activities, and quick action buttons.
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-300">
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">Detailed</span>
                    Analytics View
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    In-depth charts, trends, and detailed statistics for advanced analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      residents: {
        title: 'Residents Module - Management Guide',
        content: (
          <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 dark:from-emerald-900/20 dark:to-emerald-800/20">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-emerald-900 dark:text-emerald-300">
                <Users className="h-5 w-5" />
                Resident Management
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-emerald-800 dark:text-emerald-400">
                    <UserPlus className="h-4 w-4" />
                    Adding Residents
                  </h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">1</span>
                      <span>Click "Register Resident" from Quick Actions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">2</span>
                      <span>Fill in all required personal information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">3</span>
                      <span>Upload valid ID and proof of residency</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">4</span>
                      <span>Assign to existing household or create new</span>
                    </li>
                  </ol>
                </div>
                
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-emerald-800 dark:text-emerald-400">
                    <UserCheck className="h-4 w-4" />
                    Resident Search
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <Search className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span><strong>Quick Search:</strong> Name, household number, or address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Filter className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span><strong>Advanced Filters:</strong> Age range, gender, purok</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Printer className="mt-0.5 h-3 w-3 flex-shrink-0" />
                      <span><strong>Export Data:</strong> Generate reports in PDF/Excel</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Resident Categories */}
            <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Resident Categories</h3>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <div className="font-medium text-blue-800 dark:text-blue-300">Regular</div>
                  <div className="text-xs text-blue-700 dark:text-blue-400">Permanent residents</div>
                </div>
                <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                  <div className="font-medium text-purple-800 dark:text-purple-300">Senior</div>
                  <div className="text-xs text-purple-700 dark:text-purple-400">60+ years old</div>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <div className="font-medium text-amber-800 dark:text-amber-300">PWD</div>
                  <div className="text-xs text-amber-700 dark:text-amber-400">With disability</div>
                </div>
                <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
                  <div className="font-medium text-rose-800 dark:text-rose-300">Transient</div>
                  <div className="text-xs text-rose-700 dark:text-rose-400">Temporary residents</div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      clearance: {
        title: 'Clearance System - Processing Guide',
        content: (
          <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-4 dark:from-purple-900/20 dark:to-purple-800/20">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-purple-900 dark:text-purple-300">
                <FileTextIcon className="h-5 w-5" />
                Clearance Processing Workflow
              </h3>
              
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-3 font-medium text-purple-800 dark:text-purple-400">Step-by-Step Process</h4>
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-purple-800 font-bold">1</span>
                      <div>
                        <div className="font-medium">Receive & Verify Request</div>
                        <div className="mt-1 text-gray-600 dark:text-gray-400">
                          Check submitted documents: Valid ID, Proof of Residency, Purpose Letter
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold">2</span>
                      <div>
                        <div className="font-medium">Background Check</div>
                        <div className="mt-1 text-gray-600 dark:text-gray-400">
                          Verify barangay records for dues, violations, or pending issues
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold">3</span>
                      <div>
                        <div className="font-medium">Payment Processing</div>
                        <div className="mt-1 text-gray-600 dark:text-gray-400">
                          Collect fees and issue official barangay receipt
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold">4</span>
                      <div>
                        <div className="font-medium">Approval & Issuance</div>
                        <div className="mt-1 text-gray-600 dark:text-gray-400">
                          Approve request and generate clearance certificate with QR code
                        </div>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Clearance Types */}
            <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Clearance Types & Requirements</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Type</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Fee</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Processing</th>
                      <th className="px-4 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Validity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    <tr>
                      <td className="px-4 py-2 font-medium">Barangay Clearance</td>
                      <td className="px-4 py-2">₱100</td>
                      <td className="px-4 py-2">1-3 days</td>
                      <td className="px-4 py-2">6 months</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium">Business Permit</td>
                      <td className="px-4 py-2">₱500+</td>
                      <td className="px-4 py-2">3-5 days</td>
                      <td className="px-4 py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium">Good Moral</td>
                      <td className="px-4 py-2">₱150</td>
                      <td className="px-4 py-2">2-4 days</td>
                      <td className="px-4 py-2">6 months</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 font-medium">Residency</td>
                      <td className="px-4 py-2">₱100</td>
                      <td className="px-4 py-2">1-2 days</td>
                      <td className="px-4 py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      },
      payments: {
        title: 'Payment System - Collection Guide',
        content: (
          <div className="space-y-6">
            <div className="rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 p-4 dark:from-amber-900/20 dark:to-amber-800/20">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-amber-900 dark:text-amber-300">
                <CreditCard className="h-5 w-5" />
                Payment Processing
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-amber-800 dark:text-amber-400">
                    <DollarSign className="h-4 w-4" />
                    Payment Methods
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">Cash</div>
                      <span>Over-the-counter at barangay hall</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">GCash</div>
                      <span>Mobile payment via 0917-XXX-XXXX</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800">PayMaya</div>
                      <span>Mobile payment via 0918-XXX-XXXX</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-800">Bank Transfer</div>
                      <span>BPI/KB Barangay Account</span>
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-amber-800 dark:text-amber-400">
                    <Receipt className="h-4 w-4" />
                    Official Receipts
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                      <span>All payments must have official barangay receipt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                      <span>Receipt number is auto-generated by system</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                      <span>Keep duplicate copy for barangay records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-emerald-500" />
                      <span>Digital receipts can be sent via SMS/Email</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Collection Schedule */}
            <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Calendar className="h-5 w-5" />
                Collection Schedule
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <div className="font-medium text-blue-800 dark:text-blue-300">Monday - Friday</div>
                  <div className="text-xs text-blue-700 dark:text-blue-400">8:00 AM - 5:00 PM</div>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                  <div className="font-medium text-emerald-800 dark:text-emerald-300">Saturday</div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400">8:00 AM - 12:00 PM</div>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <div className="font-medium text-amber-800 dark:text-amber-300">Cut-off</div>
                  <div className="text-xs text-amber-700 dark:text-amber-400">Daily 3:00 PM</div>
                </div>
                <div className="rounded-lg bg-rose-50 p-3 dark:bg-rose-900/20">
                  <div className="font-medium text-rose-800 dark:text-rose-300">Emergency</div>
                  <div className="text-xs text-rose-700 dark:text-rose-400">24/7 On-call</div>
                </div>
              </div>
            </div>
          </div>
        )
      },
      general: {
        title: 'Barangay Management System - User Guide',
        content: (
          <div className="space-y-6">
            {/* Role-Based Access */}
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 dark:from-blue-900/20 dark:to-blue-800/20">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-300">
                <Shield className="h-5 w-5" />
                Role-Based Access Control
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-blue-800 dark:text-blue-400">
                    <Shield className="h-4 w-4" />
                    Administrator
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Full system access</li>
                    <li>• User management</li>
                    <li>• System configuration</li>
                    <li>• Report generation</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-emerald-800 dark:text-emerald-400">
                    <UserCheck className="h-4 w-4" />
                    Barangay Staff
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Resident management</li>
                    <li>• Clearance processing</li>
                    <li>• Payment collection</li>
                    <li>• Document generation</li>
                  </ul>
                </div>
                <div className="rounded-lg bg-white p-4 dark:bg-gray-800">
                  <h4 className="mb-2 flex items-center gap-2 font-medium text-purple-800 dark:text-purple-400">
                    <Users className="h-4 w-4" />
                    Residents (Portal)
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Apply for clearances</li>
                    <li>• View personal records</li>
                    {/* <li>• Make payments</li> */}
                    <li>• Track applications</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Start Guide */}
            {showQuickGuide && (
              <div className="rounded-lg border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <BookOpen className="h-5 w-5" />
                  Quick Start Guide
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                      <h4 className="mb-1 font-medium text-gray-800 dark:text-gray-300">First-Time Setup</h4>
                      <ol className="ml-4 list-decimal space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>Complete your staff profile</li>
                        <li>Set up your security preferences</li>
                        <li>Review barangay fees and rates</li>
                        <li>Test the system with sample data</li>
                      </ol>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                      <h4 className="mb-1 font-medium text-gray-800 dark:text-gray-300">Daily Tasks</h4>
                      <ul className="ml-4 list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <li>Check pending clearances</li>
                        <li>Process resident applications</li>
                        <li>Record daily collections</li>
                        <li>Update resident records</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                      <h4 className="mb-1 font-medium text-blue-800 dark:text-blue-400">Best Practices</h4>
                      <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          <span>Always verify resident identity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          <span>Keep digital records updated daily</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          <span>Backup system data regularly</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                          <span>Log out when not using system</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">F1</kbd>
                    <span className="font-medium text-gray-900 dark:text-white">Help</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Open this guide</div>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">Ctrl</kbd>
                    <span className="font-medium">+</span>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">K</kbd>
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Command palette</div>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">Ctrl</kbd>
                    <span className="font-medium">+</span>
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">N</kbd>
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">New record</div>
                </div>
                <div className="rounded-lg bg-white p-3 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <kbd className="rounded bg-gray-100 px-2 py-1 font-mono text-xs dark:bg-gray-700">Esc</kbd>
                    <span className="font-medium text-gray-900 dark:text-white">Close</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Close modals/panels</div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    };

    return modules[module] || modules.general;
  };

  const moduleContent = getModuleContent();
  const modalTitle = title || moduleContent.title;

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all dark:bg-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sidebar-border/70 bg-white px-6 py-4 dark:border-sidebar-border dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {modalTitle}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Barangay Kibawe Management System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label="Close help guide"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {customContent ? customContent : moduleContent.content}

            {/* Additional Resources Section */}
            <div className="mt-8 border-t border-sidebar-border/70 pt-6 dark:border-sidebar-border">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                <FileText className="h-5 w-5" />
                Additional Resources
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                <a
                  href="/user-guide.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 rounded-lg border border-sidebar-border/70 p-3 hover:border-blue-500 hover:bg-blue-50 dark:border-sidebar-border dark:hover:bg-blue-900/20"
                >
                  <div className="rounded-lg bg-blue-100 p-2 group-hover:bg-blue-200 dark:bg-blue-900/30 dark:group-hover:bg-blue-900/40">
                    <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Complete User Guide</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">PDF Manual (50 pages)</div>
                  </div>
                </a>
                <a
                  href="/training-videos"
                  className="group flex items-center gap-3 rounded-lg border border-sidebar-border/70 p-3 hover:border-purple-500 hover:bg-purple-50 dark:border-sidebar-border dark:hover:bg-purple-900/20"
                >
                  <div className="rounded-lg bg-purple-100 p-2 group-hover:bg-purple-200 dark:bg-purple-900/30 dark:group-hover:bg-purple-900/40">
                    <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Video Tutorials</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Step-by-step guides</div>
                  </div>
                </a>
                <a
                  href="/faq"
                  className="group flex items-center gap-3 rounded-lg border border-sidebar-border/70 p-3 hover:border-emerald-500 hover:bg-emerald-50 dark:border-sidebar-border dark:hover:bg-emerald-900/20"
                >
                  <div className="rounded-lg bg-emerald-100 p-2 group-hover:bg-emerald-200 dark:bg-emerald-900/30 dark:group-hover:bg-emerald-900/40">
                    <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">FAQ & Troubleshooting</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Common questions</div>
                  </div>
                </a>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <h4 className="mb-3 font-medium text-gray-900 dark:text-white">Need Assistance?</h4>
              <div className="grid gap-4 text-sm md:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-300">
                    <Phone className="h-4 w-4" />
                    Contact Support
                  </div>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div>Barangay IT Officer: (02) 1234-5678</div>
                    <div>Emergency Hotline: 911</div>
                    <div>Mobile: 0917-XXX-XXXX</div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-2 font-medium text-gray-800 dark:text-gray-300">
                    <Mail className="h-4 w-4" />
                    Email Support
                  </div>
                  <div className="space-y-1 text-gray-600 dark:text-gray-400">
                    <div>Technical: support@barangaykibawe.gov.ph</div>
                    <div>Administrative: admin@barangaykibawe.gov.ph</div>
                    <div>Clearance: clearance@barangaykibawe.gov.ph</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-sidebar-border/70 bg-gray-50 px-6 py-4 dark:border-sidebar-border dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Eye className="h-4 w-4" />
                <span>Press <kbd className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-700">ESC</kbd> to close</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Close Guide
                </button>
                <button
                  onClick={() => window.open('/admin/instructions', '_blank')}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Open Full Manual
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing icon components
const Activity = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const DollarSign = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Receipt = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default InstructionsModal;
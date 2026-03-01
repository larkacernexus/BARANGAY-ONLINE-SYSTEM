// resources/js/Pages/HouseholdInstructions.tsx
import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/resident-app-layout';
import {
  BookOpen,
  HelpCircle,
  Video,
  FileText,
  Download,
  Search,
  Printer,
  Share2,
  Eye,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Users,
  Home,
  CreditCard,
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
  Shield,
  AlertTriangle,
  Menu,
  X,
  Star,
  TrendingUp,
  Activity,
  DollarSign,
  Receipt,
  Briefcase,
  Building,
  User,
  Upload,
  Download as DownloadIcon,
  Copy,
  Check,
  Layers,
  Grid,
  List,
  Zap,
  Trash2,
  Leaf,
  Sun,
  Moon,
  Globe2,
  Map,
  Flag,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Divide,
  Percent,
  Award,
  Gift,
  Package,
  Box,
  Archive,
  Folder,
  FolderOpen,
  FolderTree,
  File,
  FilePlus,
  FileEdit,
  FileMinus,
  FileCheck,
  FileX,
  FileSearch,
  FileWarning,
  FileQuestion,
  FileSignature,
  FileSpreadsheet,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  Sparkles,
  Users2,
  Building2,
  Key,
  Link2,
  TreePine,
  Droplet,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  content: React.ReactNode;
}

// Additional icon components
const Rocket = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const Navigation = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const Move = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
  </svg>
);

const Table = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const Signature = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
  </svg>
);

const QrCode = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const Target = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

// Simple PDF icon as a React component
const PdfIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="4" y="2" width="16" height="20" rx="2" fill="#fff" stroke="#ef4444" strokeWidth="2"/>
    <path d="M8 16v-4m0 0h1.5a1.5 1.5 0 010 3H8m4-3v4m0 0h1.5a1.5 1.5 0 000-3H12m4 0v4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HouseholdInstructions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [activeTab, setActiveTab] = useState<'guide' | 'videos' | 'faq' | 'shortcuts'>('guide');
  const [copied, setCopied] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when section changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [selectedSection, isMobile]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Helper function for className merging
  const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  // Sections data (keep all your existing sections - I'll keep them as is)
  const sections: Section[] = [
    {
      id: 'overview',
      title: 'Household Management Overview',
      icon: Home,
      description: 'Complete guide to managing households in the barangay',
      content: (
        <div className="space-y-4 sm:space-y-6">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 sm:p-8 text-white">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10"></div>
            <h2 className="relative text-lg sm:text-2xl font-bold">Household Management System</h2>
            <p className="relative mt-2 text-xs sm:text-sm text-emerald-100">
              Efficiently manage and track all households in Barangay Kibawe
            </p>
            <div className="relative mt-3 sm:mt-4 flex flex-wrap gap-3 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Version 2.0</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm">Last Updated: March 2024</span>
              </div>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {[
              { icon: Home, value: '1,245', label: 'Total Households', color: 'emerald' },
              { icon: Users, value: '5,234', label: 'Total Residents', color: 'blue' },
              { icon: Users2, value: '4.2', label: 'Avg. Household Size', color: 'purple' },
              { icon: Building2, value: '7', label: 'Puroks', color: 'amber' },
            ].map((stat, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-white p-2 sm:p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3">
                  <div className={`rounded-lg bg-${stat.color}-100 p-1.5 sm:p-2 dark:bg-${stat.color}-900/30`}>
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{stat.value}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg bg-emerald-50 p-4 sm:p-6 dark:bg-emerald-900/20">
            <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-300">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <Link
                href="/admin/households/create"
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-white p-2 sm:p-3 text-xs sm:text-sm text-emerald-700 hover:bg-emerald-100 dark:bg-gray-800 dark:text-emerald-400 dark:hover:bg-gray-700"
              >
                <Home className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Add Household</span>
              </Link>
              <Link
                href="/admin/households?filter=pending"
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-white p-2 sm:p-3 text-xs sm:text-sm text-amber-700 hover:bg-amber-100 dark:bg-gray-800 dark:text-amber-400 dark:hover:bg-gray-700"
              >
                <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Pending</span>
              </Link>
              <Link
                href="/admin/reports/households"
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-white p-2 sm:p-3 text-xs sm:text-sm text-purple-700 hover:bg-purple-100 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-gray-700"
              >
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Reports</span>
              </Link>
              <Link
                href="/admin/households/export"
                className="flex items-center gap-1 sm:gap-2 rounded-lg bg-white p-2 sm:p-3 text-xs sm:text-sm text-blue-700 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">Export</span>
              </Link>
            </div>
          </div>

          {/* Important Information */}
          <div className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
            <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              <Info className="h-4 w-4 sm:h-5 sm:w-5" />
              Important Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="mb-2 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-300">Household Data Includes</h4>
                <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-1 sm:gap-2">
                    <CheckCircle className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-500" />
                    <span>Household head information</span>
                  </li>
                  <li className="flex items-start gap-1 sm:gap-2">
                    <CheckCircle className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-500" />
                    <span>Complete address and purok</span>
                  </li>
                  <li className="flex items-start gap-1 sm:gap-2">
                    <CheckCircle className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-500" />
                    <span>List of all household members</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-300">Benefits</h4>
                <ul className="space-y-1 sm:space-y-2 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-1 sm:gap-2">
                    <TrendingUp className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500" />
                    <span>Accurate population tracking</span>
                  </li>
                  <li className="flex items-start gap-1 sm:gap-2">
                    <TrendingUp className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-blue-500" />
                    <span>Efficient service delivery</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Getting Started with Households',
      icon: Rocket,
      description: 'First-time setup and basic household management',
      content: (
        <div className="space-y-4 sm:space-y-6">
          {/* Welcome Steps */}
          <div className="relative">
            <div className="absolute left-4 sm:left-8 top-0 h-full w-0.5 bg-emerald-200 dark:bg-emerald-800"></div>
            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  step: 1,
                  title: 'Access Household Module',
                  description: 'Navigate to the Households section',
                  details: [
                    'From the main dashboard, click on "Households" in the sidebar',
                    'You can also use quick access from the Residents dropdown',
                    'Bookmark the page for faster access'
                  ]
                },
                {
                  step: 2,
                  title: 'Review Existing Households',
                  description: 'Familiarize yourself with current data',
                  details: [
                    'Browse through the list of registered households',
                    'Check household compositions and details',
                    'Verify purok distribution and statistics'
                  ]
                },
                {
                  step: 3,
                  title: 'Set Up Household Categories',
                  description: 'Configure household classifications',
                  details: [
                    'Define tenure types (Owned, Rented, Shared)',
                    'Set up household types (Single Family, Extended Family, etc.)',
                    'Configure priority indicators for programs'
                  ]
                },
                {
                  step: 4,
                  title: 'Train Staff',
                  description: 'Ensure your team knows how to manage households',
                  details: [
                    'Schedule training on data entry procedures',
                    'Review data validation rules',
                    'Practice adding and updating household records',
                    'Understand reporting features'
                  ]
                }
              ].map((item) => (
                <div key={item.step} className="relative flex gap-3 sm:gap-4 pl-6 sm:pl-8">
                  <div className="absolute left-0 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-600 text-xs sm:text-sm text-white">
                    {item.step}
                  </div>
                  <div className="flex-1 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                    <ul className="mt-2 sm:mt-3 space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {item.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-1 sm:gap-2">
                          <CheckCircle className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-green-500" />
                          <span className="text-xs sm:text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'adding-households',
      title: 'Adding Households',
      icon: Home,
      description: 'Step-by-step guide to registering new households',
      content: (
        <div className="space-y-4 sm:space-y-6">
          {/* Registration Process */}
          <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:p-6 dark:from-emerald-900/20 dark:to-teal-900/20">
            <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-300">
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
              New Household Registration
            </h3>
            
            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  step: 'Basic Information',
                  fields: [
                    'Household Number (auto-generated)',
                    'Household Name',
                    'Household Type',
                    'Tenure Status',
                    'Year Established'
                  ],
                  icon: Home
                },
                {
                  step: 'Location Details',
                  fields: [
                    'Purok/Zone',
                    'Street/Sitio',
                    'House/Lot Number',
                    'Landmark',
                    'GPS Coordinates'
                  ],
                  icon: MapPin
                },
                {
                  step: 'Household Head',
                  fields: [
                    'Select from existing residents',
                    'Relationship to household',
                    'Primary contact number',
                    'Occupation'
                  ],
                  icon: User
                },
                {
                  step: 'Contact Information',
                  fields: [
                    'Primary phone number',
                    'Secondary phone number',
                    'Email address',
                    'Emergency contact'
                  ],
                  icon: Phone
                },
                {
                  step: 'Household Members',
                  fields: [
                    'Add existing residents',
                    'Register new residents',
                    'Specify relationship',
                    'Set dependent status'
                  ],
                  icon: Users
                },
                {
                  step: 'Additional Information',
                  fields: [
                    'Economic classification',
                    '4Ps beneficiary',
                    'Senior count',
                    'PWD count',
                    'Solo parent count'
                  ],
                  icon: FileText
                }
              ].map((section, idx) => (
                <div key={idx} className="rounded-lg bg-white p-3 sm:p-4 dark:bg-gray-800">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <section.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Step {idx + 1}: {section.step}</h4>
                      <div className="mt-1 sm:mt-2 flex flex-wrap gap-1 sm:gap-2">
                        {section.fields.slice(0, isMobile ? 2 : section.fields.length).map((field, fieldIdx) => (
                          <span key={fieldIdx} className="rounded-full bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 text-[8px] sm:text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {field}
                          </span>
                        ))}
                        {isMobile && section.fields.length > 2 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[8px] text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            +{section.fields.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notes - Mobile Optimized */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 sm:p-4 dark:border-amber-800 dark:bg-amber-900/20">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-400">Important Notes</h4>
                <ul className="mt-1 sm:mt-2 space-y-1 text-[10px] sm:text-xs text-amber-700 dark:text-amber-300">
                  <li>• Household numbers are auto-generated</li>
                  <li>• Must have a household head</li>
                  <li>• Verify all information before saving</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'managing-members',
      title: 'Managing Household Members',
      icon: Users,
      description: 'How to add, edit, and manage household members',
      content: (
        <div className="space-y-4 sm:space-y-6">
          {/* Member Management Overview */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-300">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Household Member Management
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="rounded-lg bg-white p-3 sm:p-4 dark:bg-gray-800">
                <UserPlus className="mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <h4 className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-400">Add Members</h4>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  Add existing residents or register new ones
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 sm:p-4 dark:bg-gray-800">
                <UserCheck className="mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <h4 className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-400">Update Roles</h4>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  Change relationships and member status
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 sm:p-4 dark:bg-gray-800">
                <User className="mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <h4 className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-400">Member Profiles</h4>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  View detailed member information
                </p>
              </div>
            </div>
          </div>

          {/* Member Roles Table - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-3 sm:p-4 dark:bg-gray-800/50">
              <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Member Roles</h4>
              <div className="space-y-1 sm:space-y-2">
                {[
                  { role: 'Household Head', badge: 'Primary', color: 'blue' },
                  { role: 'Spouse', badge: 'Secondary', color: 'green' },
                  { role: 'Child', badge: 'Dependent', color: 'purple' },
                  { role: 'Parent', badge: 'Senior', color: 'amber' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-1.5 sm:p-2 text-xs sm:text-sm dark:bg-gray-800">
                    <span>{item.role}</span>
                    <span className={`rounded-full bg-${item.color}-100 px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-xs text-${item.color}-800 dark:bg-${item.color}-900/40 dark:text-${item.color}-300`}>
                      {item.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3 sm:p-4 dark:bg-gray-800/50">
              <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Special Categories</h4>
              <div className="space-y-1 sm:space-y-2">
                {[
                  { category: 'Senior Citizen', desc: '60+ years' },
                  { category: 'PWD', desc: 'With disability' },
                  { category: 'Solo Parent', desc: 'Single parent' },
                  { category: '4Ps', desc: 'Beneficiary' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-1.5 sm:p-2 text-xs sm:text-sm dark:bg-gray-800">
                    <span>{item.category}</span>
                    <span className="text-[8px] sm:text-xs text-gray-500">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'household-categories',
      title: 'Household Categories & Types',
      icon: Layers,
      description: 'Understanding household classifications',
      content: (
        <div className="space-y-4 sm:space-y-6">
          {/* Household Types */}
          <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 dark:from-purple-900/20 dark:to-pink-900/20">
            <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-300">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
              Household Types
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="rounded-lg bg-white p-3 sm:p-4 dark:bg-gray-800">
                <Home className="mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <h4 className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-400">Single Family</h4>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  Nuclear family with parents and children
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 sm:p-4 dark:bg-gray-800">
                <Users className="mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <h4 className="text-xs sm:text-sm font-medium text-green-800 dark:text-green-400">Extended Family</h4>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  Multiple generations living together
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 sm:p-4 dark:bg-gray-800">
                <Users2 className="mb-1 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <h4 className="text-xs sm:text-sm font-medium text-purple-800 dark:text-purple-400">Multi-family</h4>
                <p className="mt-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  Multiple families sharing one household
                </p>
              </div>
            </div>
          </div>

          {/* Tenure Status - Mobile Optimized */}
          <div className="rounded-lg border border-gray-200 p-4 sm:p-6 dark:border-gray-700">
            <h3 className="mb-3 sm:mb-4 text-sm sm:text-lg font-semibold text-gray-900 dark:text-white">Tenure Status</h3>
            
            <div className="space-y-2 sm:space-y-4">
              {[
                { icon: CheckCircle, title: 'Owned', desc: 'Owns the property', color: 'emerald' },
                { icon: Home, title: 'Rented', desc: 'Pays rent to owner', color: 'blue' },
                { icon: Users, title: 'Shared', desc: 'Living with relatives', color: 'purple' },
                { icon: AlertCircle, title: 'Informal Settler', desc: 'No legal claim', color: 'amber' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 sm:gap-3">
                  <div className={`rounded-full bg-${item.color}-100 p-1.5 sm:p-2 dark:bg-${item.color}-900/30`}>
                    <item.icon className={`h-3 w-3 sm:h-4 sm:w-4 text-${item.color}-600 dark:text-${item.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'reports-analytics',
      title: 'Reports & Analytics',
      icon: BarChart3,
      description: 'Generate and analyze household reports',
      content: (
        <div className="space-y-4 sm:space-y-6">
          {/* Available Reports */}
          <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 sm:p-6 dark:from-indigo-900/20 dark:to-indigo-800/20">
            <h3 className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-base sm:text-lg font-semibold text-indigo-900 dark:text-indigo-300">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Household Reports
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              {[
                { title: 'Population Summary', icon: Users },
                { title: 'Household Distribution', icon: PieChart },
                { title: 'Demographic Profile', icon: Activity },
                { title: 'Economic Report', icon: DollarSign },
                { title: 'Social Services', icon: Award },
                { title: 'Housing Report', icon: Home },
              ].map((report, idx) => {
                const Icon = report.icon;
                return (
                  <div key={idx} className="rounded-lg bg-white p-2 sm:p-3 dark:bg-gray-800">
                    <Icon className="mb-1 h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                    <h4 className="text-[10px] sm:text-xs font-medium text-indigo-800 dark:text-indigo-400">{report.title}</h4>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sample Data - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
              <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Households by Purok</h4>
              <div className="space-y-1 sm:space-y-2">
                {[
                  { name: 'Purok 1', count: 245, percent: 35 },
                  { name: 'Purok 2', count: 189, percent: 27 },
                  { name: 'Purok 3', count: 312, percent: 45 },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 sm:h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className={`h-1.5 sm:h-2 w-[${item.percent}%] rounded-full bg-${idx === 0 ? 'blue' : idx === 1 ? 'green' : 'purple'}-500`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
              <h4 className="mb-2 sm:mb-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Household Types</h4>
              <div className="space-y-2">
                {[
                  { type: 'Single Family', percent: 58 },
                  { type: 'Extended Family', percent: 32 },
                  { type: 'Multi-family', percent: 10 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-${idx === 0 ? 'blue' : idx === 1 ? 'green' : 'purple'}-500`}></div>
                      <span className="text-[10px] sm:text-xs">{item.type}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Options - Mobile Optimized */}
          <div className="rounded-lg bg-gray-50 p-3 sm:p-4 dark:bg-gray-800/50">
            <h4 className="mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              Export Options
            </h4>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
              <button className="flex items-center justify-center gap-1 rounded-lg bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                <PdfIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                PDF
              </button>
              <button className="flex items-center justify-center gap-1 rounded-lg bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                Excel
              </button>
              <button className="flex items-center justify-center gap-1 rounded-lg bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                <Printer className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                Print
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: Award,
      description: 'Tips for effective household management',
      content: (
        <div className="space-y-4 sm:space-y-6">
          {/* Best Practices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { title: 'Data Accuracy', icon: CheckCircle, color: 'blue', items: ['Verify with documents', 'Regular visits', 'Double-check names'] },
              { title: 'Regular Updates', icon: RefreshCw, color: 'green', items: ['Quarterly updates', 'Track changes', 'Monitor births/deaths'] },
              { title: 'Data Privacy', icon: Shield, color: 'purple', items: ['Limit access', 'Get consent', 'Follow guidelines'] },
              { title: 'Community Engagement', icon: Users, color: 'amber', items: ['Involve purok leaders', 'Share statistics', 'Gather feedback'] },
            ].map((practice, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
                <div className="mb-2 flex items-center gap-1 sm:gap-2">
                  <div className={`rounded-full bg-${practice.color}-100 p-1.5 sm:p-2 dark:bg-${practice.color}-900/30`}>
                    <practice.icon className={`h-3 w-3 sm:h-4 sm:w-4 text-${practice.color}-600 dark:text-${practice.color}-400`} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">{practice.title}</h4>
                </div>
                <ul className="space-y-1 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                  {practice.items.map((item, itemIdx) => (
                    <li key={itemIdx}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Common Mistakes - Mobile Optimized */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4 dark:border-red-800 dark:bg-red-900/20">
            <h4 className="mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-red-800 dark:text-red-400">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              Common Mistakes
            </h4>
            <div className="grid grid-cols-1 gap-1 text-[10px] sm:text-xs text-red-700 dark:text-red-300">
              <div className="flex items-start gap-1 sm:gap-2">
                <X className="mt-0.5 h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                <span>Duplicate household entries</span>
              </div>
              <div className="flex items-start gap-1 sm:gap-2">
                <X className="mt-0.5 h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                <span>Missing household head</span>
              </div>
              <div className="flex items-start gap-1 sm:gap-2">
                <X className="mt-0.5 h-2 w-2 sm:h-3 sm:w-3 flex-shrink-0" />
                <span>Incorrect purok assignments</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  // Video tutorials
  const videoTutorials = [
    {
      title: 'Household Management Basics',
      duration: '6:45',
      thumbnail: '/thumbnails/household-basics.jpg',
      views: '892'
    },
    {
      title: 'Adding and Managing Household Members',
      duration: '8:30',
      thumbnail: '/thumbnails/household-members.jpg',
      views: '654'
    },
    {
      title: 'Household Reports and Analytics',
      duration: '5:15',
      thumbnail: '/thumbnails/household-reports.jpg',
      views: '423'
    },
    {
      title: 'Best Practices for Household Data',
      duration: '7:20',
      thumbnail: '/thumbnails/household-best-practices.jpg',
      views: '567'
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: 'How do I transfer a resident to a different household?',
      answer: 'Go to the household page, click "Manage Members", find the resident, and use the "Transfer" option.'
    },
    {
      question: 'What happens when I delete a household?',
      answer: 'Households are soft-deleted by default. Members are unlinked but resident records remain.'
    },
    {
      question: 'Can a household have multiple heads?',
      answer: 'No, each household can only have one designated household head.'
    },
    {
      question: 'How do I handle households with changing members?',
      answer: 'Use the "Update Composition" feature to add or remove members.'
    },
    {
      question: 'What if a household head passes away?',
      answer: 'Update the record by removing the deceased as head and assigning a new head.'
    },
    {
      question: 'How do I generate a list of households by purok?',
      answer: 'Go to Reports → Household Reports → Household Distribution and select "By Purok" filter.'
    }
  ];

  // Keyboard shortcuts
  const shortcuts = [
    { key: 'Ctrl + H', description: 'Go to Households' },
    { key: 'Ctrl + N', description: 'Add household' },
    { key: 'Ctrl + M', description: 'Manage members' },
    { key: 'Ctrl + F', description: 'Search' },
    { key: 'Ctrl + E', description: 'Export' },
    { key: 'Ctrl + P', description: 'Print' },
    { key: 'Ctrl + R', description: 'Generate report' },
  ];

  const selectedContent = sections.find(s => s.id === selectedSection) || sections[0];

  // Helper function to get icon component
  const getIcon = (IconComponent: LucideIcon) => {
    return <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />;
  };

  return (
    <>
      <Head title="Household Management Instructions - Barangay Kibawe" />
      
      <AppLayout>
        <div className="flex-1 space-y-3 sm:space-y-4 p-3 sm:p-4 pt-4 sm:pt-6 md:p-8">
          {/* Page Header - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Household Instructions
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Learn how to manage households effectively
              </p>
            </div>
            
            {/* Search - Mobile Optimized */}
            <div className="relative w-full sm:w-72 md:w-96">
              <Search className="absolute left-2 sm:left-3 top-1/2 h-3 w-3 sm:h-4 sm:w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-1.5 sm:py-2 pl-7 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Tab Navigation - Scrollable on Mobile */}
          <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 min-w-max px-1">
              {[
                { id: 'guide', label: 'Guide', icon: BookOpen },
                { id: 'videos', label: 'Videos', icon: Video },
                { id: 'faq', label: 'FAQ', icon: HelpCircle },
                { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex items-center gap-1 sm:gap-2 border-b-2 px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors',
                      isActive
                        ? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                    )}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="mt-4 sm:mt-6">
            {activeTab === 'guide' && (
              <>
                {/* Mobile Menu Toggle */}
                {isMobile && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="mb-3 flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {selectedContent.title}
                    </span>
                    {isMobileMenuOpen ? (
                      <X className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Menu className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Sidebar Navigation - Mobile Drawer */}
                  <div className={cn(
                    "md:col-span-3",
                    isMobile && !isMobileMenuOpen && "hidden",
                    isMobile && "fixed inset-0 z-50 bg-black/50",
                  )}>
                    <div className={cn(
                      "md:sticky md:top-20 rounded-lg border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800",
                      isMobile && "absolute top-0 left-0 h-full w-64 overflow-y-auto rounded-none"
                    )}>
                      {isMobile && (
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Sections
                          </h3>
                          <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                      <h3 className="mb-3 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white hidden md:block">
                        Household Guide Sections
                      </h3>
                      <nav className="space-y-1">
                        {sections.map((section) => {
                          const isSelected = selectedSection === section.id;
                          return (
                            <button
                              key={section.id}
                              onClick={() => setSelectedSection(section.id)}
                              className={cn(
                                'flex w-full items-start gap-2 sm:gap-3 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs transition-colors',
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                              )}
                            >
                              <div className={cn(
                                'mt-0.5 rounded p-1',
                                isSelected
                                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-400'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                              )}>
                                {getIcon(section.icon)}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium truncate">{section.title}</div>
                                {!isMobile && (
                                  <div className="mt-0.5 text-[8px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {section.description}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </nav>

                      {/* Download Resources - Hide on mobile menu */}
                      {!isMobile && (
                        <div className="mt-6 rounded-lg bg-gray-50 p-3 sm:p-4 dark:bg-gray-700/50">
                          <h4 className="mb-2 sm:mb-3 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            Resources
                          </h4>
                          <div className="space-y-1 sm:space-y-2">
                            <a
                              href="#"
                              className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                            >
                              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                              Household Manual
                            </a>
                            <a
                              href="#"
                              className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                            >
                              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                              Excel Template
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className={cn(
                    "md:col-span-9",
                    isMobile && isMobileMenuOpen && "hidden"
                  )}>
                    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
                      {/* Breadcrumb - Simplified on Mobile */}
                      <nav className="mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs flex-wrap">
                        <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                          Home
                        </Link>
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        <Link href="/admin/households" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                          Households
                        </Link>
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                          {selectedContent.title}
                        </span>
                      </nav>

                      {/* Section Header - Mobile Optimized */}
                      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="rounded-lg bg-emerald-100 p-2 sm:p-3 dark:bg-emerald-900/30">
                            {getIcon(selectedContent.icon)}
                          </div>
                          <div>
                            <h2 className="text-sm sm:text-base md:text-2xl font-bold text-gray-900 dark:text-white">
                              {selectedContent.title}
                            </h2>
                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                              {selectedContent.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Action Buttons - Stack on Mobile */}
                        <div className="flex gap-1 sm:gap-2">
                          <button className="rounded-lg border border-gray-300 p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                            <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button className="rounded-lg border border-gray-300 p-1.5 sm:p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button className="rounded-lg bg-emerald-600 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                            <Download className="mr-1 inline h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Download</span>
                          </button>
                        </div>
                      </div>

                      {/* Section Content */}
                      <div className="prose prose-xs sm:prose-sm max-w-none dark:prose-invert">
                        {selectedContent.content}
                      </div>

                      {/* Previous/Next Navigation - Simplified on Mobile */}
                      <div className="mt-6 sm:mt-8 flex items-center justify-between border-t border-gray-200 pt-4 sm:pt-6 dark:border-gray-700">
                        <button
                          onClick={() => {
                            const currentIndex = sections.findIndex(s => s.id === selectedSection);
                            if (currentIndex > 0) {
                              setSelectedSection(sections[currentIndex - 1].id);
                            }
                          }}
                          className="flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </button>
                        <button
                          onClick={() => {
                            const currentIndex = sections.findIndex(s => s.id === selectedSection);
                            if (currentIndex < sections.length - 1) {
                              setSelectedSection(sections[currentIndex + 1].id);
                            }
                          }}
                          className="flex items-center gap-1 sm:gap-2 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Video Tutorials</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                  {videoTutorials.map((video, idx) => (
                    <div key={idx} className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-3 sm:p-4 transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <div className="relative mb-2 sm:mb-3 aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black/50 p-2 sm:p-3 text-white group-hover:bg-black/70">
                            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                        </div>
                        <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 rounded bg-black/70 px-1 sm:px-2 py-0.5 text-[8px] sm:text-xs text-white">
                          {video.duration}
                        </div>
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{video.title}</h3>
                      <div className="mt-1 flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <Eye className="h-2 w-2 sm:h-3 sm:w-3" />
                        <span>{video.views} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2 sm:space-y-4">
                  {faqItems.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <button
                        onClick={() => toggleSection(`faq-${idx}`)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white pr-2">
                          {faq.question}
                        </h3>
                        {expandedSections.includes(`faq-${idx}`) ? (
                          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-gray-500" />
                        )}
                      </button>
                      {expandedSections.includes(`faq-${idx}`) && (
                        <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{faq.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-2 sm:p-3 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                      <kbd className="rounded bg-gray-100 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[8px] sm:text-xs font-mono font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
                
                <div className="rounded-lg bg-emerald-50 p-3 sm:p-4 dark:bg-emerald-900/20">
                  <h3 className="mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-400">
                    <Keyboard className="h-3 w-3 sm:h-4 sm:w-4" />
                    Pro Tip
                  </h3>
                  <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400">
                    Press <kbd className="rounded bg-emerald-200 px-1 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-xs font-mono dark:bg-emerald-800">Ctrl + /</kbd> to see all shortcuts
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default HouseholdInstructions;
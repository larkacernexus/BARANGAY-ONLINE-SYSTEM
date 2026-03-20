// resources/js/Components/InstructionsModal/HouseholdInstructions.tsx
import React, { useEffect, useState, useRef } from 'react';
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
  Building2,
  Key,
  UserCog,
  UserMinus,
  UserX,
  ClipboardList,
  ClipboardCheck,
  FolderTree,
  RefreshCw,
  Save,
  Upload,
  Download as DownloadIcon,
  Printer as PrinterIcon,
  Hash,
  Fingerprint,
  QrCode,
  Stamp,
  ScrollText,
  FileCheck,
  FileWarning,
  FilePlus,
  FileEdit,
  FileSpreadsheet,
  FileArchive,
  FileSearch,
  FileQuestion,
  FileSignature,
  FileOutput,
  FileInput,
  FileCog,
  FileUp,
  FileDown,
  FileLock,
  FileKey,
  FileBadge,
  FileClock,
  FileCheck2,
  FileX,
  FileMinus,
  FilePlus2,
  FileStack,
  FileDigit,
  FileCode,
  FileType,
  Menu,
  Star,
  Award,
  TrendingUp,
  Activity,
  DollarSign,
  Receipt,
  Briefcase,
  Building,
  User,
  Layers,
  Grid,
  List,
  Zap,
  Trash2,
  Sun,
  Moon,
  Globe2,
  Map,
  Flag,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Divide,
  Percent,
  Gift,
  Package,
  Box,
  Archive,
  Folder,
  FolderOpen,
  Sparkles,
  Users2,
  Link2,
  TreePine,
  Droplet,
  RefreshCw as RefreshCwIcon,
  type LucideIcon
} from 'lucide-react';

interface HouseholdInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  customContent?: React.ReactNode;
  showQuickGuide?: boolean;
  initialSection?: string;
}

interface Section {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const HouseholdInstructions: React.FC<HouseholdInstructionsProps> = ({
  isOpen,
  onClose,
  title,
  customContent,
  showQuickGuide = true,
  initialSection = 'overview'
}) => {
  const [activeSection, setActiveSection] = useState<string>(initialSection);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([0]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
        setScrollProgress(progress);
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Close mobile menu when section changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [activeSection, isMobile]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalTitle = title || 'Household Account Management';

  // Helper function for className merging
  const cn = (...classes: (string | boolean | undefined)[]) => {
    return classes.filter(Boolean).join(' ');
  };

  // Toggle FAQ expansion
  const toggleFaq = (index: number) => {
    setExpandedFaqs(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  // Sections for mobile menu
  const sections: Section[] = [
    { id: 'overview', label: 'Overview', icon: Building2, color: 'emerald' },
    { id: 'creation', label: 'Creating Households', icon: Home, color: 'blue' },
    { id: 'management', label: 'Managing Accounts', icon: UserCog, color: 'purple' },
    { id: 'financial', label: 'Financial', icon: CreditCard, color: 'amber' },
    { id: 'documents', label: 'Documents', icon: FileText, color: 'indigo' },
    { id: 'advanced', label: 'Advanced', icon: Settings, color: 'slate' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, color: 'rose' },
  ];

  const getSectionColor = (sectionId: string) => {
    return sections.find(s => s.id === sectionId)?.color || 'emerald';
  };

  const activeColor = getSectionColor(activeSection);

  // Quick stats data
  const quickStats = [
    { label: 'Total Households', value: '1,234', icon: Users, change: '+12', color: 'emerald' },
    { label: 'Active', value: '1,180', icon: UserCheck, change: '95.6%', color: 'blue' },
    { label: 'Avg Size', value: '4.2', icon: Users2, change: '+0.3', color: 'purple' },
    { label: 'With Dues', value: '78', icon: CreditCard, change: '6.3%', color: 'amber' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-hidden">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal - Full screen on mobile, centered on desktop */}
      <div className={cn(
        "fixed inset-0 flex items-center justify-center",
        isMobile ? "p-0" : "p-4"
      )}>
        <div className={cn(
          "relative flex flex-col bg-white shadow-2xl transition-all duration-300 dark:bg-gray-900",
          isMobile ? "h-full w-full rounded-none" : "h-[90vh] w-full max-w-6xl rounded-2xl"
        )}>
          {/* Progress bar */}
          <div 
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-150 z-30"
            style={{ width: `${scrollProgress}%` }}
          />

          {/* Header - Enhanced */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 sm:px-6 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile menu toggle with animation */}
              {isMobile ? (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className={cn(
                    "relative rounded-xl p-2 transition-all duration-200",
                    isMobileMenuOpen 
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-900"
                  )}
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              ) : (
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 shadow-lg shadow-emerald-500/20">
                  <Home className="h-5 w-5 text-white" />
                </div>
              )}
              
              <div className="min-w-0 flex-1">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-white sm:text-xl">
                  <span className="truncate">{modalTitle}</span>
                  {!isMobile && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      v2.0
                    </span>
                  )}
                </h2>
                {!isMobileMenuOpen && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Complete guide for managing household accounts
                  </p>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {!isMobile && (
                <>
                  <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300">
                    <Search className="h-5 w-5" />
                  </button>
                  <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300">
                    <Share2 className="h-5 w-5" />
                  </button>
                  <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />
                </>
              )}
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="relative flex flex-1 overflow-hidden">
            {/* Mobile Menu Drawer - Enhanced with animations */}
            {isMobile && (
              <div className={cn(
                "absolute inset-0 z-10 transform bg-white transition-transform duration-300 ease-in-out dark:bg-gray-900",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
              )}>
                <div className="h-full overflow-y-auto">
                  {/* Menu Header */}
                  <div className="sticky top-0 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Guide Sections</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sections.length} sections</p>
                  </div>

                  {/* Menu Items */}
                  <nav className="p-3">
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={cn(
                            'group relative mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all',
                            isActive
                              ? `bg-${section.color}-50 text-${section.color}-700 dark:bg-${section.color}-900/20 dark:text-${section.color}-400`
                              : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                          )}
                        >
                          {isActive && (
                            <div className={cn(
                              "absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full",
                              `bg-${section.color}-500`
                            )} />
                          )}
                          <div className={cn(
                            'rounded-lg p-2 transition-all',
                            isActive
                              ? `bg-${section.color}-100 text-${section.color}-600 dark:bg-${section.color}-800/30 dark:text-${section.color}-400`
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{section.label}</div>
                            <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                              {section.id === 'overview' && 'Statistics & overview'}
                              {section.id === 'creation' && 'Add new households'}
                              {section.id === 'management' && 'Update & maintain'}
                              {section.id === 'financial' && 'Billing & payments'}
                              {section.id === 'documents' && 'Certificates & forms'}
                              {section.id === 'advanced' && 'Advanced features'}
                              {section.id === 'faq' && 'Common questions'}
                            </div>
                          </div>
                          <ChevronRight className={cn(
                            'h-4 w-4 transition-transform',
                            isActive ? `text-${section.color}-500` : 'text-gray-400'
                          )} />
                        </button>
                      );
                    })}
                  </nav>

                  {/* Quick Actions in Menu */}
                  <div className="mt-4 border-t border-gray-200 px-4 py-4 dark:border-gray-800">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Quick Actions
                    </h4>
                    <div className="space-y-2">
                      <button className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-3 text-sm text-emerald-700 transition-all hover:shadow-md dark:from-emerald-900/20 dark:to-teal-900/20 dark:text-emerald-400">
                        <Download className="h-5 w-5" />
                        <span className="font-medium">Download PDF Guide</span>
                      </button>
                      <button className="flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 text-sm text-purple-700 transition-all hover:shadow-md dark:from-purple-900/20 dark:to-pink-900/20 dark:text-purple-400">
                        <Video className="h-5 w-5" />
                        <span className="font-medium">Watch Video Tutorials</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content - Enhanced scrolling */}
            <div 
              ref={contentRef}
              className={cn(
                "flex-1 overflow-y-auto transition-opacity duration-300",
                isMobile && isMobileMenuOpen ? "opacity-0" : "opacity-100"
              )}
            >
              <div className="p-4 sm:p-6 lg:p-8">
                {customContent ? customContent : (
                  <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                    {/* Welcome Banner - Enhanced */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white shadow-xl sm:p-8">
                      <div className="absolute right-0 top-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10"></div>
                      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-white/20 p-2 backdrop-blur-sm">
                            <Sparkles className="h-6 w-6" />
                          </div>
                          <h2 className="text-xl font-bold sm:text-2xl">Household Management System</h2>
                        </div>
                        <p className="mt-2 text-sm text-emerald-100 sm:text-base">
                          Efficiently manage and track all households in Barangay Kibawe
                        </p>
                        <div className="mt-4 flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur-sm sm:text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>Version 2.0</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur-sm sm:text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>Updated March 2024</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats - Enhanced with animations */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                      {quickStats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                          <div
                            key={idx}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                          >
                            <div className={cn(
                              "absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full opacity-10 transition-transform group-hover:scale-150",
                              `bg-${stat.color}-500`
                            )} />
                            <div className="relative">
                              <div className={cn(
                                "mb-2 inline-flex rounded-lg p-2",
                                `bg-${stat.color}-100 dark:bg-${stat.color}-900/30`
                              )}>
                                <Icon className={cn(
                                  "h-4 w-4 sm:h-5 sm:w-5",
                                  `text-${stat.color}-600 dark:text-${stat.color}-400`
                                )} />
                              </div>
                              <div className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                                {stat.value}
                              </div>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</span>
                                <span className={cn(
                                  "text-xs font-medium",
                                  stat.change.startsWith('+') ? 'text-green-600' : 'text-amber-600'
                                )}>
                                  {stat.change}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Main Feature Cards - Enhanced */}
                    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                      {/* Creation Card */}
                      <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 transition-transform group-hover:scale-150" />
                        <div className="relative">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 text-white shadow-lg shadow-blue-500/20">
                              <Home className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Creating Households</h3>
                          </div>
                          <div className="space-y-3">
                            {[
                              { step: 1, text: 'Navigate to Households module' },
                              { step: 2, text: 'Click "Add New Household"' },
                              { step: 3, text: 'Fill required information' },
                              { step: 4, text: 'Assign residents' },
                              { step: 5, text: 'Save to generate ID & QR' },
                            ].map((item) => (
                              <div key={item.step} className="flex items-center gap-3">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                  {item.step}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Management Card */}
                      <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10 transition-transform group-hover:scale-150" />
                        <div className="relative">
                          <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 text-white shadow-lg shadow-purple-500/20">
                              <UserCog className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Managing Accounts</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { icon: UserCheck, text: 'Update Info', color: 'blue' },
                              { icon: UserPlus, text: 'Add Members', color: 'green' },
                              { icon: UserMinus, text: 'Remove', color: 'red' },
                              { icon: RefreshCwIcon, text: 'Transfer', color: 'purple' },
                            ].map((item, idx) => {
                              const Icon = item.icon;
                              return (
                                <div key={idx} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-900">
                                  <Icon className={`h-4 w-4 text-${item.color}-500`} />
                                  <span className="text-xs text-gray-600 dark:text-gray-400">{item.text}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documents Section - Enhanced */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-2.5 text-white shadow-lg shadow-indigo-500/20">
                          <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents & Certificates</h3>
                      </div>
                      
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          { icon: FileCheck, title: 'Certificate of Residency', desc: 'With QR code & official seal', color: 'emerald' },
                          { icon: FileText, title: 'Household Profile', desc: 'Export to PDF/Excel', color: 'blue' },
                          { icon: FileWarning, title: 'Clearance History', desc: 'Complete audit trail', color: 'amber' },
                        ].map((doc, idx) => {
                          const Icon = doc.icon;
                          return (
                            <div key={idx} className="group relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
                              <div className={`absolute right-0 top-0 h-16 w-16 translate-x-4 -translate-y-4 rounded-full bg-${doc.color}-500/10 transition-transform group-hover:scale-150`} />
                              <Icon className={`mb-3 h-6 w-6 text-${doc.color}-600 dark:text-${doc.color}-400`} />
                              <h4 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">{doc.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{doc.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* FAQ Section - Enhanced with accordion */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 p-2.5 text-white shadow-lg shadow-rose-500/20">
                          <HelpCircle className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
                      </div>

                      <div className="space-y-3">
                        {[
                          { q: 'How to handle multiple families?', a: 'Create sub-households or tag multiple families under one household with different "family group" identifiers.' },
                          { q: 'What if head of family passes away?', a: 'Update record to mark head as deceased, then transfer headship to another adult member.' },
                          { q: 'Can I recover an archived household?', a: 'Yes, go to Archived tab, find household, click "Restore". All history preserved.' },
                          { q: 'How are household numbers generated?', a: 'Format: HH-YYYY-XXXX (HH prefix, year, sequential number). Customizable in settings.' },
                        ].map((faq, idx) => (
                          <div
                            key={idx}
                            className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50 transition-all dark:border-gray-700 dark:bg-gray-900"
                          >
                            <button
                              onClick={() => toggleFaq(idx)}
                              className="flex w-full items-center justify-between p-4 text-left"
                            >
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{faq.q}</span>
                              <ChevronDown className={cn(
                                "h-4 w-4 text-gray-500 transition-transform",
                                expandedFaqs.includes(idx) ? "rotate-180" : ""
                              )} />
                            </button>
                            {expandedFaqs.includes(idx) && (
                              <div className="px-4 pb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Reference - Enhanced */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
                      <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Quick Reference</h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          { action: 'Add New Household', shortcut: 'Ctrl+H', location: 'Households → Add' },
                          { action: 'Quick Search', shortcut: '/', location: 'Search bar' },
                          { action: 'Export List', shortcut: 'Ctrl+E', location: 'Households → Export' },
                          { action: 'Generate Report', shortcut: 'Ctrl+R', location: 'Reports → Households' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{item.location}</div>
                            </div>
                            <kbd className="rounded-lg bg-gray-200 px-2 py-1.5 text-xs font-mono font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {item.shortcut}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Support - Enhanced */}
                    <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 p-5 dark:from-gray-800/50 dark:to-gray-900/50 sm:p-6">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-lg">
                          <Phone className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Need Help?</h3>
                      </div>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
                          <div className="mb-1 font-medium text-gray-900 dark:text-white">Records Officer</div>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div>📞 (082) 123-4567 loc. 101</div>
                            <div>📧 records@barangay.gov.ph</div>
                          </div>
                        </div>
                        <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-900">
                          <div className="mb-1 font-medium text-gray-900 dark:text-white">IT Support</div>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <div>📞 (082) 123-4567 loc. 105</div>
                            <div>📧 it.support@barangay.gov.ph</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>Available Mon-Fri, 8:00 AM - 5:00 PM</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Enhanced */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/95 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                <Eye className="h-4 w-4" />
                <span>
                  <span className="hidden sm:inline">Press </span>
                  <kbd className="rounded-lg bg-gray-100 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-900">ESC</kbd>
                  <span className="hidden sm:inline"> to close</span>
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900 sm:px-4 sm:py-2"
                >
                  Close
                </button>
                <button
                  onClick={() => window.open('/portal/instructions', '_blank')}
                  className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl dark:from-emerald-500 dark:to-teal-500 sm:px-4 sm:py-2"
                >
                  <span className="hidden sm:inline">Open Full Manual</span>
                  <span className="sm:hidden">Manual</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HouseholdInstructions;
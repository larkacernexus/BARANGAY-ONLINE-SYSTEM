// resources/js/Components/InstructionsModal.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BookOpen, HelpCircle, Video, FileText, Download,
  Search, Filter, Printer, Share2, Eye, EyeOff, ChevronRight,
  ChevronDown, CheckCircle, AlertCircle, Info, Users, Home,
  CreditCard, FileText as FileTextIcon, Keyboard, Bell, Settings,
  UserPlus, UserCheck, BarChart3, PieChart, Calendar, Clock,
  MapPin, Phone, Mail, Globe, Lock, Unlock, Database, HardDrive,
  Server, Network, Shield, AlertTriangle, ExternalLink, ArrowRight,
  Copy, Check, Zap, Mic, Command
} from 'lucide-react';

// Types
interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  module?: string;
  title?: string;
  customContent?: React.ReactNode;
  showQuickGuide?: boolean;
  userRole?: 'admin' | 'staff' | 'resident';
}

interface ModuleContent {
  title: string;
  content: React.ReactNode;
}

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: 'spring', 
      damping: 25, 
      stiffness: 300 
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20,
    transition: { 
      duration: 0.2 
    }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

// Sub-components
const IconBadge: React.FC<{ icon: React.ReactNode; color?: string }> = ({ 
  icon, 
  color = 'blue' 
}) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  };

  return (
    <div className={`rounded-xl p-2.5 ${colorClasses[color] || colorClasses.blue}`}>
      {icon}
    </div>
  );
};

const StepCard: React.FC<{ 
  step: number; 
  title: string; 
  description: string; 
  color?: string 
}> = ({ step, title, description, color = 'purple' }) => {
  const colors: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  };

  return (
    <div className="flex items-start gap-4">
      <div className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold ${colors[color] || colors.purple}`}>
        {step}
      </div>
      <div>
        <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</div>
      </div>
    </div>
  );
};

const ResourceLink: React.FC<{ 
  href: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  color?: string;
}> = ({ href, icon, title, description, color = 'blue' }) => {
  const colors: Record<string, string> = {
    blue: 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    purple: 'hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20',
    emerald: 'hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-4 rounded-xl border border-gray-200 p-4 transition-all duration-200 hover:shadow-md dark:border-gray-700 ${colors[color] || colors.blue}`}
    >
      <div className="rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-white dark:bg-gray-800 dark:group-hover:bg-gray-700">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-gray-900 dark:text-white">{title}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
      </div>
      <ExternalLink className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-gray-600" />
    </a>
  );
};

// Module content components
const DashboardContent: React.FC = () => (
  <div className="space-y-8">
    <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:from-blue-900/10 dark:to-indigo-900/10">
      <div className="mb-4 flex items-center gap-3">
        <IconBadge icon={<BarChart3 className="h-5 w-5" />} color="blue" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h3>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div 
          variants={slideInRight}
          initial="hidden"
          animate="visible"
          className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-gray-800/80"
        >
          <h4 className="mb-4 flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400">
            <CheckCircle className="h-4 w-4" />
            Key Performance Indicators
          </h4>
          <div className="space-y-3">
            {[
              { icon: Users, label: 'Total Residents', desc: 'Current registered population', color: 'text-blue-500' },
              { icon: Home, label: 'Total Households', desc: 'Number of family units', color: 'text-emerald-500' },
              { icon: CreditCard, label: "Today's Collections", desc: 'Daily revenue tracking', color: 'text-amber-500' },
              { icon: FileTextIcon, label: 'Pending Clearances', desc: 'Needs immediate attention', color: 'text-purple-500' }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{item.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          variants={slideInRight}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-gray-800/80"
        >
          <h4 className="mb-4 flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-400">
            <Zap className="h-4 w-4" />
            Quick Actions
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: UserPlus, label: 'Register Resident', color: 'from-purple-500 to-pink-500' },
              { icon: FileTextIcon, label: 'New Clearance', color: 'from-blue-500 to-cyan-500' },
              { icon: CreditCard, label: 'Process Payment', color: 'from-emerald-500 to-teal-500' },
              { icon: AlertTriangle, label: 'Alert System', color: 'from-amber-500 to-orange-500' }
            ].map((action, index) => (
              <button
                key={index}
                className={`rounded-xl bg-gradient-to-r ${action.color} p-4 text-white transition-transform hover:scale-105 hover:shadow-lg`}
              >
                <action.icon className="mb-2 h-6 w-6" />
                <div className="text-sm font-medium">{action.label}</div>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </div>
);

const ResidentsContent: React.FC = () => (
  <div className="space-y-8">
    <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 dark:from-emerald-900/10 dark:to-teal-900/10">
      <div className="mb-4 flex items-center gap-3">
        <IconBadge icon={<Users className="h-5 w-5" />} color="emerald" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resident Management</h3>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-gray-800/80">
          <h4 className="mb-4 font-semibold text-emerald-700 dark:text-emerald-400">Registration Process</h4>
          <div className="space-y-4">
            <StepCard step={1} title="Initiate Registration" description="Click 'Register Resident' and fill in personal details" color="emerald" />
            <StepCard step={2} title="Document Upload" description="Upload valid ID and proof of residency" color="blue" />
            <StepCard step={3} title="Household Assignment" description="Assign to existing or create new household" color="purple" />
            <StepCard step={4} title="Verification" description="System validates and activates the record" color="amber" />
          </div>
        </div>

        <div className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-gray-800/80">
          <h4 className="mb-4 font-semibold text-blue-700 dark:text-blue-400">Search & Filter</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <Search className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Quick Search</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Search by name, ID, or address</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <Filter className="h-5 w-5 text-purple-500" />
              <div>
                <div className="font-medium">Advanced Filters</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Filter by age, gender, location</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
              <Download className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Generate reports in PDF/Excel</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ClearanceContent: React.FC = () => (
  <div className="space-y-8">
    <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 dark:from-purple-900/10 dark:to-pink-900/10">
      <div className="mb-4 flex items-center gap-3">
        <IconBadge icon={<FileTextIcon className="h-5 w-5" />} color="purple" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Clearance Processing</h3>
      </div>
      
      <div className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-gray-800/80">
        <h4 className="mb-6 font-semibold text-purple-700 dark:text-purple-400">Workflow Process</h4>
        <div className="relative">
          <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-6">
            <StepCard step={1} title="Document Verification" description="Check submitted documents and requirements" color="purple" />
            <StepCard step={2} title="Background Check" description="Verify records for dues or violations" color="blue" />
            <StepCard step={3} title="Payment Processing" description="Process fees and issue official receipt" color="emerald" />
            <StepCard step={4} title="Certificate Issuance" description="Generate clearance with QR verification" color="amber" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PaymentsContent: React.FC = () => (
  <div className="space-y-8">
    <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 dark:from-amber-900/10 dark:to-yellow-900/10">
      <div className="mb-4 flex items-center gap-3">
        <IconBadge icon={<CreditCard className="h-5 w-5" />} color="amber" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Processing</h3>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-gray-800/80">
          <h4 className="mb-4 font-semibold text-amber-700 dark:text-amber-400">Payment Methods</h4>
          <div className="space-y-3">
            {[
              { method: 'Cash', color: 'bg-emerald-100 text-emerald-800', icon: CreditCard },
              { method: 'GCash', color: 'bg-blue-100 text-blue-800', icon: Phone },
              { method: 'PayMaya', color: 'bg-purple-100 text-purple-800', icon: Phone },
              { method: 'Bank Transfer', color: 'bg-cyan-100 text-cyan-800', icon: Globe }
            ].map((payment, index) => (
              <div key={index} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
                <span className={`rounded-lg px-3 py-1 text-sm font-medium ${payment.color}`}>
                  {payment.method}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Over-the-counter transaction
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-gray-800/80">
          <h4 className="mb-4 font-semibold text-blue-700 dark:text-blue-400">Processing Schedule</h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { day: 'Weekdays', time: '8:00 AM - 5:00 PM', color: 'border-blue-500' },
              { day: 'Saturday', time: '8:00 AM - 12:00 PM', color: 'border-emerald-500' },
              { day: 'Cut-off', time: 'Daily 3:00 PM', color: 'border-amber-500' },
              { day: 'Emergency', time: '24/7 On-call', color: 'border-rose-500' }
            ].map((schedule, index) => (
              <div key={index} className={`rounded-lg border-l-4 ${schedule.color} bg-gray-50 p-3 dark:bg-gray-700/50`}>
                <div className="font-medium text-gray-900 dark:text-white">{schedule.day}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{schedule.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const GeneralContent: React.FC<{ showQuickGuide: boolean }> = ({ showQuickGuide }) => (
  <div className="space-y-8">
    <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 p-6 dark:from-gray-900/50 dark:to-blue-900/10">
      <div className="mb-4 flex items-center gap-3">
        <IconBadge icon={<Shield className="h-5 w-5" />} color="blue" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Role-Based Access</h3>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          {
            role: 'Administrator',
            icon: Shield,
            color: 'blue',
            permissions: ['Full system access', 'User management', 'System configuration', 'Report generation']
          },
          {
            role: 'Barangay Staff',
            icon: UserCheck,
            color: 'emerald',
            permissions: ['Resident management', 'Clearance processing', 'Payment collection', 'Document generation']
          },
          {
            role: 'Residents (Portal)',
            icon: Users,
            color: 'purple',
            permissions: ['Apply for clearances', 'View personal records', 'Track applications']
          }
        ].map((role, index) => (
          <motion.div
            key={index}
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
            className="rounded-xl bg-white/80 p-5 shadow-sm backdrop-blur dark:bg-gray-800/80"
          >
            <div className="mb-3 flex items-center gap-2">
              <role.icon className={`h-5 w-5 text-${role.color}-600 dark:text-${role.color}-400`} />
              <h4 className="font-semibold text-gray-900 dark:text-white">{role.role}</h4>
            </div>
            <ul className="space-y-2">
              {role.permissions.map((perm, pIndex) => (
                <li key={pIndex} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  {perm}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>

    {showQuickGuide && (
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
          <BookOpen className="h-5 w-5" />
          Getting Started Checklist
        </h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-300">Initial Setup</h4>
            <div className="space-y-2">
              {['Complete staff profile', 'Configure security settings', 'Review barangay fees', 'Test with sample data'].map((task, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">{task}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-gray-800 dark:text-gray-300">Daily Best Practices</h4>
            <div className="space-y-2 text-sm">
              {[
                'Verify resident identity before processing',
                'Keep digital records updated in real-time',
                'Backup data at the end of each day',
                'Log out when stepping away from system'
              ].map((practice, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <span className="text-gray-700 dark:text-gray-300">{practice}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
        <Command className="h-5 w-5" />
        Keyboard Shortcuts
      </h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { keys: ['⌘', 'K'], action: 'Command Palette' },
          { keys: ['⌘', 'N'], action: 'New Record' },
          { keys: ['⌘', 'S'], action: 'Save Changes' },
          { keys: ['Esc'], action: 'Close Modal' }
        ].map((shortcut, index) => (
          <div key={index} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50">
            <div className="mb-1 flex items-center gap-1">
              {shortcut.keys.map((key, kIndex) => (
                <React.Fragment key={kIndex}>
                  {kIndex > 0 && <span className="text-gray-400">+</span>}
                  <kbd className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm dark:bg-gray-600 dark:text-gray-300">
                    {key}
                  </kbd>
                </React.Fragment>
              ))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{shortcut.action}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// NOW define MODULE_CONTENT after all component declarations
const MODULE_CONTENT: Record<string, ModuleContent> = {
  dashboard: {
    title: 'Dashboard Guide',
    content: <DashboardContent />
  },
  residents: {
    title: 'Residents Management',
    content: <ResidentsContent />
  },
  clearance: {
    title: 'Clearance Processing',
    content: <ClearanceContent />
  },
  payments: {
    title: 'Payment Collection',
    content: <PaymentsContent />
  },
  general: {
    title: 'System Guide',
    content: <GeneralContent showQuickGuide={true} />
  }
};

// Main Component
const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  module = 'general',
  title,
  customContent,
  showQuickGuide = true,
  userRole = 'staff'
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus modal on open
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const moduleContent = MODULE_CONTENT[module] || MODULE_CONTENT.general;
  const modalTitle = title || moduleContent.title;

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              tabIndex={-1}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900"
            >
              {/* Header */}
              <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-xl dark:border-gray-700 dark:bg-gray-900/80">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/30">
                      <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
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
                      className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                      aria-label="Close help guide"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto p-6">
                {customContent || moduleContent.content}

                {/* Resources Section */}
                <div className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                  <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                    <FileText className="h-5 w-5" />
                    Additional Resources
                  </h3>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <ResourceLink
                      href="/user-guide.pdf"
                      icon={<Download className="h-5 w-5 text-blue-600" />}
                      title="Complete User Guide"
                      description="PDF Manual • 50 pages"
                      color="blue"
                    />
                    <ResourceLink
                      href="/training-videos"
                      icon={<Video className="h-5 w-5 text-purple-600" />}
                      title="Video Tutorials"
                      description="Step-by-step visual guides"
                      color="purple"
                    />
                    <ResourceLink
                      href="/faq"
                      icon={<HelpCircle className="h-5 w-5 text-emerald-600" />}
                      title="FAQ & Support"
                      description="Common questions answered"
                      color="emerald"
                    />
                  </div>
                </div>

                {/* Contact Section */}
                <div className="mt-8 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 p-6 dark:from-gray-800 dark:to-blue-900/10">
                  <h4 className="mb-4 font-bold text-gray-900 dark:text-white">Need Assistance?</h4>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                        <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Phone Support</div>
                        <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div>IT Officer: (02) 1234-5678</div>
                          <div>Emergency: 911</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                        <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">Email Support</div>
                        <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div>support@barangaykibawe.gov.ph</div>
                          <div>admin@barangaykibawe.gov.ph</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Eye className="h-4 w-4" />
                    <span>Press <kbd className="rounded-md bg-white px-2 py-0.5 text-xs font-medium shadow-sm dark:bg-gray-700">ESC</kbd> to close</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onClose}
                      className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Close Guide
                    </button>
                    <button
                      onClick={() => window.open('/admin/instructions', '_blank')}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Open Full Manual
                      <ArrowRight className="ml-2 inline-block h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  // Use portal to render at document body level
  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
};

export default InstructionsModal;
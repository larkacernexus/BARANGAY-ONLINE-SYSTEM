// resources/js/Pages/Instructions.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/layouts/admin-app-layout';
import PrintContent from '@/components/InstructionsModal/PrintContent';
import {
  BookOpen,
  HelpCircle,
  Video,
  FileText,
  Download,
  Search,
  Share2,
  Eye,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Users,
  Home,
  CreditCard,
  Keyboard,
  Bell,
  Settings,
  UserPlus,
  BarChart3,
  PieChart,
  Calendar,
  Shield,
  AlertTriangle,
  Activity,
  Zap,
  Globe2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Section {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  content: React.ReactNode;
}

interface VideoTutorial {
  title: string;
  duration: string;
  thumbnail: string;
  views: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface Shortcut {
  key: string;
  description: string;
}

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// ─── Custom Icon Components ──────────────────────────────────────────────────

const Rocket: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const LayoutDashboard: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UserCog: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10l2 2m0 0l2-2m-2 2v6" />
  </svg>
);

// ─── Utility Functions ───────────────────────────────────────────────────────

const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

const sanitizeFilename = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9_\-.]/g, '_');
};

// ─── Data Extraction ────────────────────────────────────────────────────────

const extractTextFromReactNode = (content: React.ReactNode): string => {
  if (typeof content === 'string') return content;
  if (typeof content === 'number') return content.toString();
  if (Array.isArray(content)) return content.map(extractTextFromReactNode).join('');
  if (React.isValidElement(content)) {
    const props = content.props as Record<string, unknown>;
    if (props.children) return extractTextFromReactNode(props.children as React.ReactNode);
    return '';
  }
  return '';
};

// ─── Constants ───────────────────────────────────────────────────────────────

const SYSTEM_STATS = {
  activeResidents: '5,234',
  households: '1,245',
  clearancesToday: '156',
  todaysCollection: '₱45,200',
} as const;

const VIDEO_TUTORIALS: VideoTutorial[] = [
  { title: 'Getting Started with BMS', duration: '5:30', thumbnail: '/thumbnails/getting-started.jpg', views: '1.2K' },
  { title: 'Resident Management Guide', duration: '8:15', thumbnail: '/thumbnails/residents.jpg', views: '856' },
  { title: 'Processing Clearances', duration: '6:45', thumbnail: '/thumbnails/clearances.jpg', views: '2.1K' },
  { title: 'Payment Collection Tutorial', duration: '4:20', thumbnail: '/thumbnails/payments.jpg', views: '1.5K' },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I reset a user password?',
    answer: 'Go to Settings → User Management, select the user, and click "Reset Password". The system will send a password reset link to their email.',
  },
  {
    question: 'What happens if I delete a resident record?',
    answer: 'Resident records are soft-deleted by default, meaning they can be restored within 30 days. After 30 days, they are permanently deleted from the system.',
  },
  {
    question: 'Can I undo a payment transaction?',
    answer: 'Yes, but only within 24 hours and requires supervisor approval. Go to Payments → Transaction History, find the transaction, and click "Void".',
  },
  {
    question: 'How often is data backed up?',
    answer: 'The system performs automatic backups daily at 2:00 AM. Manual backups can be initiated anytime from Settings → Backup.',
  },
];

const SHORTCUTS: Shortcut[] = [
  { key: 'Ctrl + K', description: 'Open command palette' },
  { key: 'Ctrl + N', description: 'Create new record' },
  { key: 'Ctrl + S', description: 'Save current form' },
  { key: 'Ctrl + F', description: 'Search' },
  { key: 'Ctrl + P', description: 'Print' },
  { key: 'Ctrl + E', description: 'Export data' },
  { key: 'F1', description: 'Open help guide' },
  { key: 'Esc', description: 'Close modal/panel' },
  { key: '?', description: 'Show keyboard shortcuts' },
  { key: 'Ctrl + D', description: 'Duplicate record' },
];

// ─── Section Content Components ──────────────────────────────────────────────

const SystemOverviewContent: React.FC = () => (
  <div className="space-y-6">
    <motion.div 
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-8 text-white"
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute right-0 top-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="relative z-10">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium text-white/80">Version 2.0 • March 2024</span>
        </div>
        <h2 className="text-3xl font-bold">Welcome to Barangay Kibawe Management System</h2>
        <p className="mt-2 max-w-2xl text-lg text-white/80">
          Your complete digital solution for efficient barangay governance and community service
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <Zap className="h-4 w-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/admin/residents/create"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            <UserPlus className="h-4 w-4" />
            Add Resident
          </Link>
        </div>
      </div>
    </motion.div>

    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-3"
    >
      {[
        { icon: Zap, title: 'Fast Processing', desc: 'Reduce clearance processing time by 70%', color: 'blue' },
        { icon: Shield, title: 'Secure & Reliable', desc: 'Enterprise-grade security with daily backups', color: 'emerald' },
        { icon: Users, title: 'User-Friendly', desc: 'Intuitive interface for all user levels', color: 'purple' },
      ].map((feature) => {
        const colorMap: Record<string, string> = {
          blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
          emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
          purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        };
        return (
          <motion.div
            key={feature.title}
            variants={scaleIn}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${colorMap[feature.color]}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
          </motion.div>
        );
      })}
    </motion.div>

    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 md:grid-cols-4"
    >
      {[
        { value: SYSTEM_STATS.activeResidents, label: 'Active Residents', color: 'text-blue-600 dark:text-blue-400' },
        { value: SYSTEM_STATS.households, label: 'Households', color: 'text-emerald-600 dark:text-emerald-400' },
        { value: SYSTEM_STATS.clearancesToday, label: 'Clearances Today', color: 'text-purple-600 dark:text-purple-400' },
        { value: SYSTEM_STATS.todaysCollection, label: "Today's Collection", color: 'text-amber-600 dark:text-amber-400' },
      ].map((stat) => (
        <motion.div
          key={stat.label}
          variants={scaleIn}
          className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800/50"
        >
          <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>

    <motion.div 
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
    >
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
        <Settings className="h-5 w-5" />
        System Requirements
      </h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 font-medium text-gray-800 dark:text-gray-300">Minimum Requirements</h4>
          <ul className="space-y-2">
            {[
              'Modern web browser (Chrome 90+, Firefox 88+, Edge 90+)',
              'Internet connection (minimum 1 Mbps)',
              '4GB RAM for optimal performance',
              'Screen resolution: 1280x720 or higher',
            ].map((req) => (
              <li key={req} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                {req}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-medium text-gray-800 dark:text-gray-300">Recommended Setup</h4>
          <ul className="space-y-2">
            {[
              'Chrome/Firefox latest version',
              '5+ Mbps internet connection',
              '8GB RAM for heavy usage',
              'Dual monitor setup for multitasking',
            ].map((req) => (
              <li key={req} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>

    <motion.div 
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="rounded-xl bg-blue-50 p-6 dark:bg-blue-900/20"
    >
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-300">
        <Zap className="h-5 w-5" />
        Quick Actions
      </h3>
      <div className="grid gap-3 md:grid-cols-4">
        {[
          { href: '/admin/residents/create', icon: UserPlus, label: 'Add Resident', color: 'blue' },
          { href: '/admin/clearances/create', icon: FileText, label: 'New Clearance', color: 'purple' },
          { href: '/admin/payments/create', icon: CreditCard, label: 'Record Payment', color: 'emerald' },
          { href: '/admin/reports', icon: BarChart3, label: 'Generate Report', color: 'amber' },
        ].map((action) => {
          const colorMap: Record<string, string> = {
            blue: 'text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-gray-700',
            purple: 'text-purple-700 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-gray-700',
            emerald: 'text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-gray-700',
            amber: 'text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-gray-700',
          };
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`flex items-center gap-2 rounded-xl bg-white p-3 transition-colors dark:bg-gray-800 ${colorMap[action.color]}`}
            >
              <action.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  </div>
);

const GettingStartedContent: React.FC = () => (
  <div className="space-y-6">
    <div className="rounded-xl bg-emerald-50 p-5 dark:bg-emerald-900/20">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-800 dark:text-emerald-400">
        <CheckCircle className="h-5 w-5" />
        Prerequisites
      </h3>
      <ul className="mt-3 space-y-2">
        {[
          'Valid user account provided by system administrator',
          'Internet connection and modern web browser',
          'User role and permissions assigned',
        ].map((item) => (
          <li key={item} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>

    {[
      { step: 1, title: 'Access the System', desc: 'Open your browser and navigate to https://bms-kibawe.gov.ph' },
      { step: 2, title: 'Login', desc: 'Enter your employee ID or email and password' },
      { step: 3, title: 'Password Change', desc: 'First-time users will be prompted to create a new password' },
      { step: 4, title: 'Dashboard Overview', desc: 'Explore your personalized dashboard with key metrics' },
    ].map((item, index) => (
      <motion.div
        key={item.step}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {item.step}
        </div>
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">{item.title}</div>
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
        </div>
      </motion.div>
    ))}
  </div>
);

const DashboardContent: React.FC = () => (
  <div className="space-y-6">
    <p className="text-gray-600 dark:text-gray-400">
      The dashboard provides a real-time overview of your barangay's key metrics and activities.
    </p>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Dashboard Components</h3>
        <div className="space-y-3">
          {[
            { icon: BarChart3, label: 'Statistics Cards', desc: 'Quick overview of key metrics' },
            { icon: Activity, label: 'Recent Activities', desc: 'Latest system actions and updates' },
            { icon: PieChart, label: 'Charts & Graphs', desc: 'Visual data trends and analytics' },
            { icon: Zap, label: 'Quick Actions', desc: 'Frequently used functions' },
            { icon: Bell, label: 'Notifications', desc: 'System alerts and reminders' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <item.icon className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{item.label}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Customization Options</h3>
        <div className="space-y-2">
          {[
            'Rearrange widgets by dragging',
            'Choose which statistics to display',
            'Set date ranges for charts',
            'Save custom dashboard layouts',
          ].map((option) => (
            <div key={option} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              {option}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ResidentsContent: React.FC = () => (
  <div className="space-y-6">
    <p className="text-gray-600 dark:text-gray-400">
      Complete resident information management system with advanced search and filtering capabilities.
    </p>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <UserPlus className="h-5 w-5 text-blue-500" />
          Adding New Residents
        </h3>
        <div className="space-y-3">
          {[
            'Click "Add Resident" button',
            'Fill in personal information',
            'Upload required documents',
            'Assign household',
            'Click "Save" to complete',
          ].map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                {index + 1}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{step}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Resident Features</h3>
        <div className="space-y-3">
          {[
            { label: 'Advanced Search', desc: 'Search by name, age, address' },
            { label: 'Filters', desc: 'Filter by status, age group, gender' },
            { label: 'Export', desc: 'Export lists to Excel/PDF' },
            { label: 'History', desc: 'Track record changes' },
          ].map((feature) => (
            <div key={feature.label} className="flex items-start gap-2">
              <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">{feature.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ClearancesContent: React.FC = () => (
  <div className="space-y-6">
    <p className="text-gray-600 dark:text-gray-400">
      Streamlined clearance processing system for various types of barangay certifications.
    </p>
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { type: 'Barangay Clearance', purpose: 'General purpose', color: 'border-blue-500' },
        { type: 'Business Clearance', purpose: 'Business permits', color: 'border-purple-500' },
        { type: 'Indigency', purpose: 'Financial assistance', color: 'border-emerald-500' },
      ].map((item) => (
        <div key={item.type} className={`rounded-xl border-l-4 ${item.color} bg-white p-4 shadow-sm dark:bg-gray-800`}>
          <div className="font-semibold text-gray-900 dark:text-white">{item.type}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{item.purpose}</div>
        </div>
      ))}
    </div>
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Processing Steps</h3>
      <div className="space-y-4">
        {[
          { step: 1, title: 'Application', desc: 'Resident submits clearance request' },
          { step: 2, title: 'Verification', desc: 'Verify resident information and eligibility' },
          { step: 3, title: 'Payment', desc: 'Process clearance fee payment' },
          { step: 4, title: 'Printing', desc: 'Generate and print clearance' },
        ].map((item) => (
          <div key={item.step} className="flex items-start gap-3">
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {item.step}
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PaymentsContent: React.FC = () => (
  <div className="space-y-6">
    <p className="text-gray-600 dark:text-gray-400">
      Comprehensive payment tracking and collection management system.
    </p>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Payment Types</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {['Clearance Fees', 'Business Permit Fees', 'Community Tax', 'Donations', 'Other Collections'].map((type) => (
            <li key={type} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {type}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Features</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {[
            'Multiple payment methods (cash, GCash, bank transfer)',
            'Automatic receipt generation',
            'Daily collection reports',
            'Payment history tracking',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const ReportsContent: React.FC = () => (
  <div className="space-y-6">
    <p className="text-gray-600 dark:text-gray-400">Generate comprehensive reports and analyze barangay data.</p>
    <div className="grid gap-4 md:grid-cols-3">
      {[
        { title: 'Demographic Reports', items: ['Population by age group', 'Gender distribution', 'Household statistics'] },
        { title: 'Financial Reports', items: ['Daily collections', 'Monthly summaries', 'Annual financial statements'] },
        { title: 'Operational Reports', items: ['Clearance issuance', 'Certificate requests', 'Staff performance'] },
      ].map((category) => (
        <div key={category.title} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">{category.title}</h3>
          <ul className="space-y-2">
            {category.items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ChevronRight className="h-3 w-3 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const UsersContent: React.FC = () => (
  <div className="space-y-6">
    <p className="text-gray-600 dark:text-gray-400">Control access and permissions for all system users.</p>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">User Roles</h3>
        <div className="space-y-4">
          {[
            { role: 'Super Admin', color: 'text-rose-500', desc: 'Full system access' },
            { role: 'Admin', color: 'text-blue-500', desc: 'Most features except system settings' },
            { role: 'Encoder', color: 'text-emerald-500', desc: 'Data entry only' },
            { role: 'Viewer', color: 'text-amber-500', desc: 'Read-only access' },
          ].map((role) => (
            <div key={role.role} className="flex items-center gap-3">
              <Shield className={`h-4 w-4 flex-shrink-0 ${role.color}`} />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{role.role}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{role.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Management Features</h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          {['Create/edit accounts', 'Assign/modify roles', 'Reset passwords', 'Enable/disable accounts', 'View audit logs'].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const SettingsContent: React.FC = () => (
  <div className="space-y-6">
    <p className="text-gray-600 dark:text-gray-400">Configure and customize the system according to your barangay's needs.</p>
    <div className="grid gap-4 md:grid-cols-2">
      {[
        { title: 'General Settings', items: ['Barangay information', 'System name and logo', 'Date and time format', 'Language preferences'] },
        { title: 'Fee Configuration', items: ['Clearance fees', 'Business permit fees', 'Community tax rates', 'Other service fees'] },
        { title: 'Notification Settings', items: ['Email notifications', 'SMS alerts', 'System alerts'] },
        { title: 'Backup Settings', items: ['Automatic backup schedule', 'Backup location', 'Retention period'] },
      ].map((section) => (
        <div key={section.title} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">{section.title}</h3>
          <ul className="space-y-2">
            {section.items.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ChevronRight className="h-3 w-3 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const ShortcutsContent: React.FC = () => (
  <div className="space-y-4">
    <p className="text-gray-600 dark:text-gray-400">Increase your productivity with these keyboard shortcuts.</p>
    <div className="grid gap-3 md:grid-cols-2">
      {SHORTCUTS.map((shortcut) => (
        <div key={shortcut.key} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm dark:bg-gray-800">
          <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</span>
          <kbd className="rounded-md bg-gray-100 px-2 py-1 text-xs font-mono font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">
            {shortcut.key}
          </kbd>
        </div>
      ))}
    </div>
  </div>
);

const FAQContent: React.FC = () => (
  <div className="space-y-4">
    {FAQ_ITEMS.map((faq) => (
      <div key={faq.question} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">{faq.question}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{faq.answer}</p>
      </div>
    ))}
  </div>
);

// ─── Sections Data ──────────────────────────────────────────────────────────

const createSections = (): Section[] => [
  { id: 'overview', title: 'System Overview', icon: Globe2, description: 'Complete guide to the Barangay Management System', content: <SystemOverviewContent /> },
  { id: 'getting-started', title: 'Getting Started', icon: Rocket, description: 'Initial setup and login instructions', content: <GettingStartedContent /> },
  { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard, description: 'Understanding the main dashboard', content: <DashboardContent /> },
  { id: 'residents', title: 'Residents Management', icon: Users, description: 'Managing resident records', content: <ResidentsContent /> },
  { id: 'clearances', title: 'Barangay Clearances', icon: FileText, description: 'Processing and managing clearances', content: <ClearancesContent /> },
  { id: 'payments', title: 'Payments & Collections', icon: CreditCard, description: 'Managing payments and financial records', content: <PaymentsContent /> },
  { id: 'reports', title: 'Reports & Analytics', icon: BarChart3, description: 'Generating and viewing reports', content: <ReportsContent /> },
  { id: 'users', title: 'User Management', icon: UserCog, description: 'Managing system users and roles', content: <UsersContent /> },
  { id: 'settings', title: 'System Settings', icon: Settings, description: 'Configuring system preferences', content: <SettingsContent /> },
  { id: 'shortcuts', title: 'Keyboard Shortcuts', icon: Keyboard, description: 'List of all keyboard shortcuts', content: <ShortcutsContent /> },
  { id: 'faq', title: 'Frequently Asked Questions', icon: HelpCircle, description: 'Common questions and answers', content: <FAQContent /> },
];

// ─── Main Component ─────────────────────────────────────────────────────────

const Instructions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [activeTab, setActiveTab] = useState<'guide' | 'videos' | 'faq' | 'shortcuts'>('guide');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'text'>('pdf');
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const sections = createSections();

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(e.target as Node)) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    cleanupRef.current = () => document.removeEventListener('mousedown', handleClickOutside);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

  const generateTextContent = useCallback((): string => {
    const date = new Date();
    const currentSection = sections.find((s) => s.id === selectedSection);
    const isFullGuide = selectedSection === 'overview';

    const lines: string[] = [];
    const separator = '='.repeat(80);
    const divider = '-'.repeat(80);

    lines.push(separator);
    lines.push('                    BARANGAY KIBAWE MANAGEMENT SYSTEM');
    lines.push('                         COMPLETE USER GUIDE');
    lines.push(separator);
    lines.push('');
    lines.push(`Generated: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`);
    lines.push(`Document Type: ${isFullGuide ? 'Full Guide' : 'Section Guide'}`);
    lines.push('Version: 2.0');
    lines.push(divider);
    lines.push('');

    if (!isFullGuide && currentSection) {
      lines.push(currentSection.title);
      lines.push('═'.repeat(currentSection.title.length));
      lines.push('');
      lines.push(`Description: ${currentSection.description}`);
      lines.push('');
      lines.push(extractTextFromReactNode(currentSection.content));
    } else {
      lines.push('TABLE OF CONTENTS');
      lines.push('─'.repeat(40));
      sections.forEach((section, index) => {
        lines.push(`${(index + 1).toString().padStart(2, '0')}. ${section.title}`);
        lines.push(`   ${section.description}`);
      });
      lines.push('');
      lines.push(separator);
      lines.push('');

      sections.forEach((section, index) => {
        lines.push(`${index + 1}. ${section.title}`);
        lines.push('─'.repeat(section.title.length + 3));
        lines.push(section.description);
        lines.push('');
        lines.push(extractTextFromReactNode(section.content));
        lines.push('');
        lines.push('-'.repeat(40));
        lines.push('');
      });
    }

    lines.push(separator);
    lines.push('                     END OF DOCUMENT');
    lines.push(separator);
    lines.push('');
    lines.push('This document was generated from the Barangay Kibawe Management System.');
    lines.push('For support, contact: support@bms-kibawe.gov.ph');

    return lines.join('\n');
  }, [sections, selectedSection]);

  const handleDownload = useCallback(async () => {
    setIsGeneratingPDF(true);
    setDownloadError(null);

    try {
      if (downloadFormat === 'text') {
        const textContent = generateTextContent();
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = sanitizeFilename(`Barangay_System_Guide_${new Date().toISOString().split('T')[0]}.txt`);
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        setShowDownloadOptions(false);
        return;
      }

      const downloadUrl = new URL('/instructions/download', window.location.origin);
      downloadUrl.searchParams.append('format', 'pdf');

      if (selectedSection !== 'overview') {
        downloadUrl.searchParams.append('section', selectedSection);
        downloadUrl.searchParams.append('type', 'section');
      } else {
        downloadUrl.searchParams.append('type', 'full');
      }

      const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';

      const response = await fetch(downloadUrl.toString(), {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/pdf',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = sanitizeFilename(`Barangay_System_Guide_${new Date().toISOString().split('T')[0]}.pdf`);

      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match?.[1]) {
          filename = sanitizeFilename(match[1].replace(/['"]/g, ''));
        }
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download. Please try again.';
      setDownloadError(message);
    } finally {
      setIsGeneratingPDF(false);
      setShowDownloadOptions(false);
      if (downloadError) {
        const timer = setTimeout(() => setDownloadError(null), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [downloadFormat, generateTextContent, selectedSection, downloadError]);

  // ─── Derived Data ─────────────────────────────────────────────────────────

  const selectedContent = sections.find((s) => s.id === selectedSection) || sections[0];
  const currentSectionIndex = sections.findIndex((s) => s.id === selectedSection);
  const hasPreviousSection = currentSectionIndex > 0;
  const hasNextSection = currentSectionIndex < sections.length - 1;
  const previousSection = hasPreviousSection ? sections[currentSectionIndex - 1] : null;
  const nextSection = hasNextSection ? sections[currentSectionIndex + 1] : null;

  const filteredSections = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <Head title="System Instructions - Barangay Kibawe" />

      <AppLayout>
        <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">System Instructions</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Learn how to use the Barangay Management System effectively
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-96 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              <PrintContent sections={sections} selectedSection={selectedSection} faqItems={FAQ_ITEMS} shortcuts={SHORTCUTS} />

              <div className="relative" ref={downloadDropdownRef}>
                <button
                  onClick={() => setShowDownloadOptions((prev) => !prev)}
                  disabled={isGeneratingPDF}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {isGeneratingPDF ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                      />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {showDownloadOptions && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
                    >
                      <div className="p-3">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Format</h4>
                        {[
                          { value: 'pdf', label: 'PDF Document', desc: 'Best for printing' },
                          { value: 'text', label: 'Plain Text', desc: 'Simple text format' },
                        ].map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          >
                            <input
                              type="radio"
                              name="downloadFormat"
                              value={option.value}
                              checked={downloadFormat === option.value}
                              onChange={(e) => setDownloadFormat(e.target.value as 'pdf' | 'text')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{option.desc}</div>
                            </div>
                          </label>
                        ))}
                        <button
                          onClick={handleDownload}
                          disabled={isGeneratingPDF}
                          className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Download {downloadFormat.toUpperCase()}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {downloadError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-2 w-64 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                    >
                      <AlertCircle className="mr-1 inline h-4 w-4" />
                      {downloadError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6">
              {[
                { id: 'guide' as const, label: 'Guide', icon: BookOpen },
                { id: 'videos' as const, label: 'Videos', icon: Video },
                { id: 'faq' as const, label: 'FAQ', icon: HelpCircle },
                { id: 'shortcuts' as const, label: 'Shortcuts', icon: Keyboard },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div ref={contentRef}>
            <AnimatePresence mode="wait">
              {activeTab === 'guide' && (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Horizontal Section Selector - Replaces sidebar */}
                  <div className="mb-6 overflow-x-auto pb-2">
                    <div className="flex gap-2 min-w-max">
                      {filteredSections.map((section) => {
                        const isSelected = selectedSection === section.id;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setSelectedSection(section.id)}
                            className={cn(
                              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap',
                              isSelected
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 dark:bg-blue-500'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700/50'
                            )}
                          >
                            <section.icon className="h-4 w-4 flex-shrink-0" />
                            {section.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex items-center gap-2 text-sm">
                      <Link href="/admin/dashboard" className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300">
                        Home
                      </Link>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Instructions</span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                      <span className="text-blue-600 dark:text-blue-400">{selectedContent.title}</span>
                    </nav>

                    {/* Section Header */}
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/30">
                          <selectedContent.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedContent.title}</h2>
                          <p className="text-gray-600 dark:text-gray-400">{selectedContent.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDownloadOptions(true)}
                          className="rounded-xl border border-gray-300 p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                          aria-label="Download section"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                          }}
                          className="rounded-xl border border-gray-300 p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                          aria-label="Share link"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Content */}
                    <div>{selectedContent.content}</div>

                    {/* Previous / Next Navigation */}
                    <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
                      {hasPreviousSection && previousSection ? (
                        <button
                          onClick={() => setSelectedSection(previousSection.id)}
                          className="group flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                          Previous: {previousSection.title}
                        </button>
                      ) : (
                        <div />
                      )}
                      <span className="text-xs text-gray-400">
                        {currentSectionIndex + 1} / {sections.length}
                      </span>
                      {hasNextSection && nextSection ? (
                        <button
                          onClick={() => setSelectedSection(nextSection.id)}
                          className="group flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                          Next: {nextSection.title}
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'videos' && (
                <motion.div
                  key="videos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Video Tutorials</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {VIDEO_TUTORIALS.map((video) => (
                      <div
                        key={video.title}
                        className="group cursor-pointer rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                      >
                        <div className="relative aspect-video overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-700">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-colors group-hover:bg-black/70">
                              <Video className="h-6 w-6" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            {video.title}
                          </h3>
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Eye className="h-3 w-3" />
                            <span>{video.views} views</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'faq' && (
                <motion.div
                  key="faq-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
                  <div className="space-y-3">
                    {FAQ_ITEMS.map((faq, idx) => {
                      const faqId = `faq-${idx}`;
                      const isExpanded = expandedSections.includes(faqId);
                      return (
                        <div key={faqId} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                          <button
                            onClick={() => toggleSection(faqId)}
                            className="flex w-full items-center justify-between p-5 text-left"
                            aria-expanded={isExpanded}
                          >
                            <h3 className="pr-4 font-semibold text-gray-900 dark:text-white">{faq.question}</h3>
                            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400" />
                            </motion.div>
                          </button>
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-gray-100 px-5 pb-5 pt-4 text-gray-600 dark:border-gray-700 dark:text-gray-400">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === 'shortcuts' && (
                <motion.div
                  key="shortcuts-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {SHORTCUTS.map((shortcut) => (
                      <div
                        key={shortcut.key}
                        className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                        <kbd className="rounded-md bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">
                          {shortcut.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
                    <h3 className="mb-2 flex items-center gap-2 font-medium text-blue-800 dark:text-blue-400">
                      <Keyboard className="h-4 w-4" />
                      Pro Tip
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Press{' '}
                      <kbd className="rounded bg-blue-200 px-2 py-0.5 font-mono text-xs dark:bg-blue-800">?</kbd>{' '}
                      anywhere in the system to view this shortcuts guide.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default Instructions;
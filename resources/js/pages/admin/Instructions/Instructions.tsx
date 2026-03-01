// resources/js/Pages/Instructions.tsx
import React, { useState, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/admin-app-layout';
import PrintContent from '@/components/InstructionsModal/PrintContent';
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
  type LucideIcon,
} from 'lucide-react';

// Export Section interface for use in other components
export interface Section {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  content: React.ReactNode;
}

const Instructions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>(['getting-started']);
  const [activeTab, setActiveTab] = useState<'guide' | 'videos' | 'faq' | 'shortcuts'>('guide');
  const [copied, setCopied] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'text'>('pdf');
  const [downloadError, setDownloadError] = useState<string | null>(null);
  
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Generate plain text content with improved formatting
  const generateTextContent = (): string => {
    const date = new Date();
    const sections_data = sections;
    const currentSection = sections.find(s => s.id === selectedSection);
    
    // Helper to extract text content from React nodes
    const extractText = (content: React.ReactNode): string => {
      if (typeof content === 'string') return content;
      if (typeof content === 'number') return content.toString();
      if (Array.isArray(content)) return content.map(extractText).join('');
      if (React.isValidElement(content)) {
        const props = content.props as any;
        if (props.children) return extractText(props.children);
        return '';
      }
      return '';
    };

    let text = '';
    
    // Header
    text += '='.repeat(80) + '\n';
    text += '                    BARANGAY KIBAWE MANAGEMENT SYSTEM\n';
    text += '                         COMPLETE USER GUIDE\n';
    text += '='.repeat(80) + '\n\n';
    
    // Metadata
    text += `Generated: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}\n`;
    text += `Document Type: ${selectedSection !== 'overview' ? 'Section Guide' : 'Full Guide'}\n`;
    text += `Version: 2.0\n`;
    text += '-'.repeat(80) + '\n\n';
    
    // System Overview Statistics
    text += 'SYSTEM OVERVIEW STATISTICS\n';
    text += '─'.repeat(40) + '\n';
    text += 'Active Residents: 5,234\n';
    text += 'Households: 1,245\n';
    text += 'Clearances Today: 156\n';
    text += "Today's Collection: ₱45,200\n\n";
    
    // Table of Contents
    text += 'TABLE OF CONTENTS\n';
    text += '─'.repeat(40) + '\n';
    sections_data.forEach((section, index) => {
      text += `${(index + 1).toString().padStart(2, '0')}. ${section.title}\n`;
      text += `   ${section.description}\n`;
    });
    text += '\n' + '='.repeat(80) + '\n\n';
    
    if (selectedSection !== 'overview' && currentSection) {
      // Single section
      text += `${currentSection.title}\n`;
      text += '═'.repeat(currentSection.title.length) + '\n\n';
      text += `Description: ${currentSection.description}\n\n`;
      text += extractText(currentSection.content);
    } else {
      // All sections
      sections_data.forEach((section, index) => {
        text += `${index + 1}. ${section.title}\n`;
        text += '─'.repeat(section.title.length + 3) + '\n';
        text += `${section.description}\n\n`;
        text += extractText(section.content);
        
        // Add keyboard shortcuts section if it's the shortcuts section
        if (section.id === 'shortcuts') {
          text += '\nKEYBOARD SHORTCUTS\n';
          text += '─'.repeat(18) + '\n';
          shortcuts.forEach(shortcut => {
            text += `${shortcut.key.padEnd(12)} - ${shortcut.description}\n`;
          });
        }
        
        // Add FAQ section if it's the FAQ section
        if (section.id === 'faq') {
          text += '\nFREQUENTLY ASKED QUESTIONS\n';
          text += '─'.repeat(26) + '\n';
          faqItems.forEach((faq, idx) => {
            text += `\nQ${idx + 1}: ${faq.question}\n`;
            text += `A: ${faq.answer}\n`;
          });
        }
        
        text += '\n' + '-'.repeat(40) + '\n\n';
      });
      
      // Quick Tips
      text += '\nQUICK TIPS & BEST PRACTICES\n';
      text += '═'.repeat(27) + '\n';
      text += '• Use keyboard shortcuts to speed up common tasks\n';
      text += '• Regular data backup ensures information safety\n';
      text += '• Verify resident information before issuing clearances\n';
      text += '• Daily reconciliation of collections is recommended\n';
      text += '• Review audit logs periodically for security\n\n';
      
      // Version History
      text += 'VERSION HISTORY\n';
      text += '═'.repeat(14) + '\n';
      text += 'Version 2.0 (March 2024)\n';
      text += '  • Complete system overhaul with modern UI\n';
      text += '  • Enhanced security features\n';
      text += '  • New reporting capabilities\n';
      text += '  • Mobile-responsive design\n';
      text += '  • Improved performance and speed\n\n';
      text += 'Version 1.5 (January 2024)\n';
      text += '  • Added payment tracking system\n';
      text += '  • Resident management enhancements\n';
      text += '  • Bug fixes and optimizations\n\n';
    }
    
    // Footer
    text += '\n' + '='.repeat(80) + '\n';
    text += '                     END OF DOCUMENT\n';
    text += '='.repeat(80) + '\n\n';
    text += `This document was generated from the Barangay Kibawe Management System.\n`;
    text += `For support, contact: support@bms-kibawe.gov.ph\n`;
    text += `Document ID: ${Math.random().toString(36).substring(2, 15).toUpperCase()}\n`;
    
    return text;
  };

  // Handle download based on selected format
  const handleDownload = async () => {
    setIsGeneratingPDF(true);
    setDownloadError(null);
    
    try {
      if (downloadFormat === 'text') {
        // Generate text content directly
        const textContent = generateTextContent();
        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Barangay_System_Guide_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setIsGeneratingPDF(false);
        setShowDownloadOptions(false);
        return;
      }

      // For PDF format, make API request
      const url = new URL('/instructions/download', window.location.origin);
      url.searchParams.append('format', downloadFormat);
      
      if (selectedSection !== 'overview' && selectedSection) {
        url.searchParams.append('section', selectedSection);
        url.searchParams.append('type', 'section');
      } else {
        url.searchParams.append('type', 'full');
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/pdf',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Download failed with status: ${response.status}`);
      }
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Barangay_System_Guide_${new Date().toISOString().split('T')[0]}.pdf`;
      
      if (contentDisposition) {
        const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match && match[1]) {
          filename = match[1].replace(/['"]/g, '');
        }
      }
      
      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_blob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url_blob);
      
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error instanceof Error ? error.message : 'Failed to download. Please try again.');
      alert(error instanceof Error ? error.message : 'Failed to download. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
      setShowDownloadOptions(false);
      setTimeout(() => setDownloadError(null), 5000);
    }
  };

  // Sections data
  const sections: Section[] = [
    {
      id: 'overview',
      title: 'System Overview',
      icon: Globe2,
      description: 'Complete guide to the Barangay Management System',
      content: (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/10"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-white/10"></div>
            <h2 className="relative text-2xl font-bold">Welcome to Barangay Kibawe Management System</h2>
            <p className="relative mt-2 text-blue-100">
              Your complete digital solution for efficient barangay governance and community service
            </p>
            <div className="relative mt-4 flex gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Version 2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Last Updated: March 2024</span>
              </div>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Fast Processing</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reduce clearance processing time by 70%</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Secure & Reliable</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Enterprise-grade security with daily backups</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">User-Friendly</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Intuitive interface for all user levels</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">5,234</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Residents</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">1,245</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Households</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">156</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Clearances Today</div>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">₱45.2K</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today's Collection</div>
            </div>
          </div>

          {/* System Requirements */}
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Settings className="h-5 w-5" />
              System Requirements
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-300">Minimum Requirements</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Modern web browser (Chrome 90+, Firefox 88+, Edge 90+)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Internet connection (minimum 1 Mbps)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>4GB RAM for optimal performance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Screen resolution: 1280x720 or higher</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-2 font-medium text-gray-800 dark:text-gray-300">Recommended Setup</h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Chrome/Firefox latest version</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>5+ Mbps internet connection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>8GB RAM for heavy usage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Dual monitor setup for multitasking</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-300">
              <Zap className="h-5 w-5" />
              Quick Actions
            </h3>
            <div className="grid gap-3 md:grid-cols-4">
              <Link
                href="/admin/residents/create"
                className="flex items-center gap-2 rounded-lg bg-white p-3 text-blue-700 hover:bg-blue-100 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add Resident</span>
              </Link>
              <Link
                href="/admin/clearances/create"
                className="flex items-center gap-2 rounded-lg bg-white p-3 text-purple-700 hover:bg-purple-100 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-gray-700"
              >
                <FileText className="h-4 w-4" />
                <span>New Clearance</span>
              </Link>
              <Link
                href="/admin/payments/create"
                className="flex items-center gap-2 rounded-lg bg-white p-3 text-green-700 hover:bg-green-100 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
              >
                <CreditCard className="h-4 w-4" />
                <span>Record Payment</span>
              </Link>
              <Link
                href="/admin/reports"
                className="flex items-center gap-2 rounded-lg bg-white p-3 text-amber-700 hover:bg-amber-100 dark:bg-gray-800 dark:text-amber-400 dark:hover:bg-gray-700"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Generate Report</span>
              </Link>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Rocket,
      description: 'Initial setup and login instructions',
      content: (
        <div className="space-y-6">
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-green-800 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Prerequisites
            </h3>
            <ul className="mt-2 space-y-2 text-green-700 dark:text-green-300">
              <li>• Valid user account provided by system administrator</li>
              <li>• Internet connection and modern web browser</li>
              <li>• User role and permissions assigned</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Step 1: Access the System</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Open your web browser and navigate to: <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-800">https://bms-kibawe.gov.ph</code>
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Step 2: Login</h3>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <p className="mb-2 text-gray-600 dark:text-gray-400">Enter your credentials:</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><span className="font-medium">Username:</span> Your employee ID or email</li>
                <li><span className="font-medium">Password:</span> Initial password provided by admin</li>
              </ul>
              <div className="mt-3 rounded bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                First-time users will be prompted to change their password.
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Step 3: Dashboard Overview</h3>
            <p className="text-gray-600 dark:text-gray-400">
              After login, you'll see the main dashboard with key metrics and quick access to common functions.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Understanding the main dashboard',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            The dashboard provides a real-time overview of your barangay's key metrics and activities.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Dashboard Components</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• <span className="font-medium">Statistics Cards</span> - Quick overview of residents, clearances, payments</li>
                <li>• <span className="font-medium">Recent Activities</span> - Latest system actions and updates</li>
                <li>• <span className="font-medium">Charts & Graphs</span> - Visual representation of data trends</li>
                <li>• <span className="font-medium">Quick Actions</span> - Frequently used functions</li>
                <li>• <span className="font-medium">Notifications</span> - System alerts and reminders</li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Customization Options</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Rearrange widgets by dragging</li>
                <li>• Choose which statistics to display</li>
                <li>• Set date ranges for charts</li>
                <li>• Save custom dashboard layouts</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-400">Pro Tip</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Click on any statistic card to view detailed reports and analytics for that specific metric.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'residents',
      title: 'Residents Management',
      icon: Users,
      description: 'Managing resident records',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Complete resident information management system with advanced search and filtering capabilities.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Adding New Residents</h3>
              <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Click "Add Resident" button</li>
                <li>Fill in personal information</li>
                <li>Upload required documents</li>
                <li>Assign household</li>
                <li>Click "Save" to complete</li>
              </ol>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Resident Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• <span className="font-medium">Advanced Search</span> - Search by name, age, address, etc.</li>
                <li>• <span className="font-medium">Filters</span> - Filter by status, age group, gender</li>
                <li>• <span className="font-medium">Export</span> - Export resident lists to Excel/PDF</li>
                <li>• <span className="font-medium">History</span> - Track resident record changes</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-yellow-800 dark:text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              Important Note
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Resident records are protected by data privacy laws. Only authorized personnel can access sensitive information.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'clearances',
      title: 'Barangay Clearances',
      icon: FileText,
      description: 'Processing and managing clearances',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Streamlined clearance processing system for various types of barangay certifications.
          </p>

          <div className="grid gap-6">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Clearance Types</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded bg-gray-50 p-3 text-center dark:bg-gray-800">
                  <div className="font-medium text-gray-900 dark:text-white">Barangay Clearance</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">General purpose</div>
                </div>
                <div className="rounded bg-gray-50 p-3 text-center dark:bg-gray-800">
                  <div className="font-medium text-gray-900 dark:text-white">Business Clearance</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">For business permits</div>
                </div>
                <div className="rounded bg-gray-50 p-3 text-center dark:bg-gray-800">
                  <div className="font-medium text-gray-900 dark:text-white">Indigency</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">For financial assistance</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Processing Steps</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">1</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Application</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Resident submits clearance request</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">2</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Verification</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Verify resident information and eligibility</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">3</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Payment</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Process clearance fee payment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-400">4</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Printing</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Generate and print clearance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'payments',
      title: 'Payments & Collections',
      icon: CreditCard,
      description: 'Managing payments and financial records',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive payment tracking and collection management system.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Payment Types</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Clearance Fees</li>
                <li>• Business Permit Fees</li>
                <li>• Community Tax</li>
                <li>• Donations</li>
                <li>• Other Collections</li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Multiple payment methods (cash, GCash, bank transfer)</li>
                <li>• Automatic receipt generation</li>
                <li>• Daily collection reports</li>
                <li>• Payment history tracking</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <h4 className="mb-2 font-medium text-green-800 dark:text-green-400">Daily Closing</h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              End-of-day reconciliation should be completed by all cashiers. The system automatically generates a closing report.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      icon: BarChart3,
      description: 'Generating and viewing reports',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Generate comprehensive reports and analyze barangay data.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Demographic Reports</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Population by age group</li>
                <li>Gender distribution</li>
                <li>Household statistics</li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Financial Reports</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Daily collections</li>
                <li>Monthly summaries</li>
                <li>Annual financial statements</li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Operational Reports</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Clearance issuance</li>
                <li>Certificate requests</li>
                <li>Staff performance</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
            <h4 className="mb-2 font-medium text-purple-800 dark:text-purple-400">Export Options</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Reports can be exported in multiple formats: PDF, Excel, CSV, and HTML for further analysis.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'users',
      title: 'User Management',
      icon: UserCog,
      description: 'Managing system users and roles',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Control access and permissions for all system users.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">User Roles</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Super Admin</span>
                  <span className="text-gray-500 dark:text-gray-400">- Full system access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Admin</span>
                  <span className="text-gray-500 dark:text-gray-400">- Most features except system settings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Encoder</span>
                  <span className="text-gray-500 dark:text-gray-400">- Data entry only</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Viewer</span>
                  <span className="text-gray-500 dark:text-gray-400">- Read-only access</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">User Management Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Create and edit user accounts</li>
                <li>• Assign and modify roles</li>
                <li>• Reset passwords</li>
                <li>• Enable/disable accounts</li>
                <li>• View audit logs</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <h4 className="mb-2 flex items-center gap-2 font-medium text-red-800 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Security Warning
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              Only assign Super Admin role to trusted personnel. Regular review of user permissions is recommended.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'System Settings',
      icon: Settings,
      description: 'Configuring system preferences',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Configure and customize the system according to your barangay's needs.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">General Settings</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Barangay information</li>
                <li>• System name and logo</li>
                <li>• Date and time format</li>
                <li>• Language preferences</li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Fee Configuration</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Clearance fees</li>
                <li>• Business permit fees</li>
                <li>• Community tax rates</li>
                <li>• Other service fees</li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Notification Settings</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Email notifications</li>
                <li>• SMS alerts</li>
                <li>• System alerts</li>
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Backup Settings</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>• Automatic backup schedule</li>
                <li>• Backup location</li>
                <li>• Retention period</li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-400">Important</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Changes to system settings affect all users. Some changes may require system restart.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'shortcuts',
      title: 'Keyboard Shortcuts',
      icon: Keyboard,
      description: 'List of all keyboard shortcuts',
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Increase your productivity with these keyboard shortcuts.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Open command palette</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Create new record</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">Ctrl + N</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Save current form</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">Ctrl + S</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Search</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">Ctrl + F</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Print</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">Ctrl + P</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Export data</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">Ctrl + E</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Open help guide</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">F1</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Close modal/panel</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">Esc</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Show keyboard shortcuts</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">?</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Duplicate record</span>
              <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">Ctrl + D</kbd>
            </div>
          </div>

          <div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
            <h4 className="mb-2 font-medium text-purple-800 dark:text-purple-400">Pro Tip</h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Press <kbd className="rounded bg-purple-200 px-2 py-1 font-mono text-xs dark:bg-purple-800">?</kbd> anywhere in the system to view this shortcuts guide.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: 'Frequently Asked Questions',
      icon: HelpCircle,
      description: 'Common questions and answers',
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">How do I reset a user password?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Go to Settings → User Management, select the user, and click "Reset Password". The system will send a password reset link to their email.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">What happens if I delete a resident record?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Resident records are soft-deleted by default, meaning they can be restored within 30 days. After 30 days, they are permanently deleted from the system.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">Can I undo a payment transaction?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes, but only within 24 hours and requires supervisor approval. Go to Payments → Transaction History, find the transaction, and click "Void".
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">How often is data backed up?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              The system performs automatic backups daily at 2:00 AM. Manual backups can be initiated anytime from Settings → Backup.
            </p>
          </div>
        </div>
      )
    }
  ];

  // Video tutorials
  const videoTutorials = [
    {
      title: 'Getting Started with BMS',
      duration: '5:30',
      thumbnail: '/thumbnails/getting-started.jpg',
      views: '1.2K'
    },
    {
      title: 'Resident Management Guide',
      duration: '8:15',
      thumbnail: '/thumbnails/residents.jpg',
      views: '856'
    },
    {
      title: 'Processing Clearances',
      duration: '6:45',
      thumbnail: '/thumbnails/clearances.jpg',
      views: '2.1K'
    },
    {
      title: 'Payment Collection Tutorial',
      duration: '4:20',
      thumbnail: '/thumbnails/payments.jpg',
      views: '1.5K'
    }
  ];

  // FAQ items
  const faqItems = [
    {
      question: 'How do I reset a user password?',
      answer: 'Go to Settings → User Management, select the user, and click "Reset Password". The system will send a password reset link to their email.'
    },
    {
      question: 'What happens if I delete a resident record?',
      answer: 'Resident records are soft-deleted by default, meaning they can be restored within 30 days. After 30 days, they are permanently deleted from the system.'
    },
    {
      question: 'Can I undo a payment transaction?',
      answer: 'Yes, but only within 24 hours and requires supervisor approval. Go to Payments → Transaction History, find the transaction, and click "Void".'
    },
    {
      question: 'How often is data backed up?',
      answer: 'The system performs automatic backups daily at 2:00 AM. Manual backups can be initiated anytime from Settings → Backup.'
    }
  ];

  // Keyboard shortcuts
  const shortcuts = [
    { key: 'Ctrl + K', description: 'Open command palette' },
    { key: 'Ctrl + N', description: 'Create new record' },
    { key: 'Ctrl + S', description: 'Save current form' },
    { key: 'Ctrl + F', description: 'Search' },
    { key: 'Ctrl + P', description: 'Print' },
    { key: 'Ctrl + E', description: 'Export data' },
    { key: 'F1', description: 'Open help guide' },
    { key: 'Esc', description: 'Close modal/panel' },
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Ctrl + D', description: 'Duplicate record' }
  ];

  const selectedContent = sections.find(s => s.id === selectedSection) || sections[0];

  // Helper function to get icon component
  const getIcon = (IconComponent: LucideIcon) => {
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <>
      <Head title="System Instructions - Barangay Kibawe" />
      
      <AppLayout>
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                System Instructions
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Learn how to use the Barangay Management System effectively
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>

              {/* PrintContent Component - Now handles printing */}
              <PrintContent 
                sections={sections}
                selectedSection={selectedSection}
                faqItems={faqItems}
                shortcuts={shortcuts}
              />

              {/* Download Button with Options */}
              <div className="relative">
                <button
                  onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  <Download className="h-4 w-4" />
                  {isGeneratingPDF ? 'Generating...' : 'Download Guide'}
                </button>

                {showDownloadOptions && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 z-10">
                    <div className="p-2">
                      <div className="mb-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        SELECT FORMAT
                      </div>
                      
                      <label className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="format"
                          value="pdf"
                          checked={downloadFormat === 'pdf'}
                          onChange={(e) => setDownloadFormat(e.target.value as 'pdf' | 'text')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">PDF Document</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Best for printing</p>
                        </div>
                      </label>

                      <label className="mb-1 flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="format"
                          value="text"
                          checked={downloadFormat === 'text'}
                          onChange={(e) => setDownloadFormat(e.target.value as 'pdf' | 'text')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Plain Text</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Simple text format</p>
                        </div>
                      </label>

                      <div className="mt-2 border-t border-gray-200 pt-2 dark:border-gray-700">
                        <button
                          onClick={handleDownload}
                          disabled={isGeneratingPDF}
                          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingPDF ? 'Generating...' : 'Download'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {downloadError && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    {downloadError}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
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
                      'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                      isActive
                        ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div ref={contentRef}>
            {activeTab === 'guide' && (
              <div className="grid grid-cols-12 gap-6">
                {/* Sidebar Navigation */}
                <div className="col-span-3">
                  <div className="sticky top-20 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                      All Sections
                    </h3>
                    <nav className="space-y-1">
                      {sections.map((section) => {
                        const isSelected = selectedSection === section.id;
                        return (
                          <button
                            key={section.id}
                            onClick={() => setSelectedSection(section.id)}
                            className={cn(
                              'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                              isSelected
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            )}
                          >
                            <div className={cn(
                              'mt-0.5 rounded p-1',
                              isSelected
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            )}>
                              {getIcon(section.icon)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{section.title}</div>
                              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                {section.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </nav>

                    {/* Download Resources */}
                    <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Resources
                      </h4>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            setDownloadFormat('pdf');
                            handleDownload();
                          }}
                          className="flex w-full items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                          <Download className="h-4 w-4" />
                          User Manual (PDF)
                        </button>
                        <button
                          onClick={() => {
                            setDownloadFormat('text');
                            handleDownload();
                          }}
                          className="flex w-full items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        >
                          <Download className="h-4 w-4" />
                          Quick Reference Card
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="col-span-9">
                  <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    {/* Breadcrumb */}
                    <nav className="mb-4 flex items-center gap-2 text-sm">
                      <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        Home
                      </Link>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">Instructions</span>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                      <span className="text-blue-600 dark:text-blue-400">{selectedContent.title}</span>
                    </nav>

                    {/* Section Header */}
                    <div className="mb-6 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                          {getIcon(selectedContent.icon)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedContent.title}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400">
                            {selectedContent.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowDownloadOptions(true)}
                          className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700">
                          <Share2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Content */}
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {selectedContent.content}
                    </div>

                    {/* Previous/Next Navigation */}
                    <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700">
                      <button
                        onClick={() => {
                          const currentIndex = sections.findIndex(s => s.id === selectedSection);
                          if (currentIndex > 0) {
                            setSelectedSection(sections[currentIndex - 1].id);
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous: {sections.find((s, i) => i === sections.findIndex(s2 => s2.id === selectedSection) - 1)?.title || 'None'}
                      </button>
                      <button
                        onClick={() => {
                          const currentIndex = sections.findIndex(s => s.id === selectedSection);
                          if (currentIndex < sections.length - 1) {
                            setSelectedSection(sections[currentIndex + 1].id);
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                      >
                        Next: {sections.find((s, i) => i === sections.findIndex(s2 => s2.id === selectedSection) + 1)?.title || 'None'}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'videos' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Video Tutorials</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {videoTutorials.map((video, idx) => (
                    <div key={idx} className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black/50 p-3 text-white group-hover:bg-black/70">
                            <Video className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                          {video.duration}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{video.title}</h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Eye className="h-3 w-3" />
                        <span>{video.views} views</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {faqItems.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <button
                        onClick={() => toggleSection(`faq-${idx}`)}
                        className="flex w-full items-center justify-between text-left"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {faq.question}
                        </h3>
                        {expandedSections.includes(`faq-${idx}`) ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      {expandedSections.includes(`faq-${idx}`) && (
                        <p className="mt-4 text-gray-600 dark:text-gray-400">{faq.answer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                    >
                      <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                      <kbd className="rounded bg-gray-100 px-3 py-1.5 font-mono text-sm font-semibold text-gray-900 dark:bg-gray-700 dark:text-white">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
                
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <h3 className="mb-2 flex items-center gap-2 font-medium text-blue-800 dark:text-blue-400">
                    <Keyboard className="h-4 w-4" />
                    Pro Tip
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Press <kbd className="rounded bg-blue-200 px-2 py-1 font-mono text-xs dark:bg-blue-800">?</kbd> anywhere in the system to view this shortcuts guide.
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

// Additional icon components
const Rocket = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UserCog = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 10l2 2m0 0l2-2m-2 2v6" />
  </svg>
);

export default Instructions;
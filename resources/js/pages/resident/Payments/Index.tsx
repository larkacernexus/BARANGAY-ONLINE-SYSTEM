import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, usePage, router, Head } from '@inertiajs/react';
import { toast } from 'sonner';
import { format, isValid } from 'date-fns';

// Components
import ResidentLayout from '@/layouts/resident-app-layout';
import ResidentMobileFooter from '@/layouts/resident-mobile-sticky-footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Icons
import {
  AlertCircle,
  Search,
  Eye,
  Plus,
  Check,
  X,
  Square,
  Grid,
  List,
  MoreVertical,
  Copy,
  FileText,
  Printer,
  Download,
  Share2,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  Clock,
  CreditCard,
  Banknote,
  ShieldCheck,
  Receipt,
  CheckCircle,
  XCircle,
  X as XIcon,
  SlidersHorizontal,
  LucideIcon,
} from 'lucide-react';

// Extracted Components
import { StatusBadge } from '@/components/residentui/StatusBadge';
import { MobilePaymentCard } from '@/components/residentui/MobilePaymentCard';
import { DesktopGridViewCard } from '@/components/residentui/DesktopGridViewCard';
import { CollapsibleStats } from '@/components/residentui/CollapsibleStats';
import { DesktopStats } from '@/components/residentui/DesktopStats';
import { FilterspaymentSection } from '@/components/residentui/FilterspaymentSection';
import { CustomTabs } from '@/components/residentui/CustomTabs';

// Types
type PaymentStatus = 'completed' | 'paid' | 'pending' | 'overdue' | 'cancelled';
type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'bank' | 'check' | 'online';
type ViewMode = 'grid' | 'list';
type TabValue = 'all' | PaymentStatus;

interface StatusConfig {
  label: string;
  color: string;
  textColor: string;
  variant: 'paid' | 'pending' | 'overdue' | 'cancelled';
}

interface PaymentMethodConfig {
  label: string;
  color: string;
  textColor: string;
  icon: LucideIcon;
}

interface PayerDetails {
  name: string;
  contact_number?: string;
  address?: string;
  household_number?: string;
  purok?: string;
}

interface PaymentItem {
  id: number;
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Payment {
  id: number;
  or_number: string;
  reference_number?: string;
  purpose: string;
  subtotal: number;
  surcharge: number;
  penalty: number;
  discount: number;
  total_amount: number;
  payment_date: string;
  due_date?: string;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  payment_method_display: string;
  is_cleared: boolean;
  certificate_type?: string;
  certificate_type_display?: string;
  collection_type: string;
  collection_type_display: string;
  remarks?: string;
  formatted_total: string;
  formatted_date: string;
  formatted_subtotal: string;
  formatted_surcharge: string;
  formatted_penalty: string;
  formatted_discount: string;
  payer_details?: PayerDetails;
  items?: PaymentItem[];
}

interface PaginationData {
  data: Payment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface StatsData {
  total_payments: number;
  pending_payments: number;
  total_paid: number;
  balance_due: number;
  completed_payments: number;
  overdue_payments: number;
  cancelled_payments: number;
  current_year_total: number;
  current_year_paid: number;
  current_year_balance: number;
}

interface PageProps extends Record<string, any> {
  payments?: PaginationData;
  stats?: StatsData;
  availableYears?: number[];
  availablePaymentMethods?: Array<{
    type: string;
    display_name: string;
  }>;
  currentResident?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  hasProfile?: boolean;
  filters?: {
    search?: string;
    status?: string;
    payment_method?: string;
    year?: string;
    page?: string;
  };
  error?: string;
}

// Constants
const STATUS_CONFIG: Record<PaymentStatus, StatusConfig> = {
  completed: {
    label: 'Paid',
    color: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    variant: 'paid',
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    variant: 'paid',
  },
  pending: {
    label: 'Pending',
    color: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-800 dark:text-amber-300',
    variant: 'pending',
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-800 dark:text-red-300',
    variant: 'overdue',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-800 dark:text-gray-300',
    variant: 'cancelled',
  },
};

const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, PaymentMethodConfig> = {
  cash: {
    label: 'Cash',
    color: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-800 dark:text-green-300',
    icon: Banknote,
  },
  gcash: {
    label: 'GCash',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-800 dark:text-blue-300',
    icon: CreditCard,
  },
  maya: {
    label: 'Maya',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    textColor: 'text-purple-800 dark:text-purple-300',
    icon: CreditCard,
  },
  bank: {
    label: 'Bank Transfer',
    color: 'bg-indigo-100 dark:bg-indigo-900/30',
    textColor: 'text-indigo-800 dark:text-indigo-300',
    icon: Banknote,
  },
  check: {
    label: 'Check',
    color: 'bg-gray-100 dark:bg-gray-900/30',
    textColor: 'text-gray-800 dark:text-gray-300',
    icon: FileText,
  },
  online: {
    label: 'Online',
    color: 'bg-teal-100 dark:bg-teal-900/30',
    textColor: 'text-teal-800 dark:text-teal-300',
    icon: ShieldCheck,
  },
};

const PAYMENT_TABS = [
  { value: 'all' as TabValue, label: 'All', icon: Receipt },
  { value: 'paid' as TabValue, label: 'Paid', icon: CheckCircle },
  { value: 'pending' as TabValue, label: 'Pending', icon: Clock },
  { value: 'overdue' as TabValue, label: 'Overdue', icon: AlertCircle },
  { value: 'cancelled' as TabValue, label: 'Cancelled', icon: XCircle },
];

// Utility Functions
const formatDate = (dateString: string, isMobile: boolean): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (!isValid(date)) return 'N/A';

    return isMobile
      ? format(date, 'MMM dd')
      : format(date, 'MMM dd, yyyy');
  } catch {
    return 'N/A';
  }
};

const formatCurrency = (amount: number): string => {
  return `₱${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const copyToClipboard = async (text: string, successMessage: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error('Failed to copy');
  }
};

// Custom Hooks
const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const useFilters = (initialFilters: PageProps['filters']) => {
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [statusFilter, setStatusFilter] = useState<TabValue>(
    (initialFilters?.status as TabValue) || 'all'
  );
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(
    initialFilters?.payment_method || 'all'
  );
  const [yearFilter, setYearFilter] = useState(initialFilters?.year || 'all');

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    yearFilter,
    setYearFilter,
  };
};

// Components
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const statusKey = status as PaymentStatus;
  const config = STATUS_CONFIG[statusKey];

  if (!config) {
    return (
      <Badge className="bg-gray-100 text-gray-800 border-0 px-2 py-1 capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  }

  const Icon =
    config.variant === 'paid'
      ? CheckCircle
      : config.variant === 'pending'
      ? Clock
      : config.variant === 'overdue'
      ? AlertCircle
      : XCircle;

  return (
    <Badge className={`${config.color} ${config.textColor} border-0 px-2 py-1 gap-1`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

const PaymentMethodBadge = ({ method }: { method: string }) => {
  const methodKey = method as PaymentMethod;
  const config = PAYMENT_METHOD_CONFIG[methodKey];

  if (!config) {
    return (
      <Badge variant="outline" className="text-gray-700">
        {method}
      </Badge>
    );
  }

  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`${config.color} ${config.textColor} border-0 gap-1`}>
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

interface EmptyStateProps {
  statusFilter: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const EmptyState = ({ statusFilter, hasActiveFilters, onClearFilters }: EmptyStateProps) => {
  const Icon =
    statusFilter === 'all'
      ? Receipt
      : statusFilter === 'paid'
      ? CheckCircle
      : statusFilter === 'pending'
      ? Clock
      : statusFilter === 'overdue'
      ? AlertCircle
      : XCircle;

  return (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        No {statusFilter === 'all' ? 'payments' : statusFilter.replace('_', ' ')} found
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">
        {hasActiveFilters
          ? 'Try adjusting your filters'
          : statusFilter === 'all'
          ? 'You have no payments'
          : `You have no ${statusFilter.replace('_', ' ')} payments`}
      </p>
      {hasActiveFilters && (
        <Button variant="outline" onClick={onClearFilters} size="sm">
          Clear Filters
        </Button>
      )}
    </div>
  );
};

interface SelectionModeBannerProps {
  selectMode: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onCancelSelect: () => void;
}

const SelectionModeBanner = ({
  selectMode,
  selectedCount,
  totalCount,
  onSelectAll,
  onDeleteSelected,
  onCancelSelect,
}: SelectionModeBannerProps) => {
  if (!selectMode) return null;

  return (
    <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1">
            <Square className="h-3 w-3" />
            Selection Mode
          </Badge>
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedCount} payment{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="flex-1 sm:flex-none"
          >
            {selectedCount === totalCount && totalCount > 0
              ? 'Deselect All'
              : 'Select All'}
          </Button>
          {selectedCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onDeleteSelected}
              className="flex-1 sm:flex-none"
            >
              Delete Selected
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelSelect}
            className="flex-1 sm:flex-none"
          >
            <XIcon className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchClear: () => void;
  paymentMethodFilter: string;
  onPaymentMethodChange: (method: string) => void;
  yearFilter: string;
  onYearChange: (year: string) => void;
  loading: boolean;
  availablePaymentMethods: Array<{ type: string; display_name: string }>;
  availableYears: number[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const MobileFilterModal = ({
  isOpen,
  onClose,
  search,
  onSearchChange,
  onSearchSubmit,
  onSearchClear,
  paymentMethodFilter,
  onPaymentMethodChange,
  yearFilter,
  onYearChange,
  loading,
  availablePaymentMethods,
  availableYears,
  hasActiveFilters,
  onClearFilters,
}: MobileFilterModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed bottom-0 left-0 right-0 z-[101] animate-in slide-in-from-bottom duration-300">
        <div className="bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <SlidersHorizontal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Filter Payments
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <XIcon className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search Payments
              </label>
              <form onSubmit={onSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search by OR#, purpose, reference..."
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={onSearchClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <XIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </form>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Method
              </label>
              <Select
                value={paymentMethodFilter}
                onValueChange={onPaymentMethodChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All payment methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All payment methods</SelectItem>
                  {availablePaymentMethods.map((method) => (
                    <SelectItem key={method.type} value={method.type}>
                      {method.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Year
              </label>
              <Select value={yearFilter} onValueChange={onYearChange} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Filters are active
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t dark:border-gray-800 p-4 space-y-3 pb-safe-bottom">
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  onClearFilters();
                  onClose();
                }}
                className="w-full"
              >
                <XIcon className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            )}
            <Button onClick={onClose} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

interface PaymentsTableProps {
  payments: Payment[];
  selectMode: boolean;
  selectedPayments: number[];
  toggleSelectPayment: (id: number) => void;
  selectAllPayments: () => void;
  isMobile: boolean;
}

const PaymentsTable = ({
  payments,
  selectMode,
  selectedPayments,
  toggleSelectPayment,
  selectAllPayments,
  isMobile,
}: PaymentsTableProps) => {
  const handleCopyOrNumber = useCallback((orNumber: string) => {
    copyToClipboard(orNumber, `Copied: ${orNumber}`);
  }, []);

  const handleCopyReference = useCallback((referenceNumber: string) => {
    copyToClipboard(referenceNumber, `Copied: ${referenceNumber}`);
  }, []);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {selectMode && (
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={selectedPayments.length === payments.length && payments.length > 0}
                  onChange={selectAllPayments}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </TableHead>
            )}
            <TableHead>OR Details</TableHead>
            <TableHead>Purpose & Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              {selectMode && (
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedPayments.includes(payment.id)}
                    onChange={() => toggleSelectPayment(payment.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableCell>
              )}
              <TableCell>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => handleCopyOrNumber(payment.or_number)}
                      className="font-mono text-sm font-medium hover:text-blue-600 transition-colors"
                      title="Copy OR number"
                    >
                      OR #{payment.or_number}
                    </button>
                    {payment.reference_number && (
                      <Badge variant="outline" size="sm" className="text-xs">
                        Ref: {payment.reference_number}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {payment.collection_type_display}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {payment.purpose}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {payment.certificate_type_display || 'General Payment'}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div>
                    <p className="text-xs text-gray-500">Paid</p>
                    <p className="text-sm">{formatDate(payment.payment_date, isMobile)}</p>
                  </div>
                  {payment.due_date && (
                    <div>
                      <p
                        className={`text-xs ${
                          payment.status === 'overdue' ? 'text-red-600' : 'text-gray-500'
                        }`}
                      >
                        Due
                      </p>
                      <p
                        className={`text-sm ${
                          payment.status === 'overdue' ? 'text-red-600 font-medium' : ''
                        }`}
                      >
                        {formatDate(payment.due_date, isMobile)}
                      </p>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <PaymentMethodBadge method={payment.payment_method} />
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={payment.status} />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-bold">{payment.formatted_total}</div>
                  {((payment.surcharge || 0) > 0 ||
                    (payment.penalty || 0) > 0 ||
                    (payment.discount || 0) > 0) && (
                    <div className="text-xs text-gray-500">
                      Base: {payment.formatted_subtotal}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Link href={`/my-payments/${payment.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {(payment.status === 'completed' || payment.status === 'paid') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={() => toast.info('Receipt download would be implemented here')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {(payment.status === 'pending' || payment.status === 'overdue') && (
                    <Link href={`/my-payments/create?payment_id=${payment.id}`}>
                      <Button size="sm" variant="default" className="h-8 px-3 text-xs bg-green-600 hover:bg-green-700">
                        Pay
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleCopyOrNumber(payment.or_number)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy OR Number
                      </DropdownMenuItem>
                      {payment.reference_number && (
                        <DropdownMenuItem
                          onClick={() => handleCopyReference(payment.reference_number!)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Reference
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          const reportWindow = window.open('', '_blank');
                          if (reportWindow) {
                            reportWindow.document.write(`
                              <h1>Payment Receipt: ${payment.or_number}</h1>
                              <p><strong>Purpose:</strong> ${payment.purpose}</p>
                              <p><strong>Amount:</strong> ${payment.formatted_total}</p>
                              <p><strong>Status:</strong> ${payment.status}</p>
                            `);
                          }
                        }}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Receipt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

interface PaginationProps {
  pagination: PaginationData;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const Pagination = ({ pagination, loading, onPageChange }: PaginationProps) => {
  if (pagination.last_page <= 1) return null;

  return (
    <div className="mt-4 md:mt-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Page {pagination.current_page} of {pagination.last_page}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.current_page + 1)}
            disabled={pagination.current_page >= pagination.last_page || loading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function MyPayments() {
  const page = usePage<PageProps>();
  const pageProps = page.props;

  const isMobile = useDeviceDetection();
  const [loading, setLoading] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const hasInitialized = useRef(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Extract data with defaults
  const payments = pageProps.payments || {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
    links: [],
  };

  const stats = pageProps.stats || {
    total_payments: 0,
    pending_payments: 0,
    total_paid: 0,
    balance_due: 0,
    completed_payments: 0,
    overdue_payments: 0,
    cancelled_payments: 0,
    current_year_total: 0,
    current_year_paid: 0,
    current_year_balance: 0,
  };

  const availableYears = pageProps.availableYears || [];
  const availablePaymentMethods = pageProps.availablePaymentMethods || [];
  const hasProfile = pageProps.hasProfile || false;
  const filters = pageProps.filters || {};

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paymentMethodFilter,
    setPaymentMethodFilter,
    yearFilter,
    setYearFilter,
  } = useFilters(filters);

  // Initialize filters from props
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
    }
  }, []);

  // Search debounce
  useEffect(() => {
    if (!hasInitialized.current) return;
    if (search === '' && !filters.search) return;
    if (search === filters.search) return;

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      updateFilters({
        search: search.trim(),
        page: '1',
      });
    }, 800);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search, filters.search]);

  const updateFilters = useCallback(
    (newFilters: Record<string, string>) => {
      setLoading(true);

      const updatedFilters = {
        ...filters,
        ...newFilters,
      };

      const cleanFilters: Record<string, string> = {};

      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (key === 'page' && value === '1') return;
        if (value && value !== '' && value !== 'all') {
          cleanFilters[key] = value;
        }
      });

      router.get('/my-payments', cleanFilters, {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        onFinish: () => setLoading(false),
      });
    },
    [filters]
  );

  const handleTabChange = useCallback(
    (tab: TabValue) => {
      setStatusFilter(tab);
      updateFilters({
        status: tab === 'all' ? '' : tab,
        page: '1',
      });
    },
    [updateFilters]
  );

  const handlePaymentMethodChange = useCallback(
    (method: string) => {
      setPaymentMethodFilter(method);
      updateFilters({
        payment_method: method === 'all' ? '' : method,
        page: '1',
      });
    },
    [updateFilters]
  );

  const handleYearChange = useCallback(
    (year: string) => {
      setYearFilter(year);
      updateFilters({
        year: year === 'all' ? '' : year,
        page: '1',
      });
    },
    [updateFilters]
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setPaymentMethodFilter('all');
    setYearFilter('all');

    router.get('/my-payments', {}, {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => setLoading(false),
    });
  }, []);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      updateFilters({
        search: search.trim(),
        page: '1',
      });
    },
    [search, updateFilters]
  );

  const handleSearchClear = useCallback(() => {
    setSearch('');
    updateFilters({
      search: '',
      page: '1',
    });
  }, [updateFilters]);

  // Selection mode functions
  const toggleSelectPayment = useCallback((id: number) => {
    setSelectedPayments((prev) =>
      prev.includes(id) ? prev.filter((paymentId) => paymentId !== id) : [...prev, id]
    );
  }, []);

  const selectAllPayments = useCallback(() => {
    if (selectedPayments.length === payments.data.length && payments.data.length > 0) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.data.map((p) => p.id));
    }
  }, [payments.data, selectedPayments.length]);

  const handleDeleteSelected = useCallback(() => {
    if (confirm(`Are you sure you want to delete ${selectedPayments.length} selected payments?`)) {
      toast.success(`Deleted ${selectedPayments.length} payments`);
      setSelectedPayments([]);
      setSelectMode(false);
    }
  }, [selectedPayments.length]);

  const toggleSelectMode = useCallback(() => {
    if (selectMode) {
      setSelectMode(false);
      setSelectedPayments([]);
    } else {
      setSelectMode(true);
    }
  }, [selectMode]);

  const getStatusCount = useCallback(
    (status: TabValue): number => {
      switch (status) {
        case 'all':
          return stats.total_payments;
        case 'paid':
          return stats.completed_payments + payments.data.filter((p) => p.status === 'paid').length;
        case 'pending':
          return stats.pending_payments;
        case 'overdue':
          return stats.overdue_payments;
        case 'cancelled':
          return stats.cancelled_payments;
        default:
          return 0;
      }
    },
    [stats, payments.data]
  );

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(
      ([key, value]) => key !== 'page' && value && value !== '' && value !== 'all'
    );
  }, [filters]);

  const printPayments = useCallback(() => {
    if (payments.data.length === 0) {
      toast.error('No payments to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>My Payments Report</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .print-header { margin-bottom: 30px; }
              .print-info { display: flex; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; }
              .payment-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .payment-table th { background-color: #f3f4f6; padding: 12px; text-align: left; border: 1px solid #ddd; }
              .payment-table td { padding: 10px; border: 1px solid #ddd; }
              .badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; display: inline-block; }
              .badge-completed { background-color: #d1fae5; color: #065f46; }
              .badge-paid { background-color: #d1fae5; color: #065f46; }
              .badge-pending { background-color: #fef3c7; color: #92400e; }
              .badge-overdue { background-color: #fee2e2; color: #991b1b; }
              .badge-cancelled { background-color: #f3f4f6; color: #374151; }
              .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; }
              @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
              }
          </style>
      </head>
      <body>
          <div class="print-header">
              <h1>My Payments Report</h1>
              <div class="print-info">
                  <div>
                      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}</p>
                      <p><strong>Total Payments:</strong> ${payments.data.length}</p>
                      <p><strong>Status:</strong> ${
                        statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
                      }</p>
                  </div>
                  <div>
                      <p><strong>Total Paid:</strong> ${formatCurrency(stats.total_paid)}</p>
                      <p><strong>Balance Due:</strong> ${formatCurrency(stats.balance_due)}</p>
                      <p><strong>Pending Payments:</strong> ${stats.pending_payments || 0}</p>
                  </div>
              </div>
          </div>
          
          <table class="payment-table">
              <thead>
                  <tr>
                      <th>OR Number</th>
                      <th>Purpose</th>
                      <th>Date</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Amount</th>
                  </tr>
              </thead>
              <tbody>
                  ${payments.data
                    .map(
                      (payment) => `
                      <tr>
                          <td>${payment.or_number}</td>
                          <td>${payment.purpose}</td>
                          <td>${formatDate(payment.payment_date, false)}</td>
                          <td>${payment.payment_method_display}</td>
                          <td><span class="badge badge-${payment.status}">${payment.status
                            .replace('_', ' ')
                            .toUpperCase()}</span></td>
                          <td>${payment.formatted_total}</td>
                      </tr>
                  `
                    )
                    .join('')}
              </tbody>
          </table>
          
          <div class="footer">
              <p>Generated from Barangay Management System</p>
              <p>Page 1 of 1</p>
          </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }, [payments.data, statusFilter, stats]);

  const exportToCSV = useCallback(() => {
    if (payments.data.length === 0) {
      toast.error('No payments to export');
      return;
    }

    setIsExporting(true);

    const headers = [
      'OR Number',
      'Reference Number',
      'Purpose',
      'Certificate Type',
      'Subtotal',
      'Surcharge',
      'Penalty',
      'Discount',
      'Total Amount',
      'Payment Date',
      'Due Date',
      'Status',
      'Payment Method',
      'Collection Type',
      'Remarks',
    ];

    const csvData = payments.data.map((payment) => [
      payment.or_number,
      payment.reference_number || 'N/A',
      `"${payment.purpose.replace(/"/g, '""')}"`,
      payment.certificate_type_display || 'N/A',
      (payment.subtotal || 0).toFixed(2),
      (payment.surcharge || 0).toFixed(2),
      (payment.penalty || 0).toFixed(2),
      (payment.discount || 0).toFixed(2),
      (payment.total_amount || 0).toFixed(2),
      formatDate(payment.payment_date, false),
      payment.due_date ? formatDate(payment.due_date, false) : 'N/A',
      payment.status.toUpperCase(),
      payment.payment_method_display,
      payment.collection_type_display,
      `"${(payment.remarks || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...csvData.map((row) => row.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `payments_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    toast.success('CSV file downloaded successfully');
  }, [payments.data, statusFilter]);

  const sharePayments = useCallback(async () => {
    if (payments.data.length === 0) {
      toast.error('No payments to share');
      return;
    }

    const summary = `My Payments Summary:\n\n` +
      `Total Payments: ${payments.data.length}\n` +
      `Total Paid: ${formatCurrency(stats.total_paid)}\n` +
      `Balance Due: ${formatCurrency(stats.balance_due)}\n` +
      `Pending: ${stats.pending_payments || 0}\n` +
      `Overdue: ${stats.overdue_payments || 0}\n` +
      `Cancelled: ${stats.cancelled_payments || 0}\n\n` +
      `Generated on: ${new Date().toLocaleDateString()}\n` +
      `View online: ${window.location.origin}/my-payments`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My Payments Report',
          text: summary,
        });
        toast.success('Shared successfully');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        toast.success('Summary copied to clipboard');
      } else {
        toast.error('Sharing not supported on this device');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        toast.error('Failed to share');
      }
    }
  }, [payments.data, stats]);

  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ page: page.toString() });
    },
    [updateFilters]
  );

  const renderTabContent = useCallback(() => {
    const tabHasData = payments.data.length > 0;

    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4 md:p-6">
          <SelectionModeBanner
            selectMode={selectMode}
            selectedCount={selectedPayments.length}
            totalCount={payments.data.length}
            onSelectAll={selectAllPayments}
            onDeleteSelected={handleDeleteSelected}
            onCancelSelect={() => {
              setSelectMode(false);
              setSelectedPayments([]);
            }}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {statusFilter === 'all'
                  ? 'All'
                  : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}{' '}
                Payments
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tabHasData
                  ? `Showing ${payments.data.length} payment${payments.data.length !== 1 ? 's' : ''}`
                  : `No ${statusFilter === 'all' ? 'payments' : statusFilter.replace('_', ' ')} found`}
                {selectMode && selectedPayments.length > 0 && ` • ${selectedPayments.length} selected`}
                {(paymentMethodFilter !== 'all' || yearFilter !== 'all' || search) && ' (filtered)'}
                {selectMode && ' • Selection Mode'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {!selectMode && tabHasData && (
                  <>
                    <div className="hidden md:flex gap-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="gap-2"
                      >
                        <Grid className="h-4 w-4" />
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="gap-2"
                      >
                        <List className="h-4 w-4" />
                        List
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleSelectMode}
                        className="gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Select
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {!tabHasData ? (
            <EmptyState
              statusFilter={statusFilter}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <>
              {isMobile && !selectMode && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="flex-1"
                    >
                      <Grid className="h-4 w-4 mr-2" />
                      Grid View
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="flex-1"
                    >
                      <List className="h-4 w-4 mr-2" />
                      List View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleSelectMode}
                      className="flex-1"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Select
                    </Button>
                  </div>
                </div>
              )}

              {viewMode === 'grid' && (
                <>
                  {isMobile && (
                    <div className="pb-4">
                      {payments.data.map((payment) => (
                        <MobilePaymentCard
                          key={payment.id}
                          payment={payment}
                          selectMode={selectMode}
                          selectedPayments={selectedPayments}
                          toggleSelectPayment={toggleSelectPayment}
                          formatDate={formatDate}
                          formatCurrency={formatCurrency}
                          copyOrNumber={(orNumber) => copyToClipboard(orNumber, `Copied: ${orNumber}`)}
                        />
                      ))}
                    </div>
                  )}

                  {!isMobile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {payments.data.map((payment) => (
                        <DesktopGridViewCard
                          key={payment.id}
                          payment={payment}
                          selectMode={selectMode}
                          selectedPayments={selectedPayments}
                          toggleSelectPayment={toggleSelectPayment}
                          formatDate={formatDate}
                          formatCurrency={formatCurrency}
                          copyOrNumber={(orNumber) => copyToClipboard(orNumber, `Copied: ${orNumber}`)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {viewMode === 'list' && (
                <PaymentsTable
                  payments={payments.data}
                  selectMode={selectMode}
                  selectedPayments={selectedPayments}
                  toggleSelectPayment={toggleSelectPayment}
                  selectAllPayments={selectAllPayments}
                  isMobile={isMobile}
                />
              )}

              <Pagination
                pagination={payments}
                loading={loading}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    );
  }, [
    payments,
    selectMode,
    selectedPayments,
    statusFilter,
    paymentMethodFilter,
    yearFilter,
    search,
    hasActiveFilters,
    viewMode,
    isMobile,
    selectAllPayments,
    handleDeleteSelected,
    toggleSelectMode,
    toggleSelectPayment,
    handleClearFilters,
    handlePageChange,
  ]);

  if (!hasProfile) {
    return (
      <ResidentLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/resident/dashboard' },
          { title: 'My Payments', href: '/my-payments' },
        ]}
      >
        <Head title="My Payments" />
        <div className="min-h-[50vh] flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                You need to complete your resident profile before you can view payments.
              </p>
              <Link href="/resident/profile/create">
                <Button>Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ResidentLayout>
    );
  }

  if (pageProps.error) {
    return (
      <ResidentLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/resident/dashboard' },
          { title: 'My Payments', href: '/my-payments' },
        ]}
      >
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Payments</h1>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-red-400" />
              <h3 className="mt-4 text-lg font-semibold">Error</h3>
              <p className="text-gray-500 mt-2">{pageProps.error}</p>
              <Button className="mt-4" onClick={() => (window.location.href = '/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </ResidentLayout>
    );
  }

  return (
    <>
      <Head title="My Payments" />

      <ResidentLayout
        breadcrumbs={[
          { title: 'Dashboard', href: '/resident/dashboard' },
          { title: 'My Payments', href: '/my-payments' },
        ]}
      >
        <div className="space-y-4 md:space-y-6">
          {isMobile && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">My Payments</h1>
                <p className="text-xs text-gray-500">
                  {stats.total_payments} payment{stats.total_payments !== 1 ? 's' : ''} total
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="h-8 px-2"
                >
                  {showStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(true)}
                  className="h-8 px-2 relative"
                >
                  <Filter className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {!isMobile && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  My Payments
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  View and manage your barangay payments
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={exportToCSV} disabled={isExporting}>
                      <FileText className="h-4 w-4 mr-2" />
                      {isExporting ? 'Exporting...' : 'Export as CSV'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={printPayments}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print List
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={sharePayments}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Copy Summary
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={printPayments} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

                <Link href="/my-payments/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Make Payment</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {showStats && (
            <CollapsibleStats
              showStats={showStats}
              setShowStats={setShowStats}
              statusFilter={statusFilter}
              stats={stats}
              payments={payments}
              getStatusCount={getStatusCount}
              formatCurrency={formatCurrency}
            />
          )}
          {!isMobile && (
            <DesktopStats
              statusFilter={statusFilter}
              stats={stats}
              payments={payments}
              getStatusCount={getStatusCount}
              formatCurrency={formatCurrency}
            />
          )}

          <MobileFilterModal
            isOpen={showMobileFilters}
            onClose={() => setShowMobileFilters(false)}
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onSearchClear={handleSearchClear}
            paymentMethodFilter={paymentMethodFilter}
            onPaymentMethodChange={handlePaymentMethodChange}
            yearFilter={yearFilter}
            onYearChange={handleYearChange}
            loading={loading}
            availablePaymentMethods={availablePaymentMethods}
            availableYears={availableYears}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />

          {!isMobile && (
            <FilterspaymentSection
              search={search}
              setSearch={setSearch}
              handleSearchSubmit={handleSearchSubmit}
              handleSearchClear={handleSearchClear}
              paymentMethodFilter={paymentMethodFilter}
              handlePaymentMethodChange={handlePaymentMethodChange}
              yearFilter={yearFilter}
              handleYearChange={handleYearChange}
              loading={loading}
              availablePaymentMethods={availablePaymentMethods}
              availableYears={availableYears}
              printPayments={printPayments}
              exportToCSV={exportToCSV}
              isExporting={isExporting}
              getCurrentTabPayments={() => payments.data}
              hasActiveFilters={hasActiveFilters}
              handleClearFilters={handleClearFilters}
              isMobile={isMobile}
              setShowFilters={() => {}}
            />
          )}

          <div className="mt-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Payment History
              </h2>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
                  Page {payments.current_page} of {payments.last_page}
                </div>
              </div>
            </div>

            <CustomTabs
              statusFilter={statusFilter}
              handleTabChange={handleTabChange}
              getStatusCount={getStatusCount}
              tabsConfig={PAYMENT_TABS.map((tab) => ({
                id: tab.value,
                label: tab.label,
                icon: tab.icon,
              }))}
            />

            <div className="mt-4">{renderTabContent()}</div>
          </div>
        </div>

        {isMobile && !showMobileFilters && (
          <div className="fixed bottom-24 right-6 z-40 safe-bottom">
            <Link href="/my-payments/create">
              <Button size="lg" className="rounded-full h-14 w-14 shadow-lg shadow-blue-500/20">
                <Plus className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        )}

        {!showMobileFilters && (
          <div className="md:hidden">
            <ResidentMobileFooter />
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        )}
      </ResidentLayout>
    </>
  );
}
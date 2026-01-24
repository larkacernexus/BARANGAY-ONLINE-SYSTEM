import { CustomTabs } from '@/components/residentui/CustomTabs';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  Loader2, 
  CheckCircle, 
  FileCheck, 
  XCircle 
} from 'lucide-react';

const CLEARANCE_TABS = [
  { id: 'all', label: 'All', icon: FileText },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'pending_payment', label: 'Payment', icon: DollarSign },
  { id: 'processing', label: 'Processing', icon: Loader2 },
  { id: 'approved', label: 'Approved', icon: CheckCircle },
  { id: 'issued', label: 'Issued', icon: FileCheck },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle },
];

interface ClearanceTabsProps {
  statusFilter: string;
  handleTabChange: (value: string) => void;
  getStatusCount: (status: string) => number;
}

export function ClearanceTabs(props: ClearanceTabsProps) {
  return <CustomTabs {...props} tabsConfig={CLEARANCE_TABS} />;
}
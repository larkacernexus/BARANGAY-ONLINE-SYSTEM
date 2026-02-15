import { CustomTabs } from '@/components/residentui/CustomTabs';
import { 
  BarChart, 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle,
  AlertCircle
} from 'lucide-react';

const COMPLAINT_TABS = [
  { id: 'all', label: 'All', icon: BarChart },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'under_review', label: 'In Review', icon: Loader2 },
  { id: 'resolved', label: 'Resolved', icon: CheckCircle },
  { id: 'dismissed', label: 'Dismissed', icon: XCircle },
];

interface ComplaintTabsProps {
  statusFilter: string;
  handleTabChange: (value: string) => void;
  getStatusCount: (status: string) => number;
}

export function ComplaintTabs(props: ComplaintTabsProps) {
  return <CustomTabs {...props} tabsConfig={COMPLAINT_TABS} />;
}
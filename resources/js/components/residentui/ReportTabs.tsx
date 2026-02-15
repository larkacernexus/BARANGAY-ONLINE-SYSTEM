import { CustomTabs } from '@/components/residentui/CustomTabs';
import { 
  BarChart, 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

const REPORT_TABS = [
  { id: 'all', label: 'All', icon: BarChart },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'under_review', label: 'Under Review', icon: Loader2 },
  { id: 'in_progress', label: 'In Progress', icon: TrendingUp },
  { id: 'resolved', label: 'Resolved', icon: CheckCircle },
  { id: 'rejected', label: 'Rejected', icon: XCircle },
];

interface ReportTabsProps {
  statusFilter: string;
  handleTabChange: (value: string) => void;
  getStatusCount: (status: string) => number;
}

export function ReportTabs(props: ReportTabsProps) {
  return <CustomTabs {...props} tabsConfig={REPORT_TABS} />;
}
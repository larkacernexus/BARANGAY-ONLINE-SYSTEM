// utils/icon-map.ts
import { 
  Home, 
  Search, 
  User, 
  Bell, 
  Menu, 
  HelpCircle,
  Users,
  FileText,
  CreditCard,
  Settings,
  // Add other icons you need
} from 'lucide-react';

export const iconMap: Record<string, React.ComponentType<any>> = {
  'home': Home,
  'search': Search,
  'user': User,
  'bell': Bell,
  'menu': Menu,
  'help-circle': HelpCircle,
  'users': Users,
  'file-text': FileText,
  'credit-card': CreditCard,
  'settings': Settings,
};
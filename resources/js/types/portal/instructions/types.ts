// /components/residentui/instructions/types.ts
import { LucideIcon } from 'lucide-react';

export interface Section {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  content: React.ReactNode;
}

export interface VideoTutorial {
  title: string;
  duration: string;
  views: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Shortcut {
  key: string;
  description: string;
}
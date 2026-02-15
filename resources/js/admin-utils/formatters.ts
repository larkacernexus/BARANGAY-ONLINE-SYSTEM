import { format, parseISO } from 'date-fns';

export const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date';
  try {
    return format(parseISO(dateString), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);
  
  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getDiskHealthColor = (percentage: number): string => {
  if (percentage > 90) return 'text-red-600 dark:text-red-400';
  if (percentage > 75) return 'text-amber-600 dark:text-amber-400';
  return 'text-green-600 dark:text-green-400';
};

export const getSizeColor = (bytes: number): string => {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb > 2) return 'text-red-600 dark:text-red-400';
  if (gb > 1) return 'text-amber-600 dark:text-amber-400';
  return 'text-green-600 dark:text-green-400';
};

export const getTruncationLength = (windowWidth: number): number => {
  if (windowWidth < 640) return 20;
  if (windowWidth < 768) return 30;
  if (windowWidth < 1024) return 35;
  return 40;
};
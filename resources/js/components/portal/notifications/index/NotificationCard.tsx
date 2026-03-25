// /components/residentui/notifications/NotificationCard.tsx
import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Clock, Mail, MailOpen, Trash2, MoreVertical, ExternalLink, User } from 'lucide-react';
import { NotificationIcon } from './NotificationIcon';
import { getNotificationLink, formatNotificationTime } from '@/utils/portal/notifications/notification-utils';
import { Notification } from '@/types/portal/notifications/types';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  selectMode?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  isSelected,
  onSelect,
  selectMode
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('.dropdown-menu') || target.closest('.dropdown-item')) {
      return;
    }

    if (selectMode) {
      e.preventDefault();
      onSelect?.(notification.id);
      return;
    }

    const link = getNotificationLink(notification);
    
    if (link && link !== '#') {
      if (!notification.read_at) {
        onMarkAsRead(notification.id);
      }
      router.visit(link);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete?.(notification.id);
  };

  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDropdownOpen(!dropdownOpen);
  };

  const handleDropdownItemClick = (callback: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDropdownOpen(false);
    callback();
  };

  const hasValidLink = () => {
    const link = getNotificationLink(notification);
    return link && link !== '#';
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    
    const handleClickOutside = () => {
      setDropdownOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200 hover:shadow-md",
        "bg-white dark:bg-gray-900",
        !notification.read_at 
          ? 'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20 dark:bg-gray-900' 
          : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50',
        isHovered && !selectMode && 'scale-[1.01]',
        selectMode && 'cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
        !hasValidLink() && !selectMode && 'opacity-75 cursor-not-allowed',
        hasValidLink() && !selectMode && 'cursor-pointer'
      )}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setDropdownOpen(false);
      }}
      onClick={handleCardClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {selectMode && (
            <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect?.(notification.id)}
                className="h-5 w-5 border-gray-300 dark:border-gray-600"
              />
            </div>
          )}

          <NotificationIcon notification={notification} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn(
                "text-base font-semibold truncate",
                !notification.read_at 
                  ? 'text-gray-900 dark:text-gray-100' 
                  : 'text-gray-700 dark:text-gray-300'
              )}>
                {notification.title}
              </h3>
              
              <div className="flex items-center gap-2 shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatNotificationTime(notification.created_at)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">
                      {new Date(notification.created_at).toLocaleString()}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {!notification.read_at && (
                  <Badge variant="default" className="bg-blue-500 dark:bg-blue-600 text-xs animate-pulse">
                    New
                  </Badge>
                )}
              </div>
            </div>

            {notification.resident_name && (
              <div className="flex items-center gap-1 mb-2">
                <User className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {notification.resident_name}
                </span>
              </div>
            )}

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {notification.formatted_amount && notification.formatted_amount !== '₱0.00' && (
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-0">
                    {notification.formatted_amount}
                  </Badge>
                )}
                
                {notification.fee_type && (
                  <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                    {notification.fee_type}
                  </Badge>
                )}
                
                {notification.fee_code && (
                  <Badge variant="outline" className="text-xs font-mono bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300">
                    #{notification.fee_code}
                  </Badge>
                )}
                
                {notification.read_at ? (
                  <Badge variant="outline" className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 dark:border-gray-600">
                    <MailOpen className="h-3 w-3" />
                    Read
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-blue-500 dark:text-blue-400 flex items-center gap-1 border-blue-200 dark:border-blue-800">
                    <Mail className="h-3 w-3" />
                    Unread
                  </Badge>
                )}
              </div>

              {!selectMode && isHovered && (
                <div className="flex items-center gap-1 relative" onClick={(e) => e.stopPropagation()}>
                  {!notification.read_at && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/30"
                            onClick={handleMarkAsRead}
                          >
                            <MailOpen className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">Mark as read</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {onDelete && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30"
                            onClick={handleDelete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="dark:bg-gray-800 dark:text-gray-200">Delete</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <div className="relative" style={{ zIndex: 100 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      onClick={handleDropdownToggle}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    
                    {dropdownOpen && (
                      <div 
                        className="absolute right-0 bottom-full mb-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 dropdown-menu"
                        style={{ 
                          zIndex: 9999,
                          position: 'absolute',
                          bottom: '100%',
                          marginBottom: '0.5rem'
                        }}
                      >
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dropdown-item"
                          onClick={handleDropdownItemClick(() => {
                            navigator.clipboard.writeText(notification.id);
                            toast.success('Notification ID copied');
                          })}
                        >
                          <span>Copy ID</span>
                        </button>
                        
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 dropdown-item"
                          onClick={handleDropdownItemClick(() => {
                            const link = getNotificationLink(notification);
                            if (link && link !== '#') {
                              window.open(link, '_blank');
                            }
                          })}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in new tab
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 truncate border-t dark:border-gray-800 pt-2">
                <span className="font-mono">Link: {getNotificationLink(notification)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
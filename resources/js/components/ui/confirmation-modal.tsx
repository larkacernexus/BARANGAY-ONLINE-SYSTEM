import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Info, Trash2, Lock, Unlock } from 'lucide-react';
import { JSX } from 'react';

export type ConfirmationType = 'delete' | 'activate' | 'deactivate' | 'warning' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isProcessing = false,
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />;
      case 'activate':
        return <Unlock className="h-6 w-6 text-green-600 dark:text-green-400" />;
      case 'deactivate':
        return <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getConfirmButtonClass = () => {
    // Base classes for all confirm buttons
    let classes = 'cursor-pointer';
    
    // Type-specific classes
    switch (type) {
      case 'delete':
        classes += ' bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white';
        break;
      case 'activate':
        classes += ' bg-green-600 hover:bg-green-700 focus:ring-green-600 text-white';
        break;
      case 'deactivate':
        classes += ' bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 text-white';
        break;
      case 'warning':
        classes += ' bg-amber-600 hover:bg-amber-700 focus:ring-amber-600 text-white';
        break;
      default:
        classes += ' bg-blue-600 hover:bg-blue-700 focus:ring-blue-600 text-white';
        break;
    }
    
    return classes;
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle className="text-lg sm:text-xl">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2 text-sm sm:text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-3">
          <AlertDialogCancel 
            onClick={onClose} 
            disabled={isProcessing}
            className="cursor-pointer"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isProcessing}
            className={getConfirmButtonClass()}
          >
            {isProcessing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
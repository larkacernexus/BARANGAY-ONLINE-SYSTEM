// resources/js/hooks/use-toast.ts
import { toast as sonnerToast, Toaster } from 'sonner';
import type { ToasterProps } from 'sonner';

export { Toaster };

// Export the toast function directly
export const toast = sonnerToast;

// Custom toast function with presets
export const useToast = () => {
  return {
    // Basic toast methods
    success: (message: string, description?: string) => {
      sonnerToast.success(message, {
        description,
      });
    },
    
    error: (message: string, description?: string) => {
      sonnerToast.error(message, {
        description,
      });
    },
    
    warning: (message: string, description?: string) => {
      sonnerToast.warning(message, {
        description,
      });
    },
    
    info: (message: string, description?: string) => {
      sonnerToast.info(message, {
        description,
      });
    },
    
    // Custom toast with options
    custom: (message: string, options?: any) => {
      sonnerToast(message, options);
    },
    
    // Promise toast
    promise: (promise: Promise<any>, options: any) => {
      return sonnerToast.promise(promise, options);
    },
    
    // Loading toast
    loading: (message: string) => {
      return sonnerToast.loading(message);
    },
    
    // Dismiss toast
    dismiss: (toastId?: string) => {
      sonnerToast.dismiss(toastId);
    },
  };
};

// Default export
export default useToast;
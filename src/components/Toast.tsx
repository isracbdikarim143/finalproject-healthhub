import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div
      className={`flex items-center gap-3 min-w-[320px] px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm animate-slide-in ${
        toast.type === 'success'
          ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
      }`}
    >
      {toast.type === 'success' ? (
        <CheckCircle className="w-5 h-5 flex-shrink-0" />
      ) : (
        <XCircle className="w-5 h-5 flex-shrink-0" />
      )}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Helper function to show toasts
export const toast = {
  success: (message: string) => useToastStore.getState().addToast(message, 'success'),
  error: (message: string) => useToastStore.getState().addToast(message, 'error'),
};

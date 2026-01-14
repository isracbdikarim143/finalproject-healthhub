import toast, { Toaster } from 'react-hot-toast';

// Export toast for use throughout the app
export { toast };

// Export Toaster component to be placed in App.jsx
export function ToastContainer() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'var(--toast-bg)',
          color: 'var(--toast-color)',
          border: '1px solid var(--toast-border)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

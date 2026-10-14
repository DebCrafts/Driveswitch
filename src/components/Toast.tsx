import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              isError
                ? 'bg-[#1f1412] text-white border-[#b5523f]/50'
                : 'bg-[#1f3a2d] text-white border-[#3b6b53]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isError ? (
                <AlertCircle className="w-4 h-4 text-[#f87171] shrink-0" />
              ) : isInfo ? (
                <Info className="w-4 h-4 text-[#93c5fd] shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#7fb27a] shrink-0" />
              )}
              <span className="text-xs font-medium truncate">{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-white/60 hover:text-white p-0.5 rounded"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

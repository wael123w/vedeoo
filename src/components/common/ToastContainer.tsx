import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-800/80 bg-slate-900/95 text-emerald-200',
          warning: 'border-amber-800/80 bg-slate-900/95 text-amber-200',
          error: 'border-rose-800/80 bg-slate-900/95 text-rose-200',
          info: 'border-sky-800/80 bg-slate-900/95 text-sky-200',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl backdrop-blur-md transition-all ${borders[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-white leading-tight">{toast.title}</div>
              {toast.message && (
                <div className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white shrink-0 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

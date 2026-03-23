import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel();
    },
    [onCancel, loading],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/20 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl border border-navy/[0.07] p-6"
        style={{
          animation: 'hero-fade-up 0.25s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-4 right-4 p-1 rounded-lg text-navy/40 hover:text-navy hover:bg-navy/[0.05] transition-colors disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${
            destructive ? 'bg-red-50' : 'bg-navy/[0.06]'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 ${destructive ? 'text-red-500' : 'text-navy'}`}
          />
        </div>

        {/* Title */}
        <h3
          id="confirm-dialog-title"
          className="text-lg font-semibold text-navy font-general mb-2"
        >
          {title}
        </h3>

        {/* Message */}
        <p className="text-sm text-navy/60 font-instrument leading-relaxed mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy bg-navy/[0.04] hover:bg-navy/[0.08] rounded-full transition-colors font-instrument disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-full transition-colors font-instrument flex items-center gap-2 disabled:opacity-70 ${
              destructive
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-navy hover:bg-navy-hover'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

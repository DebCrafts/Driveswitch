import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { formatBytes } from '../utils/seedData';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
  totalBytesReclaimed: number;
  singleFileName?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  count,
  totalBytesReclaimed,
  singleFileName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl border border-[#d4ded0] dark:border-[#233a2c] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#e2ede0] dark:border-[#233a2c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#b5523f]/15 text-[#b5523f] dark:text-[#f87171] flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                {count === 1 ? 'Delete File' : `Delete ${count} Files`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Move to Google Drive Trash
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            {count === 1 ? (
              <>
                Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-white font-mono">{singleFileName}</span>?
              </>
            ) : (
              <>
                Are you sure you want to delete all <span className="font-bold text-slate-900 dark:text-white">{count} selected files</span>?
              </>
            )}
          </p>

          <div className="p-3 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c] flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">Reclaimed Space:</span>
            <span className="text-sm font-bold font-mono text-[#2d5c2d] dark:text-[#7fb27a] tabular-nums">
              +{formatBytes(totalBytesReclaimed)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p>
              In production, files are moved to Google Drive Trash and permanently purged after 30 days. In this prototype, storage quota is updated immediately.
            </p>
          </div>
        </div>

        <div className="p-4 bg-[#f5f8f3] dark:bg-[#122018] border-t border-[#e2ede0] dark:border-[#233a2c] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-lg border border-[#d4ded0] dark:border-[#233a2c] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1a2d21]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-2 px-4 rounded-lg bg-[#b5523f] hover:bg-[#9d4433] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Deletion</span>
          </button>
        </div>
      </div>
    </div>
  );
};

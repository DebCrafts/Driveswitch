import React from 'react';
import { ConnectedAccount } from '../types';
import { Unlink, AlertTriangle, X } from 'lucide-react';

interface DisconnectConfirmModalProps {
  isOpen: boolean;
  account: ConnectedAccount | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DisconnectConfirmModal: React.FC<DisconnectConfirmModalProps> = ({
  isOpen,
  account,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !account) return null;

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
              <Unlink className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                Disconnect Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Remove Google Drive from Driveswitch
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
            Are you sure you want to disconnect{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {account.displayName} ({account.email})
            </span>
            ?
          </p>

          <div className="p-3.5 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c] text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-medium text-slate-800 dark:text-slate-200">What happens next:</p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
              <li>This drive will be removed from your sidebar and combined view.</li>
              <li>Your actual Google Drive account and cloud files remain safe and intact on Google.</li>
              <li>You can reconnect this account anytime via the &ldquo;+ Connect account&rdquo; button.</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-[#f5f8f3] dark:bg-[#122018] border-t border-[#e2ede0] dark:border-[#233a2c] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-lg border border-[#d4ded0] dark:border-[#233a2c] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1a2d21]"
          >
            Keep Connected
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-2 px-4 rounded-lg bg-[#b5523f] hover:bg-[#9d4433] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Unlink className="w-3.5 h-3.5" />
            <span>Disconnect Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

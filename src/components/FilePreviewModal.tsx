import React, { useEffect } from 'react';
import { DriveFile, ConnectedAccount } from '../types';
import { formatBytes, formatDate } from '../utils/seedData';
import {
  X,
  Download,
  Trash2,
  FileText,
  Image,
  FileSpreadsheet,
  FileCode,
  Video,
  Archive,
  Music,
  HardDrive,
  Calendar,
  Layers,
} from 'lucide-react';

interface FilePreviewModalProps {
  file: DriveFile | null;
  account?: ConnectedAccount | null;
  onClose: () => void;
  onDelete: (file: DriveFile) => void;
  onDownload: (file: DriveFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  account,
  onClose,
  onDelete,
  onDownload,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const renderVisualPreview = () => {
    switch (file.type) {
      case 'IMG':
        return (
          <div className="h-56 w-full rounded-xl bg-gradient-to-br from-[#e2ede0] to-[#c7dfc4] dark:from-[#1b3426] dark:to-[#122219] flex flex-col items-center justify-center border border-[#d4ded0] dark:border-[#233a2c] text-center p-4">
            <Image className="w-12 h-12 text-[#4a7c4a] mb-2" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">High-Resolution Image Preview</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{file.name}</p>
          </div>
        );
      case 'VID':
        return (
          <div className="h-56 w-full rounded-xl bg-[#13241b] flex flex-col items-center justify-center border border-[#233a2c] text-center p-4 text-white">
            <div className="w-12 h-12 rounded-full bg-[#6f4c78] flex items-center justify-center text-white mb-2 shadow-md">
              <Video className="w-6 h-6" />
            </div>
            <p className="text-xs font-medium text-slate-200">Video Media Stream</p>
            <span className="text-[11px] text-[#a3c4ab] font-mono mt-1">4K Ultra HD · {formatBytes(file.sizeBytes)}</span>
          </div>
        );
      case 'AUD':
        return (
          <div className="h-44 w-full rounded-xl bg-[#1a2f26] flex flex-col items-center justify-center border border-[#233a2c] text-center p-4">
            <Music className="w-10 h-10 text-[#2d7a78] mb-2" />
            <div className="flex items-center gap-1 my-2">
              <div className="w-1 h-6 bg-[#2d7a78] rounded-full animate-pulse" />
              <div className="w-1 h-10 bg-[#7fb27a] rounded-full animate-pulse" />
              <div className="w-1 h-4 bg-[#2d7a78] rounded-full" />
              <div className="w-1 h-8 bg-[#7fb27a] rounded-full animate-pulse" />
              <div className="w-1 h-5 bg-[#2d7a78] rounded-full" />
            </div>
            <p className="text-xs font-medium text-slate-300">Lossless Audio Recording</p>
          </div>
        );
      case 'PDF':
      case 'DOC':
      case 'XLS':
        return (
          <div className="h-56 w-full rounded-xl bg-white dark:bg-[#122018] border border-[#d4ded0] dark:border-[#233a2c] p-6 flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {file.type === 'XLS' ? (
                  <FileSpreadsheet className="w-6 h-6 text-[#6b7d3f]" />
                ) : (
                  <FileText className="w-6 h-6 text-[#a05a42]" />
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{file.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Google Drive Document</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {file.type}
              </span>
            </div>
            <div className="space-y-2 py-2 border-y border-slate-100 dark:border-slate-800/80">
              <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-700/60 rounded" />
              <div className="h-2 w-4/6 bg-slate-200 dark:bg-slate-700/60 rounded" />
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/60 rounded" />
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Read-only prototype preview</span>
              <span>{formatBytes(file.sizeBytes)}</span>
            </div>
          </div>
        );
      case 'ZIP':
      default:
        return (
          <div className="h-44 w-full rounded-xl bg-[#fafbf8] dark:bg-[#14231b] border border-[#d4ded0] dark:border-[#233a2c] p-4 flex flex-col items-center justify-center text-center">
            <Archive className="w-10 h-10 text-[#b38b46] mb-2" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Compressed Archive Container</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Package includes multiple asset files</p>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl border border-[#d4ded0] dark:border-[#233a2c] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2ede0] dark:border-[#233a2c] flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white truncate">
              {file.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              File Details & Inspection
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1f3a2d] transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Visual container */}
          {renderVisualPreview()}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
                <HardDrive className="w-3.5 h-3.5" />
                File Size
              </span>
              <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100 tabular-nums">
                {formatBytes(file.sizeBytes)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c]">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                Last Modified
              </span>
              <span className="text-sm font-medium font-mono text-slate-800 dark:text-slate-100">
                {formatDate(file.updatedAt)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c] col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5" />
                Source Account
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                {account && (
                  <span
                    style={{ backgroundColor: account.color }}
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                  />
                )}
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                  {account ? account.displayName : 'Google Drive'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {account ? `(${account.email})` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-[#f5f8f3] dark:bg-[#122018] border-t border-[#e2ede0] dark:border-[#233a2c] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(file);
            }}
            className="py-2 px-3 rounded-lg border border-[#b5523f]/30 hover:bg-[#b5523f]/10 text-[#b5523f] dark:text-[#f87171] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete File</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3.5 rounded-lg border border-[#d4ded0] dark:border-[#233a2c] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-[#1a2d21] transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onDownload(file);
              }}
              className="py-2 px-4 rounded-lg bg-[#1f3a2d] dark:bg-[#4a7c4a] hover:bg-[#162a20] dark:hover:bg-[#3d693d] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

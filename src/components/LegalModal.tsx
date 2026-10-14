import React from 'react';
import { X, ShieldCheck, FileText, Lock } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl border border-[#d4ded0] dark:border-[#233a2c] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#e2ede0] dark:border-[#233a2c] flex items-center justify-between bg-[#f5f8f3] dark:bg-[#14231a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#4a7c4a]/15 text-[#2d5c2d] dark:text-[#7fb27a] flex items-center justify-center">
              {type === 'privacy' ? <ShieldCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                {type === 'privacy' ? 'Driveswitch Privacy Policy' : 'Driveswitch Terms of Service'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Google API Services User Data Policy Compliance
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

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-xs text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed font-sans">
          {type === 'privacy' ? (
            <>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  1. Introduction &amp; Commitment to Privacy
                </h4>
                <p>
                  Driveswitch (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the application&rdquo;) respects your privacy and is committed to protecting your personal data. This Privacy Policy describes how your information is handled when connecting Google Drive accounts to Driveswitch.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  2. Google User Data Accessed &amp; Requested Scopes
                </h4>
                <p className="mb-2">
                  When you authenticate with Google OAuth 2.0, Driveswitch requests access to the following Google Workspace scopes:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>
                    <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">https://www.googleapis.com/auth/drive</code>: Used exclusively to retrieve storage quota telemetry (<code className="font-mono text-[10px]">about.get</code>), index file names, file sizes, and modified dates (<code className="font-mono text-[10px]">files.list</code>), and move selected files to Google Drive Trash when explicitly confirmed by the user (<code className="font-mono text-[10px]">files.update</code>).
                  </li>
                  <li>
                    <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">email</code> and <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">profile</code>: Used to identify and label your connected accounts in the left sidebar.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  3. In-Memory Security &amp; Token Handling
                </h4>
                <p>
                  Driveswitch complies strictly with Google OAuth security standards. OAuth access tokens are held strictly in temporary volatile memory during your active browser session and are never transmitted to unauthorized third parties or stored in unencrypted third-party databases.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  4. Google API Services Limited Use Disclosure
                </h4>
                <p className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-amber-900 dark:text-amber-200">
                  Driveswitch&apos;s use and transfer of information received from Google APIs adheres to the{' '}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  5. Zero Sale or Third-Party Sharing of Data
                </h4>
                <p>
                  We do not sell, rent, monetize, or transfer your Google Drive files or metadata to any third-party advertising platforms, data brokers, or AI model training pipelines. Your files belong exclusively to you.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  6. User Control &amp; Data Deletion
                </h4>
                <p>
                  You retain complete control over your accounts at all times. You can disconnect any connected account in one click via the Disconnect button in the top bar, which immediately revokes local references. You can also revoke Driveswitch&apos;s access at any time through your{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#4a7c4a] dark:text-[#7fb27a]"
                  >
                    Google Account Security Settings
                  </a>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  7. Developer Contact
                </h4>
                <p>
                  For privacy inquiries or feedback, contact the developer at <code className="font-mono text-[11px]">debmondal0625@gmail.com</code>.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  1. Acceptance of Terms
                </h4>
                <p>
                  By accessing and using Driveswitch, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  2. Description of Service
                </h4>
                <p>
                  Driveswitch is a web-based productivity application designed to provide multi-account Google Drive storage visibility, aggregated quota tracking, file sorting, and user-confirmed file organization.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  3. Account Authorization &amp; Google Account Security
                </h4>
                <p>
                  You are responsible for maintaining the security of your Google credentials. Driveswitch connects via official Google OAuth 2.0 authorization prompts and will only perform actions that you explicitly authorize.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  4. File Deletion Policy
                </h4>
                <p>
                  When you initiate file deletion in Driveswitch, the application moves items to Google Drive Trash (recoverable for 30 days under standard Google Drive policy). Driveswitch will never perform permanent non-recoverable purges without user instruction.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                  5. Disclaimer &amp; Limitation of Liability
                </h4>
                <p>
                  Driveswitch is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f5f8f3] dark:bg-[#122018] border-t border-[#e2ede0] dark:border-[#233a2c] flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Last updated: October 2026 · Driveswitch
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-lg bg-[#1f3a2d] dark:bg-[#4a7c4a] text-white text-xs font-semibold hover:bg-[#162a20] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

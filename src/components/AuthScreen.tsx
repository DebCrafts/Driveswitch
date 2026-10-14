import React, { useState } from 'react';
import { User, ConnectedAccount, DriveFile } from '../types';
import { googleSignIn } from '../services/googleDriveService';
import {
  Leaf,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  HardDrive,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { saveUser, setCurrentSessionUserId } from '../utils/storage';
import { LegalModal } from './LegalModal';

interface AuthScreenProps {
  onGoogleLoginSuccess: (
    user: User,
    primaryAccount: ConnectedAccount,
    files: DriveFile[]
  ) => void;
  onDemoLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onGoogleLoginSuccess,
  onDemoLoginSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  const projectId = 'alien-iterator-447511-h3';
  const consoleTestUsersUrl = `https://console.cloud.google.com/apis/credentials/consent?project=${projectId}`;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { user: firebaseUser, account, files } = await googleSignIn();

      const appUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || account.displayName,
        email: (firebaseUser.email || account.email).toLowerCase(),
        passwordHash: 'google_oauth_session',
        createdAt: new Date().toISOString(),
      };

      saveUser(appUser);
      setCurrentSessionUserId(appUser.id);
      onGoogleLoginSuccess(appUser, account, files);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setErrorMessage(
          'Sign-in was closed or blocked by Google. If you saw "Access blocked: has not completed the Google verification process", see the quick fix instructions below.'
        );
        setShowTroubleshooting(true);
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('Pop-up was blocked by your browser. Please enable pop-ups for this tab and click "Sign in with Google" again.');
        return;
      }
      setErrorMessage(
        err?.message || 'Failed to authenticate with Google. If you saw a 403 access_denied, see the test user guide below.'
      );
      setShowTroubleshooting(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFallback = () => {
    const demoEmail = 'alex.morgan@gmail.com';
    const demoUser: User = {
      id: 'usr_demo_primary',
      name: 'Alex Morgan',
      email: demoEmail,
      passwordHash: 'demo',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    };
    saveUser(demoUser);
    setCurrentSessionUserId(demoUser.id);
    onDemoLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#eef2ea] dark:bg-[#0f1a14] text-slate-800 dark:text-slate-100 transition-colors">
      {/* Left Hero Panel */}
      <div className="lg:w-1/2 bg-[#1f3a2d] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative layered organic shapes */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-[#2d5240]/40 blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 -top-20 w-80 h-80 rounded-full bg-[#162a20]/60 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#4a7c4a] flex items-center justify-center text-white shadow-md">
              <Leaf className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#fafbf8]">Driveswitch</span>
              <p className="text-xs text-[#a3c4ab] font-sans">All your Drives, one place</p>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white mb-6">
              Every Google Drive. One login.
            </h1>
            <p className="text-base text-[#c4d9cb] leading-relaxed mb-8">
              Connect all your Google &amp; Gmail accounts to view combined 15 GB storage quotas,
              switch accounts in one click, and manage all your Drive files seamlessly.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-md bg-[#2a4d3c] text-[#7fb27a] mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Live Storage Telemetry</h2>
                  <p className="text-xs text-[#a3c4ab]">Direct connection to Google Drive API to read accurate quota and usage.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-md bg-[#2a4d3c] text-[#7fb27a] mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Multi-Account Linking</h2>
                  <p className="text-xs text-[#a3c4ab]">Link work, personal, and secondary Google accounts under a single unified dashboard.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-md bg-[#2a4d3c] text-[#7fb27a] mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">Safe 30-Day Trash Reclamation</h2>
                  <p className="text-xs text-[#a3c4ab]">Delete unneeded heavy files with Google Drive&apos;s 30-day recoverable trash protection.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote */}
        <div className="relative z-10 pt-8 mt-8 border-t border-[#2e5240]/60 flex items-center justify-between text-xs text-[#9bbca5]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#7fb27a]" />
            Official Google OAuth 2.0 Integration
          </span>
          <span className="font-mono text-[11px] opacity-80">v2.0-live</span>
        </div>
      </div>

      {/* Right Sign-in Panel */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md bg-[#fafbf8] dark:bg-[#16251c] rounded-2xl p-6 sm:p-8 border border-[#d4ded0] dark:border-[#233a2c] shadow-sm">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#4a7c4a]/10 dark:bg-[#4a7c4a]/20 flex items-center justify-center text-[#2d5c2d] dark:text-[#7fb27a] mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Sign in to Driveswitch
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Connect your primary Google account with Google OAuth 2.0
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-[#b5523f]/10 border border-[#b5523f]/30 text-xs text-[#b5523f] dark:text-[#f87171] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Official Google Sign In Button */}
          <div className="space-y-4">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a2d21] hover:bg-slate-50 dark:hover:bg-[#233a2c] text-slate-800 dark:text-white text-sm font-semibold flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#4a7c4a]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {/* Test Users / Google Verification Help Box */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Seeing &ldquo;Access blocked: unverified app&rdquo;?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5 text-[11px] font-medium"
                >
                  {showTroubleshooting ? 'Hide fix' : 'How to fix (30 sec)'}
                  {showTroubleshooting ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {showTroubleshooting && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 dark:border-amber-800/40 text-[11px] space-y-2 text-slate-600 dark:text-slate-400 leading-relaxed">
                  <p>
                    Because this Google Cloud project is in <strong>Testing mode</strong> with the sensitive Google Drive scope, Google restricts access to developer-approved accounts:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-700 dark:text-slate-300 font-medium">
                    <li>
                      Option A: Sign in with the project developer account (<strong>debmondal0625@gmail.com</strong>) — allowed automatically.
                    </li>
                    <li>
                      Option B: Add your email (e.g. <strong>baberbilla01@gmail.com</strong>) as a Test User in Google Cloud:
                    </li>
                  </ol>
                  <div className="pt-1">
                    <a
                      href={consoleTestUsersUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition-colors shadow-xs"
                    >
                      <span>Open Google Cloud Test Users Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    In the Cloud Console: Scroll to &ldquo;Test users&rdquo; &rarr; click &ldquo;+ ADD USERS&rdquo; &rarr; enter your email &rarr; click Save. Then return here and click Sign in with Google!
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-[#eef2ea] dark:bg-[#0f1a14] border border-[#d4ded0] dark:border-[#233a2c] text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4a7c4a]" />
                Permissions Requested:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                <li>Read your Google Drive storage quota (used and free bytes)</li>
                <li>List Drive files to sort and search by size</li>
                <li>Move unneeded files to Drive Trash only when you confirm</li>
              </ul>
            </div>
          </div>

          {/* Demo Fallback Option */}
          <div className="mt-6 pt-5 border-t border-[#e2ede0] dark:border-[#233a2c]">
            <p className="text-center text-xs text-slate-400 dark:text-slate-500 mb-2.5">
              Want to test the full UI without Google Cloud configuration?
            </p>
            <button
              type="button"
              onClick={handleDemoFallback}
              className="w-full py-2.5 px-3 rounded-xl border border-[#4a7c4a]/30 bg-[#4a7c4a]/10 hover:bg-[#4a7c4a]/15 text-[#2d5c2d] dark:text-[#a3e29f] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Explore Demo Environment (Simulated 2 Accounts &amp; Files)</span>
            </button>
          </div>

          {/* Legal Links required for Google OAuth public verification */}
          <div className="mt-4 pt-3 flex items-center justify-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
            <button
              type="button"
              onClick={() => setLegalModalType('privacy')}
              className="hover:underline hover:text-slate-600 dark:hover:text-slate-300"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setLegalModalType('terms')}
              className="hover:underline hover:text-slate-600 dark:hover:text-slate-300"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Legal Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Globe, Copy, Check, ExternalLink, X, ShieldAlert, KeyRound } from 'lucide-react';
import { AuthBackgroundPattern } from './AuthBackgroundPattern';

interface UnauthorizedDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseDemoAccount?: () => void;
}

export const UnauthorizedDomainModal: React.FC<UnauthorizedDomainModalProps> = ({
  isOpen,
  onClose,
  onUseDemoAccount,
}) => {
  const [copied, setCopied] = useState(false);
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentHost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      id="unauthorized-domain-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="unauthorized-domain-modal"
        className="bg-white dark:bg-[#101A16] rounded-2xl max-w-[420px] w-full p-6 shadow-2xl border border-[#D1E0D9] dark:border-[#243B2F] relative overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Background Pattern */}
        <AuthBackgroundPattern variant="modal" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#7A8C83] dark:text-[#8EA298] hover:text-[#17211D] dark:hover:text-[#F1F7F4] hover:bg-[#EAEFEA] dark:hover:bg-[#1A2C23] rounded-xl transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#FEF2F2] dark:bg-[#2A1215] text-[#D83B3B] dark:text-[#FF7575] rounded-xl flex items-center justify-center shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="text-[17px] font-black text-[#17211D] dark:text-[#F1F7F4] tracking-tight">
              Authorized Domain Required
            </h3>
            <p className="text-xs text-[#6E7974] dark:text-[#8EA298] font-medium">
              Firebase Auth Security Restriction
            </p>
          </div>
        </div>

        <p className="text-[13px] text-[#4A5751] dark:text-[#A6B8AF] leading-relaxed mb-3.5">
          Firebase Google Sign-In requires your current preview domain to be listed under <strong>Authorized Domains</strong> in Firebase Console.
        </p>

        {/* Current Domain Box with Copy */}
        <div className="mb-4 bg-[#F2F7F4] dark:bg-[#15241D] border border-[#D1E0D9] dark:border-[#22382C] rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Globe size={16} className="text-[#008F5B] dark:text-[#10E594] shrink-0" />
            <span className="text-xs font-mono font-bold text-[#17211D] dark:text-[#F1F7F4] truncate">
              {currentHost || 'ais-dev-....run.app'}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 px-2.5 py-1 bg-white dark:bg-[#1C2F26] border border-[#D1E0D9] dark:border-[#2B4537] hover:bg-[#E8F7F0] dark:hover:bg-[#233D30] rounded-lg text-xs font-bold text-[#008F5B] dark:text-[#10E594] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Steps to Add */}
        <div className="space-y-2 mb-5 text-[12.5px] text-[#4A5751] dark:text-[#A6B8AF] bg-[#FAFDFB] dark:bg-[#0D1612] p-3 rounded-xl border border-[#E2ECE7] dark:border-[#1E3027]">
          <p className="font-bold text-[#17211D] dark:text-[#F1F7F4] text-xs">How to fix this in 1 minute:</p>
          <ol className="list-decimal pl-4 space-y-1 text-xs">
            <li>Open <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-[#008F5B] dark:text-[#10E594] font-bold underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink size={10} /></a></li>
            <li>Go to <strong>Authentication</strong> → <strong>Settings</strong> tab</li>
            <li>Scroll to <strong>Authorized domains</strong> → Click <strong>Add domain</strong></li>
            <li>Paste your copied domain and save.</li>
          </ol>
        </div>

        <div className="flex flex-col gap-2">
          {onUseDemoAccount && (
            <button
              onClick={() => {
                onClose();
                onUseDemoAccount();
              }}
              className="w-full h-[42px] bg-gradient-to-r from-[#008F5B] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] text-white font-extrabold text-[13px] rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <KeyRound size={15} />
              <span>Continue with Instant Demo Account</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full h-[38px] bg-white dark:bg-[#14221C] border border-[#D1E0D9] dark:border-[#243B2F] hover:bg-[#F2F7F4] dark:hover:bg-[#1A2C23] text-[#35433C] dark:text-[#B2C4BB] font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            I'll use Email / Password Login
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { KeyRound, X, Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, Shield } from 'lucide-react';
import { auth, sendPasswordResetEmail } from '../firebase';
import { AuthBackgroundPattern } from './AuthBackgroundPattern';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid work email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setIsLoading(false);
      setIsSuccess(true);
    } catch (err: any) {
      console.warn('Password reset notice:', err);
      setIsLoading(false);
      setIsSuccess(true);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    setError(null);
    onClose();
  };

  return (
    <div
      id="forgot-password-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={handleClose}
    >
      <div
        id="forgot-password-modal-card"
        className="bg-white/95 dark:bg-[#101A16]/95 backdrop-blur-md rounded-2xl max-w-[390px] w-full p-6 shadow-2xl border border-[#D1E0D9] dark:border-[#243B2F] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Graphical Background Pattern */}
        <AuthBackgroundPattern variant="modal" />

        <button
          id="forgot-password-close-btn"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-[#7A8C83] dark:text-[#8EA298] hover:text-[#17211D] dark:hover:text-[#F1F7F4] hover:bg-[#EAEFEA] dark:hover:bg-[#1A2C23] rounded-xl transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div id="forgot-password-success" className="text-center py-2 relative z-10">
            <div className="w-12 h-12 bg-[#E9F7F1] dark:bg-[#163024] text-[#008F5B] dark:text-[#10E594] rounded-full flex items-center justify-center mx-auto mb-3 shadow-xs">
              <CheckCircle2 size={26} />
            </div>
            <h3 className="text-lg font-black text-[#17211D] dark:text-[#F1F7F4] mb-1.5 tracking-tight">
              Reset Link Dispatched
            </h3>
            <p className="text-[13px] text-[#6E7974] dark:text-[#8EA298] leading-relaxed mb-5 font-medium">
              A secure password reset link has been dispatched to{' '}
              <strong className="text-[#17211D] dark:text-[#F1F7F4]">{email}</strong>. Please check your inbox.
            </p>
            <button
              id="forgot-password-done-btn"
              onClick={handleClose}
              className="w-full h-[46px] bg-gradient-to-r from-[#008F5B] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] text-white font-extrabold text-[14px] rounded-xl shadow-md shadow-[#008F5B]/20 transition-all cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form id="forgot-password-form" onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
            <div className="w-10 h-10 bg-[#E9F7F1] dark:bg-[#163024] text-[#008F5B] dark:text-[#10E594] rounded-xl flex items-center justify-center mb-0.5 shadow-xs">
              <KeyRound size={20} />
            </div>

            <div>
              <h3 className="text-[19px] font-black text-[#17211D] dark:text-[#F1F7F4] tracking-tight">
                Reset Password
              </h3>
              <p className="text-[13px] text-[#6E7974] dark:text-[#8EA298] mt-0.5 leading-relaxed font-medium">
                Enter your work email address to receive a secure recovery link.
              </p>
            </div>

            {error && (
              <div
                id="forgot-password-error"
                className="p-2.5 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#D83B3B]/30 rounded-xl text-[#D83B3B] dark:text-[#FF7575] text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="forgot-password-email"
                className="block text-[12px] font-bold text-[#35433C] dark:text-[#B2C4BB] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative flex items-center group">
                <input
                  id="forgot-password-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-[46px] pl-11 pr-4 rounded-xl border border-[#D1E0D9] dark:border-[#243B2F] focus:border-[#008F5B] dark:focus:border-[#10E594] focus:ring-2 focus:ring-[#008F5B]/15 outline-none text-[13.5px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] dark:placeholder-[#5A6D63] bg-white/80 dark:bg-[#101A16]/80 transition-all"
                  required
                />
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-[#7A8C83] dark:text-[#8EA298] group-focus-within:text-[#008F5B] dark:group-focus-within:text-[#10E594] pointer-events-none transition-colors"
                />
              </div>
            </div>

            <button
              id="forgot-password-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full h-[48px] mt-1 bg-gradient-to-r from-[#008F5B] via-[#009E65] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] active:scale-[0.99] disabled:opacity-70 text-white font-extrabold text-[14.5px] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#008F5B]/20 transition-all cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={17} strokeWidth={2.5} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-[#7A8C83] dark:text-[#657A70] uppercase tracking-wider pt-1">
              <Shield size={12} className="text-[#008F5B] dark:text-[#10E594]" />
              <span>Encrypted Recovery Protocol</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  Loader2,
  ArrowRight,
  IdCard,
  Shield,
  Check,
} from 'lucide-react';
import { PayFlowLogo } from './PayFlowLogo';
import { auth, createUserWithEmailAndPassword, updateProfile } from '../firebase';
import { saveUserProfile, signInWithGoogle } from '../services/firebaseService';
import { UnauthorizedDomainModal } from './UnauthorizedDomainModal';
import { AuthBackgroundPattern } from './AuthBackgroundPattern';

interface RegisterViewProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: (email: string, uid?: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isUnauthorizedDomainOpen, setIsUnauthorizedDomainOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPin = employeeId.trim();

    if (!cleanName) {
      setError('Please provide your full name.');
      return;
    }
    if (!cleanEmail) {
      setError('Please enter a valid work email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!termsAccepted) {
      setError('You must agree to the Terms to proceed.');
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;
      const uid = user.uid;

      try {
        await updateProfile(user, { displayName: cleanName });
      } catch (profErr) {
        console.warn('Profile name update note:', profErr);
      }

      await saveUserProfile({
        uid,
        name: cleanName.toUpperCase(),
        companyName: '',
        designation: '',
        pin: cleanPin || '1001',
        email: cleanEmail,
        mobile: '',
        joinDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
      });

      setIsLoading(false);
      onRegisterSuccess(cleanEmail, uid);
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Firebase registration error:', err?.code, err?.message);

      if (err?.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err?.code === 'auth/invalid-email') {
        setError('Please provide a valid email format.');
      } else if (err?.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (err?.code === 'auth/network-request-failed') {
        setError('Network connection error. Please check your internet.');
      } else {
        setError(err?.message || 'Registration could not be completed. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { user } = await signInWithGoogle();
      setIsGoogleLoading(false);
      onRegisterSuccess(user.email || 'google.user@payflow.com', user.uid);
    } catch (err: any) {
      setIsGoogleLoading(false);
      console.warn('Google registration error:', err?.code, err?.message);
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      } else if (err?.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomainOpen(true);
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by browser. Please allow popups.');
      } else {
        setError(err?.message || 'Google sign-in could not be completed. Please try again.');
      }
    }
  };

  return (
    <div id="register-screen-container" className="w-full min-h-full flex flex-col items-center justify-between py-6 px-4 relative overflow-hidden select-none">
      {/* Graphical Ambient & Vector Mesh Background */}
      <AuthBackgroundPattern variant="fullscreen" />

      {/* Main Content Container (No Card, Clean Form Structure) */}
      <div className="w-full max-w-[380px] flex flex-col items-center relative z-10 my-auto">
        {/* Logo & Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <PayFlowLogo iconSize={48} fontSize={24} showSubtitle={true} />
        </div>

        {/* Create Account & Sub-heading */}
        <div className="w-full text-center mb-5">
          <h1 className="text-[23px] sm:text-[25px] font-black text-[#17211D] dark:text-[#F1F7F4] tracking-tight">
            Create Account
          </h1>
          <p className="text-[13.5px] text-[#6E7974] dark:text-[#8EA298] mt-1 font-medium leading-normal">
            Sign up to track your salary & allowances
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            id="register-error-banner"
            className="w-full mb-3.5 p-3 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#D83B3B]/30 rounded-xl text-[#D83B3B] dark:text-[#FF7575] text-xs font-semibold flex items-center gap-2 animate-in fade-in"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Clean Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          {/* Full Name */}
          <div className="text-left">
            <label
              htmlFor="register-fullname-input"
              className="block text-[12px] font-bold text-[#35433C] dark:text-[#B2C4BB] mb-1.5"
            >
              Full Name
            </label>
            <div className="relative flex items-center group">
              <input
                id="register-fullname-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Asif Arman Saikot"
                className="w-full h-[46px] pl-11 pr-4 rounded-xl border border-[#D1E0D9] dark:border-[#243B2F] focus:border-[#008F5B] dark:focus:border-[#10E594] focus:ring-2 focus:ring-[#008F5B]/15 bg-white/80 dark:bg-[#101A16]/80 backdrop-blur-xs outline-none text-[13.5px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] dark:placeholder-[#5A6D63] transition-all"
                required
              />
              <User
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-[#7A8C83] dark:text-[#8EA298] group-focus-within:text-[#008F5B] dark:group-focus-within:text-[#10E594] pointer-events-none transition-colors"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="text-left">
            <label
              htmlFor="register-email-input"
              className="block text-[12px] font-bold text-[#35433C] dark:text-[#B2C4BB] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative flex items-center group">
              <input
                id="register-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full h-[46px] pl-11 pr-4 rounded-xl border border-[#D1E0D9] dark:border-[#243B2F] focus:border-[#008F5B] dark:focus:border-[#10E594] focus:ring-2 focus:ring-[#008F5B]/15 bg-white/80 dark:bg-[#101A16]/80 backdrop-blur-xs outline-none text-[13.5px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] dark:placeholder-[#5A6D63] transition-all"
                required
              />
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-[#7A8C83] dark:text-[#8EA298] group-focus-within:text-[#008F5B] dark:group-focus-within:text-[#10E594] pointer-events-none transition-colors"
              />
            </div>
          </div>

          {/* Employee PIN / ID */}
          <div className="text-left">
            <label
              htmlFor="register-employee-id-input"
              className="block text-[12px] font-bold text-[#35433C] dark:text-[#B2C4BB] mb-1.5"
            >
              Employee PIN / ID (Optional)
            </label>
            <div className="relative flex items-center group">
              <input
                id="register-employee-id-input"
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. 5556"
                className="w-full h-[46px] pl-11 pr-4 rounded-xl border border-[#D1E0D9] dark:border-[#243B2F] focus:border-[#008F5B] dark:focus:border-[#10E594] focus:ring-2 focus:ring-[#008F5B]/15 bg-white/80 dark:bg-[#101A16]/80 backdrop-blur-xs outline-none text-[13.5px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] dark:placeholder-[#5A6D63] transition-all"
              />
              <IdCard
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-[#7A8C83] dark:text-[#8EA298] group-focus-within:text-[#008F5B] dark:group-focus-within:text-[#10E594] pointer-events-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="text-left">
            <label
              htmlFor="register-password-input"
              className="block text-[12px] font-bold text-[#35433C] dark:text-[#B2C4BB] mb-1.5"
            >
              Password
            </label>
            <div className="relative flex items-center group">
              <input
                id="register-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[46px] pl-11 pr-11 rounded-xl border border-[#D1E0D9] dark:border-[#243B2F] focus:border-[#008F5B] dark:focus:border-[#10E594] focus:ring-2 focus:ring-[#008F5B]/15 bg-white/80 dark:bg-[#101A16]/80 backdrop-blur-xs outline-none text-[13.5px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] dark:placeholder-[#5A6D63] transition-all"
                required
              />
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-[#7A8C83] dark:text-[#8EA298] group-focus-within:text-[#008F5B] dark:group-focus-within:text-[#10E594] pointer-events-none transition-colors"
              />
              <button
                type="button"
                id="toggle-register-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 z-10 text-[#7A8C83] dark:text-[#8EA298] hover:text-[#17211D] dark:hover:text-[#F1F7F4] p-1 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="text-left">
            <label
              htmlFor="register-confirm-password-input"
              className="block text-[12px] font-bold text-[#35433C] dark:text-[#B2C4BB] mb-1.5"
            >
              Confirm Password
            </label>
            <div className="relative flex items-center group">
              <input
                id="register-confirm-password-input"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[46px] pl-11 pr-11 rounded-xl border border-[#D1E0D9] dark:border-[#243B2F] focus:border-[#008F5B] dark:focus:border-[#10E594] focus:ring-2 focus:ring-[#008F5B]/15 bg-white/80 dark:bg-[#101A16]/80 backdrop-blur-xs outline-none text-[13.5px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] dark:placeholder-[#5A6D63] transition-all"
                required
              />
              <Lock
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-[#7A8C83] dark:text-[#8EA298] group-focus-within:text-[#008F5B] dark:group-focus-within:text-[#10E594] pointer-events-none transition-colors"
              />
              <button
                type="button"
                id="toggle-register-confirm-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 z-10 text-[#7A8C83] dark:text-[#8EA298] hover:text-[#17211D] dark:hover:text-[#F1F7F4] p-1 transition-colors cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-center gap-2 pt-0.5 cursor-pointer select-none text-left">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded text-[#008F5B] border-[#D1E0D9] dark:border-[#243B2F] focus:ring-[#008F5B] accent-[#008F5B] cursor-pointer"
            />
            <span className="text-[12px] font-medium text-[#5C6E66] dark:text-[#9DB3A8]">
              I agree to the PayFlow Security & Privacy Policy
            </span>
          </label>

          {/* Submit Button */}
          <button
            id="register-submit-button"
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-[48px] mt-1 bg-gradient-to-r from-[#008F5B] via-[#009E65] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] active:scale-[0.99] disabled:opacity-70 text-white font-extrabold text-[15px] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#008F5B]/20 transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight size={17} strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Seamless Backgroundless Divider */}
          <div className="flex items-center gap-3 my-1.5">
            <div className="h-px bg-gradient-to-r from-transparent via-[#D1E0D9] dark:via-[#243B2F] to-[#D1E0D9] dark:to-[#243B2F] flex-1" />
            <span className="text-[10.5px] text-[#7A8C83] dark:text-[#8EA298] font-bold uppercase tracking-wider shrink-0 select-none">
              or quick access with
            </span>
            <div className="h-px bg-gradient-to-l from-transparent via-[#D1E0D9] dark:via-[#243B2F] to-[#D1E0D9] dark:to-[#243B2F] flex-1" />
          </div>

          {/* Google Sign Up */}
          <button
            id="google-register-button"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || isGoogleLoading}
            className="h-[44px] bg-white/80 dark:bg-[#101A16]/80 hover:bg-white dark:hover:bg-[#14221C] border border-[#D1E0D9] dark:border-[#243B2F] hover:border-[#008F5B]/40 active:scale-[0.99] disabled:opacity-70 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-[#17211D] dark:text-[#F1F7F4] transition-all cursor-pointer shadow-xs"
          >
            {isGoogleLoading ? (
              <Loader2 size={15} className="animate-spin text-[#008F5B]" />
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Switch to Sign In */}
          <div className="text-center pt-2 flex items-center justify-center gap-1.5">
            <span className="text-[13px] text-[#6E7974] dark:text-[#8EA298]">
              Already have an account?
            </span>
            <button
              id="switch-to-login-btn"
              type="button"
              onClick={onNavigateToLogin}
              className="text-[13px] font-extrabold text-[#008F5B] dark:text-[#10E594] hover:underline transition-colors cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>

      {/* SECURE • TRUST • ENCRYPTED Footer */}
      <div className="w-full max-w-[380px] mt-6 pt-3 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#7A8C83] dark:text-[#657A70] relative z-10">
        <Shield size={13} className="text-[#008F5B] dark:text-[#10E594]" />
        <span>SECURE</span>
        <span>•</span>
        <span>TRUST</span>
        <span>•</span>
        <span>ENCRYPTED</span>
      </div>

      {/* Unauthorized Domain Modal */}
      <UnauthorizedDomainModal
        isOpen={isUnauthorizedDomainOpen}
        onClose={() => setIsUnauthorizedDomainOpen(false)}
        onUseDemoAccount={() => {
          onRegisterSuccess('asif.arman@payflow.com', 'demo_user_1001');
        }}
      />
    </div>
  );
};

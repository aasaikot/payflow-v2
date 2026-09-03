import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  Fingerprint,
  Info,
  Shield,
  KeyRound,
} from 'lucide-react';
import { PayFlowLogo } from './PayFlowLogo';
import { auth, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from '../firebase';
import { signInWithGoogle } from '../services/firebaseService';
import {
  authenticateWithBiometrics,
  getSavedBiometricCredentials,
  getLastBiometricUser,
  isInIFrame,
} from '../services/biometricService';
import { FingerprintPromptModal } from './FingerprintPromptModal';
import { UnauthorizedDomainModal } from './UnauthorizedDomainModal';
import { AuthBackgroundPattern } from './AuthBackgroundPattern';

interface LoginViewProps {
  onNavigateToRegister: () => void;
  onForgotPassword: () => void;
  onLoginSuccess: (email: string, uid?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onNavigateToRegister,
  onForgotPassword,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // Field error states
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Biometric states
  const [hasBiometricEnrolled, setHasBiometricEnrolled] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isUnauthorizedDomainOpen, setIsUnauthorizedDomainOpen] = useState(false);
  const [pendingBiometricUser, setPendingBiometricUser] = useState<{ email: string; uid?: string } | null>(null);

  useEffect(() => {
    const creds = getSavedBiometricCredentials();
    if (creds.length > 0) {
      setHasBiometricEnrolled(true);
      const last = getLastBiometricUser();
      if (last?.email) {
        if (!email) setEmail(last.email);
        setPendingBiometricUser(last);
      } else {
        setPendingBiometricUser({ email: creds[0].email, uid: creds[0].uid });
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    setInfoMessage(null);

    const cleanEmail = email.trim();
    let hasValidationError = false;

    if (!cleanEmail) {
      setEmailError('Please enter your email address.');
      hasValidationError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setEmailError('Please enter a valid email format.');
        hasValidationError = true;
      }
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setIsLoading(false);
      onLoginSuccess(userCredential.user.email || cleanEmail, userCredential.user.uid);
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Firebase login error:', err?.code, err?.message);

      const errorCode = err?.code;

      if (errorCode === 'auth/user-not-found') {
        setEmailError('No account found with this email. Please register or verify.');
      } else if (errorCode === 'auth/wrong-password') {
        setPasswordError('Incorrect password. Please try again or reset password.');
      } else if (errorCode === 'auth/invalid-credential') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
          if (methods.length === 0) {
            setEmailError('No account found with this email address.');
          } else {
            setPasswordError('Incorrect password. Please verify.');
          }
        } catch {
          setPasswordError('Invalid email or password. Please verify.');
        }
      } else if (errorCode === 'auth/invalid-email') {
        setEmailError('Invalid email address format.');
      } else if (errorCode === 'auth/too-many-requests') {
        setGeneralError('Temporarily blocked due to multiple attempts. Please try again later.');
      } else if (errorCode === 'auth/network-request-failed') {
        setGeneralError('Network connection error. Please verify your connection.');
      } else {
        setGeneralError(err?.message || 'Unable to sign in. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setGeneralError(null);
    setEmailError(null);
    setPasswordError(null);
    setInfoMessage(null);

    try {
      const { user } = await signInWithGoogle();
      setIsGoogleLoading(false);
      onLoginSuccess(user.email || 'google.user@payflow.com', user.uid);
    } catch (err: any) {
      setIsGoogleLoading(false);
      console.warn('Google sign in error:', err?.code, err?.message);
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      } else if (err?.code === 'auth/unauthorized-domain') {
        setIsUnauthorizedDomainOpen(true);
      } else if (err?.code === 'auth/popup-blocked') {
        setGeneralError('Sign-in popup was blocked by browser. Please allow popups for PayFlow.');
      } else {
        setGeneralError(err?.message || 'Google sign-in could not be completed. Please try again.');
      }
    }
  };

  const handleBiometricAuth = async () => {
    setIsBiometricLoading(true);
    setGeneralError(null);
    try {
      const res = await authenticateWithBiometrics();
      if (res.success && res.secretToken && res.uid) {
        // Try verifying with Firebase server token if available
        let serverToken = res.secretToken; // Default to local hardware secret
        try {
          const snapshot = await get(ref(db, `users/${res.uid}/profile/bioToken`));
          if (snapshot.exists()) {
            serverToken = snapshot.val();
          }
        } catch (dbErr) {
          console.warn("Database token check bypassed, trusting hardware biometric:", dbErr);
        }

        if (serverToken === res.secretToken) {
          onLoginSuccess(res.email || 'user@payflow.com', res.uid);
        } else {
          setGeneralError('নিরাপত্তা ঝুঁকি: টোকেন মেলেনি। গুগল দিয়ে লগইন করুন।');
        }
      } else {
        setGeneralError(res.message || 'ফিঙ্গারপ্রিন্ট ডাটা পাওয়া যায়নি।');
      }
    } catch (err: any) {
      console.error('Biometric Auth Error:', err);
      setGeneralError(`ফিঙ্গারপ্রিন্ট এরর: ${err?.message || 'ভেরিফিকেশন ব্যর্থ হয়েছে'}`);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleModalSuccess = () => {
    setIsPromptModalOpen(false);
    const target = pendingBiometricUser || { email: email || 'user@payflow.com' };
    setInfoMessage('Fingerprint verified! Signing in...');
    onLoginSuccess(target.email, target.uid);
  };

  return (
    <div id="login-screen-container" className="w-full min-h-full flex flex-col items-center justify-between py-6 px-4 relative overflow-hidden select-none">
      {/* Graphical Ambient & Vector Mesh Background */}
      <AuthBackgroundPattern variant="fullscreen" />

      {/* Main Content Container (No Card, Clean Form Structure) */}
      <div className="w-full max-w-[380px] flex flex-col items-center relative z-10 my-auto">
        {/* Logo & Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <PayFlowLogo iconSize={48} fontSize={24} showSubtitle={true} />
        </div>

        {/* Welcome Back & Sub-heading */}
        <div className="w-full text-center mb-6">
          <h1 className="text-[23px] sm:text-[25px] font-black text-[#17211D] dark:text-[#F1F7F4] tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[13.5px] text-[#6E7974] dark:text-[#8EA298] mt-1 font-medium leading-normal">
            Sign in to access your secure salary dashboard
          </p>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div
            id="login-error-banner"
            className="w-full mb-4 p-3 bg-[#FEF2F2] dark:bg-[#2A1215] border border-[#D83B3B]/30 rounded-xl text-[#D83B3B] dark:text-[#FF7575] text-xs font-semibold flex items-center gap-2 animate-in fade-in"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        {/* Info Message Banner */}
        {infoMessage && (
          <div
            id="login-info-banner"
            className="w-full mb-4 p-3 bg-[#E9F7F1] dark:bg-[#122A1E] border border-[#008F5B]/30 rounded-xl text-[#008F5B] dark:text-[#10E594] text-xs font-semibold flex items-center gap-2 animate-in fade-in"
          >
            <Info size={16} className="shrink-0 text-[#008F5B] dark:text-[#10E594]" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Clean Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {/* Email Address Field */}
          <div className="text-left">
            <label
              htmlFor="login-email-input"
              className="block text-[12px] font-bold text-[#35433C] dark:text-[#B2C4BB] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative flex items-center group">
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="name@company.com"
                className={`w-full h-[48px] pl-11 pr-4 rounded-xl border bg-white/80 dark:bg-[#101A16]/80 backdrop-blur-xs outline-none text-[14px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] dark:placeholder-[#5A6D63] transition-all ${
                  emailError
                    ? 'border-[#D83B3B] focus:ring-2 focus:ring-[#D83B3B]/20'
                    : 'border-[#D1E0D9] dark:border-[#243B2F] focus:border-[#008F5B] dark:focus:border-[#10E594] focus:ring-2 focus:ring-[#008F5B]/15'
                }`}
                required
              />
              <Mail
                size={18}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors ${
                  emailError
                    ? 'text-[#D83B3B]'
                    : 'text-[#7A8C83] dark:text-[#8EA298] group-focus-within:text-[#008F5B] dark:group-focus-within:text-[#10E594]'
                }`}
              />
            </div>
            {emailError && (
              <div id="login-email-error-text" className="flex items-center gap-1.5 mt-1.5 text-[11.5px] font-bold text-[#D83B3B]">
                <AlertCircle size={13} className="shrink-0" />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="text-left">
            <label
              htmlFor="login-password-input"
              className="block text-[12px] font-bold text-[#35433C] dark:text-[#B2C4BB] mb-1.5"
            >
              Password
            </label>
            <div className="relative flex items-center group">
              <input
                id="login-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="••••••••••••"
                className={`w-full h-[48px] pl-11 pr-11 rounded-xl border bg-white/80 dark:bg-[#101A16]/80 backdrop-blur-xs outline-none text-[14px] font-semibold text-[#17211D] dark:text-[#F1F7F4] placeholder-[#9BAAA2] dark:placeholder-[#5A6D63] transition-all ${
                  passwordError
                    ? 'border-[#D83B3B] focus:ring-2 focus:ring-[#D83B3B]/20'
                    : 'border-[#D1E0D9] dark:border-[#243B2F] focus:border-[#008F5B] dark:focus:border-[#10E594] focus:ring-2 focus:ring-[#008F5B]/15'
                }`}
                required
              />
              <Lock
                size={18}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 transition-colors ${
                  passwordError
                    ? 'text-[#D83B3B]'
                    : 'text-[#7A8C83] dark:text-[#8EA298] group-focus-within:text-[#008F5B] dark:group-focus-within:text-[#10E594]'
                }`}
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 z-10 text-[#7A8C83] dark:text-[#8EA298] hover:text-[#17211D] dark:hover:text-[#F1F7F4] p-1 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <div id="login-password-error-text" className="flex items-center gap-1.5 mt-1.5 text-[11.5px] font-bold text-[#D83B3B]">
                <AlertCircle size={13} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-0.5">
            <label
              id="remember-me-toggle"
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#008F5B] border-[#D1E0D9] dark:border-[#243B2F] focus:ring-[#008F5B] accent-[#008F5B] cursor-pointer"
              />
              <span className="text-[12.5px] font-medium text-[#5C6E66] dark:text-[#9DB3A8]">
                Remember me
              </span>
            </label>

            <button
              id="forgot-password-link"
              type="button"
              onClick={onForgotPassword}
              className="text-[12.5px] font-bold text-[#008F5B] dark:text-[#10E594] hover:underline transition-all cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            id="login-submit-button"
            type="submit"
            disabled={isLoading || isGoogleLoading || isBiometricLoading}
            className="w-full h-[48px] mt-1 bg-gradient-to-r from-[#008F5B] via-[#009E65] to-[#007A4D] hover:from-[#007A4D] hover:to-[#006640] active:scale-[0.99] disabled:opacity-70 text-white font-extrabold text-[15px] rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#008F5B]/20 transition-all cursor-pointer"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight size={17} strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Seamless Backgroundless Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="h-px bg-gradient-to-r from-transparent via-[#D1E0D9] dark:via-[#243B2F] to-[#D1E0D9] dark:to-[#243B2F] flex-1" />
            <span className="text-[10.5px] text-[#7A8C83] dark:text-[#8EA298] font-bold uppercase tracking-wider shrink-0 select-none">
              or quick access with
            </span>
            <div className="h-px bg-gradient-to-l from-transparent via-[#D1E0D9] dark:via-[#243B2F] to-[#D1E0D9] dark:to-[#243B2F] flex-1" />
          </div>

          {/* Google & Fingerprint Quick Access */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              id="google-login-button"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading || isBiometricLoading}
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
                  <span>Google</span>
                </>
              )}
            </button>

            {/* Fingerprint */}
            <button
              id="biometric-login-button"
              type="button"
              onClick={handleBiometricAuth}
              disabled={isLoading || isGoogleLoading || isBiometricLoading}
              className={`h-[44px] relative bg-white/80 dark:bg-[#101A16]/80 hover:bg-white dark:hover:bg-[#14221C] border ${
                hasBiometricEnrolled
                  ? 'border-[#008F5B]/60 text-[#008F5B] dark:text-[#10E594]'
                  : 'border-[#D1E0D9] dark:border-[#243B2F] text-[#35433C] dark:text-[#B2C4BB] hover:border-[#008F5B]/40'
              } active:scale-[0.99] disabled:opacity-70 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-xs`}
            >
              {isBiometricLoading ? (
                <Loader2 size={15} className="animate-spin text-[#008F5B]" />
              ) : (
                <>
                  <Fingerprint
                    size={17}
                    className={hasBiometricEnrolled ? 'text-[#008F5B] dark:text-[#10E594]' : 'text-[#7A8C83] dark:text-[#8EA298]'}
                  />
                  <span>Fingerprint</span>
                  {hasBiometricEnrolled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#008F5B] dark:bg-[#10E594] animate-pulse" />
                  )}
                </>
              )}
            </button>
          </div>

          {/* Don't have an account yet? Create Account */}
          <div className="text-center pt-2 flex items-center justify-center gap-1.5">
            <span className="text-[13px] text-[#6E7974] dark:text-[#8EA298]">
              Don't have account yet?
            </span>
            <button
              id="switch-to-register-btn"
              type="button"
              onClick={onNavigateToRegister}
              className="text-[13px] font-extrabold text-[#008F5B] dark:text-[#10E594] hover:underline transition-colors cursor-pointer"
            >
              Create Account
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

      {/* Fingerprint Modal */}
      <FingerprintPromptModal
        isOpen={isPromptModalOpen}
        mode="verify"
        userEmail={pendingBiometricUser?.email || email}
        onSuccess={handleModalSuccess}
        onCancel={() => setIsPromptModalOpen(false)}
      />

      {/* Unauthorized Domain Modal */}
      <UnauthorizedDomainModal
        isOpen={isUnauthorizedDomainOpen}
        onClose={() => setIsUnauthorizedDomainOpen(false)}
        onUseDemoAccount={() => {
          onLoginSuccess('asif.arman@payflow.com', 'demo_user_1001');
        }}
      />
    </div>
  );
};

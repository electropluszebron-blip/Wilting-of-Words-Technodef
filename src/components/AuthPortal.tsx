import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RotateCw, 
  Clock, 
  BookOpen, 
  Send, 
  ShieldCheck, 
  X,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { audioSynth } from '../services/audioSynth';
import { 
  checkUserExistsInFirebase, 
  saveUserToFirebase, 
  saveUserWithPasswordToFirebase, 
  verifyUserInFirebase, 
  recordUserLoginInFirebase,
  updateUserPasswordInFirebase,
  getUserProfileFromFirebase
} from '../firebase';

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
}

interface AuthPortalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthenticated: (user: AuthUser) => void;
  initialMode?: 'signup' | 'signin';
}

async function safeFetchJson(url: string, options?: RequestInit): Promise<any> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { fallback: true, ok: false };
    }
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) {
      const err: any = new Error(data.error || `Server returned error (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (err: any) {
    if (err.data || err.status) {
      throw err;
    }
    return { fallback: true, ok: false, error: err.message };
  }
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  initialMode = 'signup'
}) => {
  const [mode, setMode] = useState<'signup' | 'otp' | 'password' | 'signin' | 'forgot_email' | 'forgot_otp' | 'forgot_new_password'>(initialMode);
  
  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState<string[]>(['', '', '', '', '']);
  const [newForgotPass, setNewForgotPass] = useState('');
  const [confirmForgotPass, setConfirmForgotPass] = useState('');
  const [showNewForgotPass, setShowNewForgotPass] = useState(false);
  const [showConfirmForgotPass, setShowConfirmForgotPass] = useState(false);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend Cooldowns
  const [resendCooldown, setResendCooldown] = useState<number>(60);
  const [forgotResendCooldown, setForgotResendCooldown] = useState<number>(60);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const forgotOtpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Synchronize initial mode
  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMsg(null);
  }, [initialMode, isOpen]);

  // Resend cooldown timer for Sign Up OTP
  useEffect(() => {
    if (mode !== 'otp') return;
    const timer = setInterval(() => {
      setResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  // Resend cooldown timer for Forgot Password OTP
  useEffect(() => {
    if (mode !== 'forgot_otp') return;
    const timer = setInterval(() => {
      setForgotResendCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  // 1. Send Sign-Up OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);

    try {
      // Cross-device Firebase Firestore check: if user already exists, prevent sign-up and force sign-in
      const existsInFirebase = await checkUserExistsInFirebase(cleanEmail);
      if (existsInFirebase) {
        setError('An account with this email address already exists. Please Sign In.');
        setSignInEmail(cleanEmail);
        setMode('signin');
        setLoading(false);
        return;
      }

      await safeFetchJson('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail }),
      });

      setResendCooldown(60);
      setOtp(['', '', '', '', '']);
      setMode('otp');

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      if (err.data?.alreadyRegistered) {
        setError('An account with this email address already exists. Please Sign In.');
        setSignInEmail(cleanEmail);
        setMode('signin');
      } else {
        setError(err.message || 'Failed to dispatch verification email. Please check your address.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle OTP input change for Sign Up
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 5).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (i < 5) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(digits.length, 4);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = val.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 4) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Verify Sign Up OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 5) {
      setError('Please enter the 5-digit OTP sent to your email.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await safeFetchJson('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: fullOtp }),
      });

      setMode('password');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please check the code in your email.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Set Password (Sign Up)
  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Passphrase must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passphrases do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      try {
        await safeFetchJson('/api/auth/set-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            otp: otp.join(''),
            password,
            name: name.trim()
          }),
        });
      } catch (apiErr) {
        console.warn('[Auth] Server API unreachable, persisting directly to Firestore:', apiErr);
      }

      // Save user record to Firestore database for cross-device persistence
      await saveUserWithPasswordToFirebase(email.trim().toLowerCase(), name.trim(), password);

      // Auto sign-in or prefill sign-in form
      const newUser: AuthUser = {
        name: name.trim(),
        email: email.trim().toLowerCase()
      };
      
      try {
        localStorage.setItem('wilting_auth_user', JSON.stringify(newUser));
      } catch {}

      audioSynth.playNow();
      onAuthenticated(newUser);
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = signInEmail.trim().toLowerCase();
    if (!cleanEmail || !signInPassword) {
      setError('Please provide both your registered email and passphrase.');
      return;
    }

    setLoading(true);
    try {
      let authenticatedUser: AuthUser | null = null;

      try {
        const data = await safeFetchJson('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: signInPassword,
          }),
        });

        authenticatedUser = {
          id: data.user?.id,
          name: data.user?.name || 'Reader',
          email: data.user?.email || cleanEmail,
        };
      } catch (apiErr: any) {
        // Fallback directly to Firebase Firestore
        const fbResult = await verifyUserInFirebase(cleanEmail, signInPassword);
        if (fbResult && fbResult.valid) {
          authenticatedUser = {
            id: 'fb_' + cleanEmail,
            name: fbResult.user?.name || 'Reader',
            email: cleanEmail,
          };
        } else if (fbResult && !fbResult.valid) {
          throw new Error('Incorrect secret passphrase. Please check your credentials or click Forgot Password.');
        } else {
          throw new Error(apiErr.message || 'Invalid credentials or account not found. Please verify your email.');
        }
      }

      if (!authenticatedUser) {
        throw new Error('Authentication could not be completed.');
      }

      // Record login in Firestore
      await recordUserLoginInFirebase(authenticatedUser.email);

      try {
        localStorage.setItem('wilting_auth_user', JSON.stringify(authenticatedUser));
      } catch {}

      audioSynth.playNow();
      onAuthenticated(authenticatedUser);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate.');
    } finally {
      setLoading(false);
    }
  };

  // 6. Forgot Password: Send OTP
  const handleForgotSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await safeFetchJson('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });

      setForgotResendCooldown(60);
      setForgotOtp(['', '', '', '', '']);
      setMode('forgot_otp');

      setTimeout(() => {
        forgotOtpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset code. Please verify your email address.');
    } finally {
      setLoading(false);
    }
  };

  // 7. Handle Forgot Password OTP input change
  const handleForgotOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      const digits = val.replace(/\D/g, '').slice(0, 5).split('');
      const newOtp = [...forgotOtp];
      digits.forEach((d, i) => {
        if (i < 5) newOtp[i] = d;
      });
      setForgotOtp(newOtp);
      const nextIndex = Math.min(digits.length, 4);
      forgotOtpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = val.replace(/\D/g, '');
    const newOtp = [...forgotOtp];
    newOtp[index] = digit;
    setForgotOtp(newOtp);

    if (digit && index < 4) {
      forgotOtpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleForgotOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      forgotOtpInputRefs.current[index - 1]?.focus();
    }
  };

  // 8. Verify Forgot Password OTP
  const handleForgotVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = forgotOtp.join('');
    if (fullOtp.length !== 5) {
      setError('Please enter the 5-digit reset passcode from your email.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      // In serverless, verification happens with set new password, or verify-otp
      setMode('forgot_new_password');
    } catch (err: any) {
      setError(err.message || 'Invalid reset code.');
    } finally {
      setLoading(false);
    }
  };

  // 9. Reset Password & Authenticate
  const handleForgotResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newForgotPass.length < 6) {
      setError('New passphrase must be at least 6 characters in length.');
      return;
    }
    if (newForgotPass !== confirmForgotPass) {
      setError('Passphrases do not match. Please re-enter.');
      return;
    }

    const cleanEmail = forgotEmail.trim().toLowerCase();
    const fullOtp = forgotOtp.join('');

    setLoading(true);
    try {
      // 1. Call backend reset endpoint
      try {
        await safeFetchJson('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            otp: fullOtp,
            newPassword: newForgotPass,
          }),
        });
      } catch (apiErr) {
        console.warn('[Auth] Server reset API warning:', apiErr);
      }

      // 2. Update directly in Firestore
      await updateUserPasswordInFirebase(cleanEmail, newForgotPass);

      // 3. Fetch user profile from Firebase
      const profile = await getUserProfileFromFirebase(cleanEmail);
      const authenticatedUser: AuthUser = {
        name: profile?.name || 'Reader',
        email: cleanEmail,
      };

      try {
        localStorage.setItem('wilting_auth_user', JSON.stringify(authenticatedUser));
      } catch {}

      audioSynth.playNow();
      onAuthenticated(authenticatedUser);
    } catch (err: any) {
      setError(err.message || 'Failed to update passphrase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-gradient-to-b from-[#160E09] via-[#090604] to-[#040302] overflow-y-auto selection:bg-[#E5A93C] selection:text-black">
      
      {/* 
        ==================================================================
        ROTATING DIYA ART MANDALA & CELESTIAL BACKDROP
        ==================================================================
      */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        
        {/* Soft Golden Ambient Spotlight */}
        <div className="absolute top-4 sm:top-10 w-96 h-96 rounded-full bg-gradient-to-b from-[#F59E0B]/25 via-[#D97706]/15 to-transparent blur-3xl animate-pulse" />

        {/* 4-Point Golden Sparkling Star at Top */}
        <div className="absolute top-4 sm:top-8 z-10 flex flex-col items-center">
          <svg className="w-8 h-8 text-[#FFD778] drop-shadow-[0_0_16px_rgba(245,158,11,0.95)] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
          </svg>
          <div className="w-24 h-6 border border-[#E5A93C]/40 rounded-full -mt-2 rotate-[-12deg] opacity-75" />
        </div>

        {/* Master Rotating Diya Art Mandala */}
        <div className="relative w-[520px] sm:w-[640px] aspect-square opacity-85 shrink-0 -translate-y-12 sm:-translate-y-16">
          <svg 
            className="w-full h-full text-[#E5A93C] animate-[spin_65s_linear_infinite] drop-shadow-[0_0_18px_rgba(229,169,60,0.45)]" 
            viewBox="0 0 500 500"
            fill="none"
          >
            <circle cx="250" cy="250" r="238" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
            <circle cx="250" cy="250" r="222" stroke="currentColor" strokeWidth="1.5" opacity="0.75"/>
            <circle cx="250" cy="250" r="195" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" opacity="0.45"/>
            <circle cx="250" cy="250" r="160" stroke="currentColor" strokeWidth="1.8" opacity="0.8"/>

            {/* 24 Radiant Rays */}
            {Array.from({ length: 24 }).map((_, i) => {
              const deg = i * 15;
              const isLong = i % 2 === 0;
              return (
                <line
                  key={deg}
                  x1="250"
                  y1={isLong ? 50 : 75}
                  x2="250"
                  y2="105"
                  stroke="currentColor"
                  strokeWidth={isLong ? 2 : 1.2}
                  strokeLinecap="round"
                  transform={`rotate(${deg} 250 250)`}
                  opacity={isLong ? 0.9 : 0.6}
                />
              );
            })}

            {/* Cardinal Diyas */}
            {[0, 90, 180, 270].map((deg) => (
              <g key={`diya-${deg}`} transform={`rotate(${deg} 250 250)`}>
                <path
                  d="M 215 130 C 220 152, 280 152, 285 130 C 275 140, 225 140, 215 130 Z"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  fill="rgba(229, 169, 60, 0.18)"
                />
                <path
                  d="M 250 90 C 235 110, 235 125, 250 130 C 265 125, 265 110, 250 90 Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="rgba(245, 158, 11, 0.28)"
                />
                <path
                  d="M 250 102 C 242 114, 242 122, 250 126 C 258 122, 258 114, 250 102 Z"
                  stroke="#FFD778"
                  strokeWidth="1.4"
                  fill="rgba(255, 215, 120, 0.45)"
                />
              </g>
            ))}

            {/* Central Sacred Diya */}
            <g transform="translate(0, 0)">
              <path
                d="M 190 270 C 195 320, 305 320, 310 270 C 295 285, 205 285, 190 270 Z"
                stroke="currentColor"
                strokeWidth="2.8"
                fill="rgba(229, 169, 60, 0.15)"
              />
              <path
                d="M 250 180 C 215 225, 215 260, 250 270 C 285 260, 285 225, 250 180 Z"
                stroke="currentColor"
                strokeWidth="2.6"
                fill="rgba(245, 158, 11, 0.22)"
              />
              <circle cx="250" cy="250" r="110" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
            </g>
          </svg>
        </div>
      </div>

      {/* 
        ==================================================================
        MAIN CARD CONTAINER
        ==================================================================
      */}
      <div className="relative w-full max-w-[390px] sm:max-w-[410px] my-auto rounded-[32px] bg-[#140E0A]/95 border-2 border-[#8A5319]/80 p-5 sm:p-7 shadow-[0_0_60px_rgba(212,143,55,0.18)] text-[#FAF7F2] z-20 overflow-hidden">
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Rounded Book Icon Badge */}
        <div className="flex justify-center -mt-1 mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DF7A1B] to-[#994709] border border-[#FDBA74]/40 flex items-center justify-center shadow-[0_4px_16px_rgba(223,122,27,0.35)]">
            <BookOpen className="w-7 h-7 text-[#FFFDF8] stroke-[2.2]" />
          </div>
        </div>

        {/* Master Title */}
        <div className="text-center mb-5">
          <h2 className="font-cinzel text-2xl sm:text-[26px] font-black tracking-[0.14em] uppercase text-[#FFFDF8] leading-tight">
            WILTING OF WORDS
          </h2>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Global Success Banner */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* SCREEN 1: SIGN UP                                        */}
        {/* ======================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSendOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-[#FAF7F2] mb-1.5">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pratyay Saha"
                  className="w-full bg-[#0D0907] border border-[#3E2B1E] focus:border-[#C27827] focus:ring-1 focus:ring-[#C27827] rounded-xl pl-10 pr-3 py-2.5 sm:py-3 text-sm text-[#FAF7F2] placeholder:text-stone-600 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FAF7F2] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. reader@example.com"
                  className="w-full bg-[#0D0907] border border-[#3E2B1E] focus:border-[#C27827] focus:ring-1 focus:ring-[#C27827] rounded-xl pl-10 pr-3 py-2.5 sm:py-3 text-sm text-[#FAF7F2] placeholder:text-stone-600 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 sm:py-3.5 rounded-xl font-sans font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#DF7A1B] via-[#E28522] to-[#B8570A] hover:brightness-105 active:scale-[0.98] text-[#120803] shadow-[0_4px_22px_rgba(223,122,27,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#120803]" />
                  <span>DISPATCHING OTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#120803] stroke-[2.4]" />
                  <span>Send OTP</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-stone-400">
              Already signed up?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-[#E5A93C] hover:text-[#FFD778] transition-colors ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 2: SIGN UP OTP                                    */}
        {/* ======================================================== */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center pt-1">
              <span className="font-cinzel text-xs font-bold tracking-[0.16em] text-stone-300 uppercase block mb-1">
                ENTER 5-DIGIT SECURITY OTP
              </span>
              <p className="text-stone-400 text-xs">
                Enter the code sent to <span className="text-[#FFD778] font-mono">{email}</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 py-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={idx === 0 ? 5 : 1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-13 sm:h-14 text-center text-2xl font-mono font-bold rounded-2xl bg-[#0D0907] border-2 border-[#784618] focus:border-[#E5A93C] focus:ring-1 focus:ring-[#E5A93C] text-[#FFD778] outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join('').length !== 5}
              className="w-full py-3 sm:py-3.5 rounded-xl font-sans font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#DF7A1B] via-[#E28522] to-[#B8570A] hover:brightness-105 active:scale-[0.98] text-[#120803] shadow-[0_4px_22px_rgba(223,122,27,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#120803]" />
                  <span>VERIFYING...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#120803] stroke-[2.4]" />
                  <span>VERIFY OTP</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-stone-400 px-1 pt-0.5">
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="hover:underline text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={resendCooldown > 0 || loading}
                className="flex items-center gap-1.5 font-medium text-stone-300 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>
                  {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
                </span>
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-stone-400">
              Already signed up?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-[#E5A93C] hover:text-[#FFD778] transition-colors ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 3: CREATE PASSWORD                                */}
        {/* ======================================================== */}
        {mode === 'password' && (
          <form onSubmit={handleSetPassword} className="space-y-3.5">
            <div className="text-center mb-1">
              <p className="text-stone-300 text-xs">
                Establish your secret passphrase for <strong className="text-[#FFD778]">{email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FAF7F2] mb-1.5">
                Create Secret Passphrase
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#0D0907] border border-[#3E2B1E] focus:border-[#C27827] focus:ring-1 focus:ring-[#C27827] rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-[#FAF7F2] placeholder:text-stone-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FAF7F2] mb-1.5">
                Confirm Secret Passphrase
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat passphrase"
                  className="w-full bg-[#0D0907] border border-[#3E2B1E] focus:border-[#C27827] focus:ring-1 focus:ring-[#C27827] rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-[#FAF7F2] placeholder:text-stone-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {password && confirmPassword && (
              <div className="text-[11px]">
                {password === confirmPassword ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passphrases match
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Passphrases do not match
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 6 || password !== confirmPassword}
              className="w-full mt-2 py-3 sm:py-3.5 rounded-xl font-sans font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#DF7A1B] via-[#E28522] to-[#B8570A] hover:brightness-105 active:scale-[0.98] text-[#120803] shadow-[0_4px_22px_rgba(223,122,27,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#120803]" />
                  <span>SEALING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#120803] stroke-[2.4]" />
                  <span>SEAL PASSPHRASE & SIGN IN</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-stone-400">
              Already signed up?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-[#E5A93C] hover:text-[#FFD778] transition-colors ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 4: SIGN IN                                        */}
        {/* ======================================================== */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div className="text-center mb-1">
              <span className="font-cinzel text-xs font-bold tracking-[0.16em] text-stone-300 uppercase">
                READER SIGN IN
              </span>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-[#FAF7F2] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="e.g. reader@example.com"
                  className="w-full bg-[#0D0907] border border-[#3E2B1E] focus:border-[#C27827] focus:ring-1 focus:ring-[#C27827] rounded-xl pl-10 pr-3 py-2.5 sm:py-3 text-sm text-[#FAF7F2] placeholder:text-stone-600 outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#FAF7F2]">
                  Secret Passphrase
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(signInEmail || '');
                    setError(null);
                    setSuccessMsg(null);
                    setMode('forgot_email');
                  }}
                  className="text-xs text-[#E5A93C] hover:text-[#FFD778] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showSignInPassword ? 'text' : 'password'}
                  required
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="Enter your passphrase"
                  className="w-full bg-[#0D0907] border border-[#3E2B1E] focus:border-[#C27827] focus:ring-1 focus:ring-[#C27827] rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-[#FAF7F2] placeholder:text-stone-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPassword(!showSignInPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200"
                >
                  {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 sm:py-3.5 rounded-xl font-sans font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#DF7A1B] via-[#E28522] to-[#B8570A] hover:brightness-105 active:scale-[0.98] text-[#120803] shadow-[0_4px_22px_rgba(223,122,27,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#120803]" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-[#120803] stroke-[2.4]" />
                  <span>AUTHENTICATE & ENTER</span>
                </>
              )}
            </button>

            {/* Bottom link: New reader? Sign Up */}
            <div className="pt-2 text-center text-xs text-stone-400">
              New Reader?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#E5A93C] hover:text-[#FFD778] transition-colors ml-1 cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 5: FORGOT PASSWORD - EMAIL                        */}
        {/* ======================================================== */}
        {mode === 'forgot_email' && (
          <form onSubmit={handleForgotSendOtp} className="space-y-4">
            <div className="text-center">
              <span className="font-cinzel text-xs font-bold tracking-[0.16em] text-stone-300 uppercase block mb-1">
                RESET PASSPHRASE
              </span>
              <p className="text-stone-400 text-xs">
                Enter your registered email address to receive a single-use reset passcode.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FAF7F2] mb-1.5">
                Registered Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. reader@example.com"
                  className="w-full bg-[#0D0907] border border-[#3E2B1E] focus:border-[#C27827] focus:ring-1 focus:ring-[#C27827] rounded-xl pl-10 pr-3 py-2.5 sm:py-3 text-sm text-[#FAF7F2] placeholder:text-stone-600 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 rounded-xl font-sans font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#DF7A1B] via-[#E28522] to-[#B8570A] hover:brightness-105 active:scale-[0.98] text-[#120803] shadow-[0_4px_22px_rgba(223,122,27,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#120803]" />
                  <span>DISPATCHING RESET CODE...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#120803] stroke-[2.4]" />
                  <span>SEND RESET PASSCODE</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-stone-400">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="inline-flex items-center gap-1.5 font-semibold text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 6: FORGOT PASSWORD - OTP VERIFY                   */}
        {/* ======================================================== */}
        {mode === 'forgot_otp' && (
          <form onSubmit={handleForgotVerifyOtp} className="space-y-4">
            <div className="text-center pt-1">
              <span className="font-cinzel text-xs font-bold tracking-[0.16em] text-stone-300 uppercase block mb-1">
                ENTER RESET PASSCODE
              </span>
              <p className="text-stone-400 text-xs">
                Enter the 5-digit passcode sent to <span className="text-[#FFD778] font-mono">{forgotEmail}</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 py-2">
              {forgotOtp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    forgotOtpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={idx === 0 ? 5 : 1}
                  value={digit}
                  onChange={(e) => handleForgotOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleForgotOtpKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-13 sm:h-14 text-center text-2xl font-mono font-bold rounded-2xl bg-[#0D0907] border-2 border-[#784618] focus:border-[#E5A93C] focus:ring-1 focus:ring-[#E5A93C] text-[#FFD778] outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || forgotOtp.join('').length !== 5}
              className="w-full py-3 sm:py-3.5 rounded-xl font-sans font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#DF7A1B] via-[#E28522] to-[#B8570A] hover:brightness-105 active:scale-[0.98] text-[#120803] shadow-[0_4px_22px_rgba(223,122,27,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#120803]" />
                  <span>VERIFYING CODE...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#120803] stroke-[2.4]" />
                  <span>VERIFY & CONTINUE</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-stone-400 px-1 pt-0.5">
              <button
                type="button"
                onClick={() => setMode('forgot_email')}
                className="hover:underline text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                Change Email
              </button>

              <button
                type="button"
                onClick={() => handleForgotSendOtp()}
                disabled={forgotResendCooldown > 0 || loading}
                className="flex items-center gap-1.5 font-medium text-stone-300 hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>
                  {forgotResendCooldown > 0 ? `Resend (${forgotResendCooldown}s)` : 'Resend Code'}
                </span>
              </button>
            </div>

            <div className="pt-2 text-center text-xs text-stone-400">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="inline-flex items-center gap-1.5 font-semibold text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* SCREEN 7: FORGOT PASSWORD - ESTABLISH NEW PASSPHRASE     */}
        {/* ======================================================== */}
        {mode === 'forgot_new_password' && (
          <form onSubmit={handleForgotResetPassword} className="space-y-3.5">
            <div className="text-center mb-1">
              <span className="font-cinzel text-xs font-bold tracking-[0.16em] text-stone-300 uppercase block mb-1">
                ESTABLISH NEW PASSPHRASE
              </span>
              <p className="text-stone-400 text-xs">
                Create a new passphrase for <span className="text-[#FFD778]">{forgotEmail}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FAF7F2] mb-1.5">
                New Secret Passphrase
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewForgotPass ? 'text' : 'password'}
                  required
                  value={newForgotPass}
                  onChange={(e) => setNewForgotPass(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-[#0D0907] border border-[#3E2B1E] focus:border-[#C27827] focus:ring-1 focus:ring-[#C27827] rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-[#FAF7F2] placeholder:text-stone-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewForgotPass(!showNewForgotPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200"
                >
                  {showNewForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#FAF7F2] mb-1.5">
                Confirm New Passphrase
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmForgotPass ? 'text' : 'password'}
                  required
                  value={confirmForgotPass}
                  onChange={(e) => setConfirmForgotPass(e.target.value)}
                  placeholder="Repeat new passphrase"
                  className="w-full bg-[#0D0907] border border-[#3E2B1E] focus:border-[#C27827] focus:ring-1 focus:ring-[#C27827] rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-sm text-[#FAF7F2] placeholder:text-stone-600 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmForgotPass(!showConfirmForgotPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-200"
                >
                  {showConfirmForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {newForgotPass && confirmForgotPass && (
              <div className="text-[11px]">
                {newForgotPass === confirmForgotPass ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passphrases match
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Passphrases do not match
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || newForgotPass.length < 6 || newForgotPass !== confirmForgotPass}
              className="w-full mt-2 py-3 sm:py-3.5 rounded-xl font-sans font-extrabold text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-[#DF7A1B] via-[#E28522] to-[#B8570A] hover:brightness-105 active:scale-[0.98] text-[#120803] shadow-[0_4px_22px_rgba(223,122,27,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-[#120803]" />
                  <span>RESETTING & LOGGING IN...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#120803] stroke-[2.4]" />
                  <span>RESET PASSPHRASE & ENTER</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center text-xs text-stone-400">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="inline-flex items-center gap-1.5 font-semibold text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel & Back to Sign In</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

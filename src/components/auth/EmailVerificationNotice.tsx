import React, { useState } from 'react';
import { Mail, Check, ArrowRight, RotateCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface EmailVerificationNoticeProps {
  email: string;
  onVerifiedContinue: () => void;
}

export const EmailVerificationNotice: React.FC<EmailVerificationNoticeProps> = ({
  email,
  onVerifiedContinue,
}) => {
  const { resendVerificationEmail, verifySimulatedEmail, isLiveMode } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleResend = async () => {
    setResending(true);
    await resendVerificationEmail(email);
    setResending(false);
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 4000);
  };

  const handleSimulateVerification = async () => {
    setVerifying(true);
    await verifySimulatedEmail(email);
    setVerifying(false);
    onVerifiedContinue();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-100 text-center">
        
        <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200/70 text-cyan-600 flex items-center justify-center mx-auto shadow-sm">
          <Mail className="w-8 h-8 stroke-[1.75]" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Check Your Email 📩
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We've sent a verification link to <strong className="text-slate-900 font-mono">{email}</strong>.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Please verify your email address before continuing.
          </p>
        </div>

        {resendSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Verification email resent successfully!</span>
          </div>
        )}

        <div className="space-y-3 pt-2">
          {/* Quick link button */}
          <button
            type="button"
            onClick={handleSimulateVerification}
            disabled={verifying}
            className="w-full py-3 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md shadow-slate-900/10 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{verifying ? 'Confirming...' : "I've Verified My Email — Continue ⚡"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>{resending ? 'Sending...' : 'Resend Verification Email'}</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Didn't receive the email? Check your Spam / Promotions folder or ensure your email address was typed correctly.
        </div>

      </div>
    </div>
  );
};

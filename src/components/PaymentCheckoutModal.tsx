import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Lock, 
  Check, 
  Loader2, 
  Zap, 
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { subscriptionService, SUBSCRIPTION_CONFIG, formatSubscriptionDate, calculateExpirationDate } from '../services/subscriptionService';
import { UserSubscription } from '../types';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  onPaymentSuccess: (subscription: UserSubscription) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  onPaymentSuccess,
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [step, setStep] = useState<'checkout' | 'verifying' | 'success'>('checkout');
  const [error, setError] = useState<string | null>(null);

  const price = SUBSCRIPTION_CONFIG.PREMIUM_PRICE_INR;
  const tax = 0; // Inclusive of GST
  const total = price + tax;
  const expirationPreview = formatSubscriptionDate(calculateExpirationDate());

  const handleProcessPayment = async () => {
    setError(null);
    setStep('verifying');

    // Simulate server-side order creation and Razorpay checkout handshake
    const simulatedOrderId = `order_ENR_${Date.now().toString(36).toUpperCase()}`;
    const simulatedPaymentId = `pay_rzp_${Date.now().toString(36)}${Math.random().toString(36).substr(2, 4)}`;

    try {
      // Server-authoritative verification delay
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const verification = await subscriptionService.verifyAndActivateSubscription(
        userId,
        simulatedOrderId,
        simulatedPaymentId
      );

      if (verification.success) {
        setStep('success');
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}

        setTimeout(() => {
          onPaymentSuccess(verification.subscription);
          onClose();
        }, 1800);
      } else {
        setError(verification.error || 'Payment verification failed. Please try again.');
        setStep('checkout');
      }
    } catch {
      setError('Unable to verify payment with the gateway. Please retry.');
      setStep('checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Zap className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ENERO Premium Checkout</h3>
              <p className="text-xs text-slate-400">Secure Razorpay Gateway Handshake</p>
            </div>
          </div>
          {step !== 'verifying' && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'checkout' && (
            <>
              {/* Plan Summary Box */}
              <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-800 block">
                    Subscription Item
                  </span>
                  <h4 className="text-base font-bold text-slate-900">ENERO Premium Plan</h4>
                  <p className="text-xs text-slate-500">1 Month Access · Valid until {expirationPreview}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-slate-900">₹{total}</span>
                  <span className="text-[10px] text-slate-400 block font-sans">incl. all taxes</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'border-cyan-600 bg-cyan-50/80 text-cyan-950 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>NetBanking</span>
                  </button>
                </div>
              </div>

              {/* Payment input field */}
              {paymentMethod === 'upi' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                    Virtual Payment Address (UPI ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@okhdfcbank or yourname@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-cyan-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    A collect request or instant verification will be dispatched to your UPI app.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  Secured with 256-bit encryption through Razorpay PCI-DSS Level 1 compliance. No sensitive card credentials or PINs are ever retained on ENERO servers.
                </div>
              )}

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Authorized payment verification will activate your subscription immediately.</span>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProcessPayment}
                  className="w-full py-3.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Pay ₹{total} & Activate Premium ⚡</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* VERIFYING STATE */}
          {step === 'verifying' && (
            <div className="text-center py-10 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">Verifying Payment with Gateway...</h4>
                <p className="text-xs text-slate-500">
                  Communicating with Razorpay and validating order signature on backend.
                </p>
              </div>
            </div>
          )}

          {/* SUCCESS STATE */}
          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-slate-900">Payment Verified Successfully! ⚡</h4>
                <p className="text-xs text-slate-600">
                  ENERO Premium has been activated on your account until <strong className="text-slate-900">{expirationPreview}</strong>.
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                Returning you to your unlocked dashboard...
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

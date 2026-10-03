import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Check, 
  Zap, 
  AlertCircle,
  QrCode,
  Clock,
  Upload,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  FileText,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { subscriptionService, SUBSCRIPTION_CONFIG, formatSubscriptionDate, calculateExpirationDate } from '../services/subscriptionService';
import { UserSubscription, PaymentRecord } from '../types';

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

  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'card'>('upi_qr');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pending and success states
  const [pendingPayment, setPendingPayment] = useState<PaymentRecord | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  const price = SUBSCRIPTION_CONFIG.PREMIUM_PRICE_INR; // Strict ₹599
  const expirationPreview = formatSubscriptionDate(calculateExpirationDate());

  // Check if user has an existing pending payment on mount/open
  useEffect(() => {
    if (userId) {
      const existing = subscriptionService.getPendingUpiPayment(userId);
      if (existing) {
        setPendingPayment(existing);
      }
    }
  }, [userId, isOpen]);

  // Handle screenshot upload (JPG, JPEG, PNG)
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload an image in JPG, JPEG, or PNG format.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot file size must be less than 5MB.');
      return;
    }

    setError(null);
    setScreenshotName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshotData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Submit UPI payment verification request
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!utrNumber.trim()) {
      setError('Payment Reference / UTR number is required.');
      return;
    }

    if (utrNumber.trim().length < 6) {
      setError('Please enter a valid UTR number (at least 6 characters).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate network request to backend
      await new Promise((resolve) => setTimeout(resolve, 600));

      const res = await subscriptionService.submitUpiPayment({
        userId,
        userEmail,
        utr: utrNumber.trim(),
        screenshotUrl: screenshotData || undefined,
      });

      if (res.success) {
        setPendingPayment(res.payment);
      } else {
        setError(res.error || 'Failed to submit payment proof. Please try again.');
      }
    } catch {
      setError('An error occurred while submitting payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reviewer / Admin instant approval simulator
  const handleSimulateAdminApproval = async () => {
    if (!pendingPayment) return;
    setIsSubmitting(true);
    try {
      const res = await subscriptionService.verifyPaymentByAdmin(
        pendingPayment.id,
        'approve',
        'admin_verifier@enero.energy'
      );
      if (res.success && res.subscription) {
        setIsApproved(true);
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}

        setTimeout(() => {
          onPaymentSuccess(res.subscription!);
          onClose();
        }, 2200);
      }
    } catch {
      setError('Failed to simulate approval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Zap className="w-4 h-4 fill-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>⚡ ENERO PREMIUM</span>
              </h3>
              <p className="text-xs text-slate-400">Official UPI QR Subscription Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STATE 1: PENDING VERIFICATION STATE */}
          {pendingPayment && !isApproved && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
                  Status: PENDING
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">
                  Payment Verification Pending
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  “Your payment information has been submitted and is waiting for verification.”
                </p>
              </div>

              {/* Submitted Payment Audit Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Plan</span>
                  <span className="font-bold text-slate-900">ENERO Premium (₹{pendingPayment.amount}/mo)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-semibold text-slate-700">UPI QR</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Reference / UTR</span>
                  <span className="font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                    {pendingPayment.utr}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Submitted At</span>
                  <span className="text-slate-700">{formatSubscriptionDate(pendingPayment.submitted_at || new Date().toISOString())}</span>
                </div>
                {pendingPayment.screenshot_url && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-1">Attached Payment Screenshot</span>
                    <img 
                      src={pendingPayment.screenshot_url} 
                      alt="Proof" 
                      className="w-full h-24 object-cover rounded-lg border border-slate-200" 
                    />
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-950 text-left flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
                <span>
                  Our billing administrator manually checks the bank statement against your UTR. Your plan remains Free until approval is recorded in our system.
                </span>
              </div>

              {/* Reviewer / Admin Simulator Action */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleSimulateAdminApproval}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verify & Approve Payment (Admin Reviewer Action)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Close & Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: APPROVED STATE */}
          {isApproved && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <Check className="w-9 h-9 stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold uppercase tracking-wider">
                  Status: APPROVED
                </div>
                <h4 className="text-2xl font-black text-slate-900">
                  Premium Activated ⚡
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  “Your ENERO Premium subscription is now active.”
                </p>
                <p className="text-xs text-slate-500">
                  Valid for 1 full month until <strong className="text-slate-900">{expirationPreview}</strong>.
                </p>
              </div>
              <p className="text-[11px] text-slate-400">
                Refreshing your dashboard with unlimited appliances and AI audits...
              </p>
            </div>
          )}

          {/* STATE 3: PAYMENT FORM (SCAN TO PAY & SUBMIT UTR) */}
          {!pendingPayment && !isApproved && (
            <>
              {/* Plan Summary Header */}
              <div className="p-4 rounded-2xl bg-cyan-50/70 border border-cyan-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-cyan-900">
                    <Zap className="w-4 h-4 fill-cyan-500 text-cyan-600" />
                    <span className="text-xs uppercase font-extrabold tracking-wider">
                      ENERO PREMIUM
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Full AI Audits, Simulator & Unlimited Inventory</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-slate-900">₹{price}</span>
                  <span className="text-xs font-semibold text-slate-500 block">/ MONTH</span>
                </div>
              </div>

              {/* Choose Payment Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Choose your payment method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_qr')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'upi_qr'
                        ? 'border-cyan-600 bg-cyan-50/90 text-cyan-950 shadow-xs ring-1 ring-cyan-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-cyan-600" />
                    <span>UPI QR PAYMENT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-cyan-600 bg-cyan-50/90 text-cyan-950 shadow-xs ring-1 ring-cyan-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span>Card / NetBanking</span>
                  </button>
                </div>
              </div>

              {/* UPI QR PAYMENT DETAILS */}
              {paymentMethod === 'upi_qr' && (
                <div className="space-y-6">

                  {/* QR Presentation Section */}
                  <div className="text-center p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800 block">
                      SCAN TO PAY
                    </span>

                    {/* Official Uploaded QR Code Image Asset */}
                    <div className="inline-block p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-md">
                      <img
                        src="/assets/enero-upi-qr.jpeg"
                        alt="ENERO Official UPI Payment QR Code"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                        onError={(e) => {
                          // Fallback to png if jpeg has format issues in browser
                          (e.target as HTMLImageElement).src = '/assets/enero-upi-qr.png';
                        }}
                      />
                    </div>

                    <div className="space-y-1 max-w-xs mx-auto">
                      <p className="text-xs font-medium text-slate-700">
                        “Scan this QR code using any supported UPI app.”
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Paytm · PhonePe · Google Pay · BHIM · Other UPI apps
                      </p>
                    </div>

                    {/* Amount to pay highlight */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-slate-600 uppercase">AMOUNT TO PAY:</span>
                      <span className="text-base font-black font-mono text-cyan-900 bg-cyan-100/70 px-2.5 py-0.5 rounded-lg border border-cyan-300">
                        ₹599
                      </span>
                    </div>
                  </div>

                  {/* Payment Instructions (Section 4) */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Payment Instructions
                    </span>

                    <div className="space-y-2.5 text-xs text-slate-700">
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <div>
                          <strong className="text-slate-900">STEP 1:</strong> Open your UPI app.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <div>
                          <strong className="text-slate-900">STEP 2:</strong> Scan the ENERO payment QR.
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <div>
                          <strong className="text-slate-900">STEP 3:</strong> Pay exactly: <span className="font-bold text-slate-900">₹599</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          4
                        </span>
                        <div>
                          <strong className="text-slate-900">STEP 4:</strong> After completing payment, enter your payment reference/UTR number below.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission Form */}
                  <form onSubmit={handleSubmitPayment} className="space-y-4">
                    
                    {/* UTR / Transaction ID (Section 6) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                        <span>PAYMENT REFERENCE / UTR *</span>
                        <span className="text-[10px] font-normal text-rose-600">Required</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="Enter your UTR or transaction reference number"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:border-cyan-500 font-mono font-medium text-slate-900"
                      />
                      <p className="text-[11px] text-slate-500">
                        Find the 12-digit UTR or transaction ID in your UPI app's payment receipt.
                      </p>
                    </div>

                    {/* Optional Screenshot Upload (Section 7) */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                        UPLOAD PAYMENT SCREENSHOT
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3.5 h-3.5 text-slate-600" />
                          <span>Choose Image (JPG, JPEG, PNG)</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png"
                            onChange={handleScreenshotChange}
                            className="hidden"
                          />
                        </label>
                        {screenshotName && (
                          <span className="text-xs text-slate-600 truncate max-w-[180px] font-mono">
                            {screenshotName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        “Optional — upload your payment confirmation screenshot to help us verify your payment.”
                      </p>
                      {screenshotData && (
                        <div className="mt-2 relative inline-block">
                          <img 
                            src={screenshotData} 
                            alt="Screenshot preview" 
                            className="h-20 w-auto rounded-lg border border-slate-300 object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setScreenshotData(null);
                              setScreenshotName(null);
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 hover:bg-rose-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Security Guarantee Banner */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Zero-Risk Guarantee</span>
                      </div>
                      <p>
                        We never ask for your UPI PIN, card number, CVV, bank password, or OTP.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Submitting Payment Proof...</span>
                      ) : (
                        <>
                          <span>I HAVE PAID — SUBMIT PAYMENT</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                </div>
              )}

              {/* CARD / NETBANKING FALLBACK TAB */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 py-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
                    <p className="font-semibold text-slate-800">Card & NetBanking Checkout</p>
                    <p>
                      Prefer instant online checkout? We recommend using our direct UPI QR code method above for zero-fee payment and fastest verification.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi_qr')}
                    className="w-full py-3 px-4 text-xs font-bold text-cyan-900 bg-cyan-100 hover:bg-cyan-200 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Switch to UPI QR Payment</span>
                  </button>
                </div>
              )}

            </>
          )}

        </div>

      </div>
    </div>
  );
};

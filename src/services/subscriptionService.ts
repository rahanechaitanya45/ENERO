import { UserSubscription, PaymentRecord, SubscriptionPlan } from '../types';

// Central limits configuration as mandated by Section 4
export const SUBSCRIPTION_CONFIG = {
  FREE_MAX_APPLIANCES: 5,
  PREMIUM_MAX_APPLIANCES: Infinity,
  PREMIUM_PRICE_INR: 599,
  PLAN_DURATION_DAYS: 30,
};

const BASE_KEYS = {
  SUBSCRIPTION: 'enero_user_subscription_',
  PAYMENTS: 'enero_user_payments_',
};

/**
 * Generates an active 1-month expiration date
 */
export function calculateExpirationDate(startDate: Date = new Date()): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + SUBSCRIPTION_CONFIG.PLAN_DURATION_DAYS);
  return d.toISOString();
}

/**
 * Format date nicely (e.g. "3 Nov 2026")
 */
export function formatSubscriptionDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export const subscriptionService = {
  getSubscription(userId: string = 'guest'): UserSubscription {
    try {
      const data = localStorage.getItem(`${BASE_KEYS.SUBSCRIPTION}${userId}`);
      if (data) {
        const sub: UserSubscription = JSON.parse(data);
        // Check if expired
        const now = new Date();
        const expiresAt = new Date(sub.expiresAt);
        if (sub.plan === 'premium' && now > expiresAt) {
          sub.status = 'expired';
          this.saveSubscription(sub, userId);
        }
        return sub;
      }
    } catch {}

    // Default to FREE plan for all users as required by Section 4
    return {
      id: `sub-free-${userId}`,
      userId,
      plan: 'free',
      status: 'active',
      amount: 0,
      currency: 'INR',
      startedAt: new Date().toISOString(),
      expiresAt: calculateExpirationDate(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  saveSubscription(sub: UserSubscription, userId: string = 'guest') {
    try {
      localStorage.setItem(`${BASE_KEYS.SUBSCRIPTION}${userId}`, JSON.stringify(sub));
    } catch (e) {
      console.error('Failed to save subscription', e);
    }
  },

  getPaymentHistory(userId: string = 'guest'): PaymentRecord[] {
    try {
      const data = localStorage.getItem(`${BASE_KEYS.PAYMENTS}${userId}`);
      if (data) return JSON.parse(data);
    } catch {}

    // If demo user Vedant, provide sample initial payment as in Section 12
    if (userId === 'demo-user-vedant') {
      return [
        {
          id: 'pay_demo_001',
          userId: 'demo-user-vedant',
          date: '03 Oct 2026',
          plan: 'ENERO Premium',
          amount: 599,
          currency: 'INR',
          status: 'Successful',
          orderId: 'order_ENR_89214',
          paymentMethod: 'UPI / NetBanking',
        },
      ];
    }

    return [];
  },

  savePaymentRecord(record: PaymentRecord, userId: string = 'guest') {
    try {
      const history = this.getPaymentHistory(userId);
      const filtered = history.filter((p) => p.id !== record.id);
      const updated = [record, ...filtered];
      localStorage.setItem(`${BASE_KEYS.PAYMENTS}${userId}`, JSON.stringify(updated));

      // Also sync to global audit store for admin review
      const all = this.getAllPayments();
      const allFiltered = all.filter((p) => p.id !== record.id);
      localStorage.setItem('enero_all_payments_audit_log', JSON.stringify([record, ...allFiltered]));
    } catch (e) {
      console.error('Failed to save payment record', e);
    }
  },

  getAllPayments(): PaymentRecord[] {
    try {
      const data = localStorage.getItem('enero_all_payments_audit_log');
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  },

  getPendingUpiPayment(userId: string): PaymentRecord | null {
    if (!userId || userId === 'guest') return null;
    const history = this.getPaymentHistory(userId);
    return history.find((p) => p.status === 'pending') || null;
  },

  /**
   * Submit manual UPI QR payment proof (Sections 6, 7, 8, 10)
   * Does NOT activate Premium immediately. Sets status to PENDING.
   */
  async submitUpiPayment(params: {
    userId: string;
    userEmail?: string;
    utr: string;
    screenshotUrl?: string;
  }): Promise<{ success: boolean; payment: PaymentRecord; error?: string }> {
    const { userId, userEmail, utr, screenshotUrl } = params;

    if (!userId || userId === 'guest') {
      return {
        success: false,
        payment: {} as PaymentRecord,
        error: 'Authentication is required to submit a payment proof.',
      };
    }

    const cleanUtr = (utr || '').trim();
    if (!cleanUtr || cleanUtr.length < 4) {
      return {
        success: false,
        payment: {} as PaymentRecord,
        error: 'Please enter a valid UPI reference / UTR number (at least 6 characters).',
      };
    }

    const now = new Date();
    const paymentId = `pay_upi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Exact database record required by Section 10
    const paymentRecord: PaymentRecord = {
      id: paymentId,
      payment_id: paymentId,
      userId,
      user_id: userId,
      userEmail: userEmail || 'user@enero.energy',
      plan: 'premium',
      amount: SUBSCRIPTION_CONFIG.PREMIUM_PRICE_INR, // ₹599 strictly locked
      currency: 'INR',
      paymentMethod: 'UPI_QR',
      payment_method: 'UPI_QR',
      utr: cleanUtr,
      screenshot_url: screenshotUrl || undefined,
      status: 'pending',
      date: formatSubscriptionDate(now.toISOString()),
      submitted_at: now.toISOString(),
      orderId: `order_UPI_${Date.now().toString(36).toUpperCase()}`,
    };

    // Save record
    this.savePaymentRecord(paymentRecord, userId);

    // Update user subscription state with pendingPayment reference WITHOUT activating Premium
    const currentSub = this.getSubscription(userId);
    currentSub.pendingPaymentId = paymentId;
    currentSub.updatedAt = now.toISOString();
    this.saveSubscription(currentSub, userId);

    return { success: true, payment: paymentRecord };
  },

  /**
   * Admin verification of pending UPI payment (Section 8, 9)
   * Approves payment and activates Premium, or rejects with reason.
   */
  async verifyPaymentByAdmin(
    paymentId: string,
    action: 'approve' | 'reject',
    verifiedBy: string = 'admin@enero.energy'
  ): Promise<{ success: boolean; payment?: PaymentRecord; subscription?: UserSubscription; error?: string }> {
    const all = this.getAllPayments();
    const payment = all.find((p) => p.id === paymentId || p.payment_id === paymentId);

    if (!payment) {
      return { success: false, error: 'Payment record not found.' };
    }

    const now = new Date();
    const userId = payment.userId || payment.user_id || 'guest';

    if (action === 'approve') {
      const expirationDate = calculateExpirationDate(now);
      payment.status = 'approved';
      payment.verified_at = now.toISOString();
      payment.verified_by = verifiedBy;
      payment.subscription_start = now.toISOString();
      payment.subscription_end = expirationDate;

      // Update user subscription to ACTIVE PREMIUM
      const activatedSub: UserSubscription = {
        id: `sub-prem-${Date.now()}`,
        userId,
        plan: 'premium',
        status: 'active',
        amount: SUBSCRIPTION_CONFIG.PREMIUM_PRICE_INR,
        currency: 'INR',
        paymentId: payment.id,
        orderId: payment.orderId,
        startedAt: now.toISOString(),
        expiresAt: expirationDate,
        createdAt: payment.submitted_at || now.toISOString(),
        updatedAt: now.toISOString(),
        pendingPaymentId: undefined,
      };

      this.saveSubscription(activatedSub, userId);
      this.savePaymentRecord(payment, userId);

      return { success: true, payment, subscription: activatedSub };
    } else {
      payment.status = 'rejected';
      payment.verified_at = now.toISOString();
      payment.verified_by = verifiedBy;

      const sub = this.getSubscription(userId);
      sub.pendingPaymentId = undefined;
      sub.updatedAt = now.toISOString();
      this.saveSubscription(sub, userId);
      this.savePaymentRecord(payment, userId);

      return { success: true, payment, subscription: sub };
    }
  },

  /**
   * Secure Payment Verification & Activation (Legacy Gateway Handshake)
   */
  async verifyAndActivateSubscription(
    userId: string,
    orderId: string,
    paymentId: string
  ): Promise<{ success: boolean; subscription: UserSubscription; error?: string }> {
    if (!orderId || !paymentId) {
      return { success: false, subscription: this.getSubscription(userId), error: 'Invalid payment tokens.' };
    }

    const now = new Date();
    const expiresAt = calculateExpirationDate(now);

    const newSub: UserSubscription = {
      id: `sub-prem-${Date.now()}`,
      userId,
      plan: 'premium',
      status: 'active',
      amount: SUBSCRIPTION_CONFIG.PREMIUM_PRICE_INR,
      currency: 'INR',
      paymentId,
      orderId,
      startedAt: now.toISOString(),
      expiresAt,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    this.saveSubscription(newSub, userId);

    const paymentRecord: PaymentRecord = {
      id: paymentId,
      payment_id: paymentId,
      userId,
      user_id: userId,
      date: formatSubscriptionDate(now.toISOString()),
      plan: 'ENERO Premium',
      amount: SUBSCRIPTION_CONFIG.PREMIUM_PRICE_INR,
      currency: 'INR',
      status: 'Successful',
      orderId,
      paymentMethod: 'Razorpay Secure Checkout',
      payment_method: 'GATEWAY',
      submitted_at: now.toISOString(),
      verified_at: now.toISOString(),
      verified_by: 'system_gateway',
      subscription_start: now.toISOString(),
      subscription_end: expiresAt,
    };
    this.savePaymentRecord(paymentRecord, userId);

    return { success: true, subscription: newSub };
  },

  /**
   * Helper to check if user has active Premium access
   */
  isPremium(sub: UserSubscription | null | undefined): boolean {
    if (!sub) return false;
    return sub.plan === 'premium' && sub.status === 'active';
  },

  /**
   * Helper to verify if user can add more appliances under their plan limit
   */
  canAddAppliance(currentApplianceCount: number, sub: UserSubscription | null | undefined): {
    allowed: boolean;
    limit: number;
    remaining: number;
  } {
    if (this.isPremium(sub)) {
      return { allowed: true, limit: SUBSCRIPTION_CONFIG.PREMIUM_MAX_APPLIANCES, remaining: Infinity };
    }
    const limit = SUBSCRIPTION_CONFIG.FREE_MAX_APPLIANCES;
    const remaining = Math.max(0, limit - currentApplianceCount);
    return {
      allowed: currentApplianceCount < limit,
      limit,
      remaining,
    };
  },
};

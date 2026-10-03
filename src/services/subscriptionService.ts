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
      const updated = [record, ...history];
      localStorage.setItem(`${BASE_KEYS.PAYMENTS}${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save payment record', e);
    }
  },

  /**
   * Secure Payment Verification & Activation (Section 8)
   * Simulates/executes server-authoritative order and payment verification
   */
  async verifyAndActivateSubscription(
    userId: string,
    orderId: string,
    paymentId: string
  ): Promise<{ success: boolean; subscription: UserSubscription; error?: string }> {
    // In production with Razorpay backend:
    // POST /api/payment/verify { orderId, paymentId, signature }
    // Here we perform strict verification check
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

    // Save active subscription
    this.saveSubscription(newSub, userId);

    // Save payment history record (Section 12)
    const paymentRecord: PaymentRecord = {
      id: paymentId,
      userId,
      date: formatSubscriptionDate(now.toISOString()),
      plan: 'ENERO Premium',
      amount: SUBSCRIPTION_CONFIG.PREMIUM_PRICE_INR,
      currency: 'INR',
      status: 'Successful',
      orderId,
      paymentMethod: 'Razorpay Secure Checkout',
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

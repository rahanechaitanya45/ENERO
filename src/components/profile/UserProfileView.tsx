import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Home, 
  Users, 
  Wallet, 
  Zap, 
  ShieldCheck, 
  LogOut, 
  KeyRound, 
  Edit3, 
  Check, 
  ArrowLeft,
  Building,
  RotateCcw,
  Sparkles,
  CreditCard,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { HomeType, TariffConfig, UserSubscription } from '../../types';
import { subscriptionService, formatSubscriptionDate } from '../../services/subscriptionService';

interface UserProfileViewProps {
  tariff: TariffConfig;
  subscription?: UserSubscription;
  onOpenChangePassword: () => void;
  onNavigateToDashboard: () => void;
  onClearUserData: () => void;
  onOpenUpgradeModal?: () => void;
  onOpenFinancialSnapshot?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  tariff,
  subscription,
  onOpenChangePassword,
  onNavigateToDashboard,
  onClearUserData,
  onOpenUpgradeModal,
  onOpenFinancialSnapshot,
}) => {
  const { user, profile, updateProfile, signOut, isDemoMode, isLiveMode } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [homeType, setHomeType] = useState<HomeType>(profile?.homeType || 'Apartment');
  const [occupants, setOccupants] = useState<number>(profile?.occupants || 3);
  const [provider, setProvider] = useState(profile?.electricityProvider || 'Tata Power');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(profile?.monthlyBudget || 2500);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Derive initials
  const initials = (profile?.fullName || user?.email || 'EN')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName: fullName.trim(),
      homeType,
      occupants: Number(occupants),
      electricityProvider: provider.trim(),
      monthlyBudget: Number(monthlyBudget),
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const homeTypeChoices: HomeType[] = [
    'Apartment',
    'Independent House',
    'Hostel/PG',
    'Small Office',
    'Other',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToDashboard}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              User Profile
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your personal details, household parameters, and security credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              onClick={() => {
                setFullName(profile?.fullName || '');
                setHomeType(profile?.homeType || 'Apartment');
                setOccupants(profile?.occupants || 3);
                setProvider(profile?.electricityProvider || '');
                setMonthlyBudget(profile?.monthlyBudget || 2500);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}

          <button
            onClick={onOpenChangePassword}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Change Password</span>
          </button>

          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* User Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-400 text-white font-black text-xl flex items-center justify-center shadow-md shadow-cyan-500/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  {profile?.fullName || 'ENERO Member'}
                </h2>
                {isDemoMode && (
                  <span className="text-[10px] font-semibold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-full">
                    Demo Account
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || profile?.email || 'vedant@example.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end text-xs text-slate-400">
            <span className="font-mono text-[11px]">Firebase UID: {user?.uid ? `${user.uid.substring(0, 16)}...` : 'demo-user-vedant'}</span>
            <span className="text-[11px] mt-0.5 text-cyan-600 font-medium">
              Firebase Auth · enero-9837b
            </span>
          </div>
        </div>

        {/* Profile Details or Edit Form */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Home Type
                </label>
                <select
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value as HomeType)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-cyan-500"
                >
                  {homeTypeChoices.map((ht) => (
                    <option key={ht} value={ht}>{ht}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Number of People
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={occupants}
                  onChange={(e) => setOccupants(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Electricity Provider
                </label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Monthly Target Electricity Budget ({tariff.currency})
                </label>
                <input
                  type="number"
                  step="50"
                  min="100"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </form>
        ) : (
          /* Profile Parameters Grid (Prompt Section 8) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Home Type
              </span>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-cyan-600" />
                <span>{profile?.homeType || 'Apartment'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Occupants
              </span>
              <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-600" />
                <span>{profile?.occupants || 4} {profile?.occupants === 1 ? 'person' : 'people'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Monthly Target Budget
              </span>
              <div className="text-base font-bold font-mono text-cyan-900 flex items-center gap-1">
                <Wallet className="w-4 h-4 text-cyan-600" />
                <span>{tariff.currency}{(profile?.monthlyBudget || 2500).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Electricity Provider
              </span>
              <div className="text-base font-bold text-slate-900 truncate flex items-center gap-1.5" title={profile?.electricityProvider}>
                <Building className="w-4 h-4 text-cyan-600 shrink-0" />
                <span className="truncate">{profile?.electricityProvider || 'Tata Power'}</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Subscription & Billing Section */}
      {(() => {
        const isPremium = subscriptionService.isPremium(subscription);
        const payments = subscriptionService.getPaymentHistory(user?.uid || (user as any)?.id);
        const pendingPayment = subscriptionService.getPendingUpiPayment(user?.uid || (user as any)?.id);
        const allPendingPayments = subscriptionService.getAllPayments().filter((p) => p.status === 'pending');

        return (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Subscription & Billing
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isPremium 
                      ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' 
                      : pendingPayment
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isPremium ? 'PREMIUM ACTIVE ⚡' : pendingPayment ? 'PAYMENT PENDING ⏳' : 'FREE BASIC PLAN'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isPremium ? 'ENERO Premium Membership' : 'Free Basic Monitoring'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {onOpenFinancialSnapshot && (
                  <button
                    type="button"
                    onClick={onOpenFinancialSnapshot}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Financial Snapshot (Part B)</span>
                  </button>
                )}

                {!isPremium && onOpenUpgradeModal && (
                  <button
                    type="button"
                    onClick={onOpenUpgradeModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{pendingPayment ? 'View Pending Payment' : 'Upgrade to Premium (₹599/mo)'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* PENDING PAYMENT CALLOUT BANNER (Section 8, 9) */}
            {pendingPayment && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                  <span>Payment Verification Pending</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed">
                  “Your payment information has been submitted and is waiting for verification.”
                </p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1 text-amber-800 font-medium">
                  <span>UTR Reference: <strong className="font-mono">{pendingPayment.utr}</strong></span>
                  <span>·</span>
                  <span>Amount: <strong className="font-mono">₹{pendingPayment.amount}</strong></span>
                  <span>·</span>
                  <span>Method: <strong>UPI QR</strong></span>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={onOpenUpgradeModal}
                    className="text-cyan-800 underline hover:text-cyan-950 font-bold cursor-pointer"
                  >
                    View Status / Verify
                  </button>
                </div>
              </div>
            )}

            {/* Plan Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Current Billing Rate
                </span>
                <div className="text-lg font-black font-mono text-slate-900">
                  {isPremium ? '₹599' : '₹0'} <span className="text-xs font-normal text-slate-500 font-sans">/month</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isPremium ? 'Active ENERO Premium membership' : '100% free basic estimation tier'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Appliance Inventory Limit
                </span>
                <div className="text-lg font-bold text-slate-900">
                  {isPremium ? 'Unlimited Appliances' : 'Up to 5 Appliances'}
                </div>
                <p className="text-[11px] text-slate-500">
                  {isPremium ? 'No cap on household equipment' : 'Free tier cap as per specification'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Next Renewal / Expiry
                </span>
                <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <span>
                    {subscription?.expiresAt 
                      ? formatSubscriptionDate(subscription.expiresAt)
                      : 'Lifetime Access'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {isPremium ? 'Valid for 1 full calendar month' : 'No credit card needed'}
                </p>
              </div>
            </div>

            {/* Payment History Records */}
            <div className="pt-2 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Billing & Payment History
              </span>

              {payments.length === 0 ? (
                <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  No payment transactions yet. When you submit a UPI QR payment (₹599/month), official payment receipts will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-left">
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">Plan / Description</th>
                        <th className="py-2.5 px-4">UTR / Order ID</th>
                        <th className="py-2.5 px-4">Method</th>
                        <th className="py-2.5 px-4 text-right">Amount</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p) => {
                        const statusLower = (p.status || '').toLowerCase();
                        const isApprv = statusLower === 'approved' || statusLower === 'successful';
                        const isPend = statusLower === 'pending';
                        const isRej = statusLower === 'rejected' || statusLower === 'failed';

                        return (
                          <tr key={p.id} className="text-slate-700 hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-medium">{p.date}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-900">{p.plan}</td>
                            <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                              {p.utr ? `UTR: ${p.utr}` : p.orderId}
                            </td>
                            <td className="py-2.5 px-4 text-slate-500">
                              {p.paymentMethod === 'UPI_QR' ? 'UPI QR' : p.paymentMethod}
                            </td>
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                              ₹{p.amount.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              {isPend && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                                  PENDING
                                </span>
                              )}
                              {isApprv && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                  APPROVED ⚡
                                </span>
                              )}
                              {isRej && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  REJECTED
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Admin Audit & Verification Console (Sections 8, 9, 10) */}
            {allPendingPayments.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    <span>Admin Verification Console ({allPendingPayments.length} Pending)</span>
                  </span>
                </div>
                <div className="space-y-2">
                  {allPendingPayments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>User: {p.userEmail || p.userId}</span>
                          <span className="font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                            UTR: {p.utr}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Amount: ₹{p.amount} · Submitted: {p.date} · Method: UPI_QR
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={async () => {
                            await subscriptionService.verifyPaymentByAdmin(p.id, 'approve');
                            window.location.reload();
                          }}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Approve Payment ⚡
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await subscriptionService.verifyPaymentByAdmin(p.id, 'reject');
                            window.location.reload();
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        );
      })()}

      {/* Security & Row Level Security Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-3">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Data Isolation</span>
        </div>
        <h3 className="text-lg font-bold text-white">
          Your Appliances and Electricity Calculations are Private
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
          ENERO uses strict Row Level Security (RLS) policies. Every appliance, simulation, and history snapshot is tied exclusively to your authenticated user account. User A cannot query User B's equipment under any circumstance.
        </p>

        <div className="pt-2 flex items-center gap-4 text-xs">
          <button
            onClick={onClearUserData}
            className="text-rose-400 hover:text-rose-300 font-medium underline cursor-pointer"
          >
            Clear my saved appliances & history
          </button>
        </div>
      </div>

    </div>
  );
};

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { X, Phone, Lock } from 'lucide-react';

interface ContextualAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
  context?: string;
  orderSummary?: {
    total: number;
    items: string;
  };
}

export default function ContextualAuthModal({
  onClose,
  onSuccess,
  context,
  orderSummary,
}: ContextualAuthModalProps) {
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load saved email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('gaso-guest-email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, []);

  const validatePhone = (phoneNumber: string): boolean => {
    // Basic Ghana phone validation
    const ghanaPhoneRegex = /^(\+233|0)[0-9]{9}$/;
    return ghanaPhoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleSendOTP = async () => {
    setError('');
    
    // Validate phone or email
    if (!phone && !email) {
      setError('Please enter a phone number or email address');
      return;
    }

    if (phone && !validatePhone(phone)) {
      setError('Please enter a valid Ghana phone number');
      return;
    }

    if (email && !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Save email to localStorage
      if (email) {
        localStorage.setItem('gaso-guest-email', email);
      }

      // TODO: In production, send OTP via Firebase Auth or SMS service
      // For now, simulate OTP sending
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Move to OTP step
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      // TODO: Verify OTP with Firebase Auth
      // For now, simulate OTP verification
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save auth state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true');
        if (phone) {
          localStorage.setItem('gaso-user-phone', phone);
        }
        if (email) {
          localStorage.setItem('gaso-user-email', email);
        }
      }

      // Call success callback to close modal and proceed
      onSuccess();
    } catch (err: any) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  const canContinue = phone.length >= 10 || email.includes('@');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <GlassCard className="p-6 bg-white border-brand-deep-blue/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-title-lg font-bold text-gray-900">
                  Almost there! 👋
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {context || 'Sign in to place your order'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Order Summary */}
            {orderSummary && (
              <div className="mb-6 p-4 bg-gradient-to-br from-brand-deep-blue/5 to-brand-corporate-blue/5 rounded-xl border border-brand-deep-blue/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Order Total</p>
                    <p className="text-title-md font-bold text-brand-deep-blue">
                      GH₵{orderSummary.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{orderSummary.items}</p>
                    <p className="text-xs text-gray-500 mt-1">Ready to deliver</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-status-error/10 border border-status-error/20 rounded-xl">
                <p className="text-sm text-status-error">{error}</p>
              </div>
            )}

            {/* Auth Form */}
            {step === 'input' ? (
              <div className="space-y-4">
                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <div className="w-24 flex-shrink-0 min-w-[96px]">
                      <select className="w-full px-3 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent text-sm sm:text-base">
                        <option value="+233">+233</option>
                      </select>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="55 123 4567"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">or</span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (e.target.value) {
                        localStorage.setItem('gaso-guest-email', e.target.value);
                      }
                    }}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                  />
                </div>

                {/* Send OTP Button */}
                <PrimaryButton
                  fullWidth
                  size="lg"
                  onClick={handleSendOTP}
                  loading={loading}
                  disabled={!canContinue || loading}
                  className="mt-6"
                >
                  <Phone className="w-5 h-5" />
                  <span>Send Verification Code</span>
                </PrimaryButton>

                {/* Privacy Assurance */}
                <p className="text-xs text-gray-500 text-center pt-2">
                  By continuing, you agree to Gaso&apos;s{' '}
                  <a href="/terms" className="text-brand-deep-blue hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-brand-deep-blue hover:underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent text-center text-2xl tracking-widest font-semibold"
                  />
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Code sent to {phone ? `+233 ${phone}` : email}
                  </p>
                </div>

                {/* Verify OTP Button */}
                <PrimaryButton
                  fullWidth
                  size="lg"
                  onClick={handleVerifyOTP}
                  loading={loading}
                  disabled={!otp || otp.length !== 6 || loading}
                  className="mt-6"
                >
                  <Lock className="w-5 h-5" />
                  <span>Verify & Continue</span>
                </PrimaryButton>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setStep('input');
                      setOtp('');
                    }}
                    className="text-sm text-brand-deep-blue hover:text-brand-corporate-blue font-medium"
                  >
                    Change phone/email
                  </button>
                  <span className="text-gray-400 mx-2">•</span>
                  <button
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="text-sm text-brand-deep-blue hover:text-brand-corporate-blue font-medium disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


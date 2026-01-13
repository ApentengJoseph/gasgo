'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import GlassCard from '@/components/Cards/GlassCard';
import { Phone, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const emailParam = searchParams.get('email') || '';
  
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load email from URL param or localStorage
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    } else if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('gaso-guest-email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    }
  }, [emailParam]);

  const validatePhone = (phoneNumber: string): boolean => {
    // Basic Ghana phone validation
    const ghanaPhoneRegex = /^(\+233|0)[0-9]{9}$/;
    return ghanaPhoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid Ghana phone number');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Implement Firebase phone auth
      // For now, simulate OTP step
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      // TODO: Verify OTP with Firebase
      // For now, simulate successful login
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save auth state to localStorage (simulated)
      if (typeof window !== 'undefined') {
        localStorage.setItem('gaso-auth', 'true');
        localStorage.setItem('gaso-user-phone', phone);
        if (email) {
          localStorage.setItem('gaso-user-email', email);
        }
      }
      
      // Redirect to the intended page (checkout) or home
      router.push(redirectTo);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 mb-4">
          <ArrowLeft className="w-5 h-5" />
          Back to home
        </Link>

        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-display-md font-bold text-gray-900 mb-2">
              Welcome to Gaso
            </h1>
            <p className="text-gray-600">
              {step === 'input' 
                ? 'Sign in to continue' 
                : 'Enter the OTP sent to your phone'}
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-status-error/10 border border-status-error/20 rounded-xl"
              >
                <div className="flex items-center gap-2 text-status-error">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 'input' ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleLogin}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 XX XXX XXXX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                  />
                </div>
              </div>

              <PrimaryButton
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
              >
                Continue
              </PrimaryButton>
            </motion.form>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleVerifyOTP}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent text-center text-2xl tracking-widest"
                  required
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  OTP sent to {phone}
                </p>
              </div>

              <PrimaryButton
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
              >
                Verify OTP
              </PrimaryButton>

              <button
                type="button"
                onClick={() => setStep('input')}
                className="w-full text-center text-sm text-brand-deep-blue"
              >
                Resend OTP
              </button>
            </motion.form>
          )}

          <div className="mt-6 text-center text-sm text-gray-500">
            By continuing, you agree to Gaso&apos;s{' '}
            <Link href="/terms" className="text-brand-deep-blue">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-brand-deep-blue">
              Privacy Policy
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}


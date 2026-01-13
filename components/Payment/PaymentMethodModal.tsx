'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '@/components/Cards/GlassCard';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { X, Smartphone, Wallet, CreditCard, CheckCircle, Tag, AlertCircle } from 'lucide-react';
import PaystackButton from './PaystackButton';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  orderId: string;
  onPaymentSuccess: (method: string, reference?: string) => void;
}

type PaymentMethod = 'mobile_money' | 'cash' | 'card';

export default function PaymentMethodModal({
  isOpen,
  onClose,
  total,
  orderId,
  onPaymentSuccess,
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [momoPhone, setMomoPhone] = useState('');
  const [momoNetwork, setMomoNetwork] = useState<'MTN' | 'VODAFONE' | 'AIRTELTIGO' | ''>('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; type: 'delivery' | 'percentage' } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const paymentMethods = [
    {
      id: 'mobile_money' as PaymentMethod,
      name: 'Mobile Money',
      description: 'Pay with MTN, Vodafone, AirtelTigo',
      icon: Smartphone,
      available: true,
    },
    {
      id: 'cash' as PaymentMethod,
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives',
      icon: Wallet,
      available: true,
    },
    {
      id: 'card' as PaymentMethod,
      name: 'Debit/Credit Card',
      description: 'Visa, Mastercard, or Verve',
      icon: CreditCard,
      available: false, // Coming soon
    },
  ];

  const handlePaymentSuccess = (method: PaymentMethod, reference?: string) => {
    setProcessing(false);
    onPaymentSuccess(method, reference);
  };

  const handleCashPayment = () => {
    setProcessing(true);
    // Simulate cash payment processing
    setTimeout(() => {
      handlePaymentSuccess('cash');
    }, 1000);
  };

  const getUserEmail = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gaso-user-email') || localStorage.getItem('gaso-guest-email') || 'customer@gaso.com';
    }
    return 'customer@gaso.com';
  };

  const getUserPhone = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gaso-user-phone') || '';
    }
    return '';
  };

  // Load user phone on mount
  useEffect(() => {
    const savedPhone = getUserPhone();
    if (savedPhone) {
      setMomoPhone(savedPhone.replace(/^\+233/, '0'));
    }
  }, []);

  const validateMomoPhone = (phone: string): boolean => {
    const ghanaPhoneRegex = /^(0|233)[0-9]{9}$/;
    return ghanaPhoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    // Simulate coupon validation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock coupon codes
    const validCoupons: Record<string, { discount: number; type: 'delivery' | 'percentage' }> = {
      'FREEDELIVERY': { discount: 100, type: 'delivery' },
      'NEWUSER10': { discount: 10, type: 'percentage' },
      'WELCOME20': { discount: 20, type: 'percentage' },
      'SAVE15': { discount: 15, type: 'percentage' },
    };

    const coupon = validCoupons[couponCode.toUpperCase()];
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon });
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
    }

    setApplyingCoupon(false);
  };

  const calculateDiscountedTotal = () => {
    let discountedTotal = total;
    
    if (appliedCoupon) {
      if (appliedCoupon.type === 'delivery') {
        // Free delivery - subtract delivery fee
        discountedTotal = total - 8.75; // Assuming delivery fee is 8.75
      } else if (appliedCoupon.type === 'percentage') {
        // Percentage discount
        discountedTotal = total * (1 - appliedCoupon.discount / 100);
      }
    }
    
    return Math.max(0, discountedTotal);
  };

  const finalTotal = calculateDiscountedTotal();
  const discountAmount = total - finalTotal;

  if (!isOpen) return null;

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
          <GlassCard className="p-4 bg-white border-brand-deep-blue/10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-title-md font-bold text-gray-900">
                Payment
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Order Total - Compact */}
            <div className="mb-4 p-3 bg-gradient-to-br from-brand-deep-blue/5 to-brand-corporate-blue/5 rounded-lg border border-brand-deep-blue/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-bold text-brand-deep-blue">
                  GH₵{finalTotal.toFixed(2)}
                </span>
              </div>
              {appliedCoupon && discountAmount > 0 && (
                <div className="mt-1 flex items-center justify-between text-brand-safety-green text-xs">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-GH₵{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Coupon Section - Compact */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    setCouponError('');
                    if (appliedCoupon && e.target.value !== appliedCoupon.code) {
                      setAppliedCoupon(null);
                    }
                  }}
                  placeholder="Promo code"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponCode.trim() || !!appliedCoupon}
                  className="px-3 py-2 text-sm bg-brand-deep-blue text-white rounded-lg hover:bg-brand-corporate-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" />
                  <span>{applyingCoupon ? '...' : appliedCoupon ? '✓' : 'Apply'}</span>
                </button>
              </div>
              {couponError && (
                <p className="mt-1 text-xs text-status-error">{couponError}</p>
              )}
              {appliedCoupon && (
                <p className="mt-1 text-xs text-brand-safety-green">
                  {appliedCoupon.type === 'delivery' ? 'Free delivery!' : `${appliedCoupon.discount}% off!`}
                </p>
              )}
            </div>

            {/* Payment Methods - Compact */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                const isDisabled = !method.available || processing;

                return (
                  <button
                    key={method.id}
                    onClick={() => !isDisabled && setSelectedMethod(method.id)}
                    disabled={isDisabled}
                    className={`
                      p-3 rounded-lg border-2 transition-all text-center
                      ${
                        isSelected
                          ? 'border-brand-deep-blue bg-brand-deep-blue/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <Icon className={`w-5 h-5 mx-auto mb-1 ${
                      isSelected ? 'text-brand-deep-blue' : 'text-gray-600'
                    }`} />
                    <p className={`text-xs font-medium ${
                      isSelected ? 'text-brand-deep-blue' : 'text-gray-700'
                    }`}>
                      {method.name === 'Mobile Money' ? 'MoMo' : method.name === 'Cash on Delivery' ? 'Cash' : method.name}
                    </p>
                    {!method.available && (
                      <p className="text-[10px] text-gray-400 mt-0.5">Soon</p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Payment Action */}
            {selectedMethod === 'mobile_money' && (
              <div className="mb-4 space-y-3">
                {/* Mobile Money Phone & Network - Compact */}
                <div className="space-y-2">
                  <input
                    type="tel"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="055 123 4567"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-deep-blue focus:border-transparent"
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    {(['MTN', 'VODAFONE', 'AIRTELTIGO'] as const).map((network) => (
                      <button
                        key={network}
                        onClick={() => setMomoNetwork(network)}
                        className={`
                          p-2 rounded-lg border-2 transition-all text-xs font-medium
                          ${
                            momoNetwork === network
                              ? 'border-brand-deep-blue bg-brand-deep-blue/5 text-brand-deep-blue'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }
                        `}
                      >
                        {network === 'AIRTELTIGO' ? 'AirtelTigo' : network}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pay Button */}
                <PaystackButton
                  amount={finalTotal}
                  email={getUserEmail()}
                  orderId={orderId}
                  phone={momoPhone}
                  network={momoNetwork}
                  onSuccess={(reference) => handlePaymentSuccess('mobile_money', reference)}
                  onError={(error) => {
                    console.error('Payment error:', error);
                    setProcessing(false);
                  }}
                />
                {(!momoPhone || !momoNetwork || !validateMomoPhone(momoPhone)) && (
                  <p className="text-xs text-status-error text-center">
                    Enter phone & select network
                  </p>
                )}
              </div>
            )}

            {selectedMethod === 'cash' && (
              <PrimaryButton
                fullWidth
                size="lg"
                onClick={handleCashPayment}
                loading={processing}
                className="mb-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Pay GH₵{finalTotal.toFixed(2)} on Delivery</span>
              </PrimaryButton>
            )}

            {selectedMethod === 'card' && (
              <div className="mb-2 p-3 bg-gray-50 rounded-lg text-center">
                <p className="text-xs text-gray-600">Coming soon</p>
              </div>
            )}

            {!selectedMethod && (
              <p className="text-xs text-gray-500 text-center mb-2">
                Select payment method above
              </p>
            )}

            {/* Info */}
            <p className="text-[10px] text-gray-400 text-center">
              Secure & encrypted
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


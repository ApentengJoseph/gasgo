'use client';

import { useState, useEffect } from 'react';
import PrimaryButton from '@/components/Buttons/PrimaryButton';

interface PaystackButtonProps {
  amount: number;
  email: string;
  orderId: string;
  phone?: string;
  network?: string;
  onSuccess?: (reference: string) => void;
  onError?: (error: Error) => void;
}

export default function PaystackButton({
  amount,
  email,
  orderId,
  phone,
  network,
  onSuccess,
  onError,
}: PaystackButtonProps) {
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  // Wait for Paystack inline script to finish loading
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const check = () => {
      if ((window as any).PaystackPop) {
        setScriptReady(true);
      } else {
        setTimeout(check, 300);
      }
    };
    check();
  }, []);

  const handlePayment = () => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!publicKey) {
      const err = new Error(
        'Paystack public key is missing. ' +
        'Add NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY to .env.local and restart the dev server.',
      );
      console.error(err.message);
      if (onError) onError(err);
      return;
    }

    if (!scriptReady || !(window as any).PaystackPop) {
      const err = new Error('Paystack script has not loaded yet. Please wait a moment and try again.');
      if (onError) onError(err);
      return;
    }

    // Use real email if provided, otherwise derive from phone
    const safeEmail =
      email && email.includes('@') && email.split('@')[1]?.includes('.')
        ? email
        : `${(phone || '').replace(/\D/g, '') || 'user'}@pay.gasgo.app`;

    const reference = `GAS_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    setLoading(true);

    try {
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: safeEmail,
        amount: Math.round(amount * 100), // pesewas
        currency: 'GHS',
        ref: reference,
        metadata: {
          orderId,
          phone: phone || '',
          custom_fields: [
            { display_name: 'Order ID', variable_name: 'order_id', value: orderId },
          ],
        },
        // Valid Paystack channel values: 'card', 'bank', 'mobile_money', 'ussd', 'bank_transfer'
        // Network (MTN/Vodafone/AirtelTigo) is chosen inside Paystack's own popup
        channels: network === 'card' ? ['card'] : ['mobile_money'],
        callback: (response: any) => {
          setLoading(false);
          if (onSuccess) onSuccess(response.reference);
        },
        onClose: () => {
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (err: any) {
      console.error('[PaystackButton] setup error:', err);
      setLoading(false);
      if (onError) onError(err);
    }
  };

  const isValid = phone && phone.replace(/\D/g, '').length >= 9 && network;

  return (
    <PrimaryButton
      onClick={handlePayment}
      loading={loading}
      fullWidth
      size="lg"
      disabled={!isValid || loading || !scriptReady}
    >
      {!scriptReady
        ? 'Loading payment…'
        : `Pay GH₵${amount.toFixed(2)}${network ? ` via ${network}` : ''}`}
    </PrimaryButton>
  );
}

'use client';

import { useState } from 'react';
import PrimaryButton from '@/components/Buttons/PrimaryButton';
import { formatAmountForPaystack } from '@/lib/payments/paystack';

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

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Check if Paystack is available
      if (typeof window === 'undefined' || !(window as any).PaystackPop) {
        throw new Error('Paystack is not loaded. Please check your Paystack configuration.');
      }

      const PaystackPop = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: formatAmountForPaystack(amount),
        ref: orderId,
        metadata: {
          orderId,
          custom_fields: [
            {
              display_name: 'Order ID',
              variable_name: 'order_id',
              value: orderId,
            },
          ],
        },
        callback: function (response: any) {
          // Payment successful
          if (onSuccess) {
            onSuccess(response.reference);
          }
          setLoading(false);
        },
        onClose: function () {
          // User closed payment modal
          setLoading(false);
        },
      });

      PaystackPop.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
      if (onError) {
        onError(error as Error);
      }
      setLoading(false);
    }
  };

  const isValid = phone && network && phone.length >= 10;

  return (
    <PrimaryButton
      onClick={handlePayment}
      loading={loading}
      fullWidth
      size="lg"
      disabled={!isValid || loading}
    >
      Pay GH₵{amount.toFixed(2)} with {network || 'Mobile Money'}
    </PrimaryButton>
  );
}


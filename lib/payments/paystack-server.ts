/**
 * Paystack Server-Side Integration
 * Handles payment verification and webhooks
 */

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    status: string;
    reference: string;
    customer: {
      email: string;
      phone: string;
    };
    authorization: {
      authorization_code: string;
      channel: string;
    };
  };
}

/**
 * Verify Paystack payment
 */
export async function verifyPaystackPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Initialize Paystack payment (for server-side)
 */
export async function initializePaystackPayment(data: {
  email: string;
  amount: number; // in pesewas
  reference: string;
  metadata?: Record<string, any>;
  callback_url?: string;
  channels?: string[]; // ['mobile_money', 'card']
}) {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...data,
      amount: data.amount * 100, // Convert to pesewas
    }),
  });

  if (!response.ok) {
    throw new Error(`Paystack API error: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Verify Paystack webhook signature
 */
export function verifyPaystackWebhook(
  payload: string,
  signature: string
): boolean {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET || '')
    .update(payload)
    .digest('hex');

  return hash === signature;
}


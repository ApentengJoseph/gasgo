/**
 * Ask Paystack to refund a transaction in full (back to the same MoMo wallet).
 * 'refunded' = Paystack accepted the refund; 'pending' = it didn't (admin follows up).
 */
export async function refundTransaction(reference: string): Promise<'refunded' | 'pending'> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !reference) return 'pending';
  try {
    const res = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: reference }),
      cache: 'no-store',
    });
    const d = await res.json().catch(() => ({}));
    return res.ok && d?.status ? 'refunded' : 'pending';
  } catch {
    return 'pending';
  }
}

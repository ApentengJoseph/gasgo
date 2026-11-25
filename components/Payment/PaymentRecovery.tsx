'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Smartphone, Banknote, Loader2, Clock } from 'lucide-react';
import MoMoSheet from '@/components/Payment/MoMoSheet';
import { useAuth } from '@/lib/contexts/AuthContext';
import { track } from '@/components/Layout/Analytics';

/**
 * Shown for an order that is still waiting for payment (e.g. the MoMo prompt
 * was missed or the page was closed). Checks Paystack in the background so a
 * late approval confirms the order by itself, and lets the customer try MoMo
 * again or switch to cash at pickup.
 */
export default function PaymentRecovery({ orderId, total, phone, onConfirmed }: {
  orderId: string;
  total: number;
  phone?: string | null;
  onConfirmed: () => void;
}) {
  const { userEmail, userPhone } = useAuth();
  const [sheet, setSheet] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Background check: did an earlier MoMo attempt go through?
  useEffect(() => {
    let stop = false;
    const check = async () => {
      const d = await fetch(`/api/payments/charge/status?orderId=${orderId}`).then(r => r.json()).catch(() => null);
      if (!stop && d?.status === 'success') { toast.success('Payment received'); onConfirmed(); }
    };
    check();
    const t = setInterval(check, 8000);
    return () => { stop = true; clearInterval(t); };
  }, [orderId, onConfirmed]);

  const payCash = async () => {
    setSwitching(true);
    const res = await fetch(`/api/orders/${orderId}/confirm-cash`, { method: 'POST' });
    const d = await res.json().catch(() => ({}));
    setSwitching(false);
    if (!res.ok) { toast.error(d.error || 'Could not switch to cash. Please try again.'); return; }
    toast.success('Done! Pay the rider in cash when they pick up your cylinder.');
    onConfirmed();
  };

  return (
    <section className="card p-5 border-flame/40" aria-labelledby="pay-again-h">
      <div className="flex items-start gap-3">
        <span className="icon-box icon-box-md icon-box-accent"><Clock className="w-5 h-5" /></span>
        <div>
          <h2 id="pay-again-h" className="font-bold text-ink">Finish your payment</h2>
          <p className="text-[0.875rem] text-ink-muted mt-0.5">
            We haven’t received your payment yet. If you already approved it, this page updates by itself.
          </p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button onClick={() => { track('payment_retry'); setSheet(true); }} className="h-12 rounded-full btn-primary text-[0.9375rem] inline-flex items-center justify-center gap-2">
          <Smartphone className="w-4 h-4" /> Pay with MoMo
        </button>
        <button onClick={payCash} disabled={switching} className="h-12 rounded-full btn-ghost text-[0.9375rem] inline-flex items-center justify-center gap-2 disabled:opacity-50">
          {switching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />} Pay cash instead
        </button>
      </div>
      {sheet && (
        <MoMoSheet
          open
          onClose={() => setSheet(false)}
          orderId={orderId}
          total={total}
          phone={phone || userPhone || ''}
          email={userEmail}
          onPaid={() => { setSheet(false); onConfirmed(); }}
        />
      )}
    </section>
  );
}

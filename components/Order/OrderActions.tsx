'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Pencil, X, Loader2, StickyNote } from 'lucide-react';
import { customerCanCancel, customerCanEdit } from '@/lib/orders/rules';
import { loadReorder } from '@/lib/utils/reorder';
import { track } from '@/components/Layout/Analytics';
import type { Order } from '@/lib/types/database';

/**
 * Change or cancel an order.
 *  - Before a rider accepts: cancel (paid MoMo orders are refunded automatically).
 *  - Unpaid orders can also be edited: we cancel this one and reopen the basket with
 *    the same cylinders, station and address so the customer can change anything.
 *  - Until pickup: the notes for the rider can be changed.
 */
export default function OrderActions({ order, onChanged }: { order: Order; onChanged: () => void }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<'cancel' | 'edit' | 'notes' | null>(null);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState(order.delivery_notes ?? '');

  const canCancel = customerCanCancel(order);
  const canEdit = customerCanEdit(order);
  const canNote = ['pending', 'confirmed', 'assigned'].includes(order.status);
  if (!canCancel && !canNote) return null;

  const cancel = async (thenEdit = false) => {
    setBusy(thenEdit ? 'edit' : 'cancel');
    const res = await fetch(`/api/orders/${order.id}/cancel`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: thenEdit ? 'Customer edited the order' : 'Cancelled by customer' }),
    }).catch(() => null);
    const d = await res?.json().catch(() => ({}));
    if (!res?.ok) { setBusy(null); toast.error(d?.error || 'Could not cancel. Please try again.'); onChanged(); return; }
    track('order_cancelled', { edit: thenEdit });
    if (thenEdit) {
      const ok = await loadReorder(order).catch(() => false);
      router.push(ok ? '/order' : '/stations');
      return;
    }
    setBusy(null); setConfirming(false);
    toast.success(d.refund === 'refunded' ? 'Cancelled. Your MoMo refund is on its way.' : 'Order cancelled.');
    onChanged();
  };

  const saveNotes = async () => {
    setBusy('notes');
    const res = await fetch(`/api/orders/${order.id}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes }),
    }).catch(() => null);
    setBusy(null);
    if (!res?.ok) { toast.error('Could not save. Please try again.'); return; }
    setEditingNotes(false); toast.success('Notes updated'); onChanged();
  };

  return (
    <section className="card p-4 space-y-3" aria-label="Change your order">
      {canNote && (
        editingNotes ? (
          <div className="space-y-2.5">
            <label htmlFor="rider-notes" className="field-label">Notes for the rider</label>
            <textarea id="rider-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={300} className="input-field resize-none" />
            <div className="flex gap-2">
              <button onClick={() => { setEditingNotes(false); setNotes(order.delivery_notes ?? ''); }} className="h-10 px-4 rounded-full btn-ghost text-[0.875rem]">Cancel</button>
              <button onClick={saveNotes} disabled={busy === 'notes'} className="flex-1 h-10 rounded-full btn-dark text-[0.875rem] inline-flex items-center justify-center">
                {busy === 'notes' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save notes'}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditingNotes(true)} className="w-full flex items-center gap-3 text-left">
            <span className="icon-box icon-box-sm icon-box-primary"><StickyNote className="w-4 h-4" /></span>
            <span className="flex-1 min-w-0">
              <span className="block font-semibold text-ink text-[0.9375rem]">Notes for the rider</span>
              <span className="block text-[0.8125rem] text-ink-muted truncate">{order.delivery_notes || 'Add directions, e.g. “blue gate”'}</span>
            </span>
            <span className="text-[0.8125rem] font-semibold text-flame-deep">Edit</span>
          </button>
        )
      )}

      {canCancel && !confirming && (
        <div className={`grid gap-2.5 ${canEdit ? 'grid-cols-2' : 'grid-cols-1'} ${canNote ? 'pt-3 border-t border-white/70' : ''}`}>
          {canEdit && (
            <button onClick={() => cancel(true)} disabled={!!busy} className="h-11 rounded-full btn-ghost text-[0.875rem] inline-flex items-center justify-center gap-1.5">
              {busy === 'edit' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />} Change order
            </button>
          )}
          <button onClick={() => setConfirming(true)} disabled={!!busy} className="h-11 rounded-full btn-ghost text-[0.875rem] inline-flex items-center justify-center gap-1.5 !text-[#B91C1C]">
            <X className="w-4 h-4" /> Cancel order
          </button>
        </div>
      )}

      {confirming && (
        <div className="rounded-2xl bg-[#FDECEC] p-4">
          <p className="font-semibold text-[#991B1B]">Cancel this order?</p>
          <p className="text-[0.8125rem] text-[#B91C1C] mt-0.5">
            {order.payment_status === 'paid' ? 'Your MoMo payment will be refunded to the same number.' : 'No rider has been sent yet, so nothing is charged.'}
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={() => setConfirming(false)} className="flex-1 h-10 rounded-full bg-white text-ink font-semibold text-[0.875rem]">Keep order</button>
            <button onClick={() => cancel(false)} disabled={busy === 'cancel'} className="flex-1 h-10 rounded-full bg-[#DC2626] text-white font-semibold text-[0.875rem] inline-flex items-center justify-center">
              {busy === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, cancel'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

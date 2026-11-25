'use client';

import { useAdmin, when, PageHead, Loading, ErrorNote, Empty } from '@/components/Admin/ui';

type Entry = { id: number; action: string; target: string | null; details: Record<string, unknown> | null; created_at: string; admin: string };

const LABEL: Record<string, string> = {
  'order.cancel': 'Cancelled order', 'order.assign': 'Assigned rider to order', 'order.unassign': 'Removed rider from order',
  'order.advance': 'Moved order step', 'order.settle': 'Paid station for order', 'order.refund': 'Retried refund for order',
  'rider.approve': 'Approved rider', 'rider.reject': 'Declined rider', 'rider.suspend': 'Paused rider', 'rider.reactivate': 'Re-approved rider',
  'rider.payout': 'Changed payout number of', 'rider.adjust': 'Adjusted wallet of', 'rider.vehicle': 'Updated vehicle of',
  'withdrawal.pay': 'Sent payout', 'withdrawal.mark_paid': 'Marked payout paid', 'withdrawal.reject': 'Declined payout',
  'question.answer': 'Answered a question', 'question.close': 'Closed a question',
  'customer.block': 'Blocked customer', 'customer.unblock': 'Unblocked customer',
  'station.create': 'Added station', 'station.update': 'Updated station',
};

/** Every admin action, newest first — who did what and when. */
export default function AdminActivityPage() {
  const { data, error, loading, reload } = useAdmin<{ entries: Entry[] }>('/api/admin/audit', 30000);
  return (
    <>
      <PageHead title="Activity log" sub="Every change made in the control centre" />
      {error && <ErrorNote text={error} retry={reload} />}
      {loading && !data ? <Loading /> : data && (data.entries.length === 0 ? <Empty text="No admin actions yet." /> : (
        <ol className="rounded-3xl bg-white border border-line divide-y divide-line">
          {data.entries.map(e => (
            <li key={e.id} className="px-4 py-3 flex flex-wrap items-baseline gap-x-2 text-[0.9375rem]">
              <b className="text-ink">{e.admin}</b>
              <span className="text-ink">{(LABEL[e.action] ?? e.action).toLowerCase()} <b>{e.target?.startsWith('GAS') || e.target?.startsWith('DEMO') ? `#${e.target}` : e.target}</b></span>
              {e.details && <span className="text-[0.8125rem] text-ink-muted">{summary(e.details)}</span>}
              <span className="ml-auto text-[0.8125rem] text-ink-faint tabular-nums">{when(e.created_at)}</span>
            </li>
          ))}
        </ol>
      ))}
    </>
  );
}

function summary(d: Record<string, unknown>) {
  const bits: string[] = [];
  if (d.reason) bits.push(`“${d.reason}”`);
  if (d.amount != null) bits.push(`GH₵${Number(d.amount).toFixed(2)}`);
  if (d.note) bits.push(String(d.note));
  if (d.to) bits.push(`→ ${d.to}`);
  if (d.refund) bits.push(`refund ${d.refund}`);
  return bits.join(' · ');
}

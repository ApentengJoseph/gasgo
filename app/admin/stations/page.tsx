'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Loader2, Eye, EyeOff, MapPin } from 'lucide-react';
import { useAdmin, adminSend, money, PageHead, Loading, ErrorNote, Empty, Sheet } from '@/components/Admin/ui';

type S = { id: string; name: string; address: string | null; phone: string | null; lat: number; lng: number; is_active: boolean; delivered: number; prices: Record<string, number> };

/** Partner stations: prices per cylinder size, show/hide, add new. Price changes reach the app within minutes. */
export default function AdminStationsPage() {
  const { data, error, loading, reload } = useAdmin<{ stations: S[]; sizes: number[] }>('/api/admin/stations');
  const [edit, setEdit] = useState<S | 'new' | null>(null);

  const toggle = async (s: S) => {
    try { await adminSend(`/api/admin/stations/${s.id}`, { is_active: !s.is_active }, 'PATCH'); toast.success(s.is_active ? `${s.name} hidden from customers` : `${s.name} is live`); reload(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <>
      <PageHead title="Stations" sub="Partner refill stations and their prices">
        <button onClick={() => setEdit('new')} className="h-11 px-5 rounded-full btn-primary text-[0.875rem] inline-flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add station</button>
      </PageHead>
      {error && <ErrorNote text={error} retry={reload} />}
      {loading && !data ? <Loading /> : data && (data.stations.length === 0 ? <Empty text="No stations yet." /> : (
        <ul className="grid md:grid-cols-2 gap-3">
          {data.stations.map(s => (
            <li key={s.id} className={`rounded-3xl bg-white border border-line p-4 ${s.is_active ? '' : 'opacity-70'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-ink truncate">{s.name} {!s.is_active && <span className="pill pill-gray ml-1 align-middle">Hidden</span>}</p>
                  <p className="text-[0.8125rem] text-ink-muted inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{s.address ?? 'Koforidua'} · {s.delivered} deliveries</p>
                </div>
                <button onClick={() => toggle(s)} className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-ink-muted" aria-label={s.is_active ? 'Hide station' : 'Show station'} title={s.is_active ? 'Hide from customers' : 'Show to customers'}>
                  {s.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {data.sizes.map(kg => (
                  <div key={kg} className="rounded-2xl bg-cream/70 px-2 py-2 text-center">
                    <p className="text-[0.6875rem] text-ink-muted">{kg} kg</p>
                    <p className="text-[0.875rem] font-bold tabular-nums text-ink">{s.prices[kg] ? money(s.prices[kg]).replace('GH₵', '₵') : '—'}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setEdit(s)} className="mt-3 text-[0.875rem] font-semibold text-flame-deep">Edit prices & details</button>
            </li>
          ))}
        </ul>
      ))}
      {edit && data && <StationSheet station={edit === 'new' ? null : edit} sizes={data.sizes} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); reload(); }} />}
    </>
  );
}

function StationSheet({ station, sizes, onClose, onSaved }: { station: S | null; sizes: number[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    name: station?.name ?? '', address: station?.address ?? '', phone: station?.phone ?? '',
    lat: station ? String(station.lat) : '', lng: station ? String(station.lng) : '',
    prices: Object.fromEntries(sizes.map(kg => [kg, station?.prices[kg] != null ? String(station.prices[kg]) : ''])) as Record<number, string>,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try {
      if (station) await adminSend(`/api/admin/stations/${station.id}`, { name: f.name, address: f.address, phone: f.phone, prices: f.prices }, 'PATCH');
      else await adminSend('/api/admin/stations', { ...f, lat: Number(f.lat), lng: Number(f.lng) });
      toast.success(station ? 'Station updated' : 'Station added');
      onSaved();
    } catch (x) { setErr((x as Error).message); }
    setBusy(false);
  };
  return (
    <Sheet open onClose={onClose} title={station ? station.name : 'Add a station'}>
      <form onSubmit={save} className="space-y-3">
        <input className="input-field" placeholder="Station name" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required />
        <input className="input-field" placeholder="Address / landmark" value={f.address} onChange={e => setF({ ...f, address: e.target.value })} />
        <input className="input-field" placeholder="Phone" inputMode="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} />
        {!station && (
          <div className="grid grid-cols-2 gap-2">
            <input className="input-field" placeholder="Latitude e.g. 6.0941" inputMode="decimal" value={f.lat} onChange={e => setF({ ...f, lat: e.target.value })} required />
            <input className="input-field" placeholder="Longitude e.g. -0.2591" inputMode="decimal" value={f.lng} onChange={e => setF({ ...f, lng: e.target.value })} required />
            <p className="col-span-2 text-[0.75rem] text-ink-faint">Tip: in Google Maps, long-press the station and copy the two numbers.</p>
          </div>
        )}
        <p className="text-[0.8125rem] font-semibold text-ink-muted pt-1">Price to refill (GH₵) — leave empty if they don’t do that size</p>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map(kg => (
            <label key={kg} className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[0.8125rem] text-ink-muted">{kg} kg</span>
              <input className="input-field pl-16 text-right font-bold" inputMode="decimal" value={f.prices[kg]} onChange={e => setF({ ...f, prices: { ...f.prices, [kg]: e.target.value.replace(/[^\d.]/g, '') } })} aria-label={`${kg} kg price`} />
            </label>
          ))}
        </div>
        {err && <p className="text-[0.875rem] text-[#B91C1C]">{err}</p>}
        <button disabled={busy} className="w-full h-12 rounded-full btn-primary">{busy ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : station ? 'Save' : 'Add station'}</button>
      </form>
    </Sheet>
  );
}

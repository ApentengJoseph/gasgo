'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Home, Briefcase, MapPin, Loader2 } from 'lucide-react';
import AddressAutocomplete from '@/components/Address/AddressAutocomplete';
import { PageHeader } from '@/components/UI/PageHeader';
import { useAuth } from '@/lib/contexts/AuthContext';

const LABELS = [
  { id: 'Home', icon: Home },
  { id: 'Work', icon: Briefcase },
  { id: 'Other', icon: MapPin },
];

export default function AddPlacePage() {
  const router = useRouter();
  const { ensureSession } = useAuth();
  const [label, setLabel] = useState('Home');
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<{ address: string; lat: number; lng: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!picked) return;
    setSaving(true);
    try {
      await ensureSession();
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, address: picked.address, lat: picked.lat, lng: picked.lng }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Could not save this place.');
      toast.success('Place saved');
      const back = new URLSearchParams(window.location.search).get('returnTo');
      router.push(back && back.startsWith('/') ? back : '/profile/addresses');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader back="/profile/addresses" title="Add a place" subtitle="Search, or use your current location." />
      <div className="card p-5 space-y-5">
        <div>
          <p className="field-label">Name this place</p>
          <div className="flex gap-2">
            {LABELS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setLabel(id)}
                aria-pressed={label === id}
                className={`glass !rounded-full inline-flex items-center gap-1.5 h-10 px-4 text-[0.875rem] font-semibold transition ${label === id ? 'card-selected text-ink' : 'text-ink-muted'}`}
              >
                <Icon className="w-4 h-4" /> {id}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="field-label">Address</p>
          <AddressAutocomplete
            value={text}
            onChange={(addr, loc) => { setText(addr); setPicked(loc ? { address: addr, ...loc } : null); }}
            placeholder="Area, street or landmark in Koforidua"
            showCurrentLocation
          />
        </div>
        <button
          onClick={save}
          disabled={!picked || saving}
          className="w-full h-14 rounded-full btn-primary disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save place'}
        </button>
      </div>
    </div>
  );
}

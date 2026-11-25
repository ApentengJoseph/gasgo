import { PageHeader } from '@/components/UI/PageHeader';

export const metadata = { title: 'Credits — GasRefill' };

const photos = [
  { what: 'Boy carrying a gas cylinder (homepage)', who: 'Mitchel Onwuchuruba', where: 'Pexels', licence: 'Pexels License' },
  { what: 'Woman working in an office (homepage)', who: 'Edmond Dantès', where: 'Pexels', licence: 'Pexels License' },
  { what: 'Delivery worker with gas cylinders (homepage)', who: 'Generated with Canva AI', where: 'Canva', licence: 'Canva content licence' },
  { what: '3 kg and 25 kg cylinders', who: 'thenwiaka', where: 'Pexels', licence: 'Pexels License' },
  { what: '6 kg table-top cylinder', who: 'ishahidsultan', where: 'Pexels', licence: 'Pexels License' },
  { what: '12 kg composite cylinder (cropped)', who: 'Aburi Composites', where: 'Wikimedia Commons', licence: 'CC BY-SA 4.0' },
  { what: 'Street in Ghana (homepage)', who: 'Ato Aikins', where: 'Unsplash', licence: 'Unsplash License' },
];

export default function CreditsPage() {
  return (
    <div>
      <PageHeader back="/" title="Credits" subtitle="Photos used on GasRefill, with thanks to their creators." />
      <ul className="card overflow-hidden divide-y divide-white/70">
        {photos.map(p => (
          <li key={p.what} className="p-4">
            <p className="font-semibold text-ink">{p.what}</p>
            <p className="text-[0.875rem] text-ink-muted">{p.who} · {p.where} · {p.licence}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[0.8125rem] text-ink-faint">
        The 12 kg photo is shared under Creative Commons Attribution-ShareAlike 4.0
        (creativecommons.org/licenses/by-sa/4.0); our cropped version is shared under the same licence.
      </p>
    </div>
  );
}

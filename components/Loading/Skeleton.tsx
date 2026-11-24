'use client';

export function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="space-y-3">
        <div className="h-4 rounded-full" style={{ background: '#EFE7DE', width: '60%' }} />
        <div className="h-3 rounded-full" style={{ background: '#EFE7DE', width: '80%' }} />
        <div className="h-24 rounded-[12px]" style={{ background: '#EFE7DE' }} />
      </div>
    </div>
  );
}

export function SkeletonButton() {
  return (
    <div className="h-12 rounded-[14px] animate-pulse" style={{ background: '#EFE7DE' }} />
  );
}

export function SkeletonRow() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] flex-shrink-0" style={{ background: '#EFE7DE' }} />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 rounded-full" style={{ background: '#EFE7DE', width: '55%' }} />
          <div className="h-3 rounded-full"   style={{ background: '#EFE7DE', width: '40%' }} />
        </div>
        <div className="w-5 h-5 rounded-full" style={{ background: '#EFE7DE' }} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

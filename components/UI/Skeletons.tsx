/**
 * Placeholders shown while a page loads. They keep the page's shape (step bar,
 * title, cards) so moving between screens never flashes blank.
 */

function Bar({ className = '' }: { className?: string }) {
  return <span className={`block rounded-full bg-white/70 shadow-[inset_0_1px_2px_rgba(60,35,15,0.06)] animate-pulse ${className}`} />;
}

function Block({ className = '' }: { className?: string }) {
  return <div className={`glass animate-pulse ${className}`} />;
}

export function OrderFlowSkeleton({ step }: { step: 0 | 1 | 2 }) {
  return (
    <div aria-busy="true" aria-label="Loading" className="pb-28">
      <div className="flex gap-2 mb-6">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-1">
            <span className={`block h-1.5 rounded-full ${i <= step ? 'bg-gradient-to-r from-flame to-flame-light' : 'bg-white/70'}`} />
            <Bar className="mt-2 h-3 w-14" />
          </div>
        ))}
      </div>
      <Bar className="h-8 w-56 mb-2.5" />
      <Bar className="h-4 w-72 max-w-full mb-8" />
      {step === 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => <Block key={i} className="aspect-[3/4.4] !rounded-[22px]" />)}
        </div>
      ) : (
        <div className="md:grid md:grid-cols-[1.25fr_1fr] md:gap-6 space-y-4 md:space-y-0">
          <div className="space-y-4">
            <Block className="h-[250px]" />
            <Block className="h-[140px]" />
          </div>
          <Block className="h-[280px]" />
        </div>
      )}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Bar className="h-8 w-48 mb-2.5" />
      <Bar className="h-4 w-64 max-w-full mb-8" />
      <div className="space-y-3">
        <Block className="h-[120px]" />
        <Block className="h-[88px]" />
        <Block className="h-[88px]" />
      </div>
    </div>
  );
}

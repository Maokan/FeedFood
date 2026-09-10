export default function FeedSkeleton() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="mb-6 overflow-hidden rounded-2xl border border-bordercol bg-panel">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="h-[38px] w-[38px] animate-pulse rounded-full bg-panellight" />
            <div className="flex-1">
              <div className="mb-2 h-3 w-2/5 animate-pulse rounded bg-panellight" />
              <div className="h-2.5 w-3/5 animate-pulse rounded bg-panellight" />
            </div>
          </div>
          <div className="h-[420px] animate-pulse bg-panellight" />
          <div className="px-4 pb-4 pt-3">
            <div className="mb-3 h-3.5 w-28 animate-pulse rounded bg-panellight" />
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-panellight" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-panellight" />
          </div>
        </div>
      ))}
    </div>
  );
}

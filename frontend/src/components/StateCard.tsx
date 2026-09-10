interface StateCardProps {
  icon: string;
  title: string;
  text: string | null;
  actionLabel?: string;
  onAction?: () => void;
}

/** Carte générique pour les états UI "erreur" et "liste vide". */
export default function StateCard({
  icon,
  title,
  text,
  actionLabel,
  onAction,
}: StateCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-bordercol bg-panel p-10 text-center">
      <i className={`fa-solid ${icon} text-3xl text-brandyellow`} aria-hidden="true" />
      <h2 className="m-0 text-base font-bold">{title}</h2>
      {text !== null && (
        <p className="m-0 max-w-[40ch] text-sm text-dimtext">{text}</p>
      )}
      {actionLabel !== undefined && onAction !== undefined && (
        <button
          type="button"
          className="mt-1 cursor-pointer rounded-full border border-brandyellow px-6 py-2 text-sm font-bold text-brandyellow transition-colors hover:bg-brandyellow/10"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

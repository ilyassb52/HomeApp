/* ==========================================================================
 * components/app/LoadStates.tsx — ce qu'affiche une page téléphone en
 * attendant sa liste
 *
 *   LoadingRows — des barres grises qui pulsent, à la place des lignes
 *   LoadFailed  — « Impossible de joindre le serveur » + Réessayer
 *
 * Nés dans PrioritiesManager, ils servent aussi à ShoppingManager depuis
 * l'arrivée des courses : factorisés à la deuxième occurrence.
 * ========================================================================== */

/** Trois barres grises qui pulsent, à la place des lignes à venir. */
export function LoadingRows() {
  return (
    <div className="flex flex-col gap-3" aria-label="Chargement">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="h-[68px] animate-pulse rounded-2xl bg-ink/5"
        />
      ))}
    </div>
  );
}

export function LoadFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-light text-muted">Impossible de joindre le serveur.</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-xl border border-ink/20 px-5"
      >
        Réessayer
      </button>
    </div>
  );
}

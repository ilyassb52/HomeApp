/* ==========================================================================
 * components/app/exercise/RestTimer.tsx — le minuteur de repos
 *
 *   ┌────────────────────────────────────────────────┐
 *   │ Repos   1:12        [−30 s] [+30 s] [Passer]   │   collé en bas
 *   └────────────────────────────────────────────────┘
 *
 * ON COMPTE JUSQU'À UNE HEURE DE FIN, PAS SECONDE PAR SECONDE
 *
 * La page donne l'instant où le repos se termine (endsAt, en millisecondes).
 * Le minuteur se contente d'afficher « fin − maintenant ». Si le téléphone
 * met la page en pause (écran éteint), le compte reste juste au réveil :
 * aucune seconde n'a été « oubliée ».
 *
 * À zéro, le téléphone vibre une fois (Android seulement : iPhone ne laisse
 * pas une page web vibrer) et le bandeau passe au vert : « C'est reparti ! ».
 * ========================================================================== */

"use client";

import { useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/workouts";

/* Rafraîchir 4 fois par seconde : le chiffre change pile à la seconde. */
const TICK_MS = 250;

/* Un repos fini depuis plus d'une minute ne concerne plus personne (une
 * page rouverte bien plus tard, par exemple) : le bandeau s'efface seul. */
const STALE_AFTER_SECONDS = 60;

const SMALL_BUTTON =
  "min-h-11 rounded-xl border border-current/30 px-3 text-sm font-semibold active:bg-ink/10";

export default function RestTimer({
  endsAt,
  onAdjust,
  onClose,
}: {
  /** L'instant de fin du repos (Date.now() + durée). */
  endsAt: number;
  /** −30 ou +30 : décaler la fin (et retenir la nouvelle durée). */
  onAdjust: (seconds: number) => void;
  /** « Passer » ou « OK » : faire disparaître le bandeau. */
  onClose: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const remaining = (endsAt - now) / 1000;
  const isOver = remaining <= 0;

  /* Vibrer UNE fois par repos : on retient la fin pour laquelle on a déjà
   * vibré. Un nouveau repos (nouvel endsAt) pourra vibrer à son tour. */
  const vibratedFor = useRef<number | null>(null);
  useEffect(() => {
    if (isOver && vibratedFor.current !== endsAt) {
      vibratedFor.current = endsAt;
      /* navigator.vibrate n'existe pas partout (iPhone) : « ?. » évite
       * l'erreur et ne fait rien. */
      navigator.vibrate?.([300, 150, 300]);
    }
  }, [isOver, endsAt]);

  if (remaining < -STALE_AFTER_SECONDS) {
    return null;
  }

  return (
    <div
      role="timer"
      aria-live="polite"
      className={`sticky bottom-3 z-10 flex items-center gap-2 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
        isOver
          ? "border-neon-green/50 bg-neon-green/15 text-neon-green"
          : "border-ink/20 bg-card/90 text-ink"
      }`}
    >
      {isOver ? (
        <p className="flex-1 text-lg font-semibold">C&apos;est reparti !</p>
      ) : (
        <p className="flex flex-1 items-baseline gap-2">
          <span className="text-sm text-muted">Repos</span>
          <span className="text-3xl font-semibold tabular-nums">
            {formatDuration(Math.ceil(remaining))}
          </span>
        </p>
      )}

      {isOver ? null : (
        <>
          <button
            type="button"
            onClick={() => onAdjust(-30)}
            className={SMALL_BUTTON}
          >
            −30 s
          </button>
          <button
            type="button"
            onClick={() => onAdjust(30)}
            className={SMALL_BUTTON}
          >
            +30 s
          </button>
        </>
      )}
      <button type="button" onClick={onClose} className={SMALL_BUTTON}>
        {isOver ? "OK" : "Passer"}
      </button>
    </div>
  );
}

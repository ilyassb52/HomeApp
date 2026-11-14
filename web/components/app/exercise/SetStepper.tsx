/* ==========================================================================
 * components/app/exercise/SetStepper.tsx — une ligne « −  valeur  + »
 *
 *   Reps    [ − ]      8      [ + ]
 *   Kg      [ − ]    52,5     [ + ]
 *                poids du corps          ← sous-titre facultatif
 *
 * Pensée pour la salle : des boutons de 56 px qu'on touche sans viser,
 * même avec des mains moites, et un grand chiffre lisible à bout de bras.
 * Le chiffre est aussi un champ : le toucher ouvre le pavé numérique pour
 * taper une valeur d'un coup (110 kg, sans 44 appuis sur +).
 *
 * Le composant ne décide de rien : la page lui donne le texte affiché et
 * reçoit les appuis (onMinus, onPlus) et la frappe (onType).
 * ========================================================================== */

"use client";

const STEP_BUTTON =
  "flex size-14 shrink-0 items-center justify-center rounded-2xl border border-ink/20 text-3xl font-light text-ink active:bg-ink/15 disabled:opacity-30";

export default function SetStepper({
  label,
  value,
  hint,
  inputMode,
  onType,
  onMinus,
  onPlus,
  canMinus,
}: {
  /** « Reps », « Kg ». */
  label: string;
  /** Le texte du champ : « 8 », « 52,5 ». */
  value: string;
  /** Une précision sous le chiffre (« poids du corps »), ou rien. */
  hint?: string;
  /** « numeric » (entiers) ou « decimal » (avec virgule). */
  inputMode: "numeric" | "decimal";
  onType: (text: string) => void;
  onMinus: () => void;
  onPlus: () => void;
  /** false grise le − (déjà au minimum). */
  canMinus: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-sm font-semibold tracking-[1px] text-label uppercase">
        {label}
      </span>

      <button
        type="button"
        aria-label={`${label} : moins`}
        onClick={onMinus}
        disabled={!canMinus}
        className={STEP_BUTTON}
      >
        −
      </button>

      <div className="flex min-w-0 flex-1 flex-col items-center">
        <input
          value={value}
          onChange={(e) => onType(e.target.value)}
          /* Tout sélectionner au toucher : on tape directement la
           * nouvelle valeur, sans effacer l'ancienne à la main. */
          onFocus={(e) => e.target.select()}
          inputMode={inputMode}
          aria-label={label}
          className="w-full bg-transparent text-center text-4xl font-semibold text-ink tabular-nums outline-none"
        />
        <span className="h-4 text-xs text-muted">{hint ?? ""}</span>
      </div>

      <button
        type="button"
        aria-label={`${label} : plus`}
        onClick={onPlus}
        className={STEP_BUTTON}
      >
        +
      </button>
    </div>
  );
}

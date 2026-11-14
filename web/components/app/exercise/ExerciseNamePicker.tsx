/* ==========================================================================
 * components/app/exercise/ExerciseNamePicker.tsx — choisir l'exercice
 *
 *   Tes exercices
 *   [Squat] [pec] [Pompes] [Tractions] …        ← un toucher et c'est parti
 *
 *   Nouvel exercice
 *   [ Développé couché…        ]  [Commencer]
 *
 * Toucher un nom déjà utilisé évite de le retaper, et surtout évite les
 * fautes : « Squat » et « Sqat » seraient deux exercices différents, et
 * « La dernière fois » ne retrouverait plus rien.
 * ========================================================================== */

"use client";

import { useState } from "react";
import { EXERCISE_NAME_MAX_LENGTH } from "@/lib/api/workouts";

export default function ExerciseNamePicker({
  names,
  onPick,
}: {
  /** Les noms déjà utilisés, du plus récent au plus ancien. */
  names: string[];
  onPick: (name: string) => void;
}) {
  const [typed, setTyped] = useState("");
  const trimmed = typed.trim();

  function submit(event: React.FormEvent) {
    event.preventDefault(); // pas de rechargement de la page
    if (trimmed !== "") onPick(trimmed);
  }

  return (
    <div className="flex flex-col gap-6">
      {names.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold tracking-[2px] text-label uppercase">
            Tes exercices
          </h2>
          <div className="flex flex-wrap gap-2">
            {names.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => onPick(name)}
                className="min-h-12 rounded-xl border border-ink/20 px-4 text-[17px] text-ink active:bg-ink/15"
              >
                {name}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <form onSubmit={submit} className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-[2px] text-label uppercase">
          Nouvel exercice
        </h2>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          maxLength={EXERCISE_NAME_MAX_LENGTH}
          placeholder="Développé couché, tractions…"
          aria-label="Nom du nouvel exercice"
          enterKeyHint="go"
          className="min-h-12 rounded-xl border border-ink/20 bg-bg px-3 text-[17px] font-light outline-none placeholder:text-muted/60 focus:border-ink/50"
        />
        <button
          type="submit"
          disabled={trimmed === ""}
          className="min-h-12 rounded-xl bg-ink px-4 font-semibold text-bg disabled:opacity-40"
        >
          Commencer
        </button>
      </form>
    </div>
  );
}

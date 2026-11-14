/* ==========================================================================
 * components/app/SessionForm.tsx — ouvrir une séance, ou changer son jour
 * et sa note
 *
 *   date   aujourd'hui par défaut
 *   note   facultative : « Jambes », « Haut du corps »…
 *
 * Les exercices ne sont pas ici : ils s'ajoutent un par un ensuite, dans
 * la carte de la séance (ExerciseForm).
 * ========================================================================== */

"use client";

import { useState } from "react";
import { WORKOUT_NOTE_MAX_LENGTH } from "@/lib/api/workouts";
import type { WorkoutDraft } from "@/lib/types";

/* Les champs du téléphone, comme dans EventForm. */
const FIELD =
  "min-h-11 rounded-xl border border-ink/20 bg-bg px-3 py-2.5 text-[17px] font-light outline-none focus:border-ink/50 placeholder:text-muted/60";

export default function SessionForm({
  initial,
  isEditing,
  isSending,
  onSubmit,
  onCancel,
}: {
  initial: WorkoutDraft;
  isEditing: boolean;
  isSending: boolean;
  /** La page s'occupe de la suite (ouvrir l'ajout d'exercice, fermer…). */
  onSubmit: (draft: WorkoutDraft) => void;
  onCancel: () => void;
}) {
  const [day, setDay] = useState(initial.day);
  const [note, setNote] = useState(initial.note ?? "");

  function submit(event: React.FormEvent) {
    event.preventDefault(); // pas de rechargement de la page
    if (day === "") return;
    onSubmit({ day, note: note.trim() || null });
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-xl border border-dashed border-ink/20 p-2"
    >
      <input
        type="date"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        aria-label="Date de la séance"
        required
        className={FIELD}
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={WORKOUT_NOTE_MAX_LENGTH}
        placeholder="Note : jambes, haut du corps… (facultatif)"
        aria-label="Note"
        className={FIELD}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-11 flex-1 rounded-xl border border-ink/20 px-4"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={day === "" || isSending}
          className="min-h-11 flex-1 rounded-xl bg-ink px-4 font-semibold text-bg disabled:opacity-40"
        >
          {isSending
            ? "Envoi…"
            : isEditing
              ? "Enregistrer"
              : "Ouvrir la séance"}
        </button>
      </div>
    </form>
  );
}

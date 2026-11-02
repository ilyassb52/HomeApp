/* ==========================================================================
 * components/app/AddPriorityForm.tsx — ajouter une priorité du jour
 *
 * Un champ de texte, le choix de la catégorie, un bouton Ajouter. Le champ
 * ne se vide qu'une fois l'API d'accord : en cas d'échec, le texte tapé
 * reste là, prêt à être renvoyé.
 * ========================================================================== */

"use client";

import { useState } from "react";
import CategoryPicker from "@/components/app/CategoryPicker";
import { GOAL_TEXT_MAX_LENGTH } from "@/lib/api/priorities";
import type { PriorityCategory } from "@/lib/types";

export default function AddPriorityForm({
  onAdd,
  isSending,
}: {
  /** Renvoie true si l'API a accepté la nouvelle priorité. */
  onAdd: (newGoal: {
    text: string;
    category: PriorityCategory;
  }) => Promise<boolean>;
  /** true pendant l'envoi : le bouton est désactivé, pas de double ajout. */
  isSending: boolean;
}) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<PriorityCategory>("work");
  const trimmedText = text.trim();

  async function submit(event: React.FormEvent) {
    event.preventDefault(); // pas de rechargement de la page
    if (trimmedText === "") return;

    const accepted = await onAdd({ text: trimmedText, category });
    if (accepted) {
      setText("");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-ink/20 p-3"
    >
      <input
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={GOAL_TEXT_MAX_LENGTH}
        placeholder="Nouvelle priorité…"
        aria-label="Nouvelle priorité"
        className="rounded-xl border border-ink/20 bg-bg px-3 py-2.5 text-[17px] font-light outline-none placeholder:text-muted/60 focus:border-ink/50"
      />

      <CategoryPicker value={category} onChange={setCategory} />

      <button
        type="submit"
        disabled={trimmedText === "" || isSending}
        className="min-h-11 rounded-xl bg-ink font-semibold text-bg disabled:opacity-40"
      >
        {isSending ? "Ajout…" : "Ajouter"}
      </button>
    </form>
  );
}

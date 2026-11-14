/* ==========================================================================
 * components/app/AddShoppingItemForm.tsx — ajouter un article aux courses
 *
 * Un champ, un bouton. On ajoute souvent plusieurs articles d'affilée :
 * après chaque ajout réussi, le champ se vide ET reprend le focus, pour que
 * le clavier du téléphone reste ouvert. En cas d'échec, le texte reste là.
 * ========================================================================== */

"use client";

import { useRef, useState } from "react";
import { SHOPPING_NAME_MAX_LENGTH } from "@/lib/api/shopping";

export default function AddShoppingItemForm({
  onAdd,
  isSending,
}: {
  /** Renvoie true si l'API a accepté le nouvel article. */
  onAdd: (name: string) => Promise<boolean>;
  /** true pendant l'envoi : le bouton est désactivé, pas de double ajout. */
  isSending: boolean;
}) {
  const [name, setName] = useState("");
  const trimmedName = name.trim();

  /* Une « ref » donne accès à l'élément HTML lui-même, pour lui redonner
   * le focus après l'ajout. */
  const inputRef = useRef<HTMLInputElement>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); // pas de rechargement de la page
    if (trimmedName === "") return;

    const accepted = await onAdd(trimmedName);
    if (accepted) {
      setName("");
      inputRef.current?.focus();
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex gap-2 rounded-2xl border border-dashed border-ink/20 p-3"
    >
      {/* enterKeyHint="done" : la touche Entrée du clavier téléphone
          affiche « OK », et envoie le formulaire. */}
      <input
        ref={inputRef}
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={SHOPPING_NAME_MAX_LENGTH}
        placeholder="Lait, pain, pommes…"
        aria-label="Nouvel article"
        enterKeyHint="done"
        className="min-w-0 flex-1 rounded-xl border border-ink/20 bg-bg px-3 py-2.5 text-[17px] font-light outline-none placeholder:text-muted/60 focus:border-ink/50"
      />

      <button
        type="submit"
        disabled={trimmedName === "" || isSending}
        className="min-h-11 shrink-0 rounded-xl bg-ink px-4 font-semibold text-bg disabled:opacity-40"
      >
        {isSending ? "Ajout…" : "Ajouter"}
      </button>
    </form>
  );
}

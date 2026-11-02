/* ==========================================================================
 * components/app/PriorityRow.tsx — une priorité sur la page téléphone
 *
 * Deux visages, selon que l'on modifie la priorité ou non :
 *
 *   lecture  — cercle à cocher, pastille, texte, flèches ↑ ↓, croix
 *   édition  — champ de texte, choix de catégorie, Annuler / Enregistrer
 *
 * On passe en édition en touchant le texte.
 *
 * La ligne ne parle jamais à l'API. Elle prévient la page (onToggle,
 * onSave…), qui seule possède les mutations. La ligne reste ainsi un simple
 * morceau d'affichage, et la page sait centraliser les messages d'erreur.
 * ========================================================================== */

"use client";

import { useState, type ReactNode } from "react";
import CategoryPicker from "@/components/app/CategoryPicker";
import Card from "@/components/ui/Card";
import CategoryChip from "@/components/ui/CategoryChip";
import CheckCircle from "@/components/ui/CheckCircle";
import { GOAL_TEXT_MAX_LENGTH, type GoalChanges } from "@/lib/api/priorities";
import { CATEGORY_LOOKS } from "@/lib/priority-categories";
import type { Priority } from "@/lib/types";

type PriorityRowProps = {
  priority: Priority;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onMove: (direction: -1 | 1) => void;
  onDelete: () => void;
  onSave: (changes: GoalChanges) => void;
};

/* La Card du miroir est taillée pour 1080 px de large. Ces classes Tailwind
 * l'ajustent au téléphone : elles l'emportent sur celles de globals.css,
 * rangées dans une couche (@layer components) moins prioritaire. */
const PHONE_CARD = "rounded-2xl p-3";

export default function PriorityRow(props: PriorityRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { tone } = CATEGORY_LOOKS[props.priority.category];

  return (
    <Card tone={tone} className={PHONE_CARD}>
      {isEditing ? (
        <EditView {...props} onClose={() => setIsEditing(false)} />
      ) : (
        <ReadView {...props} onEdit={() => setIsEditing(true)} />
      )}
    </Card>
  );
}

/* --------------------------------------------------------------------------
 * 1. Lecture
 * -------------------------------------------------------------------------- */
function ReadView({
  priority,
  isFirst,
  isLast,
  onToggle,
  onMove,
  onDelete,
  onEdit,
}: PriorityRowProps & { onEdit: () => void }) {
  return (
    <div className="flex items-center gap-2">
      {/* Le bouton fait 44 px, la taille minimale conseillée pour un doigt,
          même si le cercle dessiné dedans est plus petit. */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={priority.done ? "Marquer à faire" : "Marquer comme faite"}
        className="flex size-11 shrink-0 items-center justify-center"
      >
        <CheckCircle done={priority.done} size={26} />
      </button>

      <CategoryChip category={priority.category} size={20} />

      {/* min-w-0 autorise le texte à rétrécir sous sa largeur naturelle :
          sans lui, un long texte pousserait les boutons hors de l'écran.
          break-words coupe alors un mot trop long plutôt que de déborder. */}
      <button
        type="button"
        onClick={onEdit}
        className={`min-h-11 min-w-0 flex-1 px-1 text-left text-[17px] font-light break-words ${
          priority.done ? "text-muted line-through" : "text-ink"
        }`}
      >
        {priority.text}
      </button>

      {/* Les deux flèches empilées n'occupent qu'une colonne. */}
      <div className="flex shrink-0 flex-col">
        <IconButton
          label="Monter"
          disabled={isFirst}
          onClick={() => onMove(-1)}
        >
          ↑
        </IconButton>
        <IconButton
          label="Descendre"
          disabled={isLast}
          onClick={() => onMove(1)}
        >
          ↓
        </IconButton>
      </div>

      <IconButton label="Supprimer" onClick={onDelete}>
        ✕
      </IconButton>
    </div>
  );
}

/** Un petit bouton fait d'un seul caractère. aria-label lui donne un nom
 *  lisible par un lecteur d'écran, qui ne saurait pas lire « ↑ ». */
function IconButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-lg text-muted active:bg-ink/10 disabled:opacity-25"
    >
      {children}
    </button>
  );
}

/* --------------------------------------------------------------------------
 * 2. Édition
 *
 * Le texte et la catégorie en cours de saisie sont des brouillons, gardés
 * dans la ligne. Rien ne part vers l'API avant « Enregistrer ». Et si la
 * liste est relue entre-temps (toutes les 30 s), la saisie n'est pas écrasée.
 * -------------------------------------------------------------------------- */
function EditView({
  priority,
  onSave,
  onClose,
}: PriorityRowProps & { onClose: () => void }) {
  const [draftText, setDraftText] = useState(priority.text);
  const [draftCategory, setDraftCategory] = useState(priority.category);
  const trimmedText = draftText.trim();

  function save(event: React.FormEvent) {
    /* Sans preventDefault, le navigateur enverrait le formulaire à
     * l'ancienne, en rechargeant toute la page. */
    event.preventDefault();

    /* On n'envoie que ce qui a vraiment changé. */
    const changes: GoalChanges = {};
    if (trimmedText !== priority.text) changes.text = trimmedText;
    if (draftCategory !== priority.category) changes.category = draftCategory;

    if (Object.keys(changes).length > 0) {
      onSave(changes);
    }
    onClose();
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-3">
      <input
        autoFocus
        value={draftText}
        onChange={(event) => setDraftText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        maxLength={GOAL_TEXT_MAX_LENGTH}
        aria-label="Texte de la priorité"
        className="rounded-xl border border-ink/20 bg-bg px-3 py-2.5 text-[17px] font-light outline-none focus:border-ink/50"
      />

      <CategoryPicker value={draftCategory} onChange={setDraftCategory} />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 flex-1 rounded-xl border border-ink/20 text-muted"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={trimmedText === ""}
          className="min-h-11 flex-1 rounded-xl bg-ink font-semibold text-bg disabled:opacity-40"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}

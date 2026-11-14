/* ==========================================================================
 * components/app/EventRow.tsx — un événement sur la page téléphone
 *
 * Quand (heure, « Journée » ou 🎂), le titre, et dessous pour qui :
 * « Ilyass » ou « Tout le foyer », plus « chaque année » pour une date fixe.
 * À droite : modifier, supprimer.
 *
 * Comme ShoppingRow, la ligne ne parle jamais à l'API : elle prévient la
 * page (onEdit, onDelete), qui seule possède les mutations.
 * ========================================================================== */

"use client";

import Card from "@/components/ui/Card";
import EventWhen from "@/components/ui/EventWhen";
import MemberDot, { HOUSEHOLD_TONE } from "@/components/ui/MemberDot";
import type { CalendarEvent } from "@/lib/types";

/* La Card du miroir, ajustée au téléphone (voir ShoppingRow). */
const PHONE_CARD = "rounded-2xl p-1";

export default function EventRow({
  event,
  isEditing,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent;
  /** true quand le formulaire du bas modifie cet événement. */
  isEditing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const who = event.member?.name ?? "Tout le foyer";

  return (
    <Card
      tone={event.member?.tone ?? HOUSEHOLD_TONE}
      variant={isEditing ? "tinted" : "plain"}
      className={PHONE_CARD}
    >
      <div className="flex items-center gap-1">
        <span className="flex w-20 shrink-0 justify-center text-[15px] font-light text-muted tabular-nums">
          <EventWhen event={event} emojiSize={26} />
        </span>

        <div className="min-w-0 flex-1 py-1.5">
          <p className="text-[17px] font-light break-words text-ink">
            {event.title}
          </p>
          <p className="flex items-center gap-1.5 text-sm font-light text-muted">
            <MemberDot member={event.member} size={8} />
            {event.kind === "yearly" ? `${who} · chaque année` : who}
          </p>
        </div>

        <button
          type="button"
          aria-label={`Modifier ${event.title}`}
          onClick={onEdit}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg text-lg text-muted active:bg-ink/10"
        >
          ✎
        </button>
        <button
          type="button"
          aria-label={`Supprimer ${event.title}`}
          onClick={onDelete}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg text-lg text-muted active:bg-ink/10"
        >
          ✕
        </button>
      </div>
    </Card>
  );
}

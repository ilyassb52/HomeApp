/* ==========================================================================
 * components/ui/MemberDot.tsx — la pastille de couleur d'un membre
 *
 * Un petit rond plein qui dit POUR QUI est un rendez-vous (classe
 * .tone-dot de globals.css) :
 *   - un membre      → sa couleur à lui (profile.tone, choisie dans la base) ;
 *   - tout le foyer  → la couleur du foyer, HOUSEHOLD_TONE.
 *
 * Utilisée par le widget Agenda du miroir, et sur le téléphone par les
 * lignes et le calendrier de /app/agenda.
 * ========================================================================== */

import type { CSSProperties } from "react";
import { mp } from "@/lib/mirror-pixels";
import type { Member, Tone } from "@/lib/types";

/** La couleur de « tout le foyer ». Les membres prennent les autres
 *  couleurs (seed : cyan, magenta, vert) : ne pas donner l'ambre à un
 *  membre, sinon on ne distinguerait plus ses rendez-vous de ceux du foyer.
 *  Utilisée aussi par la carte des lignes de /app/agenda (EventRow). */
export const HOUSEHOLD_TONE: Tone = "amber";

export default function MemberDot({
  member,
  size,
}: {
  member: Member | null;
  /** Diamètre en pixels miroir (en pixels normaux sur le téléphone). */
  size: number;
}) {
  const tone = member?.tone ?? HOUSEHOLD_TONE;

  return (
    <span
      className="tone-dot inline-block shrink-0 rounded-full"
      style={
        {
          "--tone": `var(--color-${tone})`,
          width: mp(size),
          height: mp(size),
        } as CSSProperties
      }
    />
  );
}

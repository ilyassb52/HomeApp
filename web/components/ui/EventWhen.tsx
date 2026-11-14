/* ==========================================================================
 * components/ui/EventWhen.tsx — « quand » d'un événement, en un coup d'œil
 *
 *   un anniversaire (date fixe chaque année)   → 🎂
 *   un rendez-vous avec une heure              → « 14:30 »
 *   un rendez-vous sans heure                  → « Journée » (allDayLabel)
 *
 * Partagé par le widget Agenda du miroir et les lignes de /app/agenda : seule
 * la taille change, et le style du texte est donné par le parent. Le miroir,
 * qui veut des lignes compactes, passe allDayLabel="" : rien n'est écrit
 * pour un rendez-vous sans heure.
 * ========================================================================== */

import Emoji from "@/components/ui/Emoji";
import { shortTime } from "@/lib/calendar";
import type { CalendarEvent } from "@/lib/types";

export default function EventWhen({
  event,
  emojiSize,
  loop,
  allDayLabel = "Journée",
}: {
  event: CalendarEvent;
  /** Taille du gâteau d'anniversaire. */
  emojiSize: number;
  /** Nombre de lectures du gâteau (voir Emoji.tsx). Absent = à l'infini. */
  loop?: boolean | number;
  /** Ce qu'on écrit pour un rendez-vous sans heure. */
  allDayLabel?: string;
}) {
  if (event.kind === "yearly") {
    return <Emoji name="cake" size={emojiSize} loop={loop} />;
  }
  return <>{event.start_time ? shortTime(event.start_time) : allDayLabel}</>;
}

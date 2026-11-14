/* ==========================================================================
 * components/app/MonthCalendar.tsx — le calendrier d'un mois, au téléphone
 *
 * En haut : ‹ Novembre 2026 ›. Dessous, la grille du lundi au dimanche
 * (lib/calendar.ts, monthGrid). Chaque case montre le numéro du jour et un
 * petit point par événement (trois au plus), de la couleur du membre.
 *
 *   aujourd'hui      → entouré
 *   le jour choisi   → plein
 *   un mois voisin   → grisé
 *
 * Comme les lignes de la liste, le calendrier ne parle jamais à l'API : il
 * reçoit les événements déjà rangés par jour et prévient la page quand on
 * touche une case ou une flèche.
 * ========================================================================== */

"use client";

import MemberDot from "@/components/ui/MemberDot";
import { monthLabel, type IsoDay } from "@/lib/calendar";
import type { CalendarEvent } from "@/lib/types";

/* Au-delà, les points ne tiennent plus sous le numéro : trois suffisent à
 * dire « journée chargée ». */
const MAX_DOTS = 3;

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

export default function MonthCalendar({
  year,
  month,
  weeks,
  eventsByDay,
  today,
  selectedDay,
  onSelectDay,
  onShiftMonth,
}: {
  year: number;
  month: number;
  weeks: IsoDay[][];
  eventsByDay: Map<IsoDay, CalendarEvent[]>;
  today: IsoDay;
  selectedDay: IsoDay;
  onSelectDay: (day: IsoDay) => void;
  /** -1 : le mois d'avant, +1 : le mois d'après. */
  onShiftMonth: (count: -1 | 1) => void;
}) {
  /* "2026-11" : les cases dont le jour commence ainsi sont dans le mois. */
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() => onShiftMonth(-1)}
          className="flex size-11 items-center justify-center rounded-lg text-xl active:bg-ink/10"
        >
          ‹
        </button>
        <p className="text-lg font-light">{monthLabel(year, month)}</p>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() => onShiftMonth(1)}
          className="flex size-11 items-center justify-center rounded-lg text-xl active:bg-ink/10"
        >
          ›
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center text-xs font-semibold text-label">
        {WEEKDAYS.map((letter, index) => (
          /* Deux « M » (mardi, mercredi) : la clé est la position. */
          <span key={index} className="py-1">
            {letter}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day) => {
          const dayEvents = eventsByDay.get(day) ?? [];
          const isSelected = day === selectedDay;
          const inMonth = day.startsWith(monthPrefix);

          return (
            <button
              key={day}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${day}, ${dayEvents.length} événement(s)`}
              onClick={() => onSelectDay(day)}
              className={`flex h-12 flex-col items-center justify-center gap-1 rounded-xl ${
                isSelected
                  ? "bg-ink text-bg"
                  : day === today
                    ? "border border-amber text-amber"
                    : inMonth
                      ? "text-ink"
                      : "text-muted/40"
              }`}
            >
              {/* "2026-11-09" → 9 */}
              <span className="text-[15px] leading-none">
                {Number(day.slice(8))}
              </span>

              {/* h-1.5 même sans point : les numéros restent alignés. */}
              <span className="flex h-1.5 gap-0.5">
                {dayEvents.slice(0, MAX_DOTS).map((event) => (
                  <MemberDot
                    key={`${event.id}-${event.day}`}
                    member={event.member}
                    size={6}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
 * components/app/WeekTabs.tsx — les 4 boutons des semaines du mois
 *
 *   ┌──────┬──────┬──────┬──────┐
 *   │  S1  │ [S2] │  S3  │  S4  │   la semaine choisie est pleine
 *   │ 2–8  │ 9–15 │16–22 │23–6  │   ses dates
 *   │  ·   │  ••  │      │  •   │   un point par séance
 *   └──────┴──────┴──────┴──────┘
 *
 * Au-delà de 3 séances, les points laissent place à un chiffre : ils ne
 * tiendraient plus dans le bouton.
 *
 * Comme MonthCalendar, le composant ne parle jamais à l'API : il reçoit
 * les semaines déjà remplies et prévient la page quand on en touche une.
 * ========================================================================== */

"use client";

import { CATEGORY_LOOKS } from "@/lib/priority-categories";
import { countLabel, weekLabel, type WorkoutWeek } from "@/lib/workouts";

/* Au-delà, un chiffre remplace les points. */
const MAX_DOTS = 3;

/* La couleur du sport, la même que les priorités « Sport ». */
const SPORT_COLOR = `var(--color-${CATEGORY_LOOKS.sport.tone})`;

/** « 9–15 », ou « 23–6 » quand la semaine 4 déborde : le jour seulement,
 *  le mois est déjà écrit au-dessus. */
function compactDates(week: WorkoutWeek): string {
  return `${Number(week.start.slice(8))}–${Number(week.end.slice(8))}`;
}

export default function WeekTabs({
  weeks,
  selected,
  onSelect,
}: {
  weeks: WorkoutWeek[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Semaines du mois"
      className="grid grid-cols-4 gap-2"
    >
      {weeks.map((week, index) => {
        const isSelected = index === selected;
        const count = week.workouts.length;

        return (
          <button
            key={week.start}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-label={`Semaine ${index + 1}, ${weekLabel(week)}, ${countLabel("séance", count, "aucune séance")}`}
            onClick={() => onSelect(index)}
            className={`flex min-h-11 flex-col items-center gap-0.5 rounded-xl border px-1 py-2 transition-colors ${
              isSelected
                ? "border-ink bg-ink text-bg"
                : "border-ink/15 text-ink active:bg-ink/10"
            }`}
          >
            <span className="text-[15px] font-semibold">S{index + 1}</span>
            <span
              className={`text-xs tabular-nums ${isSelected ? "text-bg/70" : "text-muted"}`}
            >
              {compactDates(week)}
            </span>

            {/* Les séances : des points, ou un chiffre au-delà de 3. Une
                hauteur fixe garde les 4 boutons alignés, même vides. */}
            <span className="flex h-2.5 items-center gap-1" aria-hidden>
              {count > MAX_DOTS ? (
                <span
                  className="text-[11px] leading-none font-semibold"
                  style={{ color: isSelected ? undefined : SPORT_COLOR }}
                >
                  {count}
                </span>
              ) : (
                Array.from({ length: count }, (_, dot) => (
                  <span
                    key={dot}
                    className="size-1.5 rounded-full"
                    style={{
                      backgroundColor: isSelected
                        ? "currentColor"
                        : SPORT_COLOR,
                    }}
                  />
                ))
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

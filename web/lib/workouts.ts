/* ==========================================================================
 * lib/workouts.ts — ranger les séances par semaine, et les résumer
 *
 * UN MOIS D'ENTRAÎNEMENT = TOUJOURS 4 SEMAINES
 *
 * La semaine 1 commence le PREMIER LUNDI du mois. Les semaines 1 à 3 font
 * 7 jours ; la semaine 4 va jusqu'à la veille du premier lundi du mois
 * suivant (7 à 13 jours). Novembre 2026 :
 *
 *   S1  lun 2  → dim 8
 *   S2  lun 9  → dim 15
 *   S3  lun 16 → dim 22
 *   S4  lun 23 → dim 6 décembre      (décembre commence le lundi 7)
 *
 * Les jours d'avant le premier lundi appartiennent donc au mois précédent :
 * le dimanche 1er novembre 2026 est dans la semaine 4 d'octobre. Chaque
 * jour tombe ainsi dans exactement une semaine : aucune séance perdue.
 *
 * Aucune fonction de ce fichier ne parle à l'API ni à React : elles sont
 * testées à part (voir workouts.test.ts, juste à côté).
 * ========================================================================== */

import { addDays, firstOfMonth, shiftMonth, type IsoDay } from "@/lib/calendar";
import { capitalize } from "@/lib/time";
import type { Workout, WorkoutExercise, WorkoutSet } from "@/lib/types";

/* Un mois d'entraînement compte toujours 4 semaines. */
export const WEEKS_PER_MONTH = 4;

/* --------------------------------------------------------------------------
 * 1. Les 4 semaines d'un mois
 * -------------------------------------------------------------------------- */

/** Le premier lundi du mois : firstMonday(2026, 11) → "2026-11-02". */
export function firstMonday(year: number, month: number): IsoDay {
  const first = firstOfMonth(year, month);
  /* getUTCDay compte dimanche = 0, lundi = 1… « (8 - jour) % 7 » donne le
   * nombre de jours jusqu'au lundi suivant : 0 si le 1er est un lundi,
   * 1 si c'est un dimanche, 6 si c'est un mardi. */
  const weekday = new Date(`${first}T00:00:00Z`).getUTCDay();
  return addDays(first, (8 - weekday) % 7);
}

export type TrainingWeek = {
  /** Le lundi qui ouvre la semaine. */
  start: IsoDay;
  /** Son dernier jour (un dimanche) : 6 jours après start, ou plus pour la
   *  semaine 4. */
  end: IsoDay;
};

/** Les 4 semaines du mois d'entraînement, la dernière allongée jusqu'à la
 *  veille du premier lundi du mois suivant. */
export function trainingWeeks(year: number, month: number): TrainingWeek[] {
  const start = firstMonday(year, month);
  const next = shiftMonth(year, month, 1);
  const monthEnd = addDays(firstMonday(next.year, next.month), -1);

  return Array.from({ length: WEEKS_PER_MONTH }, (_, index) => {
    const weekStart = addDays(start, index * 7);
    const isLast = index === WEEKS_PER_MONTH - 1;
    return { start: weekStart, end: isLast ? monthEnd : addDays(weekStart, 6) };
  });
}

/** Le mois d'entraînement d'un jour. Le 3 décembre 2026 est encore dans la
 *  semaine 4 de novembre (décembre commence le lundi 7) : → novembre. */
export function trainingMonthOf(day: IsoDay): { year: number; month: number } {
  const calendarMonth = {
    year: Number(day.slice(0, 4)),
    month: Number(day.slice(5, 7)),
  };
  /* Avant le premier lundi de son mois, un jour appartient au mois d'avant. */
  if (day < firstMonday(calendarMonth.year, calendarMonth.month)) {
    return shiftMonth(calendarMonth.year, calendarMonth.month, -1);
  }
  return calendarMonth;
}

/* --------------------------------------------------------------------------
 * 2. Ranger les séances dans leur semaine
 * -------------------------------------------------------------------------- */
export type WorkoutWeek = TrainingWeek & {
  /** Les séances de la semaine, dans l'ordre où l'API les a renvoyées
   *  (par jour). */
  workouts: Workout[];
};

/** Les 4 semaines du mois, chacune avec ses séances. Une séance hors du
 *  mois d'entraînement est ignorée. */
export function groupByWeek(
  year: number,
  month: number,
  workouts: readonly Workout[],
): WorkoutWeek[] {
  return trainingWeeks(year, month).map((week) => ({
    ...week,
    /* Les jours « AAAA-MM-JJ » se comparent comme du texte. */
    workouts: workouts.filter((w) => w.day >= week.start && w.day <= week.end),
  }));
}

/** La semaine à montrer en arrivant : celle qui contient « day » (en
 *  général aujourd'hui), sinon la première. */
export function defaultWeekIndex(
  weeks: readonly TrainingWeek[],
  day: IsoDay,
): number {
  const index = weeks.findIndex((w) => day >= w.start && day <= w.end);
  return index === -1 ? 0 : index;
}

/* --------------------------------------------------------------------------
 * 3. Écrire une semaine : « 9 – 15 nov. »
 * -------------------------------------------------------------------------- */

/* timeZone: "UTC" : comme dans lib/calendar.ts, nos jours sont lus à minuit
 * UTC ; un autre fuseau pourrait donner la veille. */
const SHORT_DAY_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "UTC",
  day: "numeric",
  month: "short",
});

function shortDay(day: IsoDay): string {
  return SHORT_DAY_FORMATTER.format(new Date(`${day}T00:00:00Z`));
}

const WEEKDAY_SHORT_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** « Lun. 9 nov. » : le jour d'une séance repliée, court mais complet. */
export function shortDayLabel(day: IsoDay): string {
  return capitalize(
    WEEKDAY_SHORT_FORMATTER.format(new Date(`${day}T00:00:00Z`)),
  );
}

/** « 9 – 15 nov. », ou « 30 nov. – 6 déc. » quand la semaine change de mois. */
export function weekLabel(week: TrainingWeek): string {
  const sameMonth = week.start.slice(0, 7) === week.end.slice(0, 7);
  const from = sameMonth
    ? String(Number(week.start.slice(8)))
    : shortDay(week.start);
  return `${from} – ${shortDay(week.end)}`;
}

/* --------------------------------------------------------------------------
 * 4. Résumer un exercice : « 3 séries · max 80 kg »
 * -------------------------------------------------------------------------- */

/** Un poids lisible à la française : 62.5 → « 62,5 kg ». */
export function formatKg(weight: number): string {
  return `${weight.toLocaleString("fr-FR")} kg`;
}

/** « 1 série · 20 reps » au poids du corps, sinon « 3 séries · max 80 kg ». */
export function exerciseSummary(exercise: WorkoutExercise): string {
  const count = exercise.sets.length;
  const series = `${count} série${count > 1 ? "s" : ""}`;

  const weights = exercise.sets
    .map((s) => s.weight_kg)
    .filter((w): w is number => w !== null);

  if (weights.length === 0) {
    const reps = exercise.sets.reduce((total, s) => total + s.reps, 0);
    return `${series} · ${reps} reps`;
  }
  return `${series} · max ${formatKg(Math.max(...weights))}`;
}

/* --------------------------------------------------------------------------
 * 5. Compter : « 2 séances », « 1 exo », « Aucune séance »
 * -------------------------------------------------------------------------- */

/** Un nombre et son mot, au pluriel s'il le faut ; à zéro, « none ».
 *  Le mot de zéro est donné par l'appelant, car il dépend du genre :
 *  countLabel("séance", 0, "Aucune séance"), countLabel("exo", 0, "Aucun exo"). */
export function countLabel(word: string, count: number, none: string): string {
  if (count === 0) return none;
  return `${count} ${word}${count > 1 ? "s" : ""}`;
}

/* --------------------------------------------------------------------------
 * 6. La page d'un exercice, à la salle
 * -------------------------------------------------------------------------- */

/** Le pas des boutons − et + du poids : 2,5 kg, la plus petite paire de
 *  disques courante en salle. */
export const WEIGHT_STEP_KG = 2.5;

/** La série qu'on prépare : des reps, et des kilos (0 = poids du corps). */
export type SetValues = { reps: number; kg: number };

/** Avec quoi préremplir la prochaine série :
 *   - la série d'avant de cet exercice (on refait souvent la même) ;
 *   - sinon la première série de « la dernière fois » ;
 *   - sinon 10 reps au poids du corps. */
export function nextSetValues(
  currentSets: readonly WorkoutSet[],
  previousSets: readonly WorkoutSet[] | null,
): SetValues {
  const model = currentSets.at(-1) ?? previousSets?.[0];
  if (model === undefined) return { reps: 10, kg: 0 };
  return { reps: model.reps, kg: model.weight_kg ?? 0 };
}

/** Un cran de poids en plus (+1) ou en moins (-1), jamais sous 0.
 *  On repart d'un multiple de 2,5 : 61 + 1 cran → 62,5, pas 63,5. */
export function stepWeight(kg: number, direction: 1 | -1): number {
  const steps = kg / WEIGHT_STEP_KG;
  const next = direction === 1 ? Math.floor(steps) + 1 : Math.ceil(steps) - 1;
  return Math.max(0, next * WEIGHT_STEP_KG);
}

/** 90 → « 1:30 », 5 → « 0:05 ». */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Une série en court : « 8×50 », ou « 20 » au poids du corps. */
export function shortSet(set: WorkoutSet): string {
  return set.weight_kg === null
    ? String(set.reps)
    : `${set.reps}×${set.weight_kg.toLocaleString("fr-FR")}`;
}

/** Toutes les séries d'un exercice : « 8×50 · 8×50 · 6×55 ». */
export function setsLine(sets: readonly WorkoutSet[]): string {
  return sets.map(shortSet).join(" · ");
}

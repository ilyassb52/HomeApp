/* ==========================================================================
 * lib/calendar.ts — compter les jours, pour l'agenda
 *
 * L'agenda manipule des JOURS, pas des instants : « le 19 novembre », sans
 * heure ni fuseau. On les écrit donc comme l'API : un simple texte
 * « AAAA-MM-JJ » (« 2026-11-19 »). Deux avantages :
 *
 *   - on les compare directement : "2026-11-19" < "2026-11-20" ;
 *   - aucun fuseau ne peut décaler un jour d'une case.
 *
 * Pour compter (ajouter des jours, trouver le lundi), on passe un instant
 * par Date en UTC, jamais en heure locale : en UTC, il n'y a pas de passage
 * à l'heure d'été qui ferait sauter ou doubler un jour.
 *
 * Une seule fonction lit l'heure : parisToday, par lib/time.ts.
 * ========================================================================== */

import { capitalize, TIME_ZONE } from "@/lib/time";

/** Un jour, écrit « AAAA-MM-JJ ». */
export type IsoDay = string;

/* --------------------------------------------------------------------------
 * 1. Aujourd'hui, à Paris
 * -------------------------------------------------------------------------- */

/* en-CA : le format canadien écrit les dates « 2026-11-19 », exactement
 * notre format. Construit une seule fois, comme dans lib/time.ts. */
const ISO_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Le jour qu'il est à Paris, même si la machine est réglée ailleurs. */
export function parisToday(now: Date = new Date()): IsoDay {
  return ISO_DAY_FORMATTER.format(now);
}

/* --------------------------------------------------------------------------
 * 2. Compter les jours
 * -------------------------------------------------------------------------- */

/** "2026-11-19" → un instant à minuit UTC ce jour-là. */
function toUtc(day: IsoDay): Date {
  const [year, month, date] = day.split("-").map(Number);
  /* Les mois de Date comptent à partir de 0 : janvier = 0. */
  return new Date(Date.UTC(year, month - 1, date));
}

function fromUtc(instant: Date): IsoDay {
  /* toISOString écrit « 2026-11-19T00:00:00.000Z » : on garde le jour. */
  return instant.toISOString().slice(0, 10);
}

/** addDays("2026-12-31", 1) → "2027-01-01". */
export function addDays(day: IsoDay, count: number): IsoDay {
  const instant = toUtc(day);
  instant.setUTCDate(instant.getUTCDate() + count);
  return fromUtc(instant);
}

/** Le premier jour d'un mois : firstOfMonth(2026, 11) → "2026-11-01". */
export function firstOfMonth(year: number, month: number): IsoDay {
  return fromUtc(new Date(Date.UTC(year, month - 1, 1)));
}

/** Le mois d'avant ou d'après : shiftMonth(2026, 12, 1) → { 2027, 1 }. */
export function shiftMonth(year: number, month: number, count: number) {
  const instant = new Date(Date.UTC(year, month - 1 + count, 1));
  return { year: instant.getUTCFullYear(), month: instant.getUTCMonth() + 1 };
}

/* --------------------------------------------------------------------------
 * 3. La grille d'un mois
 *
 * Les semaines du calendrier, du lundi au dimanche : la première contient
 * le 1er du mois, la dernière contient son dernier jour. Les cases d'avant
 * et d'après appartiennent aux mois voisins (affichées en grisé).
 * -------------------------------------------------------------------------- */
export function monthGrid(year: number, month: number): IsoDay[][] {
  const first = firstOfMonth(year, month);
  const last = addDays(firstOfMonth(year, month + 1), -1);

  /* getUTCDay compte dimanche = 0, lundi = 1… « + 6) % 7 » donne le nombre
   * de jours depuis le lundi : 0 pour lundi, 6 pour dimanche. */
  const daysSinceMonday = (toUtc(first).getUTCDay() + 6) % 7;

  const weeks: IsoDay[][] = [];
  let day = addDays(first, -daysSinceMonday);
  while (day <= last) {
    const week: IsoDay[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(day);
      day = addDays(day, 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/* --------------------------------------------------------------------------
 * 4. Écrire les jours en toutes lettres
 *
 * timeZone: "UTC" : nos instants sont à minuit UTC (voir toUtc). Les lire
 * dans un autre fuseau pourrait donner la veille.
 * -------------------------------------------------------------------------- */
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
});

const LONG_DAY_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

const MONTH_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

/** « Aujourd'hui », « Demain », sinon « Jeudi 19 » : pour le miroir, où
 *  tout tient dans la semaine qui vient. */
export function dayLabel(day: IsoDay, today: IsoDay): string {
  if (day === today) return "Aujourd'hui";
  if (day === addDays(today, 1)) return "Demain";
  return capitalize(WEEKDAY_FORMATTER.format(toUtc(day)));
}

/** « Jeudi 19 novembre » : pour le téléphone, qui navigue de mois en mois. */
export function longDayLabel(day: IsoDay): string {
  return capitalize(LONG_DAY_FORMATTER.format(toUtc(day)));
}

/** « Novembre 2026 ». */
export function monthLabel(year: number, month: number): string {
  return capitalize(MONTH_FORMATTER.format(toUtc(firstOfMonth(year, month))));
}

/** L'heure renvoyée par l'API, « 14:30:00 », sans les secondes : « 14:30 ». */
export function shortTime(time: string): string {
  return time.slice(0, 5);
}

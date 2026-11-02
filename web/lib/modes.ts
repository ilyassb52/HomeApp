/* ==========================================================================
 * lib/modes.ts — quel mode l'écran doit-il afficher ?
 *
 * Quatre moments de la journée, quatre écrans : matin, soir, week-end, veille.
 * Ce fichier contient la règle qui choisit, et rien d'autre : pas de React,
 * pas d'affichage. C'est volontaire, et c'est ce qui permet de la tester
 * (voir modes.test.ts, juste à côté).
 *
 * LE PIÈGE : « EN HEURE DE PARIS »
 *
 * date.getHours() donne l'heure DE LA MACHINE. Sur ton PC à Paris, tout a
 * l'air juste — et c'est précisément ce qui rend l'erreur dangereuse : elle
 * ne se voit qu'ailleurs. Un test lancé sur une autre machine, ou le jour où
 * le miroir tourne sur un Raspberry Pi mal réglé, et l'écran du matin
 * s'affiche le soir.
 *
 * On passe donc par Intl.DateTimeFormat avec un timeZone explicite, qui
 * répond toujours la même chose quelle que soit la machine.
 * ========================================================================== */

import { TIME_ZONE } from "@/lib/time";
import type { Mode } from "@/lib/types";

/* --------------------------------------------------------------------------
 * 1. Les heures de bascule
 *
 * Regroupées ici, comme le demande le brief, pour être modifiables sans
 * relire la logique. Chaque heure est le MOMENT OÙ LE MODE COMMENCE :
 * DAY_START_HOUR = 6 signifie que 5 h 59 est encore la nuit, 6 h 00 le jour.
 *
 * Le fuseau, lui, est déclaré dans lib/time.ts : il sert aussi à l'horloge
 * et au pied de page, et il n'existe qu'à un seul endroit dans le projet.
 * -------------------------------------------------------------------------- */

/** Fin de la veille : l'écran se rallume à 6 h 00. */
export const DAY_START_HOUR = 6;

/** En semaine, le mode soir prend le relais du matin à 15 h 00. */
export const EVENING_START_HOUR = 15;

/** Début de la veille : l'écran s'éteint à 23 h 00. */
export const SLEEP_START_HOUR = 23;

/* --------------------------------------------------------------------------
 * 2. Lire l'heure de Paris
 *
 * formatToParts découpe la date en morceaux nommés — année, mois, jour,
 * heure — au lieu d'un texte à redécouper soi-même.
 *
 * Pour le jour de la semaine, on ne demande pas « lundi » : comparer des
 * noms de jours dépendrait de la langue. On reconstruit plutôt une date à
 * partir du calendrier parisien, et on lui demande son numéro de jour.
 * 0 = dimanche, 6 = samedi, comme partout en JavaScript.
 * -------------------------------------------------------------------------- */
const PARIS_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  /* hourCycle h23 force le format 0–23. Sans lui, certains navigateurs
   * renvoient « 24 » pour minuit, ce qui fausserait les comparaisons. */
  hourCycle: "h23",
});

function readParisDateTime(date: Date): { hour: number; dayOfWeek: number } {
  /* Map<string, string> est précisé explicitement : sans cela, TypeScript
   * déduit de formatToParts un type de clé très étroit, qui refuserait la
   * lecture par un simple texte juste en dessous. */
  const parts = new Map<string, string>(
    PARIS_FORMATTER.formatToParts(date).map((part) => [part.type, part.value]),
  );

  const read = (type: string) => Number(parts.get(type) ?? "0");

  const year = read("year");
  const month = read("month");
  const day = read("day");
  const hour = read("hour");

  /* Date.UTC évite que cette reconstruction soit à son tour décalée par le
   * fuseau de la machine : on travaille sur un calendrier neutre. */
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return { hour, dayOfWeek };
}

/* --------------------------------------------------------------------------
 * 3. La règle
 *
 * Les conditions sont vérifiées DANS CET ORDRE, celui du brief. L'ordre fait
 * partie de la règle : la veille l'emporte sur tout le reste, y compris le
 * week-end, sinon un samedi à minuit afficherait l'écran du week-end.
 * -------------------------------------------------------------------------- */
export function getMode(date: Date): Mode {
  const { hour, dayOfWeek } = readParisDateTime(date);

  // 23 h 00 → 5 h 59, tous les jours.
  if (hour >= SLEEP_START_HOUR || hour < DAY_START_HOUR) {
    return "sleep";
  }

  // Samedi ou dimanche, entre 6 h 00 et 22 h 59.
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekend) {
    return "weekend";
  }

  // Du lundi au vendredi : matin jusqu'à 14 h 59, soir ensuite.
  return hour < EVENING_START_HOUR ? "morning" : "evening";
}

/* --------------------------------------------------------------------------
 * 4. Le mode forcé par l'URL
 *
 * ?mode=evening permet de regarder n'importe quel écran sans attendre
 * l'heure correspondante. Indispensable pour travailler sur l'écran du soir
 * à 10 h du matin.
 *
 * Une valeur inconnue n'est pas une erreur fatale : on la signale et on
 * revient à l'heure réelle. Un paramètre mal tapé ne doit pas vider l'écran.
 * -------------------------------------------------------------------------- */
const ALL_MODES: readonly Mode[] = ["morning", "evening", "weekend", "sleep"];

export function parseMode(value: string | null): Mode | null {
  if (value === null) {
    return null;
  }

  const match = ALL_MODES.find((mode) => mode === value);
  if (!match) {
    console.warn(
      `[modes] Le paramètre ?mode=${value} ne correspond à aucun mode connu (${ALL_MODES.join(", ")}). L'heure réelle est utilisée.`,
    );
    return null;
  }

  return match;
}

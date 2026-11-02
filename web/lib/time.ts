/* ==========================================================================
 * lib/time.ts — lire l'heure de Paris, partout de la même façon
 *
 * Trois endroits ont besoin de l'heure parisienne : l'horloge, le pied de
 * page, et le calcul du mode. Tant qu'il n'y en avait qu'un, le format vivait
 * dans Clock.tsx. Ils sont maintenant trois : la règle déménage ici.
 *
 * L'intérêt n'est pas d'économiser des lignes, c'est qu'il n'existe plus
 * qu'UNE façon de lire l'heure dans le projet. Personne ne peut écrire
 * date.getHours() par distraction et obtenir l'heure de la machine.
 * ========================================================================== */

/** Le fuseau du foyer. Toute lecture d'heure passe par lui. */
export const TIME_ZONE = "Europe/Paris";

/* Les formats sont construits une seule fois, hors des fonctions : un
 * Intl.DateTimeFormat est coûteux à fabriquer, et ceux-ci ne changent jamais.
 * L'horloge les appelle chaque seconde. */
const TIME_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** « 07:05 », en heure de Paris. */
export function formatParisTime(date: Date): string {
  return TIME_FORMATTER.format(date);
}

/** « Lundi 26 octobre », en heure de Paris.
 *  Le français n'écrit pas les jours avec une majuscule, mais le brief
 *  demande cette forme à l'écran. */
export function formatParisDate(date: Date): string {
  const text = DATE_FORMATTER.format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ==========================================================================
 * lib/mirror-pixels.ts — convertir des « pixels miroir » en taille réelle
 *
 * Le miroir est fluide : un pixel du design vaut var(--mp) à l'écran, une
 * valeur qui suit la taille de la tablette (voir .mirror-screen dans
 * app/globals.css).
 *
 * Dans les classes, on écrit text-mp-34 ou gap-mp-18. Mais certaines
 * tailles sont calculées pendant l'exécution (la taille d'une icône reçue
 * en paramètre, par exemple) et passent donc par style={{…}}. Cette
 * fonction fabrique la même formule pour ces cas-là.
 * ========================================================================== */

/**
 * mp(40) → "calc(40 * var(--mp, 1px))"
 *
 * Hors du miroir (pages /app), --mp n'existe pas : la valeur de secours
 * 1px redonne exactement 40 px, comme avant.
 */
export function mp(designPixels: number): string {
  return `calc(${designPixels} * var(--mp, 1px))`;
}

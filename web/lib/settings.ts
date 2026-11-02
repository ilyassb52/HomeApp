/* ==========================================================================
 * lib/settings.ts — lire les réglages d'un widget sans risque
 *
 * LE PROBLÈME
 *
 * Les réglages viennent de config/layouts.json, que l'appli téléphone pourra
 * modifier à l'étape 4. TypeScript les décrit donc comme
 * Record<string, unknown> : « des clés texte, dont on ne sait rien ».
 *
 * « unknown » est volontairement intraitable : on ne peut pas l'afficher ni
 * le calculer sans vérifier d'abord ce que c'est. C'est exactement ce qu'on
 * veut — rien ne garantit que "max" contienne un nombre plutôt que le texte
 * "trois", ou rien du tout.
 *
 * Ces trois fonctions font la vérification une bonne fois, et rendent soit la
 * valeur attendue, soit la valeur par défaut. Les widgets n'ont plus à s'en
 * soucier et n'affichent jamais « undefined » à l'écran.
 *
 * Les clés acceptées par chaque widget sont listées en section 10 du brief.
 * ========================================================================== */

type Settings = Record<string, unknown> | undefined;

/** Un nombre entier positif, par exemple le « max » des priorités. */
export function readNumberSetting(
  settings: Settings,
  key: string,
  fallback: number,
): number {
  const value = settings?.[key];

  /* Number.isFinite écarte d'un coup les textes, null, undefined, et aussi
   * NaN et l'infini, qui sont pourtant des nombres pour JavaScript. */
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

/** Un texte, par exemple les deux côtés du pied de page. */
export function readTextSetting(
  settings: Settings,
  key: string,
  fallback: string,
): string {
  const value = settings?.[key];
  return typeof value === "string" ? value : fallback;
}

/** Un oui/non, par exemple « showMoon » sur l'horloge du soir. */
export function readBooleanSetting(
  settings: Settings,
  key: string,
  fallback: boolean,
): boolean {
  const value = settings?.[key];
  return typeof value === "boolean" ? value : fallback;
}

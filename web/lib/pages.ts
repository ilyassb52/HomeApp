/* ==========================================================================
 * lib/pages.ts — retrouver une page du miroir à partir de l'URL
 *
 * /mirror?page=evening ouvre directement la page du soir, sans cliquer sur
 * le bouton. Indispensable pour travailler sur une page précise, et pour
 * pouvoir plus tard ouvrir une page depuis le téléphone.
 *
 * La liste des pages, elle, vit dans components/mirror/pages/index.ts : elle
 * contient des composants React. Ce fichier-ci n'en contient aucun, ce qui
 * permet de le tester à part (voir pages.test.ts, juste à côté).
 * ========================================================================== */

/**
 * La position de la page demandée dans la liste.
 *
 * Sans paramètre, c'est la première page. Une valeur inconnue n'est pas une
 * erreur fatale : on la signale et on revient à la première page. Un
 * paramètre mal tapé ne doit pas vider l'écran.
 */
export function findPageIndex(
  pageIds: readonly string[],
  requested: string | null,
): number {
  if (requested === null) {
    return 0;
  }

  const index = pageIds.indexOf(requested);
  if (index === -1) {
    console.warn(
      `[pages] Le paramètre ?page=${requested} ne correspond à aucune page connue (${pageIds.join(", ")}). La première page est affichée.`,
    );
    return 0;
  }

  return index;
}

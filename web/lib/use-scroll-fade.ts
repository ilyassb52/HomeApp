/* ==========================================================================
 * lib/use-scroll-fade.ts — le fondu en bas d'une liste qui défile
 *
 * Né dans le widget Priorities ; l'agenda en a eu besoin à son tour, il est
 * donc rangé ici (factoriser à la deuxième occurrence).
 *
 * LE FONDU, SEULEMENT S'IL RESTE QUELQUE CHOSE À VOIR EN DESSOUS
 *
 * Le fondu (.scroll-fade, globals.css) est posé sur la boîte qui défile, pas
 * sur son contenu : il rend toujours transparents les 15 % du bas du cadre.
 * Si on le laissait tout le temps, il cacherait la dernière ligne une fois
 * arrivé au bout — ou dès le départ, quand tout tient.
 *
 * Plutôt que de compter les lignes (une ligne longue en prend deux, et la
 * hauteur peut changer), on MESURE la liste : atEnd vaut vrai quand on voit
 * déjà son bas. Le fondu ne s'affiche que sinon.
 *
 * UTILISATION
 *
 *   const { listRef, onScroll, fadeClass } = useScrollFade(data);
 *   <div ref={listRef} onScroll={onScroll}
 *        className={`max-h-mp-440 overflow-y-auto ${fadeClass}`}>
 *
 * On déstructure tout de suite : la règle ESLint « react-hooks/refs »
 * prendrait sinon tout l'objet pour une ref, et refuserait qu'on lise
 * fadeClass pendant le rendu.
 *
 * Le hook doit être appelé avant tout « return null » du widget : React
 * exige que les hooks soient appelés à chaque rendu, dans le même ordre.
 * ========================================================================== */

import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * @param content ce qui, en changeant, change la hauteur de la liste (les
 *                données affichées) : on remesure à chaque changement.
 */
export function useScrollFade(content: unknown) {
  const listRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  /* useCallback garde la même fonction d'un rendu à l'autre : elle peut
   * ainsi servir de dépendance à useLayoutEffect sans le relancer pour
   * rien. */
  const check = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    /* scrollTop : ce qu'on a déjà fait défiler ; clientHeight : la hauteur
     * visible ; scrollHeight : la hauteur totale du contenu. Le « - 1 »
     * absorbe les arrondis de pixels (les tailles miroir sont des calculs
     * avec --mp, rarement des nombres entiers). Si tout tient sans défiler,
     * les deux côtés sont égaux : atEnd vaut vrai, pas de fondu. */
    setAtEnd(list.scrollTop + list.clientHeight >= list.scrollHeight - 1);
  }, []);

  /* useLayoutEffect mesure avant que l'écran soit dessiné : le fondu
   * n'apparaît pas une fraction de seconde pour rien. */
  useLayoutEffect(check, [check, content]);

  return { listRef, onScroll: check, fadeClass: atEnd ? "" : "scroll-fade" };
}

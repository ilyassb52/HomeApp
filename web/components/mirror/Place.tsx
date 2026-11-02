/* ==========================================================================
 * components/mirror/Place.tsx — poser un widget à une position exacte
 *
 * Chaque widget d'une page est enveloppé dans un <Place>, qui dit où il se
 * pose sur la toile de référence (1080 × 1920 debout, 1920 × 1080 couchée) :
 *
 *   <Place portrait={{ x: 72, y: 72 }} landscape={{ x: 72, y: 72, w: 560 }}>
 *     <Clock />
 *   </Place>
 *
 * x et y sont le coin haut-gauche du widget, en pixels miroir. w, facultatif,
 * est sa largeur — utile pour une carte, qui sinon serait aussi étroite que
 * son texte. Deux positions, parce qu'une tablette couchée n'a pas la même
 * forme qu'une tablette debout.
 *
 * Aucun JavaScript ne mesure l'écran : Place écrit seulement les nombres
 * dans des variables CSS, et la classe .place (app/globals.css) choisit la
 * bonne paire selon le sens de l'écran. Quand la tablette pivote, le
 * navigateur bascule tout seul.
 * ========================================================================== */

import type { CSSProperties, ReactNode } from "react";

/** Une position sur la toile, en pixels miroir. */
export type Position = { x: number; y: number; w?: number };

/** Le texte affiché en mode calibrage : « x 72 · y 72 · w 560 ». */
function describe({ x, y, w }: Position): string {
  return w === undefined ? `x ${x} · y ${y}` : `x ${x} · y ${y} · w ${w}`;
}

export default function Place({
  portrait,
  landscape,
  children,
}: {
  portrait: Position;
  landscape: Position;
  children: ReactNode;
}) {
  /* TypeScript ne connaît pas nos variables --px, --py… : le « as » lui
   * confirme que cet objet est bien un style valide. Une largeur absente
   * reste undefined, et React n'écrit alors pas la variable du tout. */
  const style = {
    "--px": portrait.x,
    "--py": portrait.y,
    "--pw": portrait.w,
    "--lx": landscape.x,
    "--ly": landscape.y,
    "--lw": landscape.w,
  } as CSSProperties;

  return (
    <div
      className="place"
      style={style}
      data-portrait={describe(portrait)}
      data-landscape={describe(landscape)}
    >
      {children}
    </div>
  );
}

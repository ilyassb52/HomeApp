/* ==========================================================================
 * Smiley — la salutation du matin. Le visage flotte, et les yeux clignent
 * brièvement toutes les quatre secondes.
 *
 * Seule icône à superposer deux animations : le mouvement du visage est posé
 * sur le groupe entier, celui des yeux sur les yeux seuls. Chaque élément SVG
 * ne peut porter qu'une animation — on les empile donc par niveaux.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Smiley({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <g className="icon-part animate-bob">
        <circle cx="12" cy="12" r="9" />

        {/* Les paupières s'écrasent verticalement : des traits courts plutôt
            que des points, pour que l'écrasement se voie. */}
        <g className="icon-part animate-blink">
          <path d="M9 10.2v1.4" strokeWidth={2} />
          <path d="M15 10.2v1.4" strokeWidth={2} />
        </g>

        <path d="M8.2 14.6a4.6 4.6 0 0 0 7.6 0" />
      </g>
    </IconBase>
  );
}

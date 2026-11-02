/* ==========================================================================
 * Moon — météo de nuit et en-tête du mode soir. Le croissant monte et
 * descend doucement, les trois étoiles scintillent en décalé.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

/* Les étoiles : position sur la grille de 24, taille, et retard de départ.
 * Les décaler évite l'effet « guirlande » où tout clignote ensemble. */
const STARS = [
  { x: 5, y: 5.5, r: 1, delay: "0s" },
  { x: 18.5, y: 8, r: 0.8, delay: "0.7s" },
  { x: 7, y: 18.5, r: 0.7, delay: "1.4s" },
];

export default function Moon({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <path
        className="icon-part animate-bob"
        /* Un croissant se dessine avec deux arcs : un grand disque, puis une
           morsure décalée qui en retire une partie. */
        d="M15.8 4.2a7.6 7.6 0 1 0 4.4 9.6 6.3 6.3 0 0 1-4.4-9.6Z"
        fill="var(--color-moon)"
        stroke="none"
      />

      {STARS.map((star) => (
        <circle
          key={`${star.x}-${star.y}`}
          className="icon-part animate-twinkle"
          style={{ animationDelay: star.delay }}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill="var(--color-moon)"
          stroke="none"
        />
      ))}
    </IconBase>
  );
}

/* ==========================================================================
 * Confetti — la bannière du week-end. Cinq morceaux qui montent en tournant
 * puis s'effacent, chacun avec son retard et sa couleur.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

/* Chaque confetti a sa position, sa couleur et son retard. Les couleurs sont
 * prises dans les jetons de la section 4 : aucun hexadécimal ici. */
const PIECES = [
  { x: 4, y: 16, color: "var(--color-magenta)", delay: "0s" },
  { x: 8.5, y: 19, color: "var(--color-cyan)", delay: "0.4s" },
  { x: 12, y: 14.5, color: "var(--color-amber)", delay: "0.8s" },
  { x: 15.5, y: 19, color: "var(--color-neon-green)", delay: "1.2s" },
  { x: 19.5, y: 16, color: "var(--color-coral)", delay: "1.6s" },
];

export default function Confetti({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      {PIECES.map((piece) => (
        <rect
          key={`${piece.x}-${piece.y}`}
          className="icon-part animate-confetti"
          style={{ animationDelay: piece.delay }}
          x={piece.x}
          y={piece.y}
          width={2.6}
          height={2}
          rx={0.5}
          fill={piece.color}
          stroke="none"
        />
      ))}
    </IconBase>
  );
}

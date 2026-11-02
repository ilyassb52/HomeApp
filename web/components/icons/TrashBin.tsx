/* ==========================================================================
 * TrashBin — alerte « sortir les poubelles », le soir. Secousse brève, puis
 * repos : c'est l'immobilité qui rend la secousse visible de loin.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function TrashBin({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <g className="icon-part animate-wiggle">
        {/* Le couvercle et sa poignée. */}
        <path d="M3.6 6.6h16.8" />
        <path d="M9.6 6.6V4.8a1.2 1.2 0 0 1 1.2-1.2h2.4a1.2 1.2 0 0 1 1.2 1.2v1.8" />
        {/* Le corps, légèrement tronconique. */}
        <path d="M5.6 6.6h12.8l-1 12.4a1.8 1.8 0 0 1-1.8 1.6H8.4a1.8 1.8 0 0 1-1.8-1.6Z" />
        {/* Les stries verticales. */}
        <path d="M10.2 10.6v6" />
        <path d="M13.8 10.6v6" />
      </g>
    </IconBase>
  );
}

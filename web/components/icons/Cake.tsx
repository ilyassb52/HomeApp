/* ==========================================================================
 * Cake — les événements du week-end (anniversaires). Le gâteau flotte, et
 * la flamme de la bougie vacille à son propre rythme, comme dans Flame.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Cake({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <g className="icon-part animate-bob">
        {/* La flamme, posée sur la mèche : elle s'écrase sur sa base. */}
        <path
          className="icon-part--bottom animate-flicker"
          d="M12 1.6c1 .9 1.6 1.6 1.6 2.4a1.6 1.6 0 1 1-3.2 0c0-.8.6-1.5 1.6-2.4Z"
          fill="var(--color-amber)"
          stroke="none"
        />
        {/* La bougie. */}
        <path d="M12 5.6v3.2" />
        {/* L'étage supérieur, avec son glaçage ondulé. */}
        <path d="M5.6 12.4a2 2 0 0 1 2-2h8.8a2 2 0 0 1 2 2v1.2H5.6Z" />
        {/* L'étage inférieur. */}
        <path d="M4 13.6h16v5.2a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 18.8Z" />
      </g>
    </IconBase>
  );
}

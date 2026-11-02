/* ==========================================================================
 * SunCloud — météo « nuageux », et repli quand la condition est inconnue.
 * Le soleil tourne derrière, le nuage dérive devant.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function SunCloud({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      {/* Le soleil, décalé en haut à gauche pour dépasser du nuage. */}
      <g className="icon-part animate-spin" stroke="var(--color-amber)">
        <path d="M8.5 1.8v2" />
        <path d="M2.3 8h2" />
        <path d="m4 3.5 1.4 1.4" />
        <path d="m13 3.5-1.4 1.4" />
      </g>
      <circle cx="8.5" cy="8" r="3.2" fill="var(--color-amber)" stroke="none" />

      {/* Le nuage passe devant : il est écrit APRÈS dans le code, et en SVG
          ce qui vient après est dessiné par-dessus. Il est opaque pour
          masquer le bas du soleil. */}
      <path
        className="icon-part animate-drift"
        d="M7.5 20.5h9.8a3.4 3.4 0 0 0 .3-6.8 4.8 4.8 0 0 0-9.2-.8 3.3 3.3 0 0 0-.9 7.6Z"
        fill="var(--color-bg)"
        stroke="var(--color-cloud)"
      />
    </IconBase>
  );
}

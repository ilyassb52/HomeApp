/* ==========================================================================
 * Train — le widget transports. Va-et-vient horizontal : le train avance
 * puis revient, grâce à « alternate » déclaré avec l'animation.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Train({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <g className="icon-part animate-ride">
        {/* La caisse. */}
        <path d="M6 3.4h12a2 2 0 0 1 2 2v9.2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5.4a2 2 0 0 1 2-2Z" />
        {/* La baie vitrée, d'un seul tenant. */}
        <path d="M4 10.2h16" />
        {/* Les roues. */}
        <circle cx="8" cy="19.4" r="1.6" />
        <circle cx="16" cy="19.4" r="1.6" />
        {/* Les marchepieds. */}
        <path d="M5.4 16.6 4 19.4" />
        <path d="m18.6 16.6 1.4 2.8" />
      </g>
    </IconBase>
  );
}

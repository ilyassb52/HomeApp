/* ==========================================================================
 * Cart — la liste de courses du foyer. Même secousse brève que la poubelle.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Cart({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <g className="icon-part animate-wiggle">
        {/* La poignée, puis le panier qui s'évase. */}
        <path d="M2.4 3.6h2.4l2.4 11.2h10.4" />
        <path d="M6.4 6.8h14.4l-1.8 6.4H7.8" />
        {/* Les roues. */}
        <circle cx="9.4" cy="19.4" r="1.5" />
        <circle cx="17" cy="19.4" r="1.5" />
      </g>
    </IconBase>
  );
}

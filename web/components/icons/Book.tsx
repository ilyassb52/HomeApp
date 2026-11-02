/* ==========================================================================
 * Book — la série « lecture » du widget habitudes. Livre fermé, vu de face,
 * qui grossit légèrement en rythme.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Book({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <g className="icon-part animate-pop">
        {/* La couverture. */}
        <path d="M5.4 3.6h11.2a2.4 2.4 0 0 1 2.4 2.4v14.4H7.8a2.4 2.4 0 0 1-2.4-2.4Z" />
        {/* Le dos, qui donne l'épaisseur. */}
        <path d="M5.4 17.6a2.4 2.4 0 0 1 2.4-2.4h11.2" />
        {/* Le marque-page. */}
        <path d="M15 3.6v6l-2-1.4-2 1.4v-6" />
      </g>
    </IconBase>
  );
}

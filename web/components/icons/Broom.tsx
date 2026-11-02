/* ==========================================================================
 * Broom — les tâches ménagères du week-end.
 *
 * icon-part--top et non icon-part : un balai est tenu par le haut du manche
 * et se balance autour de ce point, comme un pendule. Avec le centre par
 * défaut, le manche et la brosse partiraient en sens inverse.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Broom({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <g className="icon-part--top animate-sway">
        {/* Le manche. */}
        <path d="M12 2.4v9.2" />
        {/* La brosse, évasée vers le bas. */}
        <path d="M8.6 11.6h6.8l1.8 5.2a1.6 1.6 0 0 1-1.5 2.2H8.3a1.6 1.6 0 0 1-1.5-2.2Z" />
        {/* Les brins. */}
        <path d="M10.2 14.2v4.8" />
        <path d="M13.8 14.2v4.8" />
      </g>
    </IconBase>
  );
}

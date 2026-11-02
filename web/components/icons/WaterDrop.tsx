/* ==========================================================================
 * WaterDrop — la série « eau » du widget habitudes. Flotte doucement.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function WaterDrop({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <g className="icon-part animate-bob">
        {/* Une goutte : pointe en haut, ventre rond en bas. */}
        <path d="M12 2.8c3.4 4 6 6.9 6 10.2a6 6 0 0 1-12 0c0-3.3 2.6-6.2 6-10.2Z" />
        {/* Le reflet, qui donne le volume. */}
        <path d="M9.4 14.4a2.8 2.8 0 0 0 2 2.6" />
      </g>
    </IconBase>
  );
}

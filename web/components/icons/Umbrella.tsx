/* ==========================================================================
 * Umbrella — alerte « prends un parapluie ». Le parapluie flotte, deux
 * gouttes tombent devant lui.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

const DROPS = [
  { x: 5.5, delay: "0s" },
  { x: 18.5, delay: "0.5s" },
];

export default function Umbrella({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <g className="icon-part animate-bob">
        {/* La toile : un demi-cercle posé sur sa corde. */}
        <path d="M2.8 12a9.2 9.2 0 0 1 18.4 0Z" />
        {/* Le manche, avec sa crosse. */}
        <path d="M12 12v7.2a2 2 0 0 0 4 0" />
      </g>

      {DROPS.map((drop) => (
        <path
          key={drop.x}
          className="icon-part animate-drop"
          style={{ animationDelay: drop.delay }}
          d={`M${drop.x} 14.5v2.2`}
          stroke="var(--color-cyan)"
          strokeWidth={2}
        />
      ))}
    </IconBase>
  );
}

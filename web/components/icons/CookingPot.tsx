/* ==========================================================================
 * CookingPot — le menu du lendemain. La casserole ne bouge pas ; seules les
 * trois volutes de vapeur montent et s'effacent, en décalé.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

const STEAM = [
  { x: 8.5, delay: "0s" },
  { x: 12, delay: "0.8s" },
  { x: 15.5, delay: "1.6s" },
];

export default function CookingPot({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      {STEAM.map((wisp) => (
        <path
          key={wisp.x}
          className="icon-part animate-steam"
          style={{ animationDelay: wisp.delay }}
          /* Une volute : une courbe en S, pour éviter le trait droit qui
             ferait plutôt penser à une antenne. */
          d={`M${wisp.x} 8.4c-1.1-1 1.1-1.9 0-2.9`}
          /* L'opacité de repos est visible : si le système demande moins
             d'animations, la vapeur reste dessinée au lieu de disparaître. */
          opacity={0.8}
        />
      ))}

      {/* Le couvercle, avec ses deux anses. */}
      <path d="M3.4 11.4h17.2" />
      <path d="M2 11.4h2.4" />
      <path d="M19.6 11.4H22" />
      {/* Le corps. */}
      <path d="M5 11.4h14v6.2a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z" />
    </IconBase>
  );
}

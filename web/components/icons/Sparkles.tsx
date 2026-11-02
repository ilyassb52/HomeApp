/* ==========================================================================
 * Sparkles — la revue du soir, quand les objectifs sont atteints. Trois
 * étincelles de tailles différentes, qui scintillent en décalé.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

/* Une étincelle est une croix à branches incurvées. On la décrit par son
 * centre et son rayon, et le chemin est fabriqué plus bas : trois fois la
 * même forme, écrite une seule fois. */
const SPARKLES = [
  { x: 11, y: 10, r: 6, delay: "0s" },
  { x: 18.5, y: 17.5, r: 3.4, delay: "0.7s" },
  { x: 5.5, y: 18, r: 2.6, delay: "1.4s" },
];

/** Les quatre branches d'une étincelle, creusées vers le centre. */
function sparklePath(x: number, y: number, r: number): string {
  const waist = r * 0.32;
  return [
    `M${x} ${y - r}`,
    `C${x + waist} ${y - waist} ${x + waist} ${y - waist} ${x + r} ${y}`,
    `C${x + waist} ${y + waist} ${x + waist} ${y + waist} ${x} ${y + r}`,
    `C${x - waist} ${y + waist} ${x - waist} ${y + waist} ${x - r} ${y}`,
    `C${x - waist} ${y - waist} ${x - waist} ${y - waist} ${x} ${y - r}`,
    "Z",
  ].join(" ");
}

export default function Sparkles({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      {SPARKLES.map((sparkle) => (
        <path
          key={`${sparkle.x}-${sparkle.y}`}
          className="icon-part animate-twinkle"
          style={{ animationDelay: sparkle.delay }}
          d={sparklePath(sparkle.x, sparkle.y, sparkle.r)}
          fill="currentColor"
          stroke="none"
        />
      ))}
    </IconBase>
  );
}

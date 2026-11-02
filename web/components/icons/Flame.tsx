/* ==========================================================================
 * Flame — la série « sport » du widget habitudes.
 *
 * Noter la classe : icon-part--bottom, et non icon-part. Une flamme s'écrase
 * sur sa base, pas sur son milieu. Avec le centre par défaut, elle se
 * tasserait des deux côtés et donnerait l'impression de flotter.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Flame({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <path
        className="icon-part--bottom animate-flicker"
        d="M12 2.4c3.4 3.2 5.6 5.8 5.6 9.2a5.6 5.6 0 1 1-11.2 0c0-1.8.8-3.4 2.2-5 .4 1.2 1.1 2 2 2.4-.6-2.6-.2-4.6 1.4-6.6Z"
      />
      {/* Le cœur de la flamme, plus clair, vacille un peu plus vite. */}
      <path
        className="icon-part--bottom animate-flicker"
        style={{ animationDuration: "0.65s" }}
        d="M12 13c1.4 1.2 2.2 2.2 2.2 3.3a2.2 2.2 0 1 1-4.4 0c0-1.1.8-2.1 2.2-3.3Z"
        fill="var(--color-amber)"
        stroke="none"
      />
    </IconBase>
  );
}

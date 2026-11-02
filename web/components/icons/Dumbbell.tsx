/* ==========================================================================
 * Dumbbell — catégorie « sport » du widget priorités. Statique, comme les
 * deux autres icônes de catégorie.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Dumbbell({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      {/* La barre centrale. */}
      <path d="M8.4 12h7.2" />
      {/* Les deux poids, un grand et un petit de chaque côté. */}
      <rect x="5.2" y="8.2" width="3.2" height="7.6" rx="1.1" />
      <rect x="15.6" y="8.2" width="3.2" height="7.6" rx="1.1" />
      <path d="M3.2 10v4" />
      <path d="M20.8 10v4" />
    </IconBase>
  );
}

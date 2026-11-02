/* ==========================================================================
 * Briefcase — catégorie « travail » du widget priorités.
 *
 * Icône STATIQUE, volontairement. Les priorités s'affichent en liste de trois
 * lignes : trois petites icônes qui bougeraient côte à côte feraient du
 * bruit sans rien apporter. Le brief le prévoit ainsi (section 7).
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Briefcase({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      {/* La poignée. */}
      <path d="M9 6.4V5.2a1.6 1.6 0 0 1 1.6-1.6h2.8A1.6 1.6 0 0 1 15 5.2v1.2" />
      {/* Le corps. */}
      <rect x="3" y="6.4" width="18" height="13.2" rx="2.2" />
      {/* La ligne de fermeture et la serrure. */}
      <path d="M3 12.4h18" />
      <path d="M10.8 12.4h2.4" strokeWidth={2.4} />
    </IconBase>
  );
}

/* ==========================================================================
 * OpenBook — catégorie « apprentissage » du widget priorités. Statique,
 * pour la même raison que Briefcase.
 *
 * À ne pas confondre avec Book, le livre fermé qui pulse : celui-là compte
 * les jours de lecture dans le widget habitudes.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function OpenBook({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      {/* Les deux pages ouvertes, séparées par la reliure centrale. */}
      <path d="M12 7.2C10.4 5.6 7.8 4.8 4 4.8v12.8c3.8 0 6.4.8 8 2.4" />
      <path d="M12 7.2c1.6-1.6 4.2-2.4 8-2.4v12.8c-3.8 0-6.4.8-8 2.4" />
      <path d="M12 7.2V20" />
    </IconBase>
  );
}

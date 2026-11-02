/* ==========================================================================
 * Heart — le mot laissé par un membre du foyer, et l'emplacement photo.
 * Battement lent : un léger grossissement, pas un clignotement.
 * ========================================================================== */

import IconBase, { type IconProps } from "./IconBase";

export default function Heart({ size, className }: IconProps) {
  return (
    <IconBase size={size} className={className}>
      <path
        className="icon-part animate-pop"
        /* Deux arcs symétriques qui se rejoignent en pointe, en bas. */
        d="M12 20.4 4.6 13a4.8 4.8 0 0 1 7.4-6 4.8 4.8 0 0 1 7.4 6Z"
      />
    </IconBase>
  );
}

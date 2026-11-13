/* ==========================================================================
 * components/ui/CategoryChip.tsx — la pastille d'icône d'une catégorie
 *
 * Un carré arrondi au fond teinté de la couleur de la catégorie, avec son
 * émoticône au centre. Utilisée par le widget Priorities du miroir (grande) et par la
 * page téléphone /app/priorities (petite) : seule la taille change.
 *
 * Elle pose elle-même la variable --tone, lue par la classe .tone-chip de
 * globals.css. Elle garde donc sa couleur même posée hors d'une Card.
 * ========================================================================== */

import type { CSSProperties } from "react";
import Emoji from "@/components/ui/Emoji";
import { mp } from "@/lib/mirror-pixels";
import { CATEGORY_LOOKS } from "@/lib/priority-categories";
import type { PriorityCategory } from "@/lib/types";

export default function CategoryChip({
  category,
  size,
  loop,
}: {
  category: PriorityCategory;
  /** Taille de l'icône en pixels miroir ; la pastille ajoute un quart autour. */
  size: number;
  /** Nombre de lectures de l'émoticône (voir Emoji.tsx). Absent = à l'infini. */
  loop?: boolean | number;
}) {
  const { emoji, tone } = CATEGORY_LOOKS[category];

  return (
    <span
      className="tone-chip flex shrink-0 items-center justify-center"
      style={
        {
          "--tone": `var(--color-${tone})`,
          /* Marge et arrondi proportionnels à l'icône : 40 px d'icône
           * donnent les 10 px de marge et 18 px d'arrondi du miroir. */
          padding: mp(size / 4),
          borderRadius: mp(size * 0.45),
        } as CSSProperties
      }
    >
      <Emoji name={emoji} size={size} loop={loop}/>
    </span>
  );
}

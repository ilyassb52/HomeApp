/* ==========================================================================
 * lib/priority-categories.ts — l'apparence des trois catégories de priorité
 *
 * Chaque catégorie du brief a une icône, une couleur et un nom en clair.
 * Ce tableau vivait dans le widget Priorities ; la page téléphone en a eu
 * besoin à son tour, il est donc rangé ici pour n'exister qu'une fois.
 * ========================================================================== */

import Briefcase from "@/components/icons/Briefcase";
import Dumbbell from "@/components/icons/Dumbbell";
import OpenBook from "@/components/icons/OpenBook";
import type { IconProps } from "@/components/icons/IconBase";
import type { PriorityCategory, Tone } from "@/lib/types";

type CategoryLook = {
  Icon: (props: IconProps) => React.ReactElement;
  tone: Tone;
  /** Le nom affiché sur le téléphone, à côté des boutons de choix. */
  label: string;
};

/* Record<PriorityCategory, …> oblige à décrire CHAQUE catégorie : si l'API
 * en ajoute une, TypeScript signalera ce tableau comme incomplet. */
export const CATEGORY_LOOKS: Record<PriorityCategory, CategoryLook> = {
  work: { Icon: Briefcase, tone: "cyan", label: "Travail" },
  learning: { Icon: OpenBook, tone: "magenta", label: "Apprentissage" },
  sport: { Icon: Dumbbell, tone: "coral", label: "Sport" },
};

/** Les catégories dans l'ordre d'affichage des boutons de choix. */
export const PRIORITY_CATEGORIES = Object.keys(
  CATEGORY_LOOKS,
) as PriorityCategory[];

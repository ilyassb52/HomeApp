/* ==========================================================================
 * lib/priority-categories.ts — l'apparence des trois catégories de priorité
 *
 * Chaque catégorie a une émoticône, une couleur et un nom en clair :
 *   Tâche   🚨  le quotidien (courses, papiers, ménage…)
 *   Sport   💪
 *   Projet  🚀  ce qui avance sur plusieurs jours
 * Ce tableau vivait dans le widget Priorities ; la page téléphone en a eu
 * besoin à son tour, il est donc rangé ici pour n'exister qu'une fois.
 * ========================================================================== */

import type { EmojiName } from "@/lib/emojis";
import type { PriorityCategory, Tone } from "@/lib/types";

type CategoryLook = {
  emoji: EmojiName;
  tone: Tone;
  /** Le nom affiché sur le téléphone, à côté des boutons de choix. */
  label: string;
};

/* Record<PriorityCategory, …> oblige à décrire CHAQUE catégorie : si l'API
 * en ajoute une, TypeScript signalera ce tableau comme incomplet. */
export const CATEGORY_LOOKS: Record<PriorityCategory, CategoryLook> = {
  task: { emoji: "policeLight", tone: "cyan", label: "Tâche" },
  sport: { emoji: "muscle", tone: "coral", label: "Sport" },
  project: { emoji: "rocket", tone: "magenta", label: "Projet" },
};

/** Les catégories dans l'ordre d'affichage des boutons de choix. */
export const PRIORITY_CATEGORIES = Object.keys(
  CATEGORY_LOOKS,
) as PriorityCategory[];

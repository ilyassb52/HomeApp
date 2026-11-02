/* ==========================================================================
 * components/app/CategoryPicker.tsx — choisir la catégorie d'une priorité
 *
 * Trois gros boutons côte à côte (Travail, Apprentissage, Sport), dont un
 * seul est allumé. Servi à l'ajout d'une priorité et à sa modification.
 *
 * role="radiogroup" et role="radio" disent aux lecteurs d'écran qu'il
 * s'agit d'un choix unique parmi plusieurs, comme des boutons radio.
 * ========================================================================== */

import type { CSSProperties } from "react";
import { CATEGORY_LOOKS, PRIORITY_CATEGORIES } from "@/lib/priority-categories";
import type { PriorityCategory } from "@/lib/types";

export default function CategoryPicker({
  value,
  onChange,
}: {
  value: PriorityCategory;
  onChange: (category: PriorityCategory) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Catégorie" className="flex gap-2">
      {PRIORITY_CATEGORIES.map((category) => {
        const { Icon, tone, label } = CATEGORY_LOOKS[category];
        const selected = category === value;

        return (
          <button
            key={category}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(category)}
            /* Allumé : fond teinté et texte de la couleur (.tone-chip).
             * Éteint : texte gris, seule la bordure garde un peu de
             * couleur pour qu'on reconnaisse la catégorie. */
            className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-[13px] ${
              selected ? "tone-chip font-semibold" : "text-muted"
            }`}
            style={
              {
                "--tone": `var(--color-${tone})`,
                borderColor: selected
                  ? "var(--tone)"
                  : "color-mix(in srgb, var(--tone) 25%, transparent)",
              } as CSSProperties
            }
          >
            <Icon size={20} />
            {label}
          </button>
        );
      })}
    </div>
  );
}

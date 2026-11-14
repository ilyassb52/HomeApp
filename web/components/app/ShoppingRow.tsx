/* ==========================================================================
 * components/app/ShoppingRow.tsx — un article sur la page téléphone
 *
 * Cercle à cocher, nom, croix pour supprimer. Toucher le nom coche aussi :
 * au magasin, on vise vite, la cible doit être large.
 *
 * Comme PriorityRow, la ligne ne parle jamais à l'API : elle prévient la
 * page (onToggle, onDelete), qui seule possède les mutations.
 * ========================================================================== */

"use client";

import Card from "@/components/ui/Card";
import CheckCircle from "@/components/ui/CheckCircle";
import type { ShoppingItem } from "@/lib/types";

/* La Card du miroir, ajustée au téléphone (voir PriorityRow). */
const PHONE_CARD = "rounded-2xl p-1";

export default function ShoppingRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card tone="neon-green" className={PHONE_CARD}>
      <div className="flex items-center gap-1">
        {/* Un seul bouton pour le cercle ET le nom. min-w-0 laisse le nom
            rétrécir, break-words coupe un mot trop long : la croix reste
            toujours à l'écran. */}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={item.bought}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-3 px-2 text-left"
        >
          <CheckCircle done={item.bought} size={26} />
          <span
            className={`min-w-0 text-[17px] font-light break-words ${
              item.bought ? "text-muted line-through" : "text-ink"
            }`}
          >
            {item.name}
          </span>
        </button>

        <button
          type="button"
          aria-label={`Supprimer ${item.name}`}
          onClick={onDelete}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg text-lg text-muted active:bg-ink/10"
        >
          ✕
        </button>
      </div>
    </Card>
  );
}

/* ==========================================================================
 * components/widgets/Priorities.tsx — les priorités du jour
 *
 * Un titre, puis une carte par priorité : pastille d'icône colorée selon la
 * catégorie, texte, et cercle à cocher à droite. Une priorité faite est
 * barrée et son cercle est rempli.
 *
 * PAS DE LIMITE. On peut avoir autant de priorités qu'on veut : la liste
 * montre environ quatre cartes, puis défile au doigt. Un fondu en bas
 * signale qu'il y a une suite.
 *
 * PREMIER WIDGET BRANCHÉ SUR L'API. Les priorités viennent de la base, via
 * usePriorities(), relu toutes les 30 s. Tant que rien n'est arrivé, ou si
 * l'API est injoignable dès le départ, le widget ne montre rien : le miroir
 * n'affiche jamais de message d'erreur. Si l'API tombe plus tard, il garde
 * simplement les dernières priorités reçues.
 * ========================================================================== */

"use client";

import Card from "@/components/ui/Card";
import CategoryChip from "@/components/ui/CategoryChip";
import CheckCircle from "@/components/ui/CheckCircle";
import SectionLabel from "@/components/ui/SectionLabel";
import { usePriorities } from "@/lib/api/priorities";
import { CATEGORY_LOOKS } from "@/lib/priority-categories";

/* Au-delà de ce nombre de cartes, la liste dépasse sa hauteur maximale et
 * défile : c'est là qu'on affiche le fondu du bas. */
const VISIBLE_CARDS = 4;

/* Le widget ne prend aucune prop : tout vient de l'API. */
export default function Priorities() {
  /* data vaut undefined tant que la première réponse n'est pas arrivée :
   * « ?? [] » la traite comme une liste vide. */
  const { data } = usePriorities();
  const priorities = data ?? [];

  if (priorities.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-mp-18">
      {/* Le titre compte toutes les priorités, même celles qu'il faut
          faire défiler pour voir. Au singulier, « MA PRIORITÉ » plutôt que
          « MES 1 PRIORITÉS ». */}
      <SectionLabel>
        {priorities.length === 1
          ? "Ma priorité"
          : `Mes ${priorities.length} priorités`}
      </SectionLabel>

      {/* La liste défilante.
          max-h-mp-440 : environ quatre cartes (une carte ≈ 92 + 18
          d'écart). Au-delà, overflow-y-auto la fait défiler.
          overscroll-contain : arrivé au bout de la liste, le doigt ne
          fait pas défiler tout l'écran à la place.
          Le fondu (scroll-fade, globals.css) n'apparaît que s'il y a plus
          de cartes que de place. */}
      <div
        className={`flex max-h-mp-480 flex-col gap-mp-18 overflow-y-auto overscroll-contain ${
          priorities.length > VISIBLE_CARDS ? "scroll-fade" : ""
        }`}
      >
        {priorities.map((priority) => {
          const { tone } = CATEGORY_LOOKS[priority.category];

          return (
            <Card key={priority.id} tone={tone} className="py-mp-22">
              <div className="flex items-center gap-5">
                {/* La pastille : fond teinté, icône de la même couleur
                    (components/ui/CategoryChip.tsx). */}
                <CategoryChip category={priority.category} size={40} />

                {/* flex-1 fait pousser le texte pour occuper la place
                    disponible, ce qui repousse le cercle tout à droite. */}
                <p
                  className={`flex-1 text-mp-34 font-light ${
                    priority.done ? "text-muted line-through" : "text-ink"
                  }`}
                >
                  {priority.text}
                </p>

                <CheckCircle done={priority.done} size={34} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

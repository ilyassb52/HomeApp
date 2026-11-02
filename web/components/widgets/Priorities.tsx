/* ==========================================================================
 * components/widgets/Priorities.tsx — les priorités du jour
 *
 * Un titre, puis une carte par priorité : pastille d'icône colorée selon la
 * catégorie, texte, et cercle à cocher à droite. Une priorité faite est
 * barrée et son cercle est rempli.
 *
 * PREMIER WIDGET À LIRE UN RÉGLAGE. « max » vient de config/layouts.json et
 * limite le nombre de lignes. Il passe par lib/settings.ts, qui vérifie que
 * c'est bien un nombre : l'appli téléphone pourra écrire n'importe quoi dans
 * ce fichier à l'étape 4.
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
import { readNumberSetting } from "@/lib/settings";

/** Valeur par défaut si layouts.json ne précise pas « max ». */
const DEFAULT_MAX = 3;

export default function Priorities({
  settings,
}: {
  settings?: Record<string, unknown>;
}) {
  const max = readNumberSetting(settings, "max", DEFAULT_MAX);
  /* data vaut undefined tant que la première réponse n'est pas arrivée :
   * « ?? [] » la traite comme une liste vide. */
  const { data } = usePriorities();
  const priorities = (data ?? []).slice(0, max);

  if (priorities.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[18px]">
      {/* Le titre suit le nombre réellement affiché : si « max » passe à 2,
          il annonce « MES 2 PRIORITÉS » et non plus 3. Au singulier, « MA
          PRIORITÉ » plutôt que « MES 1 PRIORITÉS ». */}
      <SectionLabel>
        {priorities.length === 1
          ? "Ma priorité"
          : `Mes ${priorities.length} priorités`}
      </SectionLabel>

      <div className="flex flex-col gap-[18px]">
        {priorities.map((priority) => {
          const { tone } = CATEGORY_LOOKS[priority.category];

          return (
            <Card key={priority.id} tone={tone} className="py-[22px]">
              <div className="flex items-center gap-5">
                {/* La pastille : fond teinté, icône de la même couleur
                    (components/ui/CategoryChip.tsx). */}
                <CategoryChip category={priority.category} size={40} />

                {/* flex-1 fait pousser le texte pour occuper la place
                    disponible, ce qui repousse le cercle tout à droite. */}
                <p
                  className={`flex-1 text-[34px] font-light ${
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

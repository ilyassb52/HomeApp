/* ==========================================================================
 * components/widgets/Priorities.tsx — les priorités du jour
 *
 * Un titre, puis une carte par priorité : pastille d'émoticône colorée selon
 * la catégorie, texte, et cercle à cocher à droite. Une priorité faite est
 * barrée et son cercle est rempli.
 *
 * ON COCHE AU DOIGT. Le miroir est une tablette tactile : toucher une carte
 * coche ou décoche la priorité. C'est exactement le même hook que la page
 * téléphone (useUpdateGoal) : la carte change tout de suite, et revient en
 * arrière si l'API refuse.
 *
 * PAS DE LIMITE. On peut avoir autant de priorités qu'on veut : la liste
 * montre environ quatre cartes, puis défile au doigt. Un fondu en bas
 * signale qu'il y a une suite — et disparaît une fois arrivé au bout, sinon
 * il cacherait la dernière carte.
 *
 * BRANCHÉ SUR L'API. Les priorités viennent de la base, via usePriorities(),
 * relu toutes les 30 s. Tant que rien n'est arrivé, ou si l'API est
 * injoignable dès le départ, le widget ne montre rien : le miroir n'affiche
 * jamais de message d'erreur. Si l'API tombe plus tard, il garde simplement
 * les dernières priorités reçues.
 * ========================================================================== */

"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Card from "@/components/ui/Card";
import CategoryChip from "@/components/ui/CategoryChip";
import CheckCircle from "@/components/ui/CheckCircle";
import SectionLabel from "@/components/ui/SectionLabel";
import { usePriorities, useUpdateGoal } from "@/lib/api/priorities";
import { CATEGORY_LOOKS } from "@/lib/priority-categories";

/* --------------------------------------------------------------------------
 * 1. Réglages
 * -------------------------------------------------------------------------- */

/* Chaque émoticône joue trois fois puis se fige : six cartes qui bougent
 * en permanence fatigueraient l'œil (et la tablette). */
const EMOJI_PLAYS = 3;

/* --------------------------------------------------------------------------
 * 2. Le widget — il ne prend aucune prop : tout vient de l'API
 * -------------------------------------------------------------------------- */
export default function Priorities() {
  /* data vaut undefined tant que la première réponse n'est pas arrivée :
   * « ?? [] » la traite comme une liste vide. */
  const { data } = usePriorities();
  const priorities = data ?? [];

  const updateGoal = useUpdateGoal();

  /* ------------------------------------------------------------------------
   * Le fondu du bas : seulement s'il reste quelque chose à voir en dessous
   *
   * Le fondu (mask-image) est posé sur la boîte qui défile, pas sur son
   * contenu : il rend toujours transparents les 15 % du bas du cadre. Si on
   * le laissait tout le temps, il cacherait la dernière carte une fois
   * arrivé au bout — ou dès le départ, quand toutes les cartes tiennent.
   *
   * Plutôt que de compter les cartes (une priorité longue prend deux lignes,
   * et la hauteur de la liste peut changer), on MESURE la liste : atEnd vaut
   * vrai quand on voit déjà son bas. Le fondu ne s'affiche que sinon.
   *
   * Ces hooks sont déclarés avant le « return null » plus bas : React exige
   * qu'ils soient appelés à chaque rendu, dans le même ordre.
   * ------------------------------------------------------------------------ */
  const listRef = useRef<HTMLDivElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  function checkAtEnd() {
    const list = listRef.current;
    if (!list) return;
    /* scrollTop : ce qu'on a déjà fait défiler ; clientHeight : la hauteur
     * visible ; scrollHeight : la hauteur totale du contenu. Le « - 1 »
     * absorbe les arrondis de pixels (les tailles miroir sont des calculs
     * avec --mp, rarement des nombres entiers). Si tout tient sans défiler,
     * les deux côtés sont égaux : atEnd vaut vrai, pas de fondu. */
    setAtEnd(list.scrollTop + list.clientHeight >= list.scrollHeight - 1);
  }

  /* On mesure à l'arrivée des priorités et à chaque nouvelle liste (ajout,
   * suppression). useLayoutEffect mesure avant que l'écran soit dessiné :
   * le fondu n'apparaît pas une fraction de seconde pour rien. */
  useLayoutEffect(checkAtEnd, [data]);

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
          max-h-mp-550 : environ cinq cartes (une carte ≈ 92 + 18
          d'écart). Au-delà, overflow-y-auto la fait défiler.
          overscroll-contain : arrivé au bout de la liste, le doigt ne
          fait pas défiler tout l'écran à la place.
          Le fondu (scroll-fade, globals.css) n'apparaît que s'il reste des
          cartes cachées en dessous : on remesure à chaque défilement. */}
      <div
        ref={listRef}
        onScroll={checkAtEnd}
        className={`flex max-h-mp-550 flex-col gap-mp-18 overflow-y-auto overscroll-contain ${
          atEnd ? "" : "scroll-fade"
        }`}
      >
        {priorities.map((priority) => {
          const { tone } = CATEGORY_LOOKS[priority.category];

          return (
            /* Le bouton entoure toute la carte : on peut toucher n'importe
               où, pas seulement le petit cercle.
               aria-pressed dit aux lecteurs d'écran si la case est cochée.
               active:scale : la carte s'enfonce un peu sous le doigt — il
               n'y a pas de curseur sur le miroir, donc pas de survol. */
            <button
              key={priority.id}
              type="button"
              aria-pressed={priority.done}
              onClick={() =>
                updateGoal.mutate({
                  id: priority.id,
                  changes: { done: !priority.done },
                })
              }
              className="w-full text-left transition-transform active:scale-[0.98]"
            >
              <Card tone={tone} className="py-mp-22">
                <div className="flex items-center gap-5">
                  {/* La pastille : fond teinté, émoticône au centre
                      (components/ui/CategoryChip.tsx). */}
                  <CategoryChip
                    category={priority.category}
                    size={40}
                    loop={EMOJI_PLAYS}
                  />

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
            </button>
          );
        })}
      </div>
    </div>
  );
}

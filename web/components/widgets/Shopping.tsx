/* ==========================================================================
 * components/widgets/Shopping.tsx — la liste de courses du foyer
 *
 * Une seule carte vert néon, mise en avant (variant « tinted », section 4
 * du brief) : en haut le caddie animé, le titre « COURSES DU FOYER » et le
 * nombre d'articles à acheter ; dessous, les articles sur deux colonnes.
 *
 * LA LISTE DÉFILE AU DOIGT, comme celles des priorités et de l'agenda :
 * une hauteur fixe (environ cinq lignes), puis un fondu en bas tant qu'il
 * reste des articles cachés (lib/use-scroll-fade.ts). Tous les articles
 * sont donc sur le miroir, aucun n'est laissé au seul téléphone.
 *
 * LES ARTICLES ACHETÉS RESTENT EN BAS : l'API les range après ceux à
 * acheter, et un article qu'on coche descend aussitôt (lib/api/shopping.ts).
 *
 * Une ou deux colonnes (prop columns) : une seule quand la carte doit tenir
 * dans une demi-largeur.
 *
 * ON COCHE AU DOIGT, comme les priorités : toucher un article le marque
 * acheté (barré) ou le décoche. Il reste barré jusqu'au soir puis disparaît
 * le lendemain — c'est l'API qui décide (api/app/services/shopping.py).
 *
 * BRANCHÉ SUR L'API, avec la même règle que les priorités : tant que rien
 * n'est arrivé, ou si la liste est vide, le widget ne montre rien.
 * ========================================================================== */

"use client";

import Card from "@/components/ui/Card";
import CheckCircle from "@/components/ui/CheckCircle";
import Emoji from "@/components/ui/Emoji";
import SectionLabel from "@/components/ui/SectionLabel";
import { useShoppingList, useUpdateShoppingItem } from "@/lib/api/shopping";
import { mp } from "@/lib/mirror-pixels";
import { useScrollFade } from "@/lib/use-scroll-fade";

/* --------------------------------------------------------------------------
 * 1. Réglages
 * -------------------------------------------------------------------------- */

/* Le caddie joue trois fois puis se fige, comme les émoticônes des
 * priorités. */
const EMOJI_PLAYS = 3;

/* --------------------------------------------------------------------------
 * 2. Le widget — les articles viennent de l'API, les props ne règlent que
 *    l'affichage
 * -------------------------------------------------------------------------- */
export default function Shopping({
  columns = 2,
}: {
  /** Une colonne pour une carte étroite, deux sinon. */
  columns?: 1 | 2;
}) {
  const { data } = useShoppingList();
  const items = data ?? [];
  const updateItem = useUpdateShoppingItem();

  /* Avant le « return null » : React veut ses hooks à chaque rendu. */
  const { listRef, onScroll, fadeClass } = useScrollFade(data);

  if (items.length === 0) {
    return null;
  }

  /* Le compteur ne compte que ce qui reste à acheter : les articles barrés
   * sont déjà dans le caddie. */
  const toBuy = items.filter((item) => !item.bought).length;

  return (
    <Card tone="neon-green" variant="tinted">
      {/* L'en-tête : caddie, titre, compteur. Sur deux colonnes, le
          compteur est poussé à droite (ml-auto) ; sur une seule, la carte
          est trop étroite : il passe sous le titre (flex-col). */}
      <div className="flex items-center gap-mp-18">
        <Emoji name="cart" size={56} loop={EMOJI_PLAYS} />
        <div
          className={
            columns === 1
              ? "flex flex-col gap-mp-4"
              : "flex flex-1 items-center"
          }
        >
          <SectionLabel className="whitespace-nowrap">
            Courses du foyer
          </SectionLabel>
          <p
            className={`text-mp-26 font-light text-muted ${columns === 1 ? "" : "ml-auto"}`}
          >
            {countLabel(toBuy)}
          </p>
        </div>
      </div>

      {/* La liste défilante, sur une ou deux colonnes de même largeur.
          max-h-mp-300 : environ cinq lignes ; overscroll-contain : arrivé au
          bout, le doigt ne fait pas défiler tout l'écran à la place.
          Les deux classes de colonnes sont écrites en entier : Tailwind ne
          verrait pas « grid-cols-" + n ». Les écarts passent par
          style={{}} et mp() : il n'existe pas d'utilitaire « gap-y » en
          pixels miroir. */}
      <div
        ref={listRef}
        onScroll={onScroll}
        className={`mt-mp-22 grid max-h-mp-300 overflow-y-auto overscroll-contain ${
          columns === 1 ? "grid-cols-1" : "grid-cols-2"
        } ${fadeClass}`}
        style={{ rowGap: mp(10), columnGap: mp(32) }}
      >
        {items.map((item) => (
          /* Le bouton entoure l'article entier : on touche le nom ou le
             cercle, peu importe. active:scale l'enfonce sous le doigt. */
          <button
            key={item.id}
            type="button"
            aria-pressed={item.bought}
            onClick={() =>
              updateItem.mutate({
                id: item.id,
                changes: { bought: !item.bought },
              })
            }
            className="flex min-w-0 items-center gap-mp-14 py-mp-6 text-left transition-transform active:scale-[0.97]"
          >
            <CheckCircle done={item.bought} size={28} />
            {/* truncate : un nom trop long finit par « … » au lieu de
                passer sur deux lignes et de décaler la grille. */}
            <span
              className={`truncate text-mp-30 font-light ${
                item.bought ? "text-muted line-through" : "text-ink"
              }`}
            >
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------------
 * 3. Le compteur en toutes lettres
 * -------------------------------------------------------------------------- */
function countLabel(toBuy: number): string {
  if (toBuy === 0) return "Tout est pris";
  return toBuy === 1 ? "1 article" : `${toBuy} articles`;
}

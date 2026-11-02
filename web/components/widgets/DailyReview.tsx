/* ==========================================================================
 * components/widgets/DailyReview.tsx — la revue de la journée
 *
 * Le soir, il reprend les priorités fixées le matin et dit où elles en sont :
 * étincelles, un message, une barre de progression, puis la liste avec les
 * objectifs faits barrés.
 *
 * C'est le seul endroit du projet où deux widgets partagent des données : les
 * priorités du matin sont celles qu'on relit le soir. Ils ne se parlent pas
 * pour autant — chacun appelle usePriorities() de son côté, et le cache de
 * TanStack Query évite de faire deux fois la même requête.
 *
 * LE MESSAGE S'ADAPTE (section 6) : « Bravo » si au moins la moitié des
 * objectifs est faite, « Demain, on remet ça » sinon. Un écran qui féliciterait
 * pour zéro objectif sur trois perdrait toute crédibilité.
 * ========================================================================== */

"use client";

import Sparkles from "@/components/icons/Sparkles";
import Card from "@/components/ui/Card";
import { usePriorities } from "@/lib/api/priorities";

export default function DailyReview() {
  /* Pas encore de réponse = liste vide = rien d'affiché, comme Priorities. */
  const { data } = usePriorities();
  const priorities = data ?? [];
  const total = priorities.length;
  const doneCount = priorities.filter((priority) => priority.done).length;

  if (total === 0) {
    return null;
  }

  const isGoodDay = doneCount >= total / 2;
  const headline = isGoodDay
    ? `Bravo, ${doneCount} sur ${total} !`
    : "Demain, on remet ça";

  /* Le pourcentage de remplissage de la barre. Math.round évite une largeur
   * à quinze décimales dans le style. */
  const progressPercent = Math.round((doneCount / total) * 100);

  return (
    <Card tone="neon-green" variant="tinted">
      <div className="flex flex-col gap-[20px]">
        <div className="flex items-center gap-5">
          <Sparkles size={64} className="text-neon-green" />
          <p className="text-[42px] leading-none font-semibold text-ink">
            {headline}
          </p>
        </div>

        {/* La barre : un rail sombre, et par-dessus une barre verte dont la
            largeur est le pourcentage. La largeur est calculée, donc écrite
            en style et non en classe Tailwind. */}
        <div className="h-[12px] w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="tone-dot h-full rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <ul className="flex flex-col gap-[10px]">
          {priorities.map((priority) => (
            <li
              key={priority.id}
              className={`text-[34px] font-light ${
                priority.done ? "text-muted line-through" : "text-ink"
              }`}
            >
              {priority.text}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

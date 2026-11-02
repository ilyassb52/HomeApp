/* ==========================================================================
 * components/widgets/Habits.tsx — les séries d'habitudes
 *
 * Un titre, puis trois cartes côte à côte : icône animée, valeur mise en
 * avant, libellé. C'est le seul widget du matin disposé en grille plutôt
 * qu'en liste — trois valeurs courtes se comparent mieux côte à côte que
 * l'une sous l'autre.
 * ========================================================================== */

import Book from "@/components/icons/Book";
import Flame from "@/components/icons/Flame";
import WaterDrop from "@/components/icons/WaterDrop";
import type { IconProps } from "@/components/icons/IconBase";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
import { mockHabits } from "@/lib/mock";
import type { HabitKind, Tone } from "@/lib/types";

/* Les trois séries du brief, chacune avec son icône et sa couleur. */
const HABIT_LOOKS: Record<
  HabitKind,
  { Icon: (props: IconProps) => React.ReactElement; tone: Tone }
> = {
  sport: { Icon: Flame, tone: "coral" },
  reading: { Icon: Book, tone: "magenta" },
  water: { Icon: WaterDrop, tone: "cyan" },
};

export default function Habits() {
  if (mockHabits.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <SectionLabel>Mes séries</SectionLabel>

      {/* grid-cols-3 : trois colonnes de largeur égale, quel que soit le
          contenu. gap-[36px] est l'espacement entre blocs du brief. */}
      <div className="grid grid-cols-3 gap-[36px]">
        {mockHabits.map((habit) => {
          const { Icon, tone } = HABIT_LOOKS[habit.kind];

          return (
            <Card key={habit.id} tone={tone} className="py-[26px]">
              <div className="flex flex-col items-center gap-[10px]">
                {/* L'icône prend la couleur de sa carte. text-[color:var(--tone)]
                    se lit : « couleur du texte = la variable --tone », celle
                    que la Card a posée juste au-dessus. Les icônes étant
                    dessinées en currentColor, elles suivent. */}
                <Icon size={56} className="text-[color:var(--tone)]" />
                <p className="text-[45px] leading-none font-semibold text-ink">
                  {habit.value}
                </p>
                <p className="text-[27px] font-light text-muted">
                  {habit.label}
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

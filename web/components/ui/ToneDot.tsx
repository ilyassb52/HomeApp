/* ==========================================================================
 * components/ui/ToneDot.tsx — la pastille ronde d'un profil
 *
 * Elle sert à répondre d'un coup d'œil à « qui ? » : qui est devant le
 * miroir dans la salutation du matin, à qui revient une tâche ménagère le
 * week-end. Chaque membre du foyer a sa couleur, fixée dans lib/mock.ts.
 *
 * Le profil actif a sa pastille pleine, les autres sont atténuées à 35 %
 * (section 6 du brief).
 *
 * Comme pour Card, la couleur arrive par la variable CSS --tone : écrire
 * cinq variantes en classes Tailwind serait la seule autre option, puisque
 * Tailwind ne sait pas fabriquer une classe à partir d'un calcul.
 * ========================================================================== */

import type { CSSProperties } from "react";
import { mp } from "@/lib/mirror-pixels";
import type { Tone } from "@/lib/types";

export default function ToneDot({
  tone,
  active = true,
  size = 18,
}: {
  tone: Tone;
  /** false = profil en retrait, affiché à 35 % d'opacité. */
  active?: boolean;
  /** Diamètre en pixels miroir. */
  size?: number;
}) {
  return (
    <span
      className="tone-dot inline-block rounded-full"
      style={
        {
          "--tone": `var(--color-${tone})`,
          width: mp(size),
          height: mp(size),
          opacity: active ? 1 : 0.35,
        } as CSSProperties
      }
    />
  );
}

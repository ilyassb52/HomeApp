/* ==========================================================================
 * components/widgets/Greeting.tsx — la salutation du matin
 *
 * Smiley animé, « Bonjour Ilyass ! » et une phrase d'encouragement.
 *
 * Le prénom n'est écrit nulle part dans ce fichier : il vient de
 * lib/mock.ts, comme l'impose la section 10. Changer les prénoms du foyer ne
 * demande donc de toucher à aucun widget.
 * ========================================================================== */

import Emoji from "@/components/ui/Emoji";
import { getActiveProfile } from "@/lib/mock";

/* La phrase sous la salutation. Elle vivra dans les données quand l'API
 * existera ; pour l'instant elle est ici, et nulle part ailleurs. */
const ENCOURAGEMENT = "Belle journée qui commence";

export default function Greeting() {
  const activeProfile = getActiveProfile();

  return (
    <div className="flex items-center gap-7">
      <Emoji name="sunRise" size={220} />
      <div className="flex flex-col gap-mp-6">
        <p className="text-mp-60 leading-none font-semibold text-ink">
          Bonjour {activeProfile.name} !
        </p>
        <p className="text-mp-30 font-light text-muted">{ENCOURAGEMENT}</p>
      </div>
    </div>
  );
}

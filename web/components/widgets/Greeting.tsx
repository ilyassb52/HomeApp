/* ==========================================================================
 * components/widgets/Greeting.tsx — la salutation du matin
 *
 * Smiley animé, « Bonjour Ilyass ! », une phrase d'encouragement, et les
 * pastilles des trois membres du foyer dont la première est pleine.
 *
 * Le prénom n'est écrit nulle part dans ce fichier : il vient de
 * lib/mock.ts, comme l'impose la section 10. Changer les prénoms du foyer ne
 * demande donc de toucher à aucun widget.
 * ========================================================================== */

import Smiley from "@/components/icons/Smiley";
import ToneDot from "@/components/ui/ToneDot";
import {
  getActiveProfile,
  mockActiveProfileId,
  mockProfiles,
} from "@/lib/mock";

/* La phrase sous la salutation. Elle vivra dans les données quand l'API
 * existera ; pour l'instant elle est ici, et nulle part ailleurs. */
const ENCOURAGEMENT = "Belle journée qui commence";

export default function Greeting() {
  const activeProfile = getActiveProfile();

  return (
    <div className="flex items-center gap-7">
      <Smiley size={88} className="text-amber" />
      <div className="flex flex-col gap-mp-6">
        <p className="text-mp-60 leading-none font-semibold text-ink">
          Bonjour {activeProfile.name} !
        </p>
        <p className="text-mp-30 font-light text-muted">{ENCOURAGEMENT}</p>
      </div>

      {/* ml-auto pousse les pastilles contre le bord droit de la carte. */}
      <div className="ml-auto flex items-center gap-mp-10">
        {mockProfiles.map((profile) => (
          <ToneDot
            key={profile.id}
            tone={profile.tone}
            active={profile.id === mockActiveProfileId}
          />
        ))}
      </div>
    </div>
  );
}

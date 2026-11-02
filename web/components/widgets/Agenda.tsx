/* ==========================================================================
 * components/widgets/Agenda.tsx — les rendez-vous de demain
 *
 * Titre « DEMAIN », puis une ligne par événement : pastille colorée, heure,
 * intitulé. Le réglage « max » de config/layouts.json limite la liste, à
 * quatre par défaut.
 *
 * Pas de carte autour de chaque ligne, contrairement aux priorités : une
 * carte par rendez-vous ferait cinq blocs encadrés d'affilée sur un écran
 * du soir déjà chargé. Une liste simple se lit plus vite de loin.
 * ========================================================================== */

import SectionLabel from "@/components/ui/SectionLabel";
import ToneDot from "@/components/ui/ToneDot";
import { mockAgenda } from "@/lib/mock";
import { readNumberSetting } from "@/lib/settings";

/** Valeur par défaut si layouts.json ne précise pas « max » (section 10). */
const DEFAULT_MAX = 4;

export default function Agenda({
  settings,
}: {
  settings?: Record<string, unknown>;
}) {
  const max = readNumberSetting(settings, "max", DEFAULT_MAX);
  const events = mockAgenda.slice(0, max);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <SectionLabel>Demain</SectionLabel>

      <ul className="flex flex-col gap-[14px]">
        {events.map((event) => (
          <li key={event.id} className="flex items-center gap-5">
            <ToneDot tone={event.tone} size={14} />

            {/* tabular-nums force des chiffres de largeur égale : sans cela,
                les heures ne s'alignent pas d'une ligne à l'autre. */}
            <span className="w-[120px] text-[34px] font-semibold tabular-nums text-ink">
              {event.time}
            </span>

            <span className="text-[34px] font-light text-muted">
              {event.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ==========================================================================
 * components/widgets/Agenda.tsx — les rendez-vous de demain
 *
 * Titre « DEMAIN », puis une ligne par événement : pastille colorée, heure,
 * intitulé. La prop « max » limite la liste, à quatre par défaut.
 *
 * Pas de carte autour de chaque ligne, contrairement aux priorités : une
 * carte par rendez-vous ferait cinq blocs encadrés d'affilée sur un écran
 * du soir déjà chargé. Une liste simple se lit plus vite de loin.
 * ========================================================================== */

import SectionLabel from "@/components/ui/SectionLabel";
import ToneDot from "@/components/ui/ToneDot";
import { mockAgenda } from "@/lib/mock";

/** Valeur par défaut si la page ne précise pas « max » (section 10). */
const DEFAULT_MAX = 4;

export default function Agenda({ max = DEFAULT_MAX }: { max?: number }) {
  const events = mockAgenda.slice(0, max);

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-mp-18">
      <SectionLabel>Demain</SectionLabel>

      <ul className="flex flex-col gap-mp-14">
        {events.map((event) => (
          <li key={event.id} className="flex items-center gap-5">
            <ToneDot tone={event.tone} size={14} />

            {/* tabular-nums force des chiffres de largeur égale : sans cela,
                les heures ne s'alignent pas d'une ligne à l'autre. */}
            <span className="w-mp-120 text-mp-34 font-semibold tabular-nums text-ink">
              {event.time}
            </span>

            <span className="text-mp-34 font-light text-muted">
              {event.title}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ==========================================================================
 * components/widgets/Transport.tsx — les prochains passages
 *
 * Train animé, badge de ligne, direction, conseil de départ, et les deux
 * prochains horaires. Le premier passage est le seul élément en vert vif de
 * l'écran du matin : c'est l'information qu'on vient chercher en passant
 * devant le miroir, elle doit se lire sans s'arrêter.
 * ========================================================================== */

import Train from "@/components/icons/Train";
import Card from "@/components/ui/Card";
import { mockTransport } from "@/lib/mock";

export default function Transport() {
  const { line, direction, advice, departures } = mockTransport;
  const [nextDeparture, ...laterDepartures] = departures;

  return (
    <Card tone="cyan">
      <div className="flex items-center gap-6">
        <Train size={72} className="text-cyan" />

        <div className="flex flex-1 flex-col gap-[8px]">
          <div className="flex items-center gap-[14px]">
            {/* Le badge de ligne : même pastille teintée que les catégories
                de priorités, en version texte. */}
            <span className="tone-chip rounded-[12px] px-[14px] py-[4px] text-[27px] font-semibold">
              {line}
            </span>
            <p className="text-[34px] font-light text-ink">{direction}</p>
          </div>
          <p className="text-[30px] font-light text-muted">{advice}</p>
        </div>

        <div className="flex flex-col items-end gap-[4px]">
          <p className="text-[45px] leading-none font-semibold text-neon-green">
            {nextDeparture}
          </p>
          {laterDepartures.length > 0 ? (
            <p className="text-[30px] font-light text-muted">
              puis {laterDepartures.join(", ")}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

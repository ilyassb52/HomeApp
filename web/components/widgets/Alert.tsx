/* ==========================================================================
 * components/widgets/Alert.tsx — la carte d'alerte
 *
 * Deux alertes existent : la pluie le matin (parapluie), les poubelles le
 * soir (poubelle). C'est le seul widget mis en avant avec une lueur.
 *
 * QUELLE ALERTE AFFICHER ?
 *
 * La prop « kind », donnée par la page. Le widget ne sait pas sur quelle
 * page il est et n'a pas à le savoir : la page décide, lui exécute. C'est
 * le principe qui tient tout le projet.
 *
 * IL PEUT NE RIEN AFFICHER. Sans alerte correspondante, il renvoie null — et
 * surtout aucun conteneur vide, qui garderait un cadre ou une marge à l'écran.
 * ========================================================================== */

import TrashBin from "@/components/icons/TrashBin";
import Umbrella from "@/components/icons/Umbrella";
import type { IconProps } from "@/components/icons/IconBase";
import Card from "@/components/ui/Card";
import { mockAlerts } from "@/lib/mock";
import type { AlertKind } from "@/lib/types";

const ALERT_ICONS: Record<AlertKind, (props: IconProps) => React.ReactElement> =
  {
    rain: Umbrella,
    trash: TrashBin,
  };

export default function Alert({ kind }: { kind?: AlertKind }) {
  /* Sans « kind », on prend la première alerte disponible plutôt que rien. */
  const alert = kind
    ? mockAlerts.find((candidate) => candidate.kind === kind)
    : mockAlerts[0];

  if (!alert) {
    return null;
  }

  const Icon = ALERT_ICONS[alert.kind];

  return (
    <Card tone="amber" variant="alert">
      <div className="flex items-center gap-6">
        <Icon size={72} className="text-amber" />
        <div className="flex flex-col gap-mp-6">
          <p className="text-mp-36 leading-tight font-semibold text-ink">
            {alert.title}
          </p>
          <p className="text-mp-30 font-light text-muted">{alert.advice}</p>
        </div>
      </div>
    </Card>
  );
}

/* ==========================================================================
 * components/widgets/Alert.tsx — la carte d'alerte
 *
 * Deux alertes existent : la pluie le matin (parapluie), les poubelles le
 * soir (poubelle). C'est le seul widget mis en avant avec une lueur.
 *
 * QUELLE ALERTE AFFICHER ?
 *
 * Le réglage « kind » de config/layouts.json le dit. Le widget ne connaît pas
 * le mode en cours et n'a pas à le connaître : la configuration décide, lui
 * exécute. C'est le principe qui tient tout le projet.
 *
 * IL PEUT NE RIEN AFFICHER. Sans alerte correspondante, il renvoie null — et
 * surtout aucun conteneur vide : la section 10 exige qu'un widget muet ne
 * laisse aucun espace dans la pile. Un trou de 36 px au milieu de l'écran se
 * verrait autant qu'une carte.
 * ========================================================================== */

import TrashBin from "@/components/icons/TrashBin";
import Umbrella from "@/components/icons/Umbrella";
import type { IconProps } from "@/components/icons/IconBase";
import Card from "@/components/ui/Card";
import { mockAlerts } from "@/lib/mock";
import { readTextSetting } from "@/lib/settings";
import type { AlertKind } from "@/lib/types";

const ALERT_ICONS: Record<AlertKind, (props: IconProps) => React.ReactElement> =
  {
    rain: Umbrella,
    trash: TrashBin,
  };

export default function Alert({
  settings,
}: {
  settings?: Record<string, unknown>;
}) {
  /* Sans réglage « kind », on prend la première alerte disponible : une
   * configuration incomplète affiche quelque chose plutôt que rien. */
  const requestedKind = readTextSetting(settings, "kind", "");

  const alert = requestedKind
    ? mockAlerts.find((candidate) => candidate.kind === requestedKind)
    : mockAlerts[0];

  if (!alert) {
    return null;
  }

  const Icon = ALERT_ICONS[alert.kind];

  return (
    <Card tone="amber" variant="alert">
      <div className="flex items-center gap-6">
        <Icon size={72} className="text-amber" />
        <div className="flex flex-col gap-[6px]">
          <p className="text-[36px] leading-tight font-semibold text-ink">
            {alert.title}
          </p>
          <p className="text-[30px] font-light text-muted">{alert.advice}</p>
        </div>
      </div>
    </Card>
  );
}

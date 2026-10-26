/* ==========================================================================
 * lib/widget-registry.ts — l'annuaire « nom du widget → composant »
 *
 * C'EST LA PIÈCE QUI REND L'ÉCRAN CONFIGURABLE
 *
 * Sans registre, la page devrait contenir une longue suite de conditions :
 * « si le type vaut clock, affiche <Clock /> ; sinon si c'est weather… ».
 * Chaque nouveau widget obligerait à rouvrir la page.
 *
 * Avec le registre, la page ne connaît aucun widget. Elle lit un nom dans la
 * configuration, le cherche ici, et affiche ce qu'elle trouve. Ajouter un
 * widget = créer son fichier et ajouter UNE ligne ci-dessous.
 *
 * C'est ce détour qui permettra, à l'étape 4, de changer l'écran depuis une
 * appli téléphone : le téléphone écrit un nom dans la configuration, le
 * miroir le retrouve ici.
 * ========================================================================== */

import type { ComponentType } from "react";
import type { WidgetType } from "@/lib/types";
import Clock from "@/components/widgets/Clock";

/* Tout widget reçoit la même chose : ses réglages, et rien d'autre. Ses
 * données, il va les chercher lui-même dans lib/mock.ts (tâche 6). C'est ce
 * contrat commun qui permet de les ranger tous dans le même annuaire. */
export type WidgetComponent = ComponentType<{
  settings?: Record<string, unknown>;
}>;

/* Partial<Record<…>> se lit « certaines de ces clés, pas forcément toutes ».
 * Aujourd'hui un seul widget existe ; les tâches 6 à 8 rempliront le reste.
 * Un type encore absent n'est pas une erreur : WidgetRenderer l'ignore et le
 * signale dans la console, exactement comme un type inconnu. Quand les dix-
 * neuf widgets existeront, « Partial » sautera — et TypeScript signalera
 * alors tout oubli. */
export const widgetRegistry: Partial<Record<WidgetType, WidgetComponent>> = {
  clock: Clock,
};

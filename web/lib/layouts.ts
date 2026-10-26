/* ==========================================================================
 * lib/layouts.ts — lire config/layouts.json sans jamais faire planter l'écran
 *
 * POURQUOI CE FICHIER EXISTE
 *
 * config/layouts.json finira, à l'étape 4, par être modifié depuis une appli
 * téléphone. Autrement dit : son contenu deviendra imprévisible. Un mode sans
 * disposition, une zone mal orthographiée, deux widgets avec le même
 * identifiant — tout cela arrivera, et le miroir doit continuer d'afficher
 * quelque chose. Un écran noir dans une salle de bain ne dit rien de ce qui
 * ne va pas.
 *
 * Ce fichier est donc le filtre entre un fichier de données et l'écran. Il
 * est volontairement dans lib/ et non dans un composant : c'est une règle de
 * décision, pas de l'affichage. Elle pourra être testée à part.
 *
 * Les cas traités sont ceux listés par la section 10 du brief.
 * ========================================================================== */

import layoutsData from "@/config/layouts.json";
import type { Layout, Mode, WidgetArea, WidgetConfig } from "@/lib/types";

/* --------------------------------------------------------------------------
 * 1. Le fichier de configuration
 *
 * TypeScript lit layouts.json et en déduit des types très larges : pour lui,
 * "morning" est juste un texte, pas notre Mode. On affirme donc ici, UNE
 * fois et à un seul endroit, que ce fichier a bien la forme attendue.
 *
 * « as unknown as Layout[] » est cette affirmation. On l'accepte parce que
 * tout ce qui suit dans ce fichier vérifie le contenu à l'exécution : si la
 * forme est fausse, ce sont les contrôles ci-dessous qui le rattrapent, pas
 * un écran blanc.
 * -------------------------------------------------------------------------- */
const layouts = layoutsData as unknown as Layout[];

/** Les zones acceptées. Toute autre valeur dans le JSON est ignorée. */
const WIDGET_AREAS: readonly WidgetArea[] = [
  "header-left",
  "header-right",
  "main",
  "footer",
];

/* Dernier filet de sécurité : si un mode n'a aucune disposition, on affiche
 * au moins l'heure. Un miroir qui donne l'heure reste utile ; un miroir noir
 * ressemble à une panne. */
const FALLBACK_WIDGETS: WidgetConfig[] = [
  { id: "clock-fallback", type: "clock", area: "header-left" },
];

/* --------------------------------------------------------------------------
 * 2. La fonction utilisée par la page
 *
 * Elle répond à une seule question : « pour ce mode, quels widgets dois-je
 * afficher, et dans quel ordre ? »
 * -------------------------------------------------------------------------- */
export function getWidgetsForMode(
  mode: Exclude<Mode, "sleep">,
): WidgetConfig[] {
  const layout = layouts.find((candidate) => candidate.mode === mode);

  if (!layout) {
    console.warn(
      `[layouts] Aucune disposition pour le mode « ${mode} » dans config/layouts.json. Seule l'horloge est affichée.`,
    );
    return FALLBACK_WIDGETS;
  }

  /* Un Set est une collection sans doublon. On y note les identifiants déjà
   * rencontrés pour repérer ceux qui reviennent deux fois. */
  const seenIds = new Set<string>();

  return layout.widgets.filter((widget) => {
    /* Le détour par « readonly string[] » est nécessaire : pour TypeScript,
     * widget.area est DÉJÀ une zone valide (c'est ce que dit le type), donc
     * il refuserait de comparer. Mais le type décrit ce que le fichier
     * DEVRAIT contenir, pas ce qu'il contient vraiment. On compare donc en
     * tant que simple texte. */
    if (!(WIDGET_AREAS as readonly string[]).includes(widget.area)) {
      console.warn(
        `[layouts] Le widget « ${widget.id} » vise la zone inconnue « ${widget.area} » : il est ignoré.`,
      );
      return false;
    }

    if (seenIds.has(widget.id)) {
      console.warn(
        `[layouts] L'identifiant « ${widget.id} » apparaît plusieurs fois dans le mode « ${mode} » : seule la première occurrence est affichée.`,
      );
      return false;
    }

    seenIds.add(widget.id);
    return true;
  });
}

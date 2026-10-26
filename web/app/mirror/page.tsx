/* ==========================================================================
 * app/mirror/page.tsx — l'écran du miroir, à l'adresse « /mirror »
 *
 * Cette page est désormais dans sa forme définitive, et elle est courte :
 * c'était l'objectif. Elle ne connaît aucun widget. Elle fait trois choses :
 *
 *   1. attendre d'être affichée dans le navigateur ;
 *   2. demander à lib/layouts.ts la liste des widgets du mode en cours ;
 *   3. confier cette liste à WidgetRenderer.
 *
 * Ajouter, retirer ou déplacer un widget ne touchera plus jamais ce fichier :
 * tout se passe dans config/layouts.json.
 *
 * POURQUOI ATTENDRE D'ÊTRE DANS LE NAVIGATEUR ?
 *
 * Next.js fabrique une première version de la page sur le serveur, puis le
 * navigateur la reprend. Si les deux versions diffèrent, React proteste :
 * c'est l'« erreur d'hydratation ». Or l'horloge affiche l'heure — forcément
 * différente entre les deux moments.
 *
 * La solution de la section 10 du brief : côté serveur, ne rien afficher
 * qu'un fond noir. Le vrai écran n'apparaît qu'une fois dans le navigateur,
 * où une seule horloge existe. Le miroir affiche un fond noir en permanence :
 * personne ne verra jamais cette première image.
 * ========================================================================== */

"use client";

import { useSyncExternalStore } from "react";
import MirrorFrame from "@/components/mirror/MirrorFrame";
import WidgetRenderer from "@/components/mirror/WidgetRenderer";
import { getWidgetsForMode } from "@/lib/layouts";
import type { Mode } from "@/lib/types";

/* PROVISOIRE — tâche 4.
 * Le mode sera alors calculé par getMode(new Date()) à partir de l'heure de
 * Paris, recalculé chaque minute, et forçable par ?mode=evening dans l'URL.
 * En attendant, l'écran affiche toujours la disposition du matin. */
const PROVISIONAL_MODE: Exclude<Mode, "sleep"> = "morning";

/* --------------------------------------------------------------------------
 * Savoir si l'on est dans le navigateur
 *
 * useSyncExternalStore sert normalement à brancher React sur quelque chose
 * d'extérieur à lui. On détourne ici ce mécanisme, parce qu'il a une
 * propriété unique : React lui demande SÉPARÉMENT la valeur à utiliser sur le
 * serveur et celle à utiliser dans le navigateur. D'où false puis true.
 *
 * Ses trois arguments :
 *   1. comment s'abonner aux changements — ici rien ne change jamais, donc
 *      une fonction qui ne fait rien et renvoie un désabonnement vide ;
 *   2. la valeur dans le navigateur ;
 *   3. la valeur pendant le rendu sur le serveur.
 *
 * Pourquoi pas le réflexe habituel (un useState passé à true dans un
 * useEffect) ? Parce que React 19 et Next 16 le refusent désormais : la règle
 * react-hooks/set-state-in-effect fait échouer npm run lint, car ce motif
 * provoque un deuxième rendu complet en cascade.
 * -------------------------------------------------------------------------- */
const subscribeToNothing = () => () => {};

function useIsBrowser(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

export default function MirrorPage() {
  const isBrowser = useIsBrowser();

  if (!isBrowser) {
    return <div className="fixed inset-0 bg-bg" />;
  }

  const widgets = getWidgetsForMode(PROVISIONAL_MODE);

  return (
    <MirrorFrame>
      <WidgetRenderer widgets={widgets} />
    </MirrorFrame>
  );
}

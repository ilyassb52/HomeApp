/* ==========================================================================
 * app/mirror/page.tsx — l'écran du miroir, à l'adresse « /mirror »
 *
 * Elle fait quatre choses, et toujours aucune ne concerne un widget :
 *
 *   1. attendre d'être affichée dans le navigateur ;
 *   2. choisir le mode — celui de l'URL s'il y en a un, sinon celui de
 *      l'heure de Paris, recalculé chaque minute ;
 *   3. afficher l'écran de veille si c'est la nuit ;
 *   4. sinon, demander les widgets du mode et les confier à WidgetRenderer.
 *
 * POURQUOI ATTENDRE D'ÊTRE DANS LE NAVIGATEUR ?
 *
 * Next.js fabrique une première version de la page sur le serveur, puis le
 * navigateur la reprend. Si les deux diffèrent, React proteste : c'est
 * l'« erreur d'hydratation ». Or l'heure, elle, diffère forcément entre les
 * deux moments. On n'affiche donc qu'un fond noir côté serveur. Sur le
 * miroir, l'écran est noir en permanence : personne ne verra cette image.
 * ========================================================================== */

"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import MirrorFrame from "@/components/mirror/MirrorFrame";
import WidgetRenderer from "@/components/mirror/WidgetRenderer";
import { getWidgetsForMode } from "@/lib/layouts";
import { getMode, parseMode } from "@/lib/modes";

/* Toutes les minutes : assez fin pour que la bascule de 15 h 00 se voie dans
 * la minute, assez rare pour ne rien coûter. Les heures de bascule étant
 * rondes, vérifier plus souvent n'apporterait rien. */
const MODE_CHECK_INTERVAL_MS = 60_000;

/** Ce que voit le serveur, et ce qu'affiche la veille : rien. */
function BlackScreen() {
  return <div className="mirror-screen fixed inset-0 bg-bg" />;
}

/* --------------------------------------------------------------------------
 * 1. Savoir si l'on est dans le navigateur
 *
 * useSyncExternalStore sert normalement à brancher React sur quelque chose
 * d'extérieur à lui. On détourne ici ce mécanisme pour une propriété unique :
 * React lui demande SÉPARÉMENT la valeur du serveur et celle du navigateur.
 * D'où false, puis true.
 *
 * Pourquoi pas le réflexe habituel — un useState passé à true dans un
 * useEffect ? Parce que React 19 et Next 16 le refusent : la règle
 * react-hooks/set-state-in-effect fait échouer npm run lint, ce motif
 * provoquant un second rendu complet en cascade.
 * -------------------------------------------------------------------------- */
const subscribeToNothing = () => () => {};

function useIsBrowser(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/* --------------------------------------------------------------------------
 * 2. La page
 *
 * useSearchParams lit l'URL, ce que Next.js ne peut pas faire pendant la
 * fabrication de la page sur le serveur — l'URL n'existe pas encore à ce
 * moment-là. Il exige donc un <Suspense> autour : « affiche ceci en
 * attendant de connaître l'adresse ». Sans lui, npm run build échoue.
 *
 * C'est pour cette seule raison que l'écran est coupé en deux composants.
 * -------------------------------------------------------------------------- */
export default function MirrorPage() {
  return (
    <Suspense fallback={<BlackScreen />}>
      <MirrorScreen />
    </Suspense>
  );
}

function MirrorScreen() {
  const isBrowser = useIsBrowser();
  const searchParams = useSearchParams();

  /* L'instant courant, relu chaque minute. Changer cet état est ce qui fait
   * basculer l'écran tout seul à 15 h 00 ou à 23 h 00, sans rechargement. */
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(
      () => setNow(new Date()),
      MODE_CHECK_INTERVAL_MS,
    );
    return () => clearInterval(intervalId);
  }, []);

  if (!isBrowser) {
    return <BlackScreen />;
  }

  /* ?mode=evening force un mode, pour travailler sur l'écran du soir à 10 h
   * du matin. Sans paramètre — le cas du vrai miroir — c'est l'heure de
   * Paris qui décide. */
  const forcedMode = parseMode(searchParams.get("mode"));
  const mode = forcedMode ?? getMode(now);

  /* PROVISOIRE — tâche 9.
   * La veille sera un écran noir portant une petite heure en 48 px qui se
   * déplace lentement, pour ne pas marquer la dalle. En attendant, l'écran
   * est simplement noir : c'est déjà le bon comportement, il lui manque
   * seulement l'heure. */
  if (mode === "sleep") {
    return <BlackScreen />;
  }

  return (
    <MirrorFrame>
      <WidgetRenderer widgets={getWidgetsForMode(mode)} />
    </MirrorFrame>
  );
}

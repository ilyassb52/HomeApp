/* ==========================================================================
 * app/mirror/page.tsx — l'écran du miroir, à l'adresse « /mirror »
 *
 * Elle fait trois choses, et aucune ne concerne un widget :
 *
 *   1. attendre d'être affichée dans le navigateur ;
 *   2. choisir la page — celle de l'URL s'il y en a une, sinon la première ;
 *   3. l'afficher dans le cadre, avec le bouton « page suivante ».
 *
 * Ce que contient chaque page, et où se pose chaque widget, est décidé dans
 * components/mirror/pages/.
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

import { Suspense, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import MirrorFrame from "@/components/mirror/MirrorFrame";
import PageSwitcher from "@/components/mirror/PageSwitcher";
import { MIRROR_PAGES } from "@/components/mirror/pages";
import { findPageIndex } from "@/lib/pages";

/** Ce que voit le serveur avant que le navigateur prenne le relais : rien. */
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

  /* La page affichée, par sa position dans MIRROR_PAGES. ?page=evening
   * choisit celle du départ ; le bouton fait ensuite avancer la position. */
  const [pageIndex, setPageIndex] = useState(() =>
    findPageIndex(
      MIRROR_PAGES.map((page) => page.id),
      searchParams.get("page"),
    ),
  );

  if (!isBrowser) {
    return <BlackScreen />;
  }

  /* ?calibrer (sans valeur) affiche la grille et les coordonnées. */
  const calibrate = searchParams.has("calibrer");

  const { Component } = MIRROR_PAGES[pageIndex];

  /* Le « % » (reste de la division) fait revenir à 0 après la dernière
   * page : avec deux pages, 0 → 1 → 0 → 1… */
  const nextIndex = (pageIndex + 1) % MIRROR_PAGES.length;

  return (
    <MirrorFrame
      calibrate={calibrate}
      overlay={
        <PageSwitcher
          nextLabel={MIRROR_PAGES[nextIndex].label}
          onNext={() => setPageIndex(nextIndex)}
        />
      }
    >
      <Component />
    </MirrorFrame>
  );
}

/* ==========================================================================
 * app/app/agenda/page.tsx — la page téléphone « /app/agenda »
 *
 * Comme /app/shopping : ce fichier reste un composant serveur pour
 * déclarer le titre de l'onglet. Tout le reste vit dans AgendaManager.
 *
 * POURQUOI UN <Suspense> ICI, ET PAS SUR LES AUTRES PAGES ?
 *
 * AgendaManager lit la date du jour (parisToday, donc new Date()) pour
 * ouvrir le calendrier sur le bon mois. Next.js prépare les pages à
 * l'avance : sans précaution, cette date serait figée au moment de la
 * préparation au lieu d'être relue à chaque visite — et Next.js le refuse.
 * <Suspense> lui dit « cette partie se fabrique à chaque visite ; montre
 * ceci en attendant ». Les priorités et les courses ne lisent pas la date :
 * elles n'en ont pas besoin.
 * ========================================================================== */

import type { Metadata } from "next";
import { Suspense } from "react";
import AgendaManager from "@/components/app/AgendaManager";
import { LoadingRows } from "@/components/app/LoadStates";

export const metadata: Metadata = {
  title: "Agenda",
};

export default function AgendaPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 pt-8">
          <LoadingRows />
        </main>
      }
    >
      <AgendaManager />
    </Suspense>
  );
}

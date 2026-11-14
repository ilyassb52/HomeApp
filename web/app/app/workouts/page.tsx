/* ==========================================================================
 * app/app/workouts/page.tsx — la page téléphone « /app/workouts »
 *
 * Comme /app/agenda : ce fichier reste un composant serveur pour déclarer
 * le titre de l'onglet. Tout le reste vit dans WorkoutsManager.
 *
 * Le <Suspense> a la même raison que sur /app/agenda (voir son page.tsx) :
 * WorkoutsManager lit la date du jour pour ouvrir le mois en cours, et
 * Next.js doit la relire à chaque visite au lieu de la figer.
 * ========================================================================== */

import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingRows } from "@/components/app/LoadStates";
import WorkoutsManager from "@/components/app/WorkoutsManager";

export const metadata: Metadata = {
  title: "Entraînements",
};

export default function WorkoutsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 pt-8">
          <LoadingRows />
        </main>
      }
    >
      <WorkoutsManager />
    </Suspense>
  );
}

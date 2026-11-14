/* ==========================================================================
 * app/app/workouts/[workoutId]/exercises/new/page.tsx
 * — la page « nouvel exercice » d'une séance, à la salle
 *
 * [workoutId] entre crochets : un morceau d'adresse variable. Pour
 * /app/workouts/12/exercises/new, Next.js donne { workoutId: "12" }.
 * « new » est un dossier ordinaire : il passe avant [exerciseId], son voisin.
 *
 * Le <Suspense> a deux raisons : ces morceaux d'adresse n'arrivent qu'à la
 * visite (une promesse), et la page lit l'heure pour son minuteur.
 * ========================================================================== */

import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingRows } from "@/components/app/LoadStates";
import ExerciseLogger from "@/components/app/exercise/ExerciseLogger";

export const metadata: Metadata = {
  title: "Nouvel exercice",
};

export default function NewExercisePage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-md px-4 pt-8">
          <LoadingRows />
        </main>
      }
    >
      <ExerciseLogger params={params} />
    </Suspense>
  );
}

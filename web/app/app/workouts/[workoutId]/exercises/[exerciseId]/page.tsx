/* ==========================================================================
 * app/app/workouts/[workoutId]/exercises/[exerciseId]/page.tsx
 * — la page d'un exercice déjà commencé : continuer ses séries, corriger
 *
 * Même page que …/exercises/new (voir son page.tsx), avec un exercice en
 * plus dans l'adresse : /app/workouts/12/exercises/34.
 * ========================================================================== */

import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingRows } from "@/components/app/LoadStates";
import ExerciseLogger from "@/components/app/exercise/ExerciseLogger";

export const metadata: Metadata = {
  title: "Exercice",
};

export default function ExercisePage({
  params,
}: {
  params: Promise<{ workoutId: string; exerciseId: string }>;
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

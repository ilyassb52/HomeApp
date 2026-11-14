/* ==========================================================================
 * components/app/WorkoutCard.tsx — une séance sur la page téléphone
 *
 * REPLIÉE : une seule ligne qu'on touche pour l'ouvrir.
 *
 *   Lun. 9 nov.   Jambes                                3 exos   ▸
 *
 * DÉPLIÉE : ses exercices, chacun avec ses séries en pastilles.
 *
 *   Squat                          3 séries · max 80 kg   ›  ✕
 *   [10 × 60 kg] [8 × 70 kg] [6 × 80 kg]
 *   [ + Ajouter un exercice ]
 *   Modifier la séance · Supprimer
 *
 * Un exercice se fait (et se corrige) sur SA page, pensée pour la salle
 * (components/app/exercise/ExerciseLogger.tsx) : toucher un exercice ou
 * « + Ajouter un exercice » y mène. Seul le formulaire du jour et de la
 * note s'ouvre encore dans la carte (« sessionForm »).
 *
 * Comme EventRow, la carte ne parle jamais à l'API : elle prévient la page
 * (onToggle, onEditSession…), qui seule possède les mutations.
 * ========================================================================== */

"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Card from "@/components/ui/Card";
import { CATEGORY_LOOKS } from "@/lib/priority-categories";
import type { Workout, WorkoutSet } from "@/lib/types";
import {
  countLabel,
  exerciseSummary,
  formatKg,
  shortDayLabel,
} from "@/lib/workouts";

/* La couleur du sport, la même que les priorités « Sport ». */
const SPORT_TONE = CATEGORY_LOOKS.sport.tone;

/* Les deux liens texte du pied de carte. La couleur est à part : deux
 * classes de couleur sur le même bouton se battraient. */
const TEXT_BUTTON =
  "min-h-11 rounded-lg px-3 text-sm font-semibold active:bg-ink/10";

/** Une série en pastille : « 10 × 60 kg », ou « 20 » au poids du corps. */
function SetChip({ set }: { set: WorkoutSet }) {
  return (
    <span className="rounded-lg bg-ink/[0.07] px-2 py-1 text-sm text-ink tabular-nums">
      {set.reps}
      {set.weight_kg !== null ? (
        <span className="text-muted"> × {formatKg(set.weight_kg)}</span>
      ) : null}
    </span>
  );
}

export default function WorkoutCard({
  workout,
  isExpanded,
  sessionForm,
  onToggle,
  onEditSession,
  onDeleteSession,
  onDeleteExercise,
}: {
  workout: Workout;
  isExpanded: boolean;
  /** Le formulaire du jour et de la note, s'il est ouvert ; sinon null. */
  sessionForm: ReactNode;
  onToggle: () => void;
  onEditSession: () => void;
  onDeleteSession: () => void;
  onDeleteExercise: (exerciseId: number) => void;
}) {
  const day = shortDayLabel(workout.day);
  const summary = countLabel("exo", workout.exercises.length, "Aucun exo");
  const exercisesUrl = `/app/workouts/${workout.id}/exercises`;

  return (
    <Card
      tone={SPORT_TONE}
      variant={isExpanded ? "tinted" : "plain"}
      /* p-0 : la marge de la carte du miroir (36 px) est faite pour un
       * grand écran ; ici, l'en-tête et le contenu posent la leur. */
      className="overflow-hidden rounded-2xl p-0"
    >
      {/* 1. L'en-tête : toute la ligne est un bouton qui plie et déplie. */}
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={onToggle}
        className="flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold text-ink">{day}</p>
          {workout.note ? (
            <p className="truncate text-sm font-light text-muted">
              {workout.note}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-sm text-muted tabular-nums">
          {summary}
        </span>
        {/* Le chevron tourne d'un quart de tour quand la carte est ouverte. */}
        <span
          aria-hidden
          className={`shrink-0 text-lg text-muted transition-transform ${isExpanded ? "rotate-90" : ""}`}
        >
          ›
        </span>
      </button>

      {isExpanded ? (
        <div className="flex flex-col gap-3 border-t border-ink/10 px-3 pt-3 pb-2">
          {/* 2. Le formulaire du jour et de la note, s'il est ouvert. */}
          {sessionForm}

          {/* 3. Les exercices : les toucher ouvre leur page. */}
          {workout.exercises.length === 0 ? (
            <p className="text-sm font-light text-muted">
              Aucun exercice pour l&apos;instant.
            </p>
          ) : (
            <ol className="flex flex-col divide-y divide-ink/10">
              {workout.exercises.map((exercise) => (
                <li
                  key={exercise.id}
                  className="flex items-center gap-1 py-2 first:pt-0"
                >
                  <Link
                    href={`${exercisesUrl}/${exercise.id}`}
                    className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg active:bg-ink/5"
                  >
                    <span className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <span className="text-[17px] break-words text-ink">
                        {exercise.name}
                      </span>
                      <span className="text-xs text-muted tabular-nums">
                        {exerciseSummary(exercise)}
                      </span>
                    </span>
                    <span className="flex flex-wrap gap-1.5">
                      {exercise.sets.map((s, index) => (
                        <SetChip key={index} set={s} />
                      ))}
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-label={`Retirer ${exercise.name}`}
                    onClick={() => onDeleteExercise(exercise.id)}
                    className="flex size-11 shrink-0 items-center justify-center rounded-lg text-lg text-muted active:bg-ink/10"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ol>
          )}

          {/* 4. Un nouvel exercice : sa page, faite pour la salle. */}
          <Link
            href={`${exercisesUrl}/new`}
            className="flex min-h-12 items-center justify-center rounded-xl bg-ink px-3 font-semibold text-bg active:opacity-80"
          >
            + Ajouter un exercice
          </Link>

          {/* 5. Le pied : agir sur la séance entière. */}
          {sessionForm === null ? (
            <div className="flex justify-end gap-1">
              <button
                type="button"
                onClick={onEditSession}
                className={`${TEXT_BUTTON} text-muted`}
              >
                Modifier la séance
              </button>
              <button
                type="button"
                onClick={onDeleteSession}
                className={`${TEXT_BUTTON} text-coral`}
              >
                Supprimer
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

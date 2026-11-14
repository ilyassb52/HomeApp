/* ==========================================================================
 * lib/api/workouts.ts — lire et modifier ses entraînements
 *
 * Les lectures : useWorkoutsBetween (les séances d'une période), et pour
 * la page d'un exercice useWorkout, useExerciseNames, usePreviousExercise.
 * Puis deux familles de mutations :
 *
 *   la séance     useAddWorkout (l'ouvrir vide), useUpdateWorkout (jour,
 *                 note), useDeleteWorkout
 *   un exercice   useAddExercise, useUpdateExercise, useDeleteExercise
 *
 * PAS DE MUTATION « OPTIMISTE » ICI, comme pour l'agenda
 * (lib/api/events.ts) : on envoie un formulaire, puis on relit. L'attente
 * est invisible, le formulaire affiche « Envoi… ».
 * ========================================================================== */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, MIRROR_PROFILE_ID } from "@/lib/api/client";
import { throwIfError } from "@/lib/api/optimistic";
import type { IsoDay } from "@/lib/calendar";
import type { ExerciseDraft, Workout, WorkoutDraft } from "@/lib/types";

/* --------------------------------------------------------------------------
 * 1. Constantes
 * -------------------------------------------------------------------------- */

/* RECOPIE de ExerciseName et WorkoutNote dans api/app/schemas/workout.py. */
export const EXERCISE_NAME_MAX_LENGTH = 80;
export const WORKOUT_NOTE_MAX_LENGTH = 200;

/* Toutes les lectures commencent par ["workouts", profil] : invalider
 * cette clé fait relire chaque mois déjà chargé. */
const workoutsQueryKey = ["workouts", MIRROR_PROFILE_ID] as const;

/* PROVISOIRE, comme pour les priorités : le profil voyage dans l'URL en
 * attendant l'authentification (voir lib/api/client.ts). */
const profileQuery = { profile_id: MIRROR_PROFILE_ID };

/* --------------------------------------------------------------------------
 * 2. Lire
 * -------------------------------------------------------------------------- */

/** Les séances du jour start au jour end, tous deux inclus. */
export function useWorkoutsBetween(start: IsoDay, end: IsoDay) {
  return useQuery({
    queryKey: [...workoutsQueryKey, start, end],
    queryFn: async () => {
      const { data, error } = await api.GET("/workouts", {
        params: { query: { ...profileQuery, start, end } },
      });
      throwIfError(error, "Lecture des entraînements impossible.");
      return data;
    },
    /* Comme l'agenda : en changeant de mois, l'ancien reste affiché le
     * temps que le nouveau arrive. */
    placeholderData: keepPreviousData,
  });
}

/** Une séance, pour la page d'un exercice. */
export function useWorkout(id: number) {
  return useQuery({
    queryKey: [...workoutsQueryKey, "one", id],
    queryFn: async () => {
      const { data, error } = await api.GET("/workouts/{workout_id}", {
        params: { path: { workout_id: id }, query: profileQuery },
      });
      throwIfError(error, "Lecture de la séance impossible.");
      return data as Workout;
    },
  });
}

/** Les noms d'exercices déjà utilisés, du plus récent au plus ancien. */
export function useExerciseNames() {
  return useQuery({
    queryKey: [...workoutsQueryKey, "names"],
    queryFn: async () => {
      const { data, error } = await api.GET("/workouts/exercise-names", {
        params: { query: profileQuery },
      });
      throwIfError(error, "Lecture des exercices impossible.");
      return data ?? [];
    },
  });
}

/** « La dernière fois » qu'on a fait cet exercice avant cette séance, ou
 *  null s'il n'a jamais été fait. Rien n'est demandé tant qu'il n'y a pas
 *  de nom (enabled). */
export function usePreviousExercise(workoutId: number, name: string) {
  return useQuery({
    queryKey: [...workoutsQueryKey, "previous", workoutId, name.toLowerCase()],
    queryFn: async () => {
      const { data, error } = await api.GET("/workouts/{workout_id}/previous", {
        params: {
          path: { workout_id: workoutId },
          query: { ...profileQuery, name },
        },
      });
      throwIfError(error, "Lecture de l'historique impossible.");
      return data ?? null;
    },
    enabled: name.trim() !== "",
  });
}

/* --------------------------------------------------------------------------
 * 3. Le chemin commun : envoyer, puis tout relire
 *
 * Chaque mutation renvoie la séance que l'API a répondue (sauf la
 * suppression d'une séance, qui ne renvoie rien). La page s'en sert après
 * « Ouvrir la séance » : il lui faut son id pour y ajouter un exercice.
 * -------------------------------------------------------------------------- */
function useWorkoutMutation<Variables, Result>(
  send: (variables: Variables) => Promise<Result>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: send,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: workoutsQueryKey }),
  });
}

/** openapi-fetch range la réponse dans « data » : on la renvoie, une fois
 *  sûr qu'il n'y a pas d'erreur. */
function workoutOrThrow(
  result: { data?: Workout; error?: unknown },
  message: string,
): Workout {
  throwIfError(result.error, message);
  return result.data as Workout;
}

/* --------------------------------------------------------------------------
 * 4. La séance : l'ouvrir, changer son jour ou sa note, la supprimer
 * -------------------------------------------------------------------------- */
export function useAddWorkout() {
  return useWorkoutMutation(async (draft: WorkoutDraft) =>
    workoutOrThrow(
      await api.POST("/workouts", {
        params: { query: profileQuery },
        body: draft,
      }),
      "Ouverture de la séance impossible.",
    ),
  );
}

export function useUpdateWorkout() {
  return useWorkoutMutation(
    async ({ id, draft }: { id: number; draft: WorkoutDraft }) =>
      workoutOrThrow(
        await api.PUT("/workouts/{workout_id}", {
          params: { path: { workout_id: id }, query: profileQuery },
          body: draft,
        }),
        "Modification impossible.",
      ),
  );
}

export function useDeleteWorkout() {
  return useWorkoutMutation(async (id: number) => {
    const { error } = await api.DELETE("/workouts/{workout_id}", {
      params: { path: { workout_id: id }, query: profileQuery },
    });
    throwIfError(error, "Suppression impossible.");
  });
}

/* --------------------------------------------------------------------------
 * 5. Les exercices, un par un
 * -------------------------------------------------------------------------- */
export function useAddExercise() {
  return useWorkoutMutation(
    async ({ workoutId, draft }: { workoutId: number; draft: ExerciseDraft }) =>
      workoutOrThrow(
        await api.POST("/workouts/{workout_id}/exercises", {
          params: { path: { workout_id: workoutId }, query: profileQuery },
          body: draft,
        }),
        "Ajout de l'exercice impossible.",
      ),
  );
}

export function useUpdateExercise() {
  return useWorkoutMutation(
    async ({
      workoutId,
      exerciseId,
      draft,
    }: {
      workoutId: number;
      exerciseId: number;
      draft: ExerciseDraft;
    }) =>
      workoutOrThrow(
        await api.PUT("/workouts/{workout_id}/exercises/{exercise_id}", {
          params: {
            path: { workout_id: workoutId, exercise_id: exerciseId },
            query: profileQuery,
          },
          body: draft,
        }),
        "Modification de l'exercice impossible.",
      ),
  );
}

export function useDeleteExercise() {
  return useWorkoutMutation(
    async ({
      workoutId,
      exerciseId,
    }: {
      workoutId: number;
      exerciseId: number;
    }) =>
      workoutOrThrow(
        await api.DELETE("/workouts/{workout_id}/exercises/{exercise_id}", {
          params: {
            path: { workout_id: workoutId, exercise_id: exerciseId },
            query: profileQuery,
          },
        }),
        "Suppression de l'exercice impossible.",
      ),
  );
}

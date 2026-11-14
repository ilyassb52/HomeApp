/* ==========================================================================
 * lib/api/priorities.ts — lire et modifier les priorités du jour
 *
 * TanStack Query s'occupe de tout ce qu'on écrirait sinon à la main : la
 * requête, sa mise en cache, la relecture régulière, et la conservation des
 * dernières données reçues si une relecture échoue.
 *
 * Le widget Priorities du miroir et la page téléphone /app/priorities
 * appellent usePriorities() chacun de leur côté : grâce au cache, une seule
 * requête part pour tous.
 *
 * Les modifications passent par des « mutations » (useMutation). Elles
 * vivent ici, et non dans la page téléphone, pour que le miroir tactile
 * coche une priorité avec exactement le même hook.
 * ========================================================================== */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, MIRROR_PROFILE_ID } from "@/lib/api/client";
import { throwIfError, useOptimisticMutation } from "@/lib/api/optimistic";
import type { Priority, PriorityCategory } from "@/lib/types";

/* --------------------------------------------------------------------------
 * 1. Constantes
 * -------------------------------------------------------------------------- */

/* Toutes les 30 s : une priorité cochée sur le téléphone apparaît sur le
 * miroir en moins d'une demi-minute, sans charger l'API pour rien. */
const PRIORITIES_REFRESH_MS = 30_000;

/* RECOPIE de GoalText dans api/app/schemas/goal.py : une priorité tient sur
 * une carte, 120 caractères au plus. Le champ de saisie s'arrête là. */
export const GOAL_TEXT_MAX_LENGTH = 120;

/* La « clé » range ces données dans le cache. Chaque mutation la cite pour
 * dire « ces données ont changé, relis-les ». */
export const prioritiesQueryKey = ["goals", MIRROR_PROFILE_ID] as const;

/* Toutes les routes attendent le profil en paramètre d'URL, en attendant le
 * jeton d'authentification (voir client.ts). */
const profileQuery = { query: { profile_id: MIRROR_PROFILE_ID } };

/* --------------------------------------------------------------------------
 * 2. Lire
 * -------------------------------------------------------------------------- */
export function usePriorities() {
  return useQuery({
    queryKey: prioritiesQueryKey,
    queryFn: async () => {
      const { data, error } = await api.GET("/goals", {
        params: profileQuery,
      });
      throwIfError(error, "Lecture des priorités impossible.");
      return data;
    },
    refetchInterval: PRIORITIES_REFRESH_MS,
  });
}

/* --------------------------------------------------------------------------
 * 3. Le motif « optimiste »
 *
 * Trois mutations sur quatre modifient la liste en cache AVANT la réponse
 * de l'API (voir lib/api/optimistic.ts). Ce raccourci leur donne la bonne
 * clé et le bon type d'élément.
 * -------------------------------------------------------------------------- */
function useOptimisticGoalMutation<Variables>(
  send: (variables: Variables) => Promise<void>,
  applyToCache: (goals: Priority[], variables: Variables) => Priority[],
) {
  return useOptimisticMutation(prioritiesQueryKey, send, applyToCache);
}

/* --------------------------------------------------------------------------
 * 4. Modifier, cocher
 *
 * changes ne contient que ce qui change : { done: true } coche,
 * { text: "…" } renomme, { category: "sport" } change la catégorie.
 * -------------------------------------------------------------------------- */
export type GoalChanges = Partial<Pick<Priority, "text" | "category" | "done">>;

export function useUpdateGoal() {
  return useOptimisticGoalMutation(
    async ({ id, changes }: { id: number; changes: GoalChanges }) => {
      const { error } = await api.PATCH("/goals/{goal_id}", {
        params: { ...profileQuery, path: { goal_id: id } },
        body: changes,
      });
      throwIfError(error, "Modification impossible.");
    },
    (goals, { id, changes }) =>
      goals.map((goal) => (goal.id === id ? { ...goal, ...changes } : goal)),
  );
}

/* --------------------------------------------------------------------------
 * 5. Supprimer
 * -------------------------------------------------------------------------- */
export function useDeleteGoal() {
  return useOptimisticGoalMutation(
    async (id: number) => {
      const { error } = await api.DELETE("/goals/{goal_id}", {
        params: { ...profileQuery, path: { goal_id: id } },
      });
      throwIfError(error, "Suppression impossible.");
    },
    (goals, id) => goals.filter((goal) => goal.id !== id),
  );
}

/* --------------------------------------------------------------------------
 * 6. Réordonner
 *
 * On envoie tous les identifiants, du premier au dernier : c'est ce que
 * demande PUT /goals/order, qui refuse une liste incomplète.
 * -------------------------------------------------------------------------- */
export function useReorderGoals() {
  return useOptimisticGoalMutation(
    async (ids: number[]) => {
      const { error } = await api.PUT("/goals/order", {
        params: profileQuery,
        body: { ids },
      });
      throwIfError(error, "Changement d'ordre impossible.");
    },
    (goals, ids) =>
      ids
        .map((id) => goals.find((goal) => goal.id === id))
        .filter((goal) => goal !== undefined),
  );
}

/* --------------------------------------------------------------------------
 * 7. Ajouter
 *
 * La seule mutation qui n'est pas optimiste : la nouvelle priorité n'a pas
 * encore d'identifiant tant que la base ne l'a pas créée. On attend donc la
 * réponse, puis on relit la liste.
 * -------------------------------------------------------------------------- */
export function useAddGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGoal: {
      text: string;
      category: PriorityCategory;
    }) => {
      const { error } = await api.POST("/goals", {
        params: profileQuery,
        body: newGoal,
      });
      throwIfError(error, "Ajout impossible.");
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: prioritiesQueryKey }),
  });
}

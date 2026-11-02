/* ==========================================================================
 * lib/api/priorities.ts — lire et modifier les priorités du jour
 *
 * TanStack Query s'occupe de tout ce qu'on écrirait sinon à la main : la
 * requête, sa mise en cache, la relecture régulière, et la conservation des
 * dernières données reçues si une relecture échoue.
 *
 * Les deux widgets du miroir (Priorities le matin, DailyReview le soir) et
 * la page téléphone /app/priorities appellent usePriorities() chacun de leur
 * côté : grâce au cache, une seule requête part pour tous.
 *
 * Les modifications passent par des « mutations » (useMutation). Elles
 * vivent ici, et non dans la page téléphone, pour que le miroir tactile
 * puisse un jour cocher une priorité avec exactement le même hook.
 * ========================================================================== */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, MIRROR_PROFILE_ID } from "@/lib/api/client";
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

/* openapi-fetch ne lève pas d'erreur sur un 404 ou un 500 : il la range dans
 * « error ». On la relance pour que TanStack Query sache que la requête a
 * échoué — il garde alors les données précédentes, ou annule la mutation. */
function throwIfError(error: unknown, message: string) {
  if (error !== undefined) {
    throw new Error(message);
  }
}

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
 * Attendre la réponse de l'API avant de cocher la case donnerait une
 * interface molle. On fait donc l'inverse : on modifie tout de suite la
 * liste en cache, comme si l'API avait déjà dit oui, puis :
 *
 *   - si l'API refuse, on remet la copie gardée de côté ;
 *   - dans tous les cas, on relit la liste pour repartir de la vérité.
 *
 * Trois mutations sur quatre suivent ce motif : il est écrit une fois ici.
 * Chacune ne fournit que deux choses : l'appel à l'API (send) et la façon
 * de modifier la liste en cache (applyToCache).
 * -------------------------------------------------------------------------- */
function useOptimisticGoalMutation<Variables>(
  send: (variables: Variables) => Promise<void>,
  applyToCache: (goals: Priority[], variables: Variables) => Priority[],
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: send,

    onMutate: async (variables: Variables) => {
      /* Une relecture partie juste avant écraserait notre modification avec
       * l'ancienne liste en arrivant : on l'annule. */
      await queryClient.cancelQueries({ queryKey: prioritiesQueryKey });

      const previous = queryClient.getQueryData<Priority[]>(prioritiesQueryKey);
      if (previous !== undefined) {
        queryClient.setQueryData(
          prioritiesQueryKey,
          applyToCache(previous, variables),
        );
      }
      /* Ce qui est renvoyé ici est transmis à onError, en troisième
       * argument : c'est notre copie de secours. */
      return { previous };
    },

    onError: (_error, _variables, saved) => {
      if (saved?.previous !== undefined) {
        queryClient.setQueryData(prioritiesQueryKey, saved.previous);
      }
    },

    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: prioritiesQueryKey }),
  });
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

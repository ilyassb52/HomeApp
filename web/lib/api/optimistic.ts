/* ==========================================================================
 * lib/api/optimistic.ts — les outils partagés des listes modifiables
 *
 * Les priorités (lib/api/priorities.ts) et les courses (lib/api/shopping.ts)
 * se lisent et se modifient de la même façon. Ce qu'elles ont en commun
 * vivait dans priorities.ts ; à la deuxième liste, il déménage ici.
 * ========================================================================== */

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

/* --------------------------------------------------------------------------
 * 1. Transformer une réponse ratée en erreur
 *
 * openapi-fetch ne lève pas d'erreur sur un 404 ou un 500 : il la range dans
 * « error ». On la relance pour que TanStack Query sache que la requête a
 * échoué — il garde alors les données précédentes, ou annule la mutation.
 * -------------------------------------------------------------------------- */
export function throwIfError(error: unknown, message: string) {
  if (error !== undefined) {
    throw new Error(message);
  }
}

/* --------------------------------------------------------------------------
 * 2. Le motif « optimiste »
 *
 * Attendre la réponse de l'API avant de cocher la case donnerait une
 * interface molle. On fait donc l'inverse : on modifie tout de suite la
 * liste en cache, comme si l'API avait déjà dit oui, puis :
 *
 *   - si l'API refuse, on remet la copie gardée de côté ;
 *   - dans tous les cas, on relit la liste pour repartir de la vérité.
 *
 * Chaque mutation ne fournit que trois choses : la clé de la liste dans le
 * cache (queryKey), l'appel à l'API (send) et la façon de modifier la liste
 * en cache (applyToCache).
 *
 * <Item, Variables> sont des « génériques » : des types laissés en blanc,
 * que chaque appel remplit (Item = Priority ou ShoppingItem…).
 * -------------------------------------------------------------------------- */
export function useOptimisticMutation<Item, Variables>(
  queryKey: QueryKey,
  send: (variables: Variables) => Promise<void>,
  applyToCache: (items: Item[], variables: Variables) => Item[],
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: send,

    onMutate: async (variables: Variables) => {
      /* Une relecture partie juste avant écraserait notre modification avec
       * l'ancienne liste en arrivant : on l'annule. */
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Item[]>(queryKey);
      if (previous !== undefined) {
        queryClient.setQueryData(queryKey, applyToCache(previous, variables));
      }
      /* Ce qui est renvoyé ici est transmis à onError, en troisième
       * argument : c'est notre copie de secours. */
      return { previous };
    },

    onError: (_error, _variables, saved) => {
      if (saved?.previous !== undefined) {
        queryClient.setQueryData(queryKey, saved.previous);
      }
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}

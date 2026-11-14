/* ==========================================================================
 * lib/api/shopping.ts — lire et modifier la liste de courses du foyer
 *
 * Le même principe que lib/api/priorities.ts : une lecture relue toutes les
 * 30 s, des modifications « optimistes » (lib/api/optimistic.ts) partagées
 * par le widget du miroir et la page téléphone /app/shopping.
 *
 * Une différence : la liste appartient au foyer, pas à un profil. Les
 * routes ne prennent donc pas de profile_id.
 * ========================================================================== */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { throwIfError, useOptimisticMutation } from "@/lib/api/optimistic";
import type { ShoppingItem } from "@/lib/types";

/* --------------------------------------------------------------------------
 * 1. Constantes
 * -------------------------------------------------------------------------- */

/* Un article coché au magasin apparaît barré sur le miroir en moins d'une
 * demi-minute. */
const SHOPPING_REFRESH_MS = 30_000;

/* RECOPIE de ItemName dans api/app/schemas/shopping.py : 80 caractères. */
export const SHOPPING_NAME_MAX_LENGTH = 80;

export const shoppingQueryKey = ["shopping"] as const;

/* --------------------------------------------------------------------------
 * 2. Lire
 * -------------------------------------------------------------------------- */
export function useShoppingList() {
  return useQuery({
    queryKey: shoppingQueryKey,
    queryFn: async () => {
      const { data, error } = await api.GET("/shopping");
      throwIfError(error, "Lecture de la liste de courses impossible.");
      return data;
    },
    refetchInterval: SHOPPING_REFRESH_MS,
  });
}

/* --------------------------------------------------------------------------
 * 3. Cocher, renommer
 *
 * changes ne contient que ce qui change : { bought: true } coche.
 * -------------------------------------------------------------------------- */
export type ShoppingItemChanges = Partial<
  Pick<ShoppingItem, "name" | "bought">
>;

export function useUpdateShoppingItem() {
  return useOptimisticMutation<
    ShoppingItem,
    { id: number; changes: ShoppingItemChanges }
  >(
    shoppingQueryKey,
    async ({ id, changes }) => {
      const { error } = await api.PATCH("/shopping/{item_id}", {
        params: { path: { item_id: id } },
        body: changes,
      });
      throwIfError(error, "Modification impossible.");
    },
    /* Dans le cache, on modifie l'article PUIS on range la liste : un
     * article qu'on coche descend aussitôt sous le doigt, au lieu de rester
     * barré au milieu jusqu'à la relecture. */
    (items, { id, changes }) =>
      boughtLast(
        items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
      ),
  );
}

/* La règle de rangement de l'API (api/app/services/shopping.py) : d'abord
 * ce qui reste à acheter, puis ce qui est acheté. toSorted renvoie une
 * nouvelle liste (le cache ne doit pas être modifié sur place) et garde
 * l'ordre d'origine à l'intérieur de chaque groupe. */
function boughtLast(items: ShoppingItem[]): ShoppingItem[] {
  return items.toSorted((a, b) => Number(a.bought) - Number(b.bought));
}

/* --------------------------------------------------------------------------
 * 4. Supprimer
 * -------------------------------------------------------------------------- */
export function useDeleteShoppingItem() {
  return useOptimisticMutation<ShoppingItem, number>(
    shoppingQueryKey,
    async (id) => {
      const { error } = await api.DELETE("/shopping/{item_id}", {
        params: { path: { item_id: id } },
      });
      throwIfError(error, "Suppression impossible.");
    },
    (items, id) => items.filter((item) => item.id !== id),
  );
}

/* --------------------------------------------------------------------------
 * 5. Ajouter
 *
 * Pas optimiste, comme pour les priorités : le nouvel article n'a pas
 * d'identifiant tant que la base ne l'a pas créé.
 * -------------------------------------------------------------------------- */
export function useAddShoppingItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await api.POST("/shopping", { body: { name } });
      throwIfError(error, "Ajout impossible.");
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: shoppingQueryKey }),
  });
}

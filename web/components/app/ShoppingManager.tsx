/* ==========================================================================
 * components/app/ShoppingManager.tsx — gérer la liste de courses depuis le
 * téléphone
 *
 * Le cœur de la page /app/shopping, construit comme PrioritiesManager : il
 * possède les mutations (lib/api/shopping.ts) et les confie aux lignes sous
 * forme de fonctions simples. Le téléphone, lui, affiche les erreurs.
 *
 * La liste est celle du foyer : ce que l'un ajoute, tous le voient.
 * ========================================================================== */

"use client";

import { useState } from "react";
import AddShoppingItemForm from "@/components/app/AddShoppingItemForm";
import ErrorBanner from "@/components/app/ErrorBanner";
import { LoadFailed, LoadingRows } from "@/components/app/LoadStates";
import ShoppingRow from "@/components/app/ShoppingRow";
import {
  useAddShoppingItem,
  useDeleteShoppingItem,
  useShoppingList,
  useUpdateShoppingItem,
} from "@/lib/api/shopping";

export default function ShoppingManager() {
  const { data: items, isError, refetch } = useShoppingList();
  const updateItem = useUpdateShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  const addItem = useAddShoppingItem();

  /* Le dernier échec, affiché en haut. Toute action réussie l'efface. */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reportResult = {
    onSuccess: () => setErrorMessage(null),
    onError: (error: Error) => setErrorMessage(error.message),
  };

  /* mutateAsync renvoie une promesse : le formulaire attend la réponse
   * pour savoir s'il doit se vider. */
  async function add(name: string) {
    try {
      await addItem.mutateAsync(name);
      setErrorMessage(null);
      return true;
    } catch (error) {
      setErrorMessage((error as Error).message);
      return false;
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-8">
      <header>
        <p className="text-xl font-semibold tracking-[2px] text-label uppercase">
          Le foyer
        </p>
        <h1 className="text-3xl font-light">Courses</h1>
      </header>

      <ErrorBanner message={errorMessage} />

      {items === undefined ? (
        isError ? (
          <LoadFailed onRetry={() => refetch()} />
        ) : (
          <LoadingRows />
        )
      ) : (
        <>
          {items.length === 0 ? (
            <p className="text-center font-light text-muted">
              La liste est vide.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {items.map((item) => (
                <li key={item.id}>
                  <ShoppingRow
                    item={item}
                    onToggle={() =>
                      updateItem.mutate(
                        { id: item.id, changes: { bought: !item.bought } },
                        reportResult,
                      )
                    }
                    onDelete={() => deleteItem.mutate(item.id, reportResult)}
                  />
                </li>
              ))}
            </ul>
          )}

          {/* Collé en bas de l'écran pendant que la liste défile, comme
              sur /app/priorities. */}
          <div className="sticky bottom-0 -mx-4 mt-auto bg-bg px-4 pt-3 pb-4">
            <AddShoppingItemForm onAdd={add} isSending={addItem.isPending} />
          </div>
        </>
      )}
    </main>
  );
}

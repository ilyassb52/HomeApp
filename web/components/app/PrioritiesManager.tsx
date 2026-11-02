/* ==========================================================================
 * components/app/PrioritiesManager.tsx — gérer les priorités depuis le
 * téléphone
 *
 * Le cœur de la page /app/priorities. Il possède les quatre mutations
 * (lib/api/priorities.ts) et les confie aux lignes sous forme de fonctions
 * simples : « coche celle-ci », « monte celle-là ».
 *
 * Contrairement au miroir, qui n'affiche jamais d'erreur, le téléphone dit
 * ce qui ne va pas : c'est là qu'on agit, il faut savoir si ça a marché.
 * ========================================================================== */

"use client";

import { useState } from "react";
import AddPriorityForm from "@/components/app/AddPriorityForm";
import PriorityRow from "@/components/app/PriorityRow";
import {
  MAX_GOALS_PER_DAY,
  useAddGoal,
  useDeleteGoal,
  usePriorities,
  useReorderGoals,
  useUpdateGoal,
} from "@/lib/api/priorities";
import type { PriorityCategory } from "@/lib/types";

/* --------------------------------------------------------------------------
 * 1. Le composant principal
 * -------------------------------------------------------------------------- */
export default function PrioritiesManager() {
  const { data: priorities, isError, refetch } = usePriorities();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const reorderGoals = useReorderGoals();
  const addGoal = useAddGoal();

  /* Le dernier échec, affiché en haut de la page. Toute action réussie
   * l'efface. */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* Passé à chaque mutate() : ce qu'il faut faire du message selon la
   * réponse de l'API. Écrit une fois pour les trois actions des lignes. */
  const reportResult = {
    onSuccess: () => setErrorMessage(null),
    onError: (error: Error) => setErrorMessage(error.message),
  };

  /* L'ajout utilise mutateAsync, qui renvoie une promesse : le formulaire
   * peut ainsi attendre la réponse pour savoir s'il doit se vider. */
  async function add(newGoal: { text: string; category: PriorityCategory }) {
    try {
      await addGoal.mutateAsync(newGoal);
      setErrorMessage(null);
      return true;
    } catch (error) {
      setErrorMessage((error as Error).message);
      return false;
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-8 pb-12">
      <header>
        <p className="text-xs font-semibold tracking-[2px] text-label uppercase">
          Aujourd&apos;hui
        </p>
        <h1 className="text-3xl font-light">Mes priorités</h1>
      </header>

      {errorMessage !== null ? (
        /* role="alert" fait lire le message aussitôt par un lecteur
         * d'écran, sans qu'il ait à le chercher. */
        <p
          role="alert"
          className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral"
        >
          {errorMessage}
        </p>
      ) : null}

      {/* Tant que la liste n'est jamais arrivée : chargement, ou échec si
          l'API ne répond pas. Une fois reçue, elle reste affichée même si
          une relecture échoue plus tard. */}
      {priorities === undefined ? (
        isError ? (
          <LoadFailed onRetry={() => refetch()} />
        ) : (
          <LoadingRows />
        )
      ) : (
        <>
          {priorities.length === 0 ? (
            <p className="text-center font-light text-muted">
              Aucune priorité aujourd&apos;hui.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {priorities.map((priority, index) => (
                <li key={priority.id}>
                  <PriorityRow
                    priority={priority}
                    isFirst={index === 0}
                    isLast={index === priorities.length - 1}
                    onToggle={() =>
                      updateGoal.mutate(
                        { id: priority.id, changes: { done: !priority.done } },
                        reportResult,
                      )
                    }
                    onSave={(changes) =>
                      updateGoal.mutate(
                        { id: priority.id, changes },
                        reportResult,
                      )
                    }
                    onDelete={() =>
                      deleteGoal.mutate(priority.id, reportResult)
                    }
                    onMove={(direction) =>
                      reorderGoals.mutate(
                        swapIds(priorities, index, index + direction),
                        reportResult,
                      )
                    }
                  />
                </li>
              ))}
            </ul>
          )}

          {priorities.length < MAX_GOALS_PER_DAY ? (
            <AddPriorityForm onAdd={add} isSending={addGoal.isPending} />
          ) : (
            <p className="text-center text-sm font-light text-muted">
              {MAX_GOALS_PER_DAY} priorités, c&apos;est le maximum pour
              aujourd&apos;hui.
            </p>
          )}
        </>
      )}
    </main>
  );
}

/** Les identifiants dans l'ordre, après avoir échangé deux places. */
function swapIds(
  priorities: { id: number }[],
  from: number,
  to: number,
): number[] {
  const ids = priorities.map((priority) => priority.id);
  [ids[from], ids[to]] = [ids[to], ids[from]];
  return ids;
}

/* --------------------------------------------------------------------------
 * 2. Les états d'attente et d'échec
 * -------------------------------------------------------------------------- */

/** Trois barres grises qui pulsent, à la place des lignes à venir. */
function LoadingRows() {
  return (
    <div className="flex flex-col gap-3" aria-label="Chargement">
      {[0, 1, 2].map((key) => (
        <div
          key={key}
          className="h-[68px] animate-pulse rounded-2xl bg-ink/5"
        />
      ))}
    </div>
  );
}

function LoadFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-light text-muted">Impossible de joindre le serveur.</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-xl border border-ink/20 px-5"
      >
        Réessayer
      </button>
    </div>
  );
}

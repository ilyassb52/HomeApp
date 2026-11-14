/* ==========================================================================
 * components/app/exercise/ExerciseLogger.tsx — la page d'un exercice
 *
 * Pensée pour la salle, entre deux séries, téléphone en main :
 *
 *   1. choisir l'exercice (ExerciseNamePicker) — seulement s'il est neuf ;
 *   2. « La dernière fois » : ce qu'on a fait la fois d'avant ;
 *   3. les séries déjà faites ;
 *   4. la série en cours : − reps +, − kg +, « Valider la série » ;
 *   5. le minuteur de repos, qui démarre à chaque série validée.
 *
 * CHAQUE SÉRIE EST ENREGISTRÉE DÈS QU'ON LA VALIDE
 *
 * La première crée l'exercice (POST), les suivantes renvoient sa liste de
 * séries complète (PUT). Si le téléphone se verrouille au milieu de
 * l'exercice, rien n'est perdu.
 *
 * Après la première série, l'adresse passe de …/exercises/new à
 * …/exercises/12 (history.replaceState, que Next.js sait suivre) : recharger
 * la page retombe sur le bon exercice, sans que la page se recharge et sans
 * couper le minuteur.
 *
 * L'ADRESSE FAIT FOI : NEXT.JS RÉUTILISE LA PAGE
 *
 * Next.js garde les pages déjà visitées en mémoire et, en y revenant, les
 * réaffiche telles qu'on les avait laissées — états React compris. Sans
 * précaution, rouvrir « + Ajouter un exercice » ressortait l'exercice créé
 * à la visite d'avant (et « Cet exercice n'existe plus » s'il avait été
 * supprimé entre-temps). La page surveille donc son adresse : quand elle
 * change, la saisie repart de zéro (voir « Repartir de zéro » plus bas).
 * ========================================================================== */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { use, useState } from "react";
import ErrorBanner from "@/components/app/ErrorBanner";
import { LoadFailed, LoadingRows } from "@/components/app/LoadStates";
import ExerciseNamePicker from "@/components/app/exercise/ExerciseNamePicker";
import RestTimer from "@/components/app/exercise/RestTimer";
import SetStepper from "@/components/app/exercise/SetStepper";
import {
  EXERCISE_NAME_MAX_LENGTH,
  useAddExercise,
  useDeleteExercise,
  useExerciseNames,
  usePreviousExercise,
  useUpdateExercise,
  useWorkout,
} from "@/lib/api/workouts";
import type { WorkoutSet } from "@/lib/types";
import {
  formatKg,
  nextSetValues,
  setsLine,
  shortDayLabel,
  stepWeight,
} from "@/lib/workouts";

/* --------------------------------------------------------------------------
 * 1. Petits outils
 * -------------------------------------------------------------------------- */

/* La durée de repos par défaut, et l'endroit où le navigateur retient celle
 * qu'on préfère (une préférence de CE téléphone, pas une donnée du foyer). */
const DEFAULT_REST_SECONDS = 90;
const REST_STORAGE_KEY = "homeapp.workouts.restSeconds";
const MIN_REST_SECONDS = 15;

/* localStorage peut manquer ou refuser (navigation privée…) : on ne laisse
 * jamais une préférence casser la page. */
function readRestSeconds(): number {
  try {
    const stored = Number(localStorage.getItem(REST_STORAGE_KEY));
    return stored >= MIN_REST_SECONDS ? stored : DEFAULT_REST_SECONDS;
  } catch {
    return DEFAULT_REST_SECONDS;
  }
}

/** L'instant où finira un repos qui commence maintenant. Hors du
 *  composant : lire l'heure n'a rien à faire dans un affichage React, seul
 *  un clic (« Valider la série ») l'appelle. */
function restEndFromNow(): number {
  return Date.now() + readRestSeconds() * 1000;
}

function saveRestSeconds(seconds: number) {
  try {
    localStorage.setItem(REST_STORAGE_KEY, String(seconds));
  } catch {
    /* Tant pis : la durée par défaut reviendra la prochaine fois. */
  }
}

/** « 52,5 » → 52.5 ; vide ou illisible → null. */
function parseNumber(text: string): number | null {
  const value = Number(text.trim().replace(",", "."));
  return text.trim() === "" || Number.isNaN(value) ? null : value;
}

/** 52.5 → « 52,5 », pour remplir un champ. */
function numberText(value: number): string {
  return value.toLocaleString("fr-FR", { useGrouping: false });
}

/** Le numéro d'exercice écrit dans l'adresse : « …/exercises/56 » → 56,
 *  « …/exercises/new » → null. */
function exerciseIdFromPath(pathname: string): number | null {
  const match = /\/exercises\/(\d+)\/?$/.exec(pathname);
  return match ? Number(match[1]) : null;
}

/** Le texte des deux champs de la série en cours. */
type Draft = { reps: string; kg: string };

/* --------------------------------------------------------------------------
 * 2. La page
 * -------------------------------------------------------------------------- */
export default function ExerciseLogger({
  params,
}: {
  /* Next.js donne les morceaux de l'adresse dans une promesse : use() les
   * attend (voir app/app/workouts/[workoutId]/exercises/…/page.tsx). */
  params: Promise<{ workoutId: string; exerciseId?: string }>;
}) {
  const router = useRouter();
  const routeParams = use(params);
  const workoutId = Number(routeParams.workoutId);

  /* L'exercice affiché : celui de l'adresse, ou celui qu'on vient de créer
   * avec la première série (createdId), le temps que Next.js voie la
   * nouvelle adresse posée par history.replaceState. */
  const pathname = usePathname();
  const [createdId, setCreatedId] = useState<number | null>(null);
  const exerciseId = exerciseIdFromPath(pathname) ?? createdId;

  /* Le nom choisi pour un exercice neuf, avant sa première série. */
  const [pickedName, setPickedName] = useState<string | null>(null);

  /* Les champs de la série en cours, seulement une fois qu'on y touche.
   * Avant cela (null), ils montrent les valeurs proposées (nextSetValues) :
   * ainsi, l'historique arrivé après coup les préremplit quand même. */
  const [draft, setDraft] = useState<Draft | null>(null);

  const [renaming, setRenaming] = useState<string | null>(null);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /* ------------------------------------------------------------------------
   * Repartir de zéro quand l'adresse change
   *
   * Next.js réutilise cette page d'une visite à l'autre (voir l'en-tête).
   * Une nouvelle adresse = une nouvelle saisie : on oublie l'exercice créé,
   * le nom choisi et la série en cours. Une seule exception : le passage
   * …/new → …/exercises/56 que fait NOTRE première série, où tout doit rester.
   *
   * Le minuteur, lui, continue : « Exercice suivant » arrive en pleine
   * pause, et le repos n'est pas fini pour autant.
   *
   * C'est le motif React « ajuster l'état pendant l'affichage » : comparer à
   * la dernière adresse vue, et corriger tout de suite, sans useEffect.
   * ------------------------------------------------------------------------ */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    const isOurFirstSet =
      lastPath.endsWith("/exercises/new") && exerciseId === createdId;
    if (!isOurFirstSet) {
      setCreatedId(null);
      setPickedName(null);
      setDraft(null);
      setRenaming(null);
      setErrorMessage(null);
    }
  }

  /* ------------------------------------------------------------------------
   * Les données
   * ------------------------------------------------------------------------ */
  const { data: workout, isError, refetch } = useWorkout(workoutId);
  const exercise =
    exerciseId === null
      ? undefined
      : workout?.exercises.find((e) => e.id === exerciseId);

  const name = exercise?.name ?? pickedName ?? "";
  const sets: WorkoutSet[] = exercise?.sets ?? [];

  const names = useExerciseNames().data ?? [];
  const { data: previous } = usePreviousExercise(workoutId, name);

  const proposed = nextSetValues(sets, previous?.sets ?? null);
  const shown: Draft = draft ?? {
    reps: String(proposed.reps),
    kg: numberText(proposed.kg),
  };
  const reps = parseNumber(shown.reps);
  const kg = parseNumber(shown.kg);
  const isValid =
    reps !== null &&
    Number.isInteger(reps) &&
    reps > 0 &&
    kg !== null &&
    kg >= 0;

  /* ------------------------------------------------------------------------
   * Les actions
   * ------------------------------------------------------------------------ */
  const addExercise = useAddExercise();
  const updateExercise = useUpdateExercise();
  const deleteExercise = useDeleteExercise();
  const isSending = addExercise.isPending || updateExercise.isPending;

  const sessionUrl = workout
    ? `/app/workouts?jour=${workout.day}&seance=${workout.id}`
    : "/app/workouts";

  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      const result = await action();
      setErrorMessage(null);
      return result;
    } catch (error) {
      setErrorMessage((error as Error).message);
      return null;
    }
  }

  /** Changer un des deux champs (à partir de ce qui est affiché). */
  function edit(change: Partial<Draft>) {
    setDraft({ ...shown, ...change });
  }

  async function validateSet() {
    if (!isValid || reps === null || kg === null) return;
    /* 0 kg = poids du corps : l'API attend alors null. */
    const newSet = { reps, weight_kg: kg === 0 ? null : kg };

    if (exerciseId === null) {
      const saved = await run(() =>
        addExercise.mutateAsync({ workoutId, draft: { name, sets: [newSet] } }),
      );
      if (saved === null) return;
      /* Le nouvel exercice est le dernier de la séance. */
      const created = saved.exercises.at(-1);
      if (created) {
        setCreatedId(created.id);
        window.history.replaceState(
          null,
          "",
          `/app/workouts/${workoutId}/exercises/${created.id}`,
        );
      }
    } else {
      const saved = await run(() =>
        updateExercise.mutateAsync({
          workoutId,
          exerciseId,
          draft: { name, sets: [...sets, newSet] },
        }),
      );
      if (saved === null) return;
    }

    /* La série suivante repart de celle-ci, et le repos commence. */
    setDraft(null);
    setRestEndsAt(restEndFromNow());
  }

  async function removeSet(index: number) {
    if (exerciseId === null) return;
    await run(() =>
      updateExercise.mutateAsync({
        workoutId,
        exerciseId,
        draft: { name, sets: sets.filter((_, i) => i !== index) },
      }),
    );
  }

  async function rename() {
    const newName = renaming?.trim() ?? "";
    if (newName === "") return;
    if (exerciseId === null) {
      setPickedName(newName);
    } else {
      const saved = await run(() =>
        updateExercise.mutateAsync({
          workoutId,
          exerciseId,
          draft: { name: newName, sets },
        }),
      );
      if (saved === null) return;
    }
    setRenaming(null);
  }

  async function removeExercise() {
    /* Rien n'est encore enregistré : on revient simplement au choix. */
    if (exerciseId === null) {
      setPickedName(null);
      setDraft(null);
      return;
    }
    const saved = await run(() =>
      deleteExercise.mutateAsync({ workoutId, exerciseId }),
    );
    if (saved !== null) router.push(sessionUrl);
  }

  /** −30 s / +30 s : décaler ce repos et retenir la durée pour les suivants. */
  function adjustRest(seconds: number) {
    saveRestSeconds(Math.max(MIN_REST_SECONDS, readRestSeconds() + seconds));
    setRestEndsAt((endsAt) =>
      endsAt === null ? null : endsAt + seconds * 1000,
    );
  }

  /* ------------------------------------------------------------------------
   * L'affichage
   * ------------------------------------------------------------------------ */
  const header = (
    <Link
      href={sessionUrl}
      className="flex min-h-11 items-center gap-1 self-start text-muted active:text-ink"
    >
      <span aria-hidden className="text-xl">
        ‹
      </span>
      {workout
        ? `Séance du ${shortDayLabel(workout.day).toLowerCase()}`
        : "Séances"}
    </Link>
  );

  /* Le minuteur, posé en bas de l'écran des séries comme de celui du
   * choix de l'exercice suivant. */
  const restTimer =
    restEndsAt !== null ? (
      <RestTimer
        /* Une key par repos : le minuteur repart de zéro à chaque série. */
        key={restEndsAt}
        endsAt={restEndsAt}
        onAdjust={adjustRest}
        onClose={() => setRestEndsAt(null)}
      />
    ) : null;

  if (workout === undefined) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pt-6 pb-8">
        {header}
        {isError ? <LoadFailed onRetry={() => refetch()} /> : <LoadingRows />}
      </main>
    );
  }

  /* L'adresse pointe vers un exercice qui n'existe pas (supprimé…). */
  if (exerciseId !== null && exercise === undefined) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pt-6 pb-8">
        {header}
        <p className="font-light text-muted">
          Cet exercice n&apos;existe plus.
        </p>
      </main>
    );
  }

  /* Étape 1 : un exercice neuf, sans nom encore. */
  if (name === "") {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pt-6 pb-8">
        {header}
        <h1 className="text-3xl font-light">Quel exercice ?</h1>
        <ExerciseNamePicker names={names} onPick={setPickedName} />
        {restTimer}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pt-6 pb-8">
      {header}
      <ErrorBanner message={errorMessage} />

      {/* Le nom, qu'on peut corriger. */}
      {renaming === null ? (
        <div className="flex items-center gap-2">
          <h1 className="min-w-0 flex-1 text-3xl font-semibold break-words">
            {name}
          </h1>
          <button
            type="button"
            aria-label="Renommer l'exercice"
            onClick={() => setRenaming(name)}
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-lg text-muted active:bg-ink/10"
          >
            ✎
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void rename();
          }}
          className="flex gap-2"
        >
          <input
            value={renaming}
            onChange={(e) => setRenaming(e.target.value)}
            maxLength={EXERCISE_NAME_MAX_LENGTH}
            aria-label="Nouveau nom de l'exercice"
            autoFocus
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-ink/20 bg-bg px-3 text-[17px] outline-none focus:border-ink/50"
          />
          <button
            type="submit"
            className="min-h-12 rounded-xl bg-ink px-4 font-semibold text-bg"
          >
            OK
          </button>
        </form>
      )}

      {/* La dernière fois. */}
      {previous ? (
        <p className="rounded-xl bg-ink/[0.06] px-3 py-2 text-sm text-muted">
          <span className="font-semibold text-ink">La dernière fois</span> ·{" "}
          {shortDayLabel(previous.day).toLowerCase()} :{" "}
          <span className="tabular-nums">{setsLine(previous.sets)}</span>
        </p>
      ) : null}

      {/* Les séries déjà faites. */}
      {sets.length > 0 ? (
        <ol className="flex flex-col divide-y divide-ink/10">
          {sets.map((s, index) => (
            <li key={index} className="flex min-h-12 items-center gap-3">
              <span className="w-6 text-center text-sm text-label tabular-nums">
                {index + 1}
              </span>
              <span className="flex-1 text-xl tabular-nums">
                {s.reps}
                <span className="text-muted">
                  {s.weight_kg === null
                    ? " reps · poids du corps"
                    : ` × ${formatKg(s.weight_kg)}`}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Retirer la série ${index + 1}`}
                onClick={() => void removeSet(index)}
                /* L'API exige au moins une série : pour tout retirer, on
                 * supprime l'exercice (en bas). */
                disabled={sets.length === 1 || isSending}
                className="flex size-11 items-center justify-center rounded-lg text-muted active:bg-ink/10 disabled:opacity-20"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      ) : null}

      {/* La série en cours. */}
      <section className="flex flex-col gap-3 rounded-2xl border border-ink/15 bg-ink/[0.03] p-4">
        <h2 className="text-sm font-semibold tracking-[2px] text-label uppercase">
          Série {sets.length + 1}
        </h2>
        <SetStepper
          label="Reps"
          value={shown.reps}
          inputMode="numeric"
          onType={(text) => edit({ reps: text })}
          onMinus={() => edit({ reps: String(Math.max(1, (reps ?? 1) - 1)) })}
          onPlus={() => edit({ reps: String((reps ?? 0) + 1) })}
          canMinus={(reps ?? 1) > 1}
        />
        <SetStepper
          label="Kg"
          value={shown.kg}
          hint={kg === 0 ? "poids du corps" : undefined}
          inputMode="decimal"
          onType={(text) => edit({ kg: text })}
          onMinus={() => edit({ kg: numberText(stepWeight(kg ?? 0, -1)) })}
          onPlus={() => edit({ kg: numberText(stepWeight(kg ?? 0, 1)) })}
          canMinus={(kg ?? 0) > 0}
        />
        <button
          type="button"
          onClick={() => void validateSet()}
          disabled={!isValid || isSending}
          className="min-h-14 rounded-2xl bg-ink text-lg font-semibold text-bg active:opacity-80 disabled:opacity-40"
        >
          {isSending ? "Enregistrement…" : "Valider la série"}
        </button>
      </section>

      {/* La suite. */}
      {sets.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/app/workouts/${workoutId}/exercises/new`}
            className="flex min-h-12 items-center justify-center rounded-xl border border-ink/20 px-3 font-semibold active:bg-ink/10"
          >
            Exercice suivant
          </Link>
          <Link
            href={sessionUrl}
            className="flex min-h-12 items-center justify-center rounded-xl border border-ink/20 px-3 font-semibold active:bg-ink/10"
          >
            Terminer la séance
          </Link>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => void removeExercise()}
        className="min-h-11 self-center rounded-lg px-3 text-sm font-semibold text-coral active:bg-ink/10"
      >
        {exerciseId === null ? "Changer d'exercice" : "Supprimer l'exercice"}
      </button>

      {restTimer}
    </main>
  );
}

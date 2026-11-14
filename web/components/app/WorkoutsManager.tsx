/* ==========================================================================
 * components/app/WorkoutsManager.tsx — ses entraînements, depuis le téléphone
 *
 * Le cœur de la page /app/workouts, construit comme AgendaManager : il
 * possède les mutations (lib/api/workouts.ts) et les confie aux morceaux de
 * la page sous forme de fonctions simples.
 *
 * ON DESCEND PAR ÉTAPES : MOIS → SEMAINE → SÉANCE → EXERCICES
 *
 *   1. ‹ Novembre 2026 › ;
 *   2. les 4 boutons des semaines (WeekTabs) : on en choisit une ;
 *   3. les séances de CETTE semaine, repliées (WorkoutCard) ;
 *   4. on touche une séance : elle se déplie et montre ses exercices ;
 *   5. un exercice se fait sur SA page, pensée pour la salle
 *      (/app/workouts/{séance}/exercises/…, voir ExerciseLogger).
 *
 * Trois états suffisent à le décrire :
 *   selectedWeek  la semaine affichée (0 à 3) ;
 *   expandedId    la séance dépliée (une seule à la fois), ou null ;
 *   open          le formulaire de séance ouvert, ou null.
 *
 * L'adresse peut les choisir : « Terminer la séance » revient sur
 * /app/workouts?jour=2026-11-14&seance=12, et la page s'ouvre sur la
 * semaine du 14 novembre, séance 12 dépliée.
 * ========================================================================== */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import ErrorBanner from "@/components/app/ErrorBanner";
import { LoadFailed, LoadingRows } from "@/components/app/LoadStates";
import SessionForm from "@/components/app/SessionForm";
import WeekTabs from "@/components/app/WeekTabs";
import WorkoutCard from "@/components/app/WorkoutCard";
import {
  useAddWorkout,
  useDeleteExercise,
  useDeleteWorkout,
  useUpdateWorkout,
  useWorkoutsBetween,
} from "@/lib/api/workouts";
import {
  monthLabel,
  parisToday,
  shiftMonth,
  type IsoDay,
} from "@/lib/calendar";
import type { Workout, WorkoutDraft } from "@/lib/types";
import {
  defaultWeekIndex,
  groupByWeek,
  countLabel,
  trainingMonthOf,
  trainingWeeks,
  weekLabel,
} from "@/lib/workouts";

/** Le formulaire de séance ouvert : en ouvrir une, ou changer le jour et
 *  la note d'une séance existante. */
type OpenForm =
  { kind: "new-session" } | { kind: "session"; workoutId: number } | null;

type Month = { year: number; month: number };

/** « 2026-11-14 » est-il un jour bien écrit ? (l'adresse se tape à la main) */
function isIsoDay(text: string | null): text is IsoDay {
  return text !== null && /^\d{4}-\d{2}-\d{2}$/.test(text);
}

/** La semaine où tombe « day » dans le mois donné (sinon la première). */
function weekOf(month: Month, day: IsoDay): number {
  return defaultWeekIndex(trainingWeeks(month.year, month.month), day);
}

/* Les flèches du mois, comme celles de MonthCalendar. */
const ARROW =
  "flex size-11 items-center justify-center rounded-lg text-xl active:bg-ink/10";

export default function WorkoutsManager() {
  const today = parisToday();
  const router = useRouter();

  /* ?jour=…&seance=… : où rouvrir la page en revenant d'un exercice. */
  const searchParams = useSearchParams();
  const focusDay = searchParams.get("jour");
  const startDay = isIsoDay(focusDay) ? focusDay : today;
  const focusId = Number(searchParams.get("seance")) || null;

  /* ------------------------------------------------------------------------
   * 1. Ce que la page affiche : un mois, une semaine, une séance dépliée,
   *    un formulaire ouvert
   * ------------------------------------------------------------------------ */
  /* trainingMonthOf : le 3 décembre, on est encore dans le mois de
   * novembre (sa semaine 4 va jusqu'au premier lundi de décembre). */
  const [shownMonth, setShownMonth] = useState(() => trainingMonthOf(startDay));
  const [selectedWeek, setSelectedWeek] = useState(() =>
    weekOf(trainingMonthOf(startDay), startDay),
  );
  const [expandedId, setExpandedId] = useState<number | null>(focusId);
  const [open, setOpen] = useState<OpenForm>(null);

  /* Next.js garde cette page en mémoire et la réutilise : useState ne relit
   * pas l'adresse au retour. Quand ?jour=…&seance=… change (« Terminer la
   * séance »), on se replace donc nous-mêmes sur la bonne semaine — motif
   * « ajuster l'état pendant l'affichage », sans useEffect. */
  const focusKey = `${startDay}|${focusId ?? ""}`;
  const [lastFocusKey, setLastFocusKey] = useState(focusKey);
  if (focusKey !== lastFocusKey) {
    setLastFocusKey(focusKey);
    const month = trainingMonthOf(startDay);
    setShownMonth(month);
    setSelectedWeek(weekOf(month, startDay));
    setExpandedId(focusId);
    setOpen(null);
  }

  /* Le dernier échec, affiché en haut. Toute action réussie l'efface. */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /** Changer de semaine ou de mois referme tout. */
  function showWeek(month: Month, week: number) {
    setShownMonth(month);
    setSelectedWeek(week);
    setExpandedId(null);
    setOpen(null);
  }

  function changeMonth(count: -1 | 1) {
    const month = shiftMonth(shownMonth.year, shownMonth.month, count);
    /* La semaine d'aujourd'hui si on revient au mois en cours, sinon S1. */
    showWeek(month, weekOf(month, today));
  }

  /** Plier ou déplier une séance. La replier ferme son formulaire. */
  function toggle(workoutId: number) {
    const closing = expandedId === workoutId;
    setExpandedId(closing ? null : workoutId);
    setOpen(null);
  }

  /* ------------------------------------------------------------------------
   * 2. Les données : les 4 semaines du mois
   * ------------------------------------------------------------------------ */
  const emptyWeeks = groupByWeek(shownMonth.year, shownMonth.month, []);
  const periodStart = emptyWeeks[0].start;
  const periodEnd = emptyWeeks[emptyWeeks.length - 1].end;

  const {
    data: workouts,
    isError,
    refetch,
  } = useWorkoutsBetween(periodStart, periodEnd);

  const weeks = groupByWeek(shownMonth.year, shownMonth.month, workouts ?? []);
  const week = weeks[selectedWeek];

  /* La date proposée pour une nouvelle séance : aujourd'hui s'il est dans
   * la semaine affichée, sinon son lundi. */
  const newSessionDay =
    today >= week.start && today <= week.end ? today : week.start;

  /* ------------------------------------------------------------------------
   * 3. Les actions
   *
   * run() écrit une seule fois ce que toutes partagent : attendre l'API,
   * effacer ou afficher l'erreur, et dire au formulaire si c'est passé.
   * ------------------------------------------------------------------------ */
  const addWorkout = useAddWorkout();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const deleteExercise = useDeleteExercise();

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

  async function saveSession(draft: WorkoutDraft) {
    const editingId = open?.kind === "session" ? open.workoutId : null;
    const workout = await run(() =>
      editingId === null
        ? addWorkout.mutateAsync(draft)
        : updateWorkout.mutateAsync({ id: editingId, draft }),
    );
    if (workout === null) return;

    /* Une séance qu'on vient d'ouvrir : direction son premier exercice,
     * sur la page faite pour la salle. */
    if (editingId === null) {
      /* Le formulaire se ferme : en revenant sur cette page (que Next.js
       * garde en mémoire), on ne veut pas le retrouver ouvert. */
      setOpen(null);
      router.push(`/app/workouts/${workout.id}/exercises/new`);
      return;
    }

    /* Une séance modifiée : on la suit dans son mois et sa semaine (sa date
     * a pu changer), dépliée. */
    const month = trainingMonthOf(workout.day);
    setShownMonth(month);
    setSelectedWeek(weekOf(month, workout.day));
    setExpandedId(workout.id);
    setOpen(null);
  }

  function removeSession(workout: Workout) {
    if (expandedId === workout.id) {
      setExpandedId(null);
      setOpen(null);
    }
    void run(() => deleteWorkout.mutateAsync(workout.id));
  }

  function removeExercise(workoutId: number, exerciseId: number) {
    void run(() => deleteExercise.mutateAsync({ workoutId, exerciseId }));
  }

  /* ------------------------------------------------------------------------
   * 4. Le formulaire du jour et de la note, s'il est ouvert sur cette séance
   * ------------------------------------------------------------------------ */
  function sessionFormFor(workout: Workout) {
    if (open?.kind !== "session" || open.workoutId !== workout.id) return null;
    return (
      <SessionForm
        initial={{ day: workout.day, note: workout.note }}
        isEditing
        isSending={updateWorkout.isPending}
        onSubmit={saveSession}
        onCancel={() => setOpen(null)}
      />
    );
  }

  /* ------------------------------------------------------------------------
   * 5. La page
   * ------------------------------------------------------------------------ */
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pt-8 pb-8">
      <header>
        <p className="text-xl font-semibold tracking-[2px] text-label uppercase">
          Sport
        </p>
        <h1 className="text-3xl font-light">Entraînements</h1>
      </header>

      <ErrorBanner message={errorMessage} />

      {/* 1. Le mois et ses chiffres. */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() => changeMonth(-1)}
          className={ARROW}
        >
          ‹
        </button>
        <p className="text-lg">
          {monthLabel(shownMonth.year, shownMonth.month)}
        </p>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() => changeMonth(1)}
          className={ARROW}
        >
          ›
        </button>
      </div>

      {/* 2. Les 4 boutons des semaines. */}
      <WeekTabs
        weeks={weeks}
        selected={selectedWeek}
        onSelect={(index) => showWeek(shownMonth, index)}
      />

      {/* 3. La semaine choisie. */}
      <section role="tabpanel" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg">
            Semaine {selectedWeek + 1}
            <span className="font-light text-muted"> · {weekLabel(week)}</span>
          </h2>
          <span className="shrink-0 text-sm text-muted tabular-nums">
            {countLabel("séance", week.workouts.length, "Aucune séance")}
          </span>
        </div>

        {open?.kind === "new-session" ? (
          <SessionForm
            initial={{ day: newSessionDay, note: null }}
            isEditing={false}
            /* isSuccess : le temps que la page de l'exercice s'ouvre, on ne
             * renvoie pas une seconde séance par un double appui. */
            isSending={addWorkout.isPending || addWorkout.isSuccess}
            onSubmit={saveSession}
            onCancel={() => setOpen(null)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setOpen({ kind: "new-session" })}
            className="min-h-11 rounded-xl bg-ink px-4 font-semibold text-bg"
          >
            + Nouvelle séance
          </button>
        )}

        {workouts === undefined ? (
          isError ? (
            <LoadFailed onRetry={() => refetch()} />
          ) : (
            <LoadingRows />
          )
        ) : week.workouts.length === 0 ? (
          <p className="py-6 text-center font-light text-muted">
            Pas encore de séance cette semaine.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {week.workouts.map((workout) => (
              <li key={workout.id}>
                <WorkoutCard
                  workout={workout}
                  isExpanded={expandedId === workout.id}
                  sessionForm={sessionFormFor(workout)}
                  onToggle={() => toggle(workout.id)}
                  onEditSession={() =>
                    setOpen({ kind: "session", workoutId: workout.id })
                  }
                  onDeleteSession={() => removeSession(workout)}
                  onDeleteExercise={(exerciseId) =>
                    removeExercise(workout.id, exerciseId)
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

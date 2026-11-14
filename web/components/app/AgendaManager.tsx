/* ==========================================================================
 * components/app/AgendaManager.tsx — l'agenda du foyer, depuis le téléphone
 *
 * Le cœur de la page /app/agenda, construit comme ShoppingManager : il
 * possède les mutations (lib/api/events.ts) et les confie aux morceaux de la
 * page sous forme de fonctions simples.
 *
 * De haut en bas :
 *   1. le calendrier du mois, où l'on choisit un jour ;
 *   2. les événements de ce jour, une ligne chacun ;
 *   3. le formulaire, qui ajoute à ce jour ou modifie la ligne touchée.
 * ========================================================================== */

"use client";

import { useMemo, useState } from "react";
import ErrorBanner from "@/components/app/ErrorBanner";
import EventForm from "@/components/app/EventForm";
import EventRow from "@/components/app/EventRow";
import { LoadFailed, LoadingRows } from "@/components/app/LoadStates";
import MonthCalendar from "@/components/app/MonthCalendar";
import {
  useAddEvent,
  useDeleteEvent,
  useEventsBetween,
  useUpdateEvent,
} from "@/lib/api/events";
import { useMembers } from "@/lib/api/profiles";
import {
  firstOfMonth,
  longDayLabel,
  monthGrid,
  parisToday,
  shiftMonth,
  type IsoDay,
} from "@/lib/calendar";
import type { CalendarEvent, CalendarEventDraft } from "@/lib/types";

/** "2026-11-19" → { year: 2026, month: 11 }. */
function monthOf(day: IsoDay) {
  return { year: Number(day.slice(0, 4)), month: Number(day.slice(5, 7)) };
}

export default function AgendaManager() {
  const today = parisToday();

  /* ------------------------------------------------------------------------
   * 1. Ce que la page affiche : un mois, un jour choisi, une ligne modifiée
   * ------------------------------------------------------------------------ */
  const [shownMonth, setShownMonth] = useState(() => monthOf(today));
  const [selectedDay, setSelectedDay] = useState(today);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  /* Le dernier échec, affiché en haut. Toute action réussie l'efface. */
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function selectDay(day: IsoDay) {
    setSelectedDay(day);
    /* Toucher une case grisée (un mois voisin) y emmène. */
    setShownMonth(monthOf(day));
    setEditing(null);
  }

  function changeMonth(count: -1 | 1) {
    const next = shiftMonth(shownMonth.year, shownMonth.month, count);
    setShownMonth(next);
    /* Le jour choisi suit : aujourd'hui si on revient au mois en cours,
     * sinon le 1er du mois. */
    const first = firstOfMonth(next.year, next.month);
    setSelectedDay(first.slice(0, 7) === today.slice(0, 7) ? today : first);
    setEditing(null);
  }

  /* ------------------------------------------------------------------------
   * 2. Les données : toute la grille du mois (cases grisées comprises)
   * ------------------------------------------------------------------------ */
  const weeks = monthGrid(shownMonth.year, shownMonth.month);
  const gridStart = weeks[0][0];
  const gridEnd = weeks[weeks.length - 1][6];

  const {
    data: events,
    isError,
    refetch,
  } = useEventsBetween(gridStart, gridEnd);
  const members = useMembers().data ?? [];

  /* Les événements rangés par jour, pour le calendrier et la liste.
   * useMemo : on ne refait le rangement que si la liste change. */
  const eventsByDay = useMemo(() => {
    const byDay = new Map<IsoDay, CalendarEvent[]>();
    for (const event of events ?? []) {
      byDay.set(event.day, [...(byDay.get(event.day) ?? []), event]);
    }
    return byDay;
  }, [events]);

  const dayEvents = eventsByDay.get(selectedDay) ?? [];

  /* ------------------------------------------------------------------------
   * 3. Les actions
   * ------------------------------------------------------------------------ */
  const addEvent = useAddEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  /* mutateAsync renvoie une promesse : le formulaire attend la réponse
   * pour savoir s'il doit se vider. */
  async function save(draft: CalendarEventDraft) {
    try {
      if (editing) {
        await updateEvent.mutateAsync({ id: editing.id, draft });
      } else {
        await addEvent.mutateAsync(draft);
      }
      setErrorMessage(null);
      /* On montre le jour de l'événement, même si sa date a changé. */
      selectDay(draft.day);
      return true;
    } catch (error) {
      setErrorMessage((error as Error).message);
      return false;
    }
  }

  function remove(event: CalendarEvent) {
    if (editing?.id === event.id) setEditing(null);
    deleteEvent.mutate(event.id, {
      onSuccess: () => setErrorMessage(null),
      onError: (error: Error) => setErrorMessage(error.message),
    });
  }

  /* Le point de départ du formulaire : la ligne modifiée, ou un événement
   * vide le jour choisi. */
  const formInitial: CalendarEventDraft = editing
    ? {
        title: editing.title,
        kind: editing.kind,
        day: editing.day,
        start_time: editing.start_time,
        profile_id: editing.member?.id ?? null,
      }
    : {
        title: "",
        kind: "once",
        day: selectedDay,
        start_time: null,
        profile_id: null,
      };

  /* ------------------------------------------------------------------------
   * 4. La page
   * ------------------------------------------------------------------------ */
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-4 pt-8 pb-8">
      <header>
        <p className="text-xl font-semibold tracking-[2px] text-label uppercase">
          Le foyer
        </p>
        <h1 className="text-3xl font-light">Agenda</h1>
      </header>

      <ErrorBanner message={errorMessage} />

      <MonthCalendar
        year={shownMonth.year}
        month={shownMonth.month}
        weeks={weeks}
        eventsByDay={eventsByDay}
        today={today}
        selectedDay={selectedDay}
        onSelectDay={selectDay}
        onShiftMonth={changeMonth}
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-light">
          {selectedDay === today ? "Aujourd'hui" : longDayLabel(selectedDay)}
        </h2>

        {events === undefined ? (
          isError ? (
            <LoadFailed onRetry={() => refetch()} />
          ) : (
            <LoadingRows />
          )
        ) : dayEvents.length === 0 ? (
          <p className="font-light text-muted">Rien de prévu.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {dayEvents.map((event) => (
              <li key={`${event.id}-${event.day}`}>
                <EventRow
                  event={event}
                  isEditing={editing?.id === event.id}
                  onEdit={() => setEditing(event)}
                  onDelete={() => remove(event)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* La key change avec le jour choisi et la ligne modifiée : le
          formulaire repart alors de formInitial (voir EventForm). */}
      <EventForm
        key={editing ? `edit-${editing.id}` : `add-${selectedDay}`}
        initial={formInitial}
        members={members}
        isEditing={editing !== null}
        isSending={addEvent.isPending || updateEvent.isPending}
        onSubmit={save}
        onCancel={() => setEditing(null)}
      />
    </main>
  );
}

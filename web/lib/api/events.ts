/* ==========================================================================
 * lib/api/events.ts — lire et modifier l'agenda du foyer
 *
 * Deux lectures :
 *   useWeekEvents     les 7 prochains jours, pour le widget du miroir ;
 *   useEventsBetween  une période, pour le calendrier du téléphone.
 *
 * PAS DE MUTATION « OPTIMISTE » ICI, contrairement aux courses. Les lignes
 * de l'agenda sont CALCULÉES par l'API (un anniversaire devient une ligne
 * par année, triée parmi les autres) : refaire ce calcul dans le cache
 * serait recopier les règles de l'API. On envoie, puis on relit.
 * ========================================================================== */

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { throwIfError } from "@/lib/api/optimistic";
import type { IsoDay } from "@/lib/calendar";
import type { CalendarEventDraft } from "@/lib/types";

/* --------------------------------------------------------------------------
 * 1. Constantes
 * -------------------------------------------------------------------------- */

/* Un rendez-vous ajouté sur le téléphone arrive sur le miroir en moins
 * d'une demi-minute, comme les courses. */
const WEEK_REFRESH_MS = 30_000;

/* RECOPIE de EventTitle dans api/app/schemas/event.py : 80 caractères. */
export const EVENT_TITLE_MAX_LENGTH = 80;

/* Toutes les lectures de l'agenda commencent par « events » : la semaine
 * (["events", "week"]) comme chaque mois (["events", début, fin]).
 * Invalider ["events"] les fait donc toutes relire d'un coup. */
const eventsQueryKey = ["events"] as const;

/* --------------------------------------------------------------------------
 * 2. Lire
 * -------------------------------------------------------------------------- */
export function useWeekEvents() {
  return useQuery({
    queryKey: [...eventsQueryKey, "week"],
    queryFn: async () => {
      const { data, error } = await api.GET("/events/week");
      throwIfError(error, "Lecture de l'agenda impossible.");
      return data;
    },
    refetchInterval: WEEK_REFRESH_MS,
  });
}

/** Les événements du jour start au jour end, tous deux inclus. */
export function useEventsBetween(start: IsoDay, end: IsoDay) {
  return useQuery({
    queryKey: [...eventsQueryKey, start, end],
    queryFn: async () => {
      const { data, error } = await api.GET("/events", {
        params: { query: { start, end } },
      });
      throwIfError(error, "Lecture de l'agenda impossible.");
      return data;
    },
    /* En passant au mois suivant, on garde l'ancien affiché le temps que le
     * nouveau arrive, au lieu de faire clignoter un écran de chargement. */
    placeholderData: keepPreviousData,
  });
}

/* --------------------------------------------------------------------------
 * 3. Ajouter, modifier, supprimer
 *
 * Les trois suivent le même chemin — envoyer, puis tout relire — écrit une
 * seule fois dans useEventMutation.
 * -------------------------------------------------------------------------- */
function useEventMutation<Variables>(
  send: (variables: Variables) => Promise<void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: send,
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: eventsQueryKey }),
  });
}

export function useAddEvent() {
  return useEventMutation(async (draft: CalendarEventDraft) => {
    const { error } = await api.POST("/events", { body: draft });
    throwIfError(error, "Ajout impossible.");
  });
}

export function useUpdateEvent() {
  return useEventMutation(
    async ({ id, draft }: { id: number; draft: CalendarEventDraft }) => {
      const { error } = await api.PUT("/events/{event_id}", {
        params: { path: { event_id: id } },
        body: draft,
      });
      throwIfError(error, "Modification impossible.");
    },
  );
}

export function useDeleteEvent() {
  return useEventMutation(async (id: number) => {
    const { error } = await api.DELETE("/events/{event_id}", {
      params: { path: { event_id: id } },
    });
    throwIfError(error, "Suppression impossible.");
  });
}

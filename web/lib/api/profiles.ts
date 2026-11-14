/* ==========================================================================
 * lib/api/profiles.ts — les membres du foyer
 *
 * Lecture seule : le formulaire de l'agenda s'en sert pour proposer
 * « pour qui » est un rendez-vous. Les membres changent rarement : pas de
 * relecture automatique, une seule lecture par visite suffit.
 * ========================================================================== */

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { throwIfError } from "@/lib/api/optimistic";

export function useMembers() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await api.GET("/profiles");
      throwIfError(error, "Lecture des membres impossible.");
      return data;
    },
    staleTime: Infinity,
  });
}

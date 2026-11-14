/* ==========================================================================
 * components/app/EventForm.tsx — ajouter ou modifier un événement
 *
 *   titre            « Dentiste », « Anniversaire de Mamie »
 *   sorte            Rendez-vous (un jour précis) / Chaque année
 *   date             préremplie avec le jour choisi dans le calendrier
 *   heure            facultative ; cachée pour « Chaque année » (toute la
 *                    journée, la règle de l'API)
 *   pour qui         Tout le foyer, ou un membre
 *
 * Le même formulaire sert à ajouter et à modifier : la page lui donne
 * l'événement de départ (initial) et dit lequel des deux elle attend
 * (isEditing). Pour repartir de zéro, la page change sa « key » : React
 * jette alors l'ancien formulaire et en fabrique un neuf.
 * ========================================================================== */

"use client";

import { useState } from "react";
import { EVENT_TITLE_MAX_LENGTH } from "@/lib/api/events";
import { shortTime } from "@/lib/calendar";
import type { CalendarEventDraft, Member } from "@/lib/types";

/* Les champs du téléphone, tous arrondis et de la même hauteur. */
const FIELD =
  "min-h-11 rounded-xl border border-ink/20 bg-bg px-3 py-2.5 text-[17px] font-light outline-none focus:border-ink/50";

export default function EventForm({
  initial,
  members,
  isEditing,
  isSending,
  onSubmit,
  onCancel,
}: {
  initial: CalendarEventDraft;
  members: Member[];
  isEditing: boolean;
  isSending: boolean;
  /** Renvoie true si l'API a accepté l'événement. */
  onSubmit: (draft: CalendarEventDraft) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [kind, setKind] = useState(initial.kind);
  const [day, setDay] = useState(initial.day);
  /* Les champs HTML parlent en texte : "" veut dire « pas d'heure » ou
   * « tout le foyer ». La conversion se fait une seule fois, à l'envoi. */
  const [startTime, setStartTime] = useState(
    initial.start_time ? shortTime(initial.start_time) : "",
  );
  const [profileId, setProfileId] = useState(
    initial.profile_id ? String(initial.profile_id) : "",
  );

  const trimmedTitle = title.trim();

  async function submit(event: React.FormEvent) {
    event.preventDefault(); // pas de rechargement de la page
    if (trimmedTitle === "" || day === "") return;

    const accepted = await onSubmit({
      title: trimmedTitle,
      kind,
      day,
      start_time: kind === "once" && startTime !== "" ? startTime : null,
      profile_id: profileId === "" ? null : Number(profileId),
    });

    /* Après un ajout réussi, on vide le titre et l'heure mais on garde le
     * jour et le membre : on enchaîne souvent deux rendez-vous. */
    if (accepted && !isEditing) {
      setTitle("");
      setStartTime("");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-3 rounded-2xl border border-dashed border-ink/20 p-3"
    >
      <p className="text-sm font-semibold tracking-[2px] text-label uppercase">
        {isEditing ? "Modifier" : "Ajouter"}
      </p>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={EVENT_TITLE_MAX_LENGTH}
        placeholder="Dentiste, anniversaire de Mamie…"
        aria-label="Titre"
        enterKeyHint="done"
        className={`${FIELD} placeholder:text-muted/60`}
      />

      {/* Deux boutons qui se comportent comme un choix unique. */}
      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Sorte">
        {(
          [
            ["once", "Rendez-vous"],
            ["yearly", "Chaque année"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={kind === value}
            onClick={() => setKind(value)}
            className={`min-h-11 rounded-xl border px-3 ${
              kind === value
                ? "border-ink bg-ink font-semibold text-bg"
                : "border-ink/20 text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          aria-label="Date"
          required
          className={`${FIELD} min-w-0 flex-1`}
        />
        {kind === "once" ? (
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            aria-label="Heure (facultative)"
            className={`${FIELD} w-32`}
          />
        ) : null}
      </div>

      <select
        value={profileId}
        onChange={(e) => setProfileId(e.target.value)}
        aria-label="Pour qui"
        className={FIELD}
      >
        <option value="">Tout le foyer</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 flex-1 rounded-xl border border-ink/20 px-4"
          >
            Annuler
          </button>
        ) : null}
        <button
          type="submit"
          disabled={trimmedTitle === "" || day === "" || isSending}
          className="min-h-11 flex-1 rounded-xl bg-ink px-4 font-semibold text-bg disabled:opacity-40"
        >
          {isSending ? "Envoi…" : isEditing ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </form>
  );
}

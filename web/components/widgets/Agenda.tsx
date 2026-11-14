/* ==========================================================================
 * components/widgets/Agenda.tsx — les rendez-vous des 7 prochains jours
 *
 * Une carte : en haut le calendrier 📅 et le titre « AGENDA » ; dessous,
 * les jours qui ont quelque chose, dans l'ordre.
 * Chaque jour a son petit titre (« AUJOURD'HUI », « DEMAIN », « JEUDI 19 »)
 * puis UNE LIGNE PAR ÉVÉNEMENT : deux rendez-vous le même jour font deux
 * lignes. Une ligne :
 *
 *   ● Dentiste                 18:30
 *   ● Anniversaire de Mamie      🎂
 *   ● Jour de grève
 *
 * le rond dit pour qui (la couleur du membre, ou l'ambre du foyer : voir
 * components/ui/MemberDot.tsx), puis le titre, puis au bout l'heure — 🎂
 * pour un anniversaire, rien pour un rendez-vous sans heure.
 *
 * « La semaine » = aujourd'hui et les 6 jours suivants. C'est l'API qui la
 * calcule (api/app/routers/events.py), anniversaires compris.
 *
 * LA LISTE DÉFILE AU DOIGT, comme celle des priorités : une hauteur fixe
 * (environ six lignes), puis un fondu en bas tant qu'il reste des lignes
 * cachées (lib/use-scroll-fade.ts). Toute la semaine reste ainsi lisible,
 * sans que la carte ne déborde de sa place.
 *
 * CONÇU POUR UNE DEMI-LARGEUR (environ 460 pixels miroir, la place qu'il a
 * debout sur la page du matin) : pas de compteur dans l'en-tête, qui
 * passerait sinon sur deux lignes.
 *
 * Même règle que les autres widgets : rien d'arrivé, ou rien de prévu cette
 * semaine, et le widget ne montre rien.
 * ========================================================================== */

"use client";

import Card from "@/components/ui/Card";
import EventWhen from "@/components/ui/EventWhen";
import MemberDot from "@/components/ui/MemberDot";
import SectionLabel from "@/components/ui/SectionLabel";
import { useWeekEvents } from "@/lib/api/events";
import { dayLabel, parisToday, type IsoDay } from "@/lib/calendar";
import { mp } from "@/lib/mirror-pixels";
import type { CalendarEvent } from "@/lib/types";
import { useScrollFade } from "@/lib/use-scroll-fade";

/* --------------------------------------------------------------------------
 * 1. Réglages
 * -------------------------------------------------------------------------- */

/* Les émoticônes jouent trois fois puis se figent, comme partout ailleurs. */
const EMOJI_PLAYS = 3;

/* --------------------------------------------------------------------------
 * 2. Le widget
 * -------------------------------------------------------------------------- */
export default function Agenda() {
  const { data } = useWeekEvents();
  const events = data ?? [];

  /* Avant le « return null » : React veut ses hooks à chaque rendu. */
  const { listRef, onScroll, fadeClass } = useScrollFade(data);

  if (events.length === 0) {
    return null;
  }

  const today = parisToday();

  return (
    <Card tone="amber">
      <div className="flex items-center gap-mp-18">
        {/* Une image FIXE, pas une <Emoji> animée : Google n'a pas de
            calendrier animé. C'est le 📅 de la même famille (Noto), en
            version dessinée, téléchargé une fois depuis
            fonts.gstatic.com/s/e/notoemoji/latest/1f4c5/emoji.svg dans
            public/emoji/ : le miroir n'a pas besoin d'Internet.
            alt="" : l'image décore, le titre dit déjà « Agenda ». */}
        {/* eslint-disable-next-line @next/next/no-img-element -- une petite
            image SVG locale : next/image n'apporterait rien ici. */}
        <img
          src="/emoji/calendar.svg"
          alt=""
          aria-hidden="true"
          className="shrink-0"
          style={{ width: mp(48), height: mp(48) }}
        />
        <SectionLabel>Agenda</SectionLabel>
      </div>

      {/* La liste défilante. max-h-mp-380 : environ six lignes.
          overscroll-contain : arrivé au bout, le doigt ne fait pas défiler
          tout l'écran à la place. mt-mp-4 + le premier mt-mp-18 des jours
          écartent la liste de l'en-tête. */}
      <div
        ref={listRef}
        onScroll={onScroll}
        className={`mt-mp-4 max-h-mp-380 overflow-y-auto overscroll-contain ${fadeClass}`}
      >
        {groupByDay(events).map(({ day, dayEvents }) => (
          <section key={day} className="mt-mp-18">
            <SectionLabel>{dayLabel(day, today)}</SectionLabel>

            {dayEvents.map((event) => (
              /* La clé réunit l'id et le jour : un même anniversaire ne
               revient qu'une fois par an, mais rien ne coûte d'être sûr. */
              <div
                key={`${event.id}-${event.day}`}
                className="mt-mp-6 flex items-center gap-mp-14"
              >
                {/* Le rond, toujours : membre ou foyer. */}
                <MemberDot member={event.member} size={16} />

                {/* flex-1 : le titre prend toute la place du milieu et
                    pousse l'heure contre le bord droit, où toutes les heures
                    s'alignent. min-w-0 + truncate : un titre trop long finit
                    par « … » au lieu de pousser l'heure hors de la carte. */}
                <span className="min-w-0 flex-1 truncate text-mp-30 font-light text-ink">
                  {event.title}
                </span>

                {/* L'heure au bout. tabular-nums donne la même largeur à
                    tous les chiffres. allDayLabel="" : rien pour un
                    rendez-vous sans heure, au lieu de « Journée ». */}
                <span className="flex shrink-0 text-mp-26 font-light text-muted tabular-nums">
                  <EventWhen
                    event={event}
                    emojiSize={32}
                    loop={EMOJI_PLAYS}
                    allDayLabel=""
                  />
                </span>
              </div>
            ))}
          </section>
        ))}
      </div>
    </Card>
  );
}

/* --------------------------------------------------------------------------
 * 3. Regrouper les lignes par jour
 *
 * Les lignes arrivent triées : il suffit de commencer un nouveau groupe à
 * chaque fois que le jour change.
 * -------------------------------------------------------------------------- */
function groupByDay(events: CalendarEvent[]) {
  const groups: { day: IsoDay; dayEvents: CalendarEvent[] }[] = [];
  for (const event of events) {
    const last = groups.at(-1);
    if (last?.day === event.day) {
      last.dayEvents.push(event);
    } else {
      groups.push({ day: event.day, dayEvents: [event] });
    }
  }
  return groups;
}

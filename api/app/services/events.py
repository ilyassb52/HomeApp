"""
==========================================================================
app/services/events.py — les règles de l'agenda

Comme app/services/shopping.py : des règles métier, sans rien de HTTP.

OCCURRENCE = « UNE LIGNE À AFFICHER »

Un rendez-vous ponctuel donne une seule occurrence, son jour. Un
anniversaire en donne une par année : le 20 novembre 2026, le 20 novembre
2027… On ne les fabrique que pour la période demandée.

Deux événements le même jour donnent donc tout naturellement deux
occurrences, c'est-à-dire deux lignes.
==========================================================================
"""

import calendar
from dataclasses import dataclass
from datetime import date, time

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Event


@dataclass(frozen=True)
class Occurrence:
    """Un événement, et le jour où il tombe dans la période demandée."""

    event: Event
    day: date


# --------------------------------------------------------------------------
# 1. La date d'un anniversaire une année donnée
# --------------------------------------------------------------------------
def yearly_date(month: int, day: int, year: int) -> date:
    """Le jour où tombe, l'année « year », une date fixe annuelle.

    Le 29 février n'existe que les années bissextiles : les autres années,
    on le fête la veille, le 28 février.
    """
    if month == 2 and day == 29 and not calendar.isleap(year):
        return date(year, 2, 28)
    return date(year, month, day)


# --------------------------------------------------------------------------
# 2. Toutes les occurrences entre deux jours (inclus)
# --------------------------------------------------------------------------
def list_occurrences(session: Session, start: date, end: date) -> list[Occurrence]:
    """Les lignes de l'agenda du jour start au jour end, tous deux inclus.

    Ordre : par jour ; dans une journée, d'abord ce qui dure toute la
    journée (sans heure), puis par heure ; l'id départage les ex æquo.
    """
    # Les rendez-vous ponctuels : la base les filtre elle-même.
    once = session.scalars(
        select(Event).where(Event.kind == "once", Event.day.between(start, end))
    )
    occurrences = [Occurrence(event, event.day) for event in once]

    # Les dates annuelles : on les lit toutes (un foyer en a quelques
    # dizaines au plus) et on calcule leur jour pour chaque année couverte.
    # Une semaine du 29 décembre au 4 janvier couvre deux années.
    yearly = session.scalars(select(Event).where(Event.kind == "yearly"))
    for event in yearly:
        for year in range(start.year, end.year + 1):
            day = yearly_date(event.day.month, event.day.day, year)
            if start <= day <= end:
                occurrences.append(Occurrence(event, day))

    occurrences.sort(
        key=lambda occurrence: (
            occurrence.day,
            # False (0) avant True (1) : les événements sans heure d'abord.
            occurrence.event.start_time is not None,
            occurrence.event.start_time or time.min,
            occurrence.event.id,
        )
    )
    return occurrences

"""
==========================================================================
app/routers/events.py — les routes de l'agenda du foyer

  GET     /events/week          les 7 prochains jours (le miroir)
  GET     /events?start=&end=   une période, pour le calendrier (le téléphone)
  POST    /events               ajouter un événement
  PUT     /events/{id}          le modifier (on renvoie l'événement entier)
  DELETE  /events/{id}          le supprimer

Comme les courses, l'agenda appartient au foyer : pas de profil demandé.
Le profil_id d'un événement n'est qu'une étiquette.
==========================================================================
"""

from datetime import date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.clock import get_now
from app.core.database import get_session
from app.models import Event, Profile
from app.schemas.event import EventRead, EventWrite
from app.services.events import Occurrence, list_occurrences

router = APIRouter(prefix="/events", tags=["Agenda"])

SessionDep = Annotated[Session, Depends(get_session)]
NowDep = Annotated[datetime, Depends(get_now)]

# « La semaine » du miroir : aujourd'hui et les 6 jours suivants.
WEEK_DAYS = 7

# La plus longue période qu'on peut demander d'un coup. Un calendrier
# mensuel affiche au plus 6 semaines, soit 42 jours : 62 laisse de la marge
# sans permettre de demander dix ans d'anniversaires.
MAX_PERIOD_DAYS = 62


def _read_all(occurrences: list[Occurrence]) -> list[EventRead]:
    return [EventRead.from_model(o.event, o.day) for o in occurrences]


def _get_event_or_404(session: Session, event_id: int) -> Event:
    event = session.get(Event, event_id)
    if event is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Événement introuvable.")
    return event


def _apply(session: Session, event: Event, body: EventWrite) -> None:
    """Recopie le formulaire dans l'événement (ajout comme modification)."""
    member = None
    if body.profile_id is not None:
        member = session.get(Profile, body.profile_id)
        if member is None:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY, "Membre introuvable."
            )

    event.title = body.title
    event.kind = body.kind
    event.day = body.day
    event.start_time = body.start_time
    # On donne le profil lui-même, pas seulement son id : event.profile est
    # ainsi à jour pour la réponse, sans relire la base.
    event.profile = member


# --------------------------------------------------------------------------
# 1. Lire
# --------------------------------------------------------------------------
@router.get("/week")
def list_week(session: SessionDep, now: NowDep) -> list[EventRead]:
    # now.date() : le jour à Paris (voir app/core/clock.py).
    today = now.date()
    end = today + timedelta(days=WEEK_DAYS - 1)
    return _read_all(list_occurrences(session, today, end))


@router.get("")
def list_period(start: date, end: date, session: SessionDep) -> list[EventRead]:
    if end < start:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "La fin de la période est avant son début.",
        )
    if (end - start).days + 1 > MAX_PERIOD_DAYS:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            f"Période trop longue : {MAX_PERIOD_DAYS} jours au plus.",
        )
    return _read_all(list_occurrences(session, start, end))


# --------------------------------------------------------------------------
# 2. Ajouter
# --------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
def create_event(body: EventWrite, session: SessionDep) -> EventRead:
    event = Event()
    _apply(session, event, body)
    session.add(event)
    session.commit()
    return EventRead.from_model(event)


# --------------------------------------------------------------------------
# 3. Modifier
# --------------------------------------------------------------------------
@router.put("/{event_id}")
def update_event(event_id: int, body: EventWrite, session: SessionDep) -> EventRead:
    event = _get_event_or_404(session, event_id)
    _apply(session, event, body)
    session.commit()
    return EventRead.from_model(event)


# --------------------------------------------------------------------------
# 4. Supprimer
# --------------------------------------------------------------------------
@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: int, session: SessionDep) -> None:
    event = _get_event_or_404(session, event_id)
    session.delete(event)
    session.commit()

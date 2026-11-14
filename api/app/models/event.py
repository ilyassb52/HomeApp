"""
==========================================================================
app/models/event.py — un événement de l'agenda du foyer

DEUX SORTES D'ÉVÉNEMENTS (« kind »)

  - « once »   : un rendez-vous ponctuel, un jour précis, heure facultative ;
  - « yearly » : une date fixe qui revient chaque année (un anniversaire),
                 toujours sur toute la journée, donc sans heure.

UN ANNIVERSAIRE N'EST ENREGISTRÉ QU'UNE FOIS

Pour un événement « yearly », seuls le jour et le mois de « day » comptent :
l'année est ignorée. C'est l'API qui CALCULE, à la lecture, la date de cette
année (app/services/events.py), comme le report des priorités. Rien ne
tourne la nuit, et rien ne change dans la base d'une année à l'autre.

L'AGENDA APPARTIENT AU FOYER

Comme la liste de courses, tout le monde voit les mêmes événements. Un
événement peut quand même porter l'étiquette d'un membre (« profile_id »,
facultatif) : le miroir affiche alors une pastille de sa couleur.
==========================================================================
"""

from datetime import date, datetime, time
from typing import Literal, get_args

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, Time, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.profile import Profile

# Même principe que GoalCategory (app/models/goal.py) : le type Literal sert
# aux schémas, le tuple à la contrainte SQL.
EventKind = Literal["once", "yearly"]
EVENT_KINDS = get_args(EventKind)


class Event(Base):
    __tablename__ = "event"
    __table_args__ = (
        CheckConstraint(f"kind IN {EVENT_KINDS}", name="event_kind_valid"),
        # Un événement annuel dure toute la journée : la base refuse une
        # heure, même si une erreur dans l'API la laissait passer.
        CheckConstraint(
            "kind = 'once' OR start_time IS NULL",
            name="event_yearly_without_time",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # « Dentiste », « Anniversaire de Mamie »… 80 caractères, comme les
    # articles de courses.
    title: Mapped[str] = mapped_column(String(80))
    kind: Mapped[str] = mapped_column(String(10))

    # Le jour de l'événement (pour « yearly » : seuls jour et mois comptent).
    # Nommé « day » plutôt que « date », comme dans goal.py, pour ne pas
    # masquer le type date de Python.
    day: Mapped[date]

    # L'heure de début, ou None pour un événement sur toute la journée.
    # Une simple heure, sans fuseau : « 14:30 », c'est 14 h 30 à Paris.
    start_time: Mapped[time | None] = mapped_column(Time())

    # Le membre concerné, ou None pour « tout le foyer ». Supprimer un profil
    # ne supprime pas ses rendez-vous : ils redeviennent ceux du foyer
    # (ondelete="SET NULL").
    profile_id: Mapped[int | None] = mapped_column(
        ForeignKey("profile.id", ondelete="SET NULL")
    )

    # Le profil lui-même, pour lire son prénom et sa couleur. lazy="joined" :
    # il arrive dans la même requête SQL que l'événement, au lieu d'une
    # requête de plus par ligne.
    profile: Mapped[Profile | None] = relationship(lazy="joined")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

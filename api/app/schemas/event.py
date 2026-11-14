"""
==========================================================================
app/schemas/event.py — la forme des événements qui entrent et qui sortent

UN SEUL SCHÉMA POUR AJOUTER ET POUR MODIFIER

Contrairement aux courses, le téléphone renvoie l'événement entier quand il
le modifie (PUT) : c'est un petit formulaire, on le renvoie tel quel. Cela
évite de distinguer « l'heure n'a pas changé » de « on a effacé l'heure ».

« day » DANS LES LISTES = LE JOUR OÙ ON L'AFFICHE

Dans une liste (semaine, mois), « day » est le jour de l'occurrence : pour
un anniversaire, la date de cette année, pas celle qui a été enregistrée.
==========================================================================
"""

from datetime import date, time
from typing import Annotated, Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models import Event, EventKind
from app.schemas.profile import MemberRead

# 80 caractères, comme la colonne.
EventTitle = Annotated[str, Field(min_length=1, max_length=80)]


class EventWrite(BaseModel):
    """Ce que le téléphone envoie pour ajouter ou modifier un événement."""

    # Retire les espaces autour du titre AVANT de vérifier sa longueur.
    model_config = ConfigDict(str_strip_whitespace=True)

    title: EventTitle
    kind: EventKind
    day: date
    start_time: time | None = None
    # None : l'événement concerne tout le foyer.
    profile_id: int | None = None

    @model_validator(mode="after")
    def yearly_has_no_time(self) -> Self:
        # La même règle que la contrainte SQL de app/models/event.py, mais
        # ici elle donne un message lisible (422) au lieu d'une erreur 500.
        if self.kind == "yearly" and self.start_time is not None:
            raise ValueError("Un événement annuel dure toute la journée : pas d'heure.")
        return self


class EventRead(BaseModel):
    """Un événement tel que le front le reçoit."""

    id: int
    title: str
    kind: EventKind
    day: date
    start_time: time | None
    member: MemberRead | None

    @classmethod
    def from_model(cls, event: Event, day: date | None = None) -> "EventRead":
        """day : le jour où on l'affiche ; par défaut, celui enregistré."""
        return cls(
            id=event.id,
            title=event.title,
            kind=event.kind,
            day=day or event.day,
            start_time=event.start_time,
            member=MemberRead.from_model(event.profile) if event.profile else None,
        )

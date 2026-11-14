"""
==========================================================================
app/routers/profiles.py — les membres du foyer

  GET  /profiles   la liste des membres (prénom et couleur)

Lecture seule pour l'instant : le téléphone s'en sert pour choisir le
membre d'un rendez-vous. Ajouter ou renommer un membre viendra avec
l'authentification (étape 3).
==========================================================================
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.models import Profile
from app.schemas.profile import MemberRead

router = APIRouter(prefix="/profiles", tags=["Membres"])

SessionDep = Annotated[Session, Depends(get_session)]


@router.get("")
def list_members(session: SessionDep) -> list[MemberRead]:
    profiles = session.scalars(select(Profile).order_by(Profile.id))
    return [MemberRead.from_model(profile) for profile in profiles]

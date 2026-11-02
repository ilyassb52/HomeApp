"""
==========================================================================
app/core/auth.py — qui fait la requête ?

PROVISOIRE, EN ATTENDANT L'AUTHENTIFICATION (étape 3).

Pour l'instant, l'appelant annonce lui-même son profil :
« /goals?profile_id=1 ». N'importe qui peut donc se faire passer pour
n'importe qui — acceptable tant que tout reste sur le Wi-Fi de la maison.

Quand le JWT arrivera, seule cette fonction changera : elle lira le profil
dans le jeton au lieu de l'URL. Les routes, elles, demandent déjà « le
profil courant » sans savoir d'où il vient, et ne bougeront pas.
==========================================================================
"""

from typing import Annotated

from fastapi import Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.models import Profile


def get_current_profile(
    session: Annotated[Session, Depends(get_session)],
    profile_id: Annotated[int, Query(description="Provisoire, avant le JWT")],
) -> Profile:
    profile = session.get(Profile, profile_id)
    if profile is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Profil introuvable.")
    return profile

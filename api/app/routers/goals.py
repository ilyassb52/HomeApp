"""
==========================================================================
app/routers/goals.py — les routes des priorités

  GET     /goals             les priorités du jour, dans l'ordre
  POST    /goals             en ajouter une (3 au maximum)
  PATCH   /goals/{id}        modifier le texte, la catégorie, cocher
  DELETE  /goals/{id}        en supprimer une
  PUT     /goals/order       enregistrer un nouvel ordre

Chaque route reçoit trois choses par injection de dépendances (Depends) :
la session de base de données, le profil courant, et l'heure. Elle ne les
fabrique jamais elle-même : c'est ce qui permet aux tests de les remplacer.
==========================================================================
"""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_profile
from app.core.clock import get_now
from app.core.database import get_session
from app.models import Goal, Profile
from app.schemas.goal import GoalCreate, GoalOrder, GoalRead, GoalUpdate
from app.services.goals import (
    MAX_GOALS_PER_DAY,
    get_profile_goal,
    list_visible_goals,
)

router = APIRouter(prefix="/goals", tags=["Priorités"])

# Des raccourcis, pour ne pas répéter « Annotated[…, Depends(…)] » partout.
SessionDep = Annotated[Session, Depends(get_session)]
ProfileDep = Annotated[Profile, Depends(get_current_profile)]
NowDep = Annotated[datetime, Depends(get_now)]


def _visible_goals_read(
    session: Session, profile: Profile, now: datetime
) -> list[GoalRead]:
    """La liste du jour, au format du front. Trois routes la renvoient."""
    goals = list_visible_goals(session, profile.id, now)
    return [GoalRead.from_model(goal) for goal in goals]


def _get_goal_or_404(session: Session, profile: Profile, goal_id: int) -> Goal:
    goal = get_profile_goal(session, profile.id, goal_id)
    if goal is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Priorité introuvable.")
    return goal


# --------------------------------------------------------------------------
# 1. Lire
# --------------------------------------------------------------------------
@router.get("")
def list_goals(session: SessionDep, profile: ProfileDep, now: NowDep) -> list[GoalRead]:
    return _visible_goals_read(session, profile, now)


# --------------------------------------------------------------------------
# 2. Ajouter
# --------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
def create_goal(
    body: GoalCreate, session: SessionDep, profile: ProfileDep, now: NowDep
) -> GoalRead:
    visible = list_visible_goals(session, profile.id, now)

    # 409 Conflict : la demande est valide, mais l'état actuel l'interdit.
    if len(visible) >= MAX_GOALS_PER_DAY:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"{MAX_GOALS_PER_DAY} priorités maximum par jour.",
        )

    # La nouvelle se place après la dernière affichée.
    position = visible[-1].position + 1 if visible else 0

    goal = Goal(
        profile_id=profile.id,
        title=body.text,
        category=body.category,
        day=now.date(),
        position=position,
    )
    session.add(goal)
    session.commit()
    return GoalRead.from_model(goal)


# --------------------------------------------------------------------------
# 3. Réordonner
#
# Déclarée AVANT /{goal_id} par lisibilité. Les méthodes diffèrent (PUT
# ici, PATCH et DELETE là-bas), donc FastAPI ne peut pas les confondre.
# --------------------------------------------------------------------------
@router.put("/order")
def reorder_goals(
    body: GoalOrder, session: SessionDep, profile: ProfileDep, now: NowDep
) -> list[GoalRead]:
    visible = list_visible_goals(session, profile.id, now)
    goals_by_id = {goal.id: goal for goal in visible}

    # La liste envoyée doit contenir chaque priorité affichée, une seule
    # fois, et rien d'autre. Sinon, on refuse plutôt que de deviner.
    if len(body.ids) != len(goals_by_id) or set(body.ids) != set(goals_by_id):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "La liste doit contenir exactement les priorités affichées.",
        )

    for position, goal_id in enumerate(body.ids):
        goals_by_id[goal_id].position = position
    session.commit()

    return _visible_goals_read(session, profile, now)


# --------------------------------------------------------------------------
# 4. Modifier, cocher
# --------------------------------------------------------------------------
@router.patch("/{goal_id}")
def update_goal(
    goal_id: int,
    body: GoalUpdate,
    session: SessionDep,
    profile: ProfileDep,
    now: NowDep,
) -> GoalRead:
    goal = _get_goal_or_404(session, profile, goal_id)

    if body.text is not None:
        goal.title = body.text
    if body.category is not None:
        goal.category = body.category

    if body.done is True and goal.done_at is None:
        goal.done_at = now
    elif body.done is False:
        goal.done_at = None
    # Recocher une priorité déjà faite ne change pas son heure : sinon, une
    # priorité cochée hier puis recochée remonterait aujourd'hui.

    session.commit()
    return GoalRead.from_model(goal)


# --------------------------------------------------------------------------
# 5. Supprimer
# --------------------------------------------------------------------------
@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, session: SessionDep, profile: ProfileDep) -> None:
    goal = _get_goal_or_404(session, profile, goal_id)
    session.delete(goal)
    session.commit()

"""
==========================================================================
app/services/goals.py — les règles des priorités

Ici vivent les règles métier, sans rien de HTTP : pas de requête, pas de
code 404. Le routeur (app/routers/goals.py) les appelle et traduit leurs
résultats en réponses.
==========================================================================
"""

from datetime import datetime, time

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models import Goal


def list_visible_goals(session: Session, profile_id: int, now: datetime) -> list[Goal]:
    """Les priorités à afficher aujourd'hui, dans l'ordre.

    C'est ici que se fait le report (voir app/models/goal.py) :

      - créée aujourd'hui ou avant  → day <= aujourd'hui
      - ET pas encore faite         → done_at vide
        OU faite aujourd'hui        → done_at depuis minuit, heure de Paris

    Une priorité d'hier non faite remonte donc d'elle-même ; une priorité
    cochée hier disparaît.
    """
    today = now.date()
    # Minuit ce matin, à Paris. now porte déjà le fuseau : on le recopie.
    start_of_today = datetime.combine(today, time.min, tzinfo=now.tzinfo)

    statement = (
        select(Goal)
        .where(
            Goal.profile_id == profile_id,
            Goal.day <= today,
            or_(Goal.done_at.is_(None), Goal.done_at >= start_of_today),
        )
        # L'id départage deux positions égales : l'ordre reste stable.
        .order_by(Goal.position, Goal.id)
    )
    return list(session.scalars(statement))


def get_profile_goal(session: Session, profile_id: int, goal_id: int) -> Goal | None:
    """La priorité demandée, seulement si elle appartient à ce profil.

    Une priorité d'un autre profil est traitée comme inexistante : on ne
    révèle même pas qu'elle existe.
    """
    goal = session.get(Goal, goal_id)
    if goal is None or goal.profile_id != profile_id:
        return None
    return goal

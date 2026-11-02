"""
Tous les modèles, importés ici pour deux raisons : écrire
« from app.models import Goal » ailleurs, et permettre à Alembic de les
trouver tous en important ce seul module.
"""

from app.models.goal import GOAL_CATEGORIES, Goal, GoalCategory
from app.models.profile import Profile

__all__ = ["GOAL_CATEGORIES", "Goal", "GoalCategory", "Profile"]

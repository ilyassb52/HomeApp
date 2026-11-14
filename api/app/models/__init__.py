"""
Tous les modèles, importés ici pour deux raisons : écrire
« from app.models import Goal » ailleurs, et permettre à Alembic de les
trouver tous en important ce seul module.
"""

from app.models.event import EVENT_KINDS, Event, EventKind
from app.models.goal import GOAL_CATEGORIES, Goal, GoalCategory
from app.models.profile import Profile
from app.models.shopping_item import ShoppingItem
from app.models.workout import WorkoutExercise, WorkoutSession, WorkoutSet

__all__ = [
    "EVENT_KINDS",
    "Event",
    "EventKind",
    "GOAL_CATEGORIES",
    "Goal",
    "GoalCategory",
    "Profile",
    "ShoppingItem",
    "WorkoutExercise",
    "WorkoutSession",
    "WorkoutSet",
]

"""
==========================================================================
app/models/goal.py — une priorité

LE REPORT DES PRIORITÉS NON FAITES

Une priorité garde pour toujours son jour de création (« day »). Elle n'est
jamais déplacée au jour suivant : le report est CALCULÉ à la lecture, comme
les séries d'habitudes. Le jour J, on affiche :

  - les priorités créées jusqu'à J et pas encore faites ;
  - celles cochées le jour J, pour qu'on les voie barrées jusqu'au soir.

Une priorité faite un jour précédent, elle, disparaît. Aucune tâche
planifiée n'a donc à tourner la nuit, et rien ne peut se désynchroniser.

POURQUOI « done_at » ET PAS UN SIMPLE BOOLÉEN « done » ?

Parce que la règle ci-dessus a besoin de savoir QUAND la priorité a été
cochée. Le booléen « done » qu'attend le miroir se déduit : done_at n'est
pas vide.
==========================================================================
"""

from datetime import date, datetime
from typing import Literal, get_args

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base

# Les trois catégories du brief, avec les mêmes noms que le front
# (web/lib/types.ts, type PriorityCategory).
# Le type Literal sert aux schémas de l'API ; le tuple, à la contrainte SQL.
# get_args tire l'un de l'autre : la liste n'est écrite qu'une fois.
GoalCategory = Literal["work", "learning", "sport"]
GOAL_CATEGORIES = get_args(GoalCategory)


class Goal(Base):
    __tablename__ = "goal"
    __table_args__ = (
        # La base refuse elle-même une catégorie inconnue, même si une
        # erreur dans l'API la laissait passer.
        CheckConstraint(
            f"category IN {GOAL_CATEGORIES}",
            name="goal_category_valid",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # Supprimer un profil supprime ses priorités (ondelete="CASCADE").
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("profile.id", ondelete="CASCADE"), index=True
    )

    title: Mapped[str] = mapped_column(String(120))
    category: Mapped[str] = mapped_column(String(20))

    # Le jour, à Paris, où la priorité a été créée. Nommé « day » plutôt que
    # « date » pour ne pas masquer le type date de Python.
    day: Mapped[date]

    # L'ordre d'affichage : la plus petite position en premier.
    position: Mapped[int]

    # Le moment où elle a été cochée, ou None si elle reste à faire.
    # timezone=True : PostgreSQL stocke l'instant en UTC, sans ambiguïté.
    done_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

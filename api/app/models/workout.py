"""
==========================================================================
app/models/workout.py — le suivi des entraînements

TROIS NIVEAUX, TROIS TABLES

  séance (workout_session)        le lundi 9 novembre, « jambes »
    └─ exercice (workout_exercise)   Squat
         └─ série (workout_set)        10 reps × 60 kg

Chaque niveau appartient au précédent. Supprimer une séance supprime ses
exercices, et supprimer un exercice supprime ses séries (CASCADE).

LES SEMAINES NE SONT PAS STOCKÉES

Une séance garde seulement son jour (« day »). La semaine du lundi au
dimanche dans laquelle elle tombe se CALCULE à l'affichage (côté front,
web/lib/workouts.ts), comme le report des priorités (app/models/goal.py).

Comme les priorités, les entraînements appartiennent à un profil : chacun
voit seulement les siens.
==========================================================================
"""

from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class WorkoutSession(Base):
    """Une séance : un jour, une note facultative, des exercices."""

    __tablename__ = "workout_session"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Supprimer un profil supprime ses séances (ondelete="CASCADE").
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("profile.id", ondelete="CASCADE"), index=True
    )

    # Le jour de la séance. « day » plutôt que « date », comme dans goal.py.
    day: Mapped[date] = mapped_column(index=True)

    # « Jambes », « Haut du corps, fatigué »… ou rien.
    note: Mapped[str | None] = mapped_column(String(200))

    # Les exercices, dans l'ordre où on les a faits.
    # cascade="all, delete-orphan" : retirer un exercice de cette liste le
    # supprime de la base. C'est ce qui permet de remplacer la séance
    # entière en une fois (PUT, voir app/routers/workouts.py).
    exercises: Mapped[list["WorkoutExercise"]] = relationship(
        order_by="WorkoutExercise.position",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class WorkoutExercise(Base):
    """Un exercice d'une séance : son nom et ses séries."""

    __tablename__ = "workout_exercise"

    id: Mapped[int] = mapped_column(primary_key=True)

    session_id: Mapped[int] = mapped_column(
        ForeignKey("workout_session.id", ondelete="CASCADE"), index=True
    )

    # « Squat », « Développé couché »… 80 caractères, comme les courses.
    name: Mapped[str] = mapped_column(String(80))

    # L'ordre dans la séance : 0 pour le premier exercice.
    position: Mapped[int]

    sets: Mapped[list["WorkoutSet"]] = relationship(
        order_by="WorkoutSet.position",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class WorkoutSet(Base):
    """Une série : un nombre de répétitions, et le poids soulevé."""

    __tablename__ = "workout_set"
    __table_args__ = (
        # La base refuse elle-même une série vide ou un poids négatif, même
        # si une erreur dans l'API les laissait passer.
        CheckConstraint("reps > 0", name="workout_set_reps_positive"),
        CheckConstraint(
            "weight_kg IS NULL OR weight_kg >= 0",
            name="workout_set_weight_positive",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    exercise_id: Mapped[int] = mapped_column(
        ForeignKey("workout_exercise.id", ondelete="CASCADE"), index=True
    )

    # L'ordre dans l'exercice : 0 pour la première série.
    position: Mapped[int]

    reps: Mapped[int]

    # Le poids en kilos, à 100 g près (Numeric(5, 1) : jusqu'à 9999,9 kg).
    # None : un exercice au poids du corps (pompes, tractions…).
    # Decimal plutôt que float : 62,5 reste 62,5, sans arrondi binaire.
    weight_kg: Mapped[Decimal | None] = mapped_column(Numeric(5, 1))

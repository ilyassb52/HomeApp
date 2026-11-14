"""
==========================================================================
app/schemas/workout.py — la forme des séances qui entrent et qui sortent

UNE SÉANCE S'OUVRE VIDE, PUIS SE REMPLIT EXERCICE PAR EXERCICE

  WorkoutWrite    ouvrir une séance, ou changer sa date et sa note
  ExerciseWrite   ajouter un exercice à une séance, ou le modifier

Pas de « position » dans ce qu'on envoie : un nouvel exercice se range à la
fin de la séance, et les séries gardent l'ordre de leur liste.

Les exercices, eux, ont un « id » dans ce qui sort : le téléphone en a
besoin pour en modifier ou en supprimer un seul.
==========================================================================
"""

from datetime import date
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.models import WorkoutExercise, WorkoutSession, WorkoutSet

# Les mêmes limites que les colonnes (app/models/workout.py).
ExerciseName = Annotated[str, Field(min_length=1, max_length=80)]
WorkoutNote = Annotated[str, Field(max_length=200)]

# Des garde-fous contre les fautes de frappe (1000 reps, 5000 kg…), pas
# des records : personne ne s'en approche.
Reps = Annotated[int, Field(gt=0, le=999)]
WeightKg = Annotated[Decimal, Field(ge=0, le=999, decimal_places=1)]


# --------------------------------------------------------------------------
# 1. Ce que le téléphone envoie
# --------------------------------------------------------------------------
class SetWrite(BaseModel):
    reps: Reps
    # None : au poids du corps.
    weight_kg: WeightKg | None = None


class ExerciseWrite(BaseModel):
    """Un exercice et toutes ses séries, pour l'ajouter ou le modifier."""

    model_config = ConfigDict(str_strip_whitespace=True)

    name: ExerciseName
    # Au moins une série : un exercice sans série n'a pas été fait.
    sets: list[SetWrite] = Field(min_length=1, max_length=30)


class WorkoutWrite(BaseModel):
    """Une séance sans ses exercices : pour l'ouvrir, ou changer sa date et
    sa note. Les exercices s'ajoutent ensuite un par un."""

    model_config = ConfigDict(str_strip_whitespace=True)

    day: date
    note: WorkoutNote | None = None


# --------------------------------------------------------------------------
# 2. Ce que le front reçoit
# --------------------------------------------------------------------------
class SetRead(BaseModel):
    reps: int
    weight_kg: float | None

    @classmethod
    def from_model(cls, workout_set: WorkoutSet) -> "SetRead":
        # float pour le JSON : le front reçoit 62.5, pas la chaîne "62.5".
        weight = workout_set.weight_kg
        return cls(
            reps=workout_set.reps,
            weight_kg=float(weight) if weight is not None else None,
        )


class ExerciseRead(BaseModel):
    id: int
    name: str
    sets: list[SetRead]

    @classmethod
    def from_model(cls, exercise: WorkoutExercise) -> "ExerciseRead":
        return cls(
            id=exercise.id,
            name=exercise.name,
            sets=[SetRead.from_model(s) for s in exercise.sets],
        )


class WorkoutRead(BaseModel):
    """Une séance telle que le front la reçoit."""

    id: int
    day: date
    note: str | None
    exercises: list[ExerciseRead]

    @classmethod
    def from_model(cls, workout: WorkoutSession) -> "WorkoutRead":
        return cls(
            id=workout.id,
            day=workout.day,
            note=workout.note,
            exercises=[ExerciseRead.from_model(e) for e in workout.exercises],
        )


class PreviousExerciseRead(BaseModel):
    """« La dernière fois » : le jour et les séries de la dernière fois
    qu'on a fait cet exercice, pour s'en souvenir à la salle."""

    day: date
    sets: list[SetRead]

    @classmethod
    def from_model(cls, exercise: WorkoutExercise, day: date) -> "PreviousExerciseRead":
        return cls(day=day, sets=[SetRead.from_model(s) for s in exercise.sets])

"""
==========================================================================
app/services/workouts.py — les règles des entraînements

Comme app/services/events.py : des règles métier, sans rien de HTTP.
==========================================================================
"""

from datetime import date

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.models import Profile, WorkoutExercise, WorkoutSession, WorkoutSet
from app.schemas.workout import ExerciseWrite


# --------------------------------------------------------------------------
# 1. Lire les séances d'une période
# --------------------------------------------------------------------------
def list_workouts(
    session: Session, profile: Profile, start: date, end: date
) -> list[WorkoutSession]:
    """Les séances du profil du jour start au jour end, tous deux inclus.

    Ordre : par jour, puis par ordre d'ajout (id) pour deux séances le même
    jour.

    selectinload : les exercices de TOUTES les séances arrivent en une seule
    requête SQL, puis leurs séries en une autre. Sans cela, on ferait une
    requête par séance, puis une par exercice (le problème « N+1 »).
    """
    query = (
        select(WorkoutSession)
        .where(
            WorkoutSession.profile_id == profile.id,
            WorkoutSession.day.between(start, end),
        )
        .order_by(WorkoutSession.day, WorkoutSession.id)
        .options(
            selectinload(WorkoutSession.exercises).selectinload(WorkoutExercise.sets)
        )
    )
    return list(session.scalars(query))


# --------------------------------------------------------------------------
# 2. Ranger un nouvel exercice à la fin de la séance
# --------------------------------------------------------------------------
def next_exercise_position(workout: WorkoutSession) -> int:
    """La position juste après le dernier exercice (0 pour le premier).

    « La plus grande + 1 » plutôt que « le nombre d'exercices » : après une
    suppression au milieu, les positions ont un trou (0, 2), et compter
    donnerait 2… déjà prise.
    """
    return max((e.position for e in workout.exercises), default=-1) + 1


# --------------------------------------------------------------------------
# 3. Recopier le formulaire dans un exercice
# --------------------------------------------------------------------------
def apply_exercise(exercise: WorkoutExercise, body: ExerciseWrite) -> None:
    """Remplit l'exercice avec le formulaire (ajout comme modification).

    Les anciennes séries sont remplacées en bloc : grâce à
    cascade="all, delete-orphan" (app/models/workout.py), SQLAlchemy
    supprime lui-même celles qui ne sont plus dans la liste.
    """
    exercise.name = body.name
    exercise.sets = [
        WorkoutSet(position=index, reps=s.reps, weight_kg=s.weight_kg)
        for index, s in enumerate(body.sets)
    ]


# --------------------------------------------------------------------------
# 4. Les noms déjà utilisés, pour les choisir d'un toucher
# --------------------------------------------------------------------------
MAX_EXERCISE_NAMES = 30


def exercise_names(session: Session, profile: Profile) -> list[str]:
    """Les noms d'exercices du profil, du plus récemment fait au plus ancien.

    « Squat » et « squat » sont le même exercice : on n'en garde qu'un, celui
    écrit le plus récemment.
    """
    last_day = func.max(WorkoutSession.day)
    query = (
        select(WorkoutExercise.name)
        .join(WorkoutSession)
        .where(WorkoutSession.profile_id == profile.id)
        .group_by(WorkoutExercise.name)
        .order_by(last_day.desc(), WorkoutExercise.name)
    )
    names: list[str] = []
    seen: set[str] = set()
    for name in session.scalars(query):
        if name.lower() not in seen:
            seen.add(name.lower())
            names.append(name)
    return names[:MAX_EXERCISE_NAMES]


# --------------------------------------------------------------------------
# 5. « La dernière fois » qu'on a fait un exercice
# --------------------------------------------------------------------------
def previous_exercise(
    session: Session, profile: Profile, workout: WorkoutSession, name: str
) -> tuple[WorkoutExercise, WorkoutSession] | None:
    """Le même exercice (sans tenir compte des majuscules) dans la séance
    la plus récente AVANT « workout » : un jour plus tôt, ou le même jour
    mais ouverte avant elle. None s'il n'a jamais été fait."""
    before = or_(
        WorkoutSession.day < workout.day,
        and_(WorkoutSession.day == workout.day, WorkoutSession.id < workout.id),
    )
    query = (
        select(WorkoutExercise, WorkoutSession)
        .join(WorkoutSession)
        .where(
            WorkoutSession.profile_id == profile.id,
            before,
            func.lower(WorkoutExercise.name) == name.strip().lower(),
        )
        # Dans une même séance, le dernier exercice de ce nom (position).
        .order_by(
            WorkoutSession.day.desc(),
            WorkoutSession.id.desc(),
            WorkoutExercise.position.desc(),
        )
        .options(selectinload(WorkoutExercise.sets))
        .limit(1)
    )
    row = session.execute(query).first()
    return None if row is None else (row[0], row[1])

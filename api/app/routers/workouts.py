"""
==========================================================================
app/routers/workouts.py — les routes des entraînements

Une séance s'ouvre vide, puis se remplit exercice par exercice.

  GET     /workouts?start=&end=                 les séances d'une période
  GET     /workouts/exercise-names              ses noms d'exercices passés
  GET     /workouts/{id}                        une séance
  GET     /workouts/{id}/previous?name=         « la dernière fois » (salle)
  POST    /workouts                             ouvrir une séance (jour, note)
  PUT     /workouts/{id}                        changer son jour ou sa note
  DELETE  /workouts/{id}                        la supprimer, exercices compris

  POST    /workouts/{id}/exercises              ajouter un exercice à la fin
  PUT     /workouts/{id}/exercises/{ex_id}      le modifier (nom et séries)
  DELETE  /workouts/{id}/exercises/{ex_id}      le retirer

Toutes les routes qui modifient renvoient la séance entière : le téléphone
la redessine d'un coup.

Comme les priorités (app/routers/goals.py), chaque route reçoit le profil
courant : on ne voit, ne modifie et ne supprime que ses propres séances.
==========================================================================
"""

from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_profile
from app.core.database import get_session
from app.models import Profile, WorkoutExercise, WorkoutSession
from app.schemas.workout import (
    ExerciseWrite,
    PreviousExerciseRead,
    WorkoutRead,
    WorkoutWrite,
)
from app.services.workouts import (
    apply_exercise,
    exercise_names,
    list_workouts,
    next_exercise_position,
    previous_exercise,
)

router = APIRouter(prefix="/workouts", tags=["Entraînements"])

SessionDep = Annotated[Session, Depends(get_session)]
ProfileDep = Annotated[Profile, Depends(get_current_profile)]

# La plus longue période qu'on peut demander d'un coup. Un mois
# d'entraînement couvre au plus 41 jours (4 semaines, dont la dernière peut
# en faire 13) : 62 laisse de la marge, comme pour l'agenda.
MAX_PERIOD_DAYS = 62


def _get_workout_or_404(
    session: Session, profile: Profile, workout_id: int
) -> WorkoutSession:
    workout = session.get(WorkoutSession, workout_id)
    # La séance d'un autre profil répond « introuvable » : on ne dit même
    # pas qu'elle existe.
    if workout is None or workout.profile_id != profile.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Séance introuvable.")
    return workout


def _get_exercise_or_404(workout: WorkoutSession, exercise_id: int) -> WorkoutExercise:
    # On cherche dans les exercices DE CETTE SÉANCE : celui d'une autre
    # séance (même à soi) répond « introuvable ».
    for exercise in workout.exercises:
        if exercise.id == exercise_id:
            return exercise
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Exercice introuvable.")


# --------------------------------------------------------------------------
# 1. Lire
# --------------------------------------------------------------------------
@router.get("")
def list_period(
    start: date, end: date, session: SessionDep, profile: ProfileDep
) -> list[WorkoutRead]:
    if end < start:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "La fin de la période est avant son début.",
        )
    if (end - start).days + 1 > MAX_PERIOD_DAYS:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            f"Période trop longue : {MAX_PERIOD_DAYS} jours au plus.",
        )
    workouts = list_workouts(session, profile, start, end)
    return [WorkoutRead.from_model(workout) for workout in workouts]


# Déclarée AVANT « /{workout_id} » : sinon FastAPI essaierait de lire
# « exercise-names » comme un numéro de séance, et répondrait 422.
@router.get("/exercise-names")
def list_exercise_names(session: SessionDep, profile: ProfileDep) -> list[str]:
    return exercise_names(session, profile)


@router.get("/{workout_id}")
def read_workout(
    workout_id: int, session: SessionDep, profile: ProfileDep
) -> WorkoutRead:
    return WorkoutRead.from_model(_get_workout_or_404(session, profile, workout_id))


@router.get("/{workout_id}/previous")
def read_previous_exercise(
    workout_id: int, name: str, session: SessionDep, profile: ProfileDep
) -> PreviousExerciseRead | None:
    workout = _get_workout_or_404(session, profile, workout_id)
    found = previous_exercise(session, profile, workout, name)
    if found is None:
        return None
    exercise, previous_workout = found
    return PreviousExerciseRead.from_model(exercise, previous_workout.day)


# --------------------------------------------------------------------------
# 2. La séance : l'ouvrir, changer son jour ou sa note, la supprimer
# --------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
def create_workout(
    body: WorkoutWrite, session: SessionDep, profile: ProfileDep
) -> WorkoutRead:
    # Une note vide (« ») devient « pas de note ».
    workout = WorkoutSession(
        profile_id=profile.id, day=body.day, note=body.note or None, exercises=[]
    )
    session.add(workout)
    session.commit()
    return WorkoutRead.from_model(workout)


@router.put("/{workout_id}")
def update_workout(
    workout_id: int, body: WorkoutWrite, session: SessionDep, profile: ProfileDep
) -> WorkoutRead:
    workout = _get_workout_or_404(session, profile, workout_id)
    workout.day = body.day
    workout.note = body.note or None
    session.commit()
    return WorkoutRead.from_model(workout)


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(workout_id: int, session: SessionDep, profile: ProfileDep) -> None:
    workout = _get_workout_or_404(session, profile, workout_id)
    session.delete(workout)
    session.commit()


# --------------------------------------------------------------------------
# 3. Les exercices de la séance, un par un
# --------------------------------------------------------------------------
@router.post("/{workout_id}/exercises", status_code=status.HTTP_201_CREATED)
def add_exercise(
    workout_id: int, body: ExerciseWrite, session: SessionDep, profile: ProfileDep
) -> WorkoutRead:
    workout = _get_workout_or_404(session, profile, workout_id)
    exercise = WorkoutExercise(position=next_exercise_position(workout))
    apply_exercise(exercise, body)
    # Ajouté à la liste de la séance : SQLAlchemy l'enregistre avec elle,
    # et la réponse le contient sans relire la base.
    workout.exercises.append(exercise)
    session.commit()
    return WorkoutRead.from_model(workout)


@router.put("/{workout_id}/exercises/{exercise_id}")
def update_exercise(
    workout_id: int,
    exercise_id: int,
    body: ExerciseWrite,
    session: SessionDep,
    profile: ProfileDep,
) -> WorkoutRead:
    workout = _get_workout_or_404(session, profile, workout_id)
    apply_exercise(_get_exercise_or_404(workout, exercise_id), body)
    session.commit()
    return WorkoutRead.from_model(workout)


@router.delete("/{workout_id}/exercises/{exercise_id}")
def delete_exercise(
    workout_id: int, exercise_id: int, session: SessionDep, profile: ProfileDep
) -> WorkoutRead:
    workout = _get_workout_or_404(session, profile, workout_id)
    # Le retirer de la liste suffit : « delete-orphan » le supprime de la
    # base, avec ses séries.
    workout.exercises.remove(_get_exercise_or_404(workout, exercise_id))
    session.commit()
    return WorkoutRead.from_model(workout)

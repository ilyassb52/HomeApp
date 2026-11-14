"""
==========================================================================
tests/test_workouts.py — les routes des entraînements

Comme les priorités (tests/test_goals.py), chaque test crée son propre
profil (fixture « profile ») : il part donc d'une liste de séances vide,
sans rien effacer.

Une séance s'ouvre vide (POST /workouts), puis reçoit ses exercices un par
un (POST /workouts/{id}/exercises).
==========================================================================
"""

from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Profile, WorkoutExercise, WorkoutSession, WorkoutSet

# --------------------------------------------------------------------------
# Petits raccourcis
# --------------------------------------------------------------------------

SQUAT = {
    "name": "  Squat  ",
    "sets": [
        {"reps": 10, "weight_kg": 60},
        {"reps": 8, "weight_kg": 62.5},
    ],
}
POMPES = {"name": "Pompes", "sets": [{"reps": 20}]}


def _params(profile: Profile) -> dict[str, int]:
    return {"profile_id": profile.id}


def _open(client: TestClient, profile: Profile, day: str, **fields) -> dict:
    """Ouvre une séance vide."""
    body = {"day": day, **fields}
    response = client.post("/workouts", params=_params(profile), json=body)
    assert response.status_code == 201, response.text
    return response.json()


def _add_exercise(
    client: TestClient, profile: Profile, workout_id: int, exercise: dict
) -> dict:
    """Ajoute un exercice ; renvoie la séance entière."""
    response = client.post(
        f"/workouts/{workout_id}/exercises", params=_params(profile), json=exercise
    )
    assert response.status_code == 201, response.text
    return response.json()


def _period(client: TestClient, profile: Profile, start: str, end: str):
    params = {**_params(profile), "start": start, "end": end}
    return client.get("/workouts", params=params)


def _days(client: TestClient, profile: Profile, start: str, end: str) -> list[str]:
    response = _period(client, profile, start, end)
    assert response.status_code == 200, response.text
    return [workout["day"] for workout in response.json()]


def _names(workout: dict) -> list[str]:
    return [exercise["name"] for exercise in workout["exercises"]]


def _count_sets(session: Session, profile: Profile) -> int | None:
    """Le nombre de séries du profil réellement en base."""
    count = (
        select(func.count())
        .select_from(WorkoutSet)
        .join(WorkoutExercise)
        .join(WorkoutSession)
        .where(WorkoutSession.profile_id == profile.id)
    )
    return session.scalar(count)


# --------------------------------------------------------------------------
# 1. La séance
# --------------------------------------------------------------------------


def test_ouvrir_une_seance_vide(client: TestClient, profile: Profile) -> None:
    workout = _open(client, profile, "2026-11-09", note="Jambes")

    assert workout["day"] == "2026-11-09"
    assert workout["note"] == "Jambes"
    assert workout["exercises"] == []


def test_une_note_vide_devient_aucune_note(
    client: TestClient, profile: Profile
) -> None:
    assert _open(client, profile, "2026-11-09", note="   ")["note"] is None


def test_changer_le_jour_et_la_note(client: TestClient, profile: Profile) -> None:
    workout = _open(client, profile, "2026-11-09", note="Jambes")
    _add_exercise(client, profile, workout["id"], SQUAT)

    response = client.put(
        f"/workouts/{workout['id']}",
        params=_params(profile),
        json={"day": "2026-11-10", "note": "Jambes, fatigué"},
    )
    assert response.status_code == 200, response.text
    changed = response.json()
    assert changed["day"] == "2026-11-10"
    assert changed["note"] == "Jambes, fatigué"
    # Les exercices ne bougent pas.
    assert _names(changed) == ["Squat"]


def test_lire_une_periode(client: TestClient, profile: Profile) -> None:
    _open(client, profile, "2026-11-20")
    _open(client, profile, "2026-11-02")
    _open(client, profile, "2026-12-07")

    # Les deux bornes sont incluses, et les séances arrivent par jour.
    assert _days(client, profile, "2026-11-02", "2026-12-06") == [
        "2026-11-02",
        "2026-11-20",
    ]


def test_supprimer_une_seance(
    client: TestClient, profile: Profile, session: Session
) -> None:
    workout = _open(client, profile, "2026-11-09")
    _add_exercise(client, profile, workout["id"], SQUAT)

    url = f"/workouts/{workout['id']}"
    assert client.delete(url, params=_params(profile)).status_code == 204
    assert _days(client, profile, "2026-11-01", "2026-11-30") == []
    # Ses exercices et leurs séries sont partis avec elle.
    assert _count_sets(session, profile) == 0
    # La supprimer une seconde fois : elle n'existe plus.
    assert client.delete(url, params=_params(profile)).status_code == 404


# --------------------------------------------------------------------------
# 2. Les exercices, un par un
# --------------------------------------------------------------------------


def test_ajouter_des_exercices_un_par_un(client: TestClient, profile: Profile) -> None:
    workout = _open(client, profile, "2026-11-09")
    _add_exercise(client, profile, workout["id"], SQUAT)
    workout = _add_exercise(client, profile, workout["id"], POMPES)

    # Les espaces autour du nom sont retirés, l'ordre d'ajout est gardé.
    assert [{"name": e["name"], "sets": e["sets"]} for e in workout["exercises"]] == [
        {
            "name": "Squat",
            "sets": [
                {"reps": 10, "weight_kg": 60.0},
                {"reps": 8, "weight_kg": 62.5},
            ],
        },
        {"name": "Pompes", "sets": [{"reps": 20, "weight_kg": None}]},
    ]
    # Chaque exercice a son id, pour le modifier ou le retirer.
    assert all(isinstance(e["id"], int) for e in workout["exercises"])


def test_modifier_un_exercice_remplace_ses_series(
    client: TestClient, profile: Profile, session: Session
) -> None:
    workout = _open(client, profile, "2026-11-09")
    workout = _add_exercise(client, profile, workout["id"], SQUAT)
    squat_id = workout["exercises"][0]["id"]

    body = {"name": "Squat barre", "sets": [{"reps": 5, "weight_kg": 80}]}
    response = client.put(
        f"/workouts/{workout['id']}/exercises/{squat_id}",
        params=_params(profile),
        json=body,
    )
    assert response.status_code == 200, response.text
    assert response.json()["exercises"] == [
        {
            "id": squat_id,
            "name": "Squat barre",
            "sets": [{"reps": 5, "weight_kg": 80.0}],
        }
    ]
    # Les deux anciennes séries ont bien disparu de la base.
    assert _count_sets(session, profile) == 1


def test_retirer_un_exercice(client: TestClient, profile: Profile) -> None:
    workout = _open(client, profile, "2026-11-09")
    _add_exercise(client, profile, workout["id"], SQUAT)
    workout = _add_exercise(client, profile, workout["id"], POMPES)
    squat_id = workout["exercises"][0]["id"]

    url = f"/workouts/{workout['id']}/exercises/{squat_id}"
    response = client.delete(url, params=_params(profile))
    assert response.status_code == 200, response.text
    assert _names(response.json()) == ["Pompes"]

    # Un exercice ajouté après un retrait se range toujours à la fin.
    workout = _add_exercise(client, profile, workout["id"], SQUAT)
    assert _names(workout) == ["Pompes", "Squat"]


def test_un_exercice_d_une_autre_seance_est_introuvable(
    client: TestClient, profile: Profile
) -> None:
    lundi = _open(client, profile, "2026-11-09")
    mardi = _add_exercise(
        client, profile, _open(client, profile, "2026-11-10")["id"], SQUAT
    )
    exercise_id = mardi["exercises"][0]["id"]

    url = f"/workouts/{lundi['id']}/exercises/{exercise_id}"
    assert client.put(url, params=_params(profile), json=POMPES).status_code == 404
    assert client.delete(url, params=_params(profile)).status_code == 404


# --------------------------------------------------------------------------
# 3. Chacun ses séances
# --------------------------------------------------------------------------


def test_on_ne_voit_que_ses_seances(
    client: TestClient, profile: Profile, other_profile: Profile
) -> None:
    _open(client, other_profile, "2026-11-09")
    assert _days(client, profile, "2026-11-01", "2026-11-30") == []


def test_on_ne_touche_pas_a_la_seance_d_un_autre(
    client: TestClient, profile: Profile, other_profile: Profile
) -> None:
    workout = _open(client, other_profile, "2026-11-09")
    workout = _add_exercise(client, other_profile, workout["id"], SQUAT)
    url = f"/workouts/{workout['id']}"
    exercise_url = f"{url}/exercises/{workout['exercises'][0]['id']}"
    mine = _params(profile)

    assert client.put(url, params=mine, json={"day": "2026-11-10"}).status_code == 404
    assert client.delete(url, params=mine).status_code == 404
    assert client.post(f"{url}/exercises", params=mine, json=POMPES).status_code == 404
    assert client.put(exercise_url, params=mine, json=POMPES).status_code == 404
    assert client.delete(exercise_url, params=mine).status_code == 404


# --------------------------------------------------------------------------
# 4. Ce que l'API refuse
# --------------------------------------------------------------------------


def _post_exercise(client: TestClient, profile: Profile, exercise: dict) -> int:
    workout = _open(client, profile, "2026-11-09")
    return client.post(
        f"/workouts/{workout['id']}/exercises", params=_params(profile), json=exercise
    ).status_code


def test_refuse_une_serie_sans_repetition(client: TestClient, profile: Profile) -> None:
    exercise = {"name": "Squat", "sets": [{"reps": 0}]}
    assert _post_exercise(client, profile, exercise) == 422


def test_refuse_un_poids_negatif(client: TestClient, profile: Profile) -> None:
    exercise = {"name": "Squat", "sets": [{"reps": 5, "weight_kg": -10}]}
    assert _post_exercise(client, profile, exercise) == 422


def test_refuse_un_exercice_sans_serie(client: TestClient, profile: Profile) -> None:
    assert _post_exercise(client, profile, {"name": "Squat", "sets": []}) == 422


def test_refuse_un_exercice_sans_nom(client: TestClient, profile: Profile) -> None:
    assert (
        _post_exercise(client, profile, {"name": "   ", "sets": [{"reps": 5}]}) == 422
    )


def test_refuse_une_periode_a_l_envers(client: TestClient, profile: Profile) -> None:
    assert _period(client, profile, "2026-11-30", "2026-11-01").status_code == 422


def test_refuse_une_periode_trop_longue(client: TestClient, profile: Profile) -> None:
    assert _period(client, profile, "2026-01-01", "2026-12-31").status_code == 422


# --------------------------------------------------------------------------
# 5. Les lectures de la page « exercice » (à la salle)
# --------------------------------------------------------------------------


def _names_used(client: TestClient, profile: Profile) -> list[str]:
    response = client.get("/workouts/exercise-names", params=_params(profile))
    assert response.status_code == 200, response.text
    return response.json()


def _previous(client: TestClient, profile: Profile, workout_id: int, name: str):
    response = client.get(
        f"/workouts/{workout_id}/previous",
        params={**_params(profile), "name": name},
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_lire_une_seance(
    client: TestClient, profile: Profile, other_profile: Profile
) -> None:
    workout = _add_exercise(
        client, profile, _open(client, profile, "2026-11-09")["id"], SQUAT
    )
    url = f"/workouts/{workout['id']}"

    response = client.get(url, params=_params(profile))
    assert response.status_code == 200, response.text
    assert response.json() == workout
    assert client.get(url, params=_params(other_profile)).status_code == 404


def test_noms_deja_utilises(
    client: TestClient, profile: Profile, other_profile: Profile
) -> None:
    ancienne = _open(client, profile, "2026-11-02")["id"]
    _add_exercise(client, profile, ancienne, {"name": "squat", "sets": [{"reps": 5}]})
    _add_exercise(client, profile, ancienne, POMPES)
    recente = _open(client, profile, "2026-11-09")["id"]
    _add_exercise(client, profile, recente, SQUAT)
    _add_exercise(
        client,
        other_profile,
        _open(client, other_profile, "2026-11-10")["id"],
        {"name": "Tractions", "sets": [{"reps": 5}]},
    )

    # Le plus récent d'abord ; « squat » et « Squat » ne comptent qu'une
    # fois (l'écriture la plus récente) ; rien de l'autre profil.
    assert _names_used(client, profile) == ["Squat", "Pompes"]


def test_la_derniere_fois(client: TestClient, profile: Profile) -> None:
    lundi = _open(client, profile, "2026-11-02")["id"]
    _add_exercise(
        client,
        profile,
        lundi,
        {"name": "Squat", "sets": [{"reps": 8, "weight_kg": 50}]},
    )
    jeudi = _open(client, profile, "2026-11-05")["id"]
    _add_exercise(
        client,
        profile,
        jeudi,
        {"name": "SQUAT", "sets": [{"reps": 6, "weight_kg": 55}]},
    )
    aujourd_hui = _open(client, profile, "2026-11-09")["id"]
    _add_exercise(client, profile, aujourd_hui, SQUAT)
    plus_tard = _open(client, profile, "2026-11-12")["id"]
    _add_exercise(
        client,
        profile,
        plus_tard,
        {"name": "Squat", "sets": [{"reps": 1, "weight_kg": 100}]},
    )

    # La séance la plus récente AVANT celle d'aujourd'hui, sans tenir compte
    # des majuscules : ni celle d'aujourd'hui, ni celle d'après.
    assert _previous(client, profile, aujourd_hui, "squat") == {
        "day": "2026-11-05",
        "sets": [{"reps": 6, "weight_kg": 55.0}],
    }


def test_la_derniere_fois_sans_historique(client: TestClient, profile: Profile) -> None:
    workout = _open(client, profile, "2026-11-09")["id"]
    assert _previous(client, profile, workout, "Squat") is None

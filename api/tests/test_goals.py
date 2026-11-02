"""
==========================================================================
tests/test_goals.py — les routes des priorités

Chaque test raconte un scénario du téléphone : ajouter, cocher, revenir
le lendemain… et vérifie ce que l'API répond.
==========================================================================
"""

from fastapi.testclient import TestClient

from app.models import Profile
from tests.conftest import FakeClock

# --------------------------------------------------------------------------
# Petits raccourcis
# --------------------------------------------------------------------------


def _params(profile: Profile) -> dict[str, int]:
    return {"profile_id": profile.id}


def _add(client: TestClient, profile: Profile, text: str, category="work") -> dict:
    response = client.post(
        "/goals", params=_params(profile), json={"text": text, "category": category}
    )
    assert response.status_code == 201, response.text
    return response.json()


def _list(client: TestClient, profile: Profile) -> list[dict]:
    response = client.get("/goals", params=_params(profile))
    assert response.status_code == 200, response.text
    return response.json()


def _texts(client: TestClient, profile: Profile) -> list[str]:
    return [goal["text"] for goal in _list(client, profile)]


def _check(client: TestClient, profile: Profile, goal_id: int) -> None:
    response = client.patch(
        f"/goals/{goal_id}", params=_params(profile), json={"done": True}
    )
    assert response.status_code == 200, response.text


# --------------------------------------------------------------------------
# 1. Ajouter et lire
# --------------------------------------------------------------------------


def test_une_priorite_ajoutee_apparait_dans_la_liste(client, profile):
    created = _add(client, profile, "Finir le rapport", "work")

    assert created["text"] == "Finir le rapport"
    assert created["category"] == "work"
    assert created["done"] is False
    assert _list(client, profile) == [created]


def test_les_priorites_gardent_leur_ordre_d_ajout(client, profile):
    _add(client, profile, "Un")
    _add(client, profile, "Deux")
    _add(client, profile, "Trois")

    assert _texts(client, profile) == ["Un", "Deux", "Trois"]


def test_les_espaces_autour_du_texte_sont_retires(client, profile):
    created = _add(client, profile, "   Courir   ", "sport")
    assert created["text"] == "Courir"


def test_un_texte_vide_est_refuse(client, profile):
    response = client.post(
        "/goals", params=_params(profile), json={"text": "   ", "category": "work"}
    )
    assert response.status_code == 422


def test_une_categorie_inconnue_est_refusee(client, profile):
    response = client.post(
        "/goals", params=_params(profile), json={"text": "Lire", "category": "jeu"}
    )
    assert response.status_code == 422


def test_un_profil_inconnu_renvoie_404(client):
    response = client.get("/goals", params={"profile_id": 999_999})
    assert response.status_code == 404


# --------------------------------------------------------------------------
# 2. La limite de 3
# --------------------------------------------------------------------------


def test_une_quatrieme_priorite_est_refusee(client, profile):
    for text in ["Un", "Deux", "Trois"]:
        _add(client, profile, text)

    response = client.post(
        "/goals", params=_params(profile), json={"text": "Quatre", "category": "work"}
    )

    assert response.status_code == 409
    assert len(_list(client, profile)) == 3


def test_une_priorite_cochee_aujourd_hui_compte_encore(client, profile):
    """Elle reste affichée, barrée : elle occupe toujours une place."""
    first = _add(client, profile, "Un")
    _add(client, profile, "Deux")
    _add(client, profile, "Trois")
    _check(client, profile, first["id"])

    response = client.post(
        "/goals", params=_params(profile), json={"text": "Quatre", "category": "work"}
    )
    assert response.status_code == 409


def test_supprimer_libere_une_place(client, profile):
    first = _add(client, profile, "Un")
    _add(client, profile, "Deux")
    _add(client, profile, "Trois")

    client.delete(f"/goals/{first['id']}", params=_params(profile))

    _add(client, profile, "Quatre")
    assert _texts(client, profile) == ["Deux", "Trois", "Quatre"]


# --------------------------------------------------------------------------
# 3. Modifier et cocher
# --------------------------------------------------------------------------


def test_cocher_puis_decocher(client, profile):
    goal = _add(client, profile, "Courir", "sport")

    _check(client, profile, goal["id"])
    assert _list(client, profile)[0]["done"] is True

    client.patch(f"/goals/{goal['id']}", params=_params(profile), json={"done": False})
    assert _list(client, profile)[0]["done"] is False


def test_modifier_le_texte_et_la_categorie(client, profile):
    goal = _add(client, profile, "Lire", "work")

    response = client.patch(
        f"/goals/{goal['id']}",
        params=_params(profile),
        json={"text": "Lire 20 pages", "category": "learning"},
    )

    assert response.status_code == 200
    assert response.json()["text"] == "Lire 20 pages"
    assert response.json()["category"] == "learning"
    # Ce qui n'a pas été envoyé ne change pas.
    assert response.json()["done"] is False


def test_on_ne_touche_pas_aux_priorites_d_un_autre(client, profile, other_profile):
    goal = _add(client, other_profile, "Secret")

    patch = client.patch(
        f"/goals/{goal['id']}", params=_params(profile), json={"done": True}
    )
    delete = client.delete(f"/goals/{goal['id']}", params=_params(profile))

    assert patch.status_code == 404
    assert delete.status_code == 404
    assert _list(client, profile) == []
    assert _list(client, other_profile)[0]["done"] is False


# --------------------------------------------------------------------------
# 4. Le report au lendemain
# --------------------------------------------------------------------------


def test_une_priorite_non_faite_est_reportee(client, profile, clock: FakeClock):
    _add(client, profile, "Pas finie")

    clock.next_day()

    assert _texts(client, profile) == ["Pas finie"]


def test_une_priorite_faite_hier_disparait(client, profile, clock: FakeClock):
    goal = _add(client, profile, "Finie hier")
    _check(client, profile, goal["id"])

    clock.next_day()

    assert _list(client, profile) == []


def test_une_priorite_reportee_puis_cochee_reste_affichee(
    client, profile, clock: FakeClock
):
    goal = _add(client, profile, "Reportée")
    clock.next_day()

    _check(client, profile, goal["id"])

    assert _list(client, profile)[0]["done"] is True


def test_les_reportees_comptent_dans_la_limite(client, profile, clock: FakeClock):
    for text in ["Un", "Deux", "Trois"]:
        _add(client, profile, text)
    clock.next_day()

    response = client.post(
        "/goals", params=_params(profile), json={"text": "Quatre", "category": "work"}
    )
    assert response.status_code == 409


# --------------------------------------------------------------------------
# 5. Réordonner
# --------------------------------------------------------------------------


def test_reordonner(client, profile):
    one = _add(client, profile, "Un")
    two = _add(client, profile, "Deux")
    three = _add(client, profile, "Trois")

    response = client.put(
        "/goals/order",
        params=_params(profile),
        json={"ids": [three["id"], one["id"], two["id"]]},
    )

    assert response.status_code == 200
    assert [goal["text"] for goal in response.json()] == ["Trois", "Un", "Deux"]
    assert _texts(client, profile) == ["Trois", "Un", "Deux"]


def test_reordonner_avec_une_liste_incomplete_est_refuse(client, profile):
    one = _add(client, profile, "Un")
    _add(client, profile, "Deux")

    response = client.put(
        "/goals/order", params=_params(profile), json={"ids": [one["id"]]}
    )

    assert response.status_code == 400
    assert _texts(client, profile) == ["Un", "Deux"]


def test_reordonner_avec_un_doublon_est_refuse(client, profile):
    one = _add(client, profile, "Un")
    _add(client, profile, "Deux")

    response = client.put(
        "/goals/order", params=_params(profile), json={"ids": [one["id"], one["id"]]}
    )

    assert response.status_code == 400

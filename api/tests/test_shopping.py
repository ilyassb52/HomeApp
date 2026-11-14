"""
==========================================================================
tests/test_shopping.py — les routes de la liste de courses

LA LISTE EST COMMUNE AU FOYER

Les priorités se testent sur un profil tout neuf, donc vide. Les courses,
elles, n'ont pas de profil : un test lirait aussi les vraies courses déjà
en base. La fixture « empty_list » vide donc la table au début de chaque
test. Comme tout le test tourne dans une transaction annulée à la fin
(voir conftest.py), les vraies courses reviennent ensuite intactes.
==========================================================================
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.models import ShoppingItem
from tests.conftest import FakeClock

# --------------------------------------------------------------------------
# Petits raccourcis
# --------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def empty_list(session: Session) -> None:
    session.execute(delete(ShoppingItem))
    session.flush()


def _add(client: TestClient, name: str) -> dict:
    response = client.post("/shopping", json={"name": name})
    assert response.status_code == 201, response.text
    return response.json()


def _list(client: TestClient) -> list[dict]:
    response = client.get("/shopping")
    assert response.status_code == 200, response.text
    return response.json()


def _names(client: TestClient) -> list[str]:
    return [item["name"] for item in _list(client)]


def _set_bought(client: TestClient, item_id: int, bought: bool) -> dict:
    response = client.patch(f"/shopping/{item_id}", json={"bought": bought})
    assert response.status_code == 200, response.text
    return response.json()


# --------------------------------------------------------------------------
# 1. Ajouter et lire
# --------------------------------------------------------------------------


def test_un_article_ajoute_apparait_dans_la_liste(client):
    created = _add(client, "Lait")

    assert created["name"] == "Lait"
    assert created["bought"] is False
    assert _list(client) == [created]


def test_les_articles_gardent_leur_ordre_d_ajout(client):
    for name in ["Lait", "Pain", "Œufs"]:
        _add(client, name)

    assert _names(client) == ["Lait", "Pain", "Œufs"]


def test_les_espaces_autour_du_nom_sont_retires(client):
    assert _add(client, "  Pommes  ")["name"] == "Pommes"


def test_un_nom_vide_est_refuse(client):
    response = client.post("/shopping", json={"name": "   "})
    assert response.status_code == 422


def test_un_nom_trop_long_est_refuse(client):
    response = client.post("/shopping", json={"name": "x" * 81})
    assert response.status_code == 422


# --------------------------------------------------------------------------
# 2. Cocher, renommer, supprimer
# --------------------------------------------------------------------------


def test_cocher_puis_decocher(client):
    item = _add(client, "Lait")

    assert _set_bought(client, item["id"], True)["bought"] is True
    assert _set_bought(client, item["id"], False)["bought"] is False


def test_les_articles_achetes_passent_en_dernier(client):
    lait = _add(client, "Lait")
    _add(client, "Pain")
    _set_bought(client, lait["id"], True)

    assert _names(client) == ["Pain", "Lait"]


def test_renommer(client):
    item = _add(client, "Lait")
    response = client.patch(f"/shopping/{item['id']}", json={"name": "Lait d'avoine"})

    assert response.status_code == 200
    assert _names(client) == ["Lait d'avoine"]


def test_supprimer_retire_l_article(client):
    item = _add(client, "Lait")
    response = client.delete(f"/shopping/{item['id']}")

    assert response.status_code == 204
    assert _list(client) == []


def test_un_article_inconnu_renvoie_404(client):
    assert client.patch("/shopping/999999", json={"bought": True}).status_code == 404
    assert client.delete("/shopping/999999").status_code == 404


# --------------------------------------------------------------------------
# 3. Le lendemain
# --------------------------------------------------------------------------


def test_un_article_achete_reste_barre_le_jour_meme(client):
    item = _add(client, "Lait")
    _set_bought(client, item["id"], True)

    assert _list(client) == [{**item, "bought": True}]


def test_un_article_achete_hier_disparait(client, clock: FakeClock):
    item = _add(client, "Lait")
    _set_bought(client, item["id"], True)
    clock.next_day()

    assert _list(client) == []


def test_un_article_non_achete_reste_le_lendemain(client, clock: FakeClock):
    _add(client, "Lait")
    clock.next_day()

    assert _names(client) == ["Lait"]


def test_recocher_ne_fait_pas_revenir_un_article(client, clock: FakeClock):
    # Coché hier, recoché aujourd'hui par erreur : il ne doit pas réapparaître.
    item = _add(client, "Lait")
    _set_bought(client, item["id"], True)
    clock.next_day()
    _set_bought(client, item["id"], True)

    assert _list(client) == []

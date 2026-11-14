"""
==========================================================================
tests/test_events.py — les routes de l'agenda du foyer

L'AGENDA EST COMMUN AU FOYER

Comme pour les courses (voir tests/test_shopping.py), la fixture
« empty_agenda » vide la table au début de chaque test ; la transaction
annulée à la fin rend ensuite les vrais événements intacts.

L'horloge des tests (tests/conftest.py) est réglée sur le mercredi
28 octobre 2026 : « la semaine » va donc du 28 octobre au 3 novembre.
==========================================================================
"""

from datetime import datetime
from zoneinfo import ZoneInfo

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.models import Event, Profile
from tests.conftest import FakeClock

# --------------------------------------------------------------------------
# Petits raccourcis
# --------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def empty_agenda(session: Session) -> None:
    session.execute(delete(Event))
    session.flush()


def _add(client: TestClient, title: str, day: str, **fields) -> dict:
    """Ajoute un rendez-vous ponctuel (ou annuel avec kind="yearly")."""
    body = {"title": title, "kind": "once", "day": day, **fields}
    response = client.post("/events", json=body)
    assert response.status_code == 201, response.text
    return response.json()


def _week(client: TestClient) -> list[dict]:
    response = client.get("/events/week")
    assert response.status_code == 200, response.text
    return response.json()


def _lines(events: list[dict]) -> list[tuple[str, str]]:
    """Chaque ligne réduite à (jour, titre) : plus lisible dans un assert."""
    return [(event["day"], event["title"]) for event in events]


def _period(client: TestClient, start: str, end: str):
    return client.get("/events", params={"start": start, "end": end})


# --------------------------------------------------------------------------
# 1. Ajouter et lire la semaine
# --------------------------------------------------------------------------


def test_agenda_vide(client: TestClient) -> None:
    assert _week(client) == []


def test_ajouter_un_rendez_vous(client: TestClient) -> None:
    event = _add(client, "  Dentiste  ", "2026-10-30", start_time="14:30")

    # Les espaces autour du titre sont retirés.
    assert event["title"] == "Dentiste"
    assert event["kind"] == "once"
    assert event["start_time"] == "14:30:00"
    assert event["member"] is None
    assert _lines(_week(client)) == [("2026-10-30", "Dentiste")]


def test_la_semaine_compte_sept_jours(client: TestClient) -> None:
    _add(client, "Hier", "2026-10-27")
    _add(client, "Aujourd'hui", "2026-10-28")
    _add(client, "Dans six jours", "2026-11-03")
    _add(client, "Dans sept jours", "2026-11-04")

    assert _lines(_week(client)) == [
        ("2026-10-28", "Aujourd'hui"),
        ("2026-11-03", "Dans six jours"),
    ]


def test_la_semaine_avance_avec_les_jours(client: TestClient, clock: FakeClock) -> None:
    _add(client, "Aujourd'hui", "2026-10-28")
    _add(client, "Dans sept jours", "2026-11-04")

    clock.next_day()

    assert _lines(_week(client)) == [("2026-11-04", "Dans sept jours")]


def test_deux_evenements_le_meme_jour_donnent_deux_lignes(
    client: TestClient,
) -> None:
    _add(client, "Réunion", "2026-10-29", start_time="18:00")
    _add(client, "Médecin", "2026-10-29", start_time="09:15")
    _add(client, "Jour férié", "2026-10-29")

    # Sans heure d'abord, puis par heure.
    assert _lines(_week(client)) == [
        ("2026-10-29", "Jour férié"),
        ("2026-10-29", "Médecin"),
        ("2026-10-29", "Réunion"),
    ]


# --------------------------------------------------------------------------
# 2. Les dates annuelles
# --------------------------------------------------------------------------


def test_un_anniversaire_revient_chaque_annee(client: TestClient) -> None:
    # Enregistré en 2020 : seuls le jour et le mois comptent.
    event = _add(client, "Anniversaire de Mamie", "2020-10-31", kind="yearly")

    assert event["day"] == "2020-10-31"
    # Dans la semaine, il porte la date de cette année.
    assert _lines(_week(client)) == [("2026-10-31", "Anniversaire de Mamie")]


def test_une_semaine_a_cheval_sur_deux_annees(
    client: TestClient, clock: FakeClock
) -> None:
    _add(client, "Réveillon", "2020-12-31", kind="yearly")
    _add(client, "Nouvel an", "2020-01-01", kind="yearly")

    clock.now = datetime(2026, 12, 29, 9, 0, tzinfo=ZoneInfo("Europe/Paris"))

    assert _lines(_week(client)) == [
        ("2026-12-31", "Réveillon"),
        ("2027-01-01", "Nouvel an"),
    ]


def test_le_29_fevrier_se_fete_le_28_les_autres_annees(client: TestClient) -> None:
    _add(client, "Anniversaire de Léa", "2024-02-29", kind="yearly")

    response = _period(client, "2027-02-01", "2027-03-05")

    assert _lines(response.json()) == [("2027-02-28", "Anniversaire de Léa")]


def test_un_anniversaire_n_a_pas_d_heure(client: TestClient) -> None:
    response = client.post(
        "/events",
        json={
            "title": "Anniversaire",
            "kind": "yearly",
            "day": "2026-10-31",
            "start_time": "10:00",
        },
    )
    assert response.status_code == 422


# --------------------------------------------------------------------------
# 3. Le calendrier : une période au choix
# --------------------------------------------------------------------------


def test_lire_une_periode(client: TestClient) -> None:
    _add(client, "Avant", "2026-11-30")
    _add(client, "Début", "2026-12-01")
    _add(client, "Fin", "2026-12-31")
    _add(client, "Après", "2027-01-01")

    response = _period(client, "2026-12-01", "2026-12-31")

    assert response.status_code == 200
    assert _lines(response.json()) == [
        ("2026-12-01", "Début"),
        ("2026-12-31", "Fin"),
    ]


def test_une_periode_a_l_envers_est_refusee(client: TestClient) -> None:
    assert _period(client, "2026-12-31", "2026-12-01").status_code == 422


def test_une_periode_trop_longue_est_refusee(client: TestClient) -> None:
    assert _period(client, "2026-01-01", "2026-12-31").status_code == 422


# --------------------------------------------------------------------------
# 4. L'étiquette membre
# --------------------------------------------------------------------------


def test_un_rendez_vous_porte_le_membre(client: TestClient, profile: Profile) -> None:
    event = _add(client, "Piscine", "2026-10-29", profile_id=profile.id)

    expected = {"id": profile.id, "name": "Test", "tone": "cyan"}
    assert event["member"] == expected
    assert _week(client)[0]["member"] == expected


def test_un_membre_inconnu_est_refuse(client: TestClient) -> None:
    response = client.post(
        "/events",
        json={"title": "X", "kind": "once", "day": "2026-10-29", "profile_id": 999999},
    )
    assert response.status_code == 422


def test_la_liste_des_membres(client: TestClient, profile: Profile) -> None:
    response = client.get("/profiles")

    assert response.status_code == 200
    assert {"id": profile.id, "name": "Test", "tone": "cyan"} in response.json()


# --------------------------------------------------------------------------
# 5. Modifier, supprimer
# --------------------------------------------------------------------------


def test_modifier_un_rendez_vous(client: TestClient, profile: Profile) -> None:
    event = _add(client, "Dentiste", "2026-10-30", start_time="14:30")

    response = client.put(
        f"/events/{event['id']}",
        json={
            "title": "Dentiste (décalé)",
            "kind": "once",
            "day": "2026-10-31",
            "profile_id": profile.id,
        },
    )

    assert response.status_code == 200, response.text
    changed = response.json()
    # PUT remplace tout : l'heure absente du corps est effacée.
    assert changed["start_time"] is None
    assert changed["member"]["id"] == profile.id
    assert _lines(_week(client)) == [("2026-10-31", "Dentiste (décalé)")]


def test_supprimer_un_rendez_vous(client: TestClient) -> None:
    event = _add(client, "Dentiste", "2026-10-30")

    response = client.delete(f"/events/{event['id']}")

    assert response.status_code == 204
    assert _week(client) == []


def test_un_evenement_inconnu_donne_404(client: TestClient) -> None:
    body = {"title": "X", "kind": "once", "day": "2026-10-29"}
    assert client.put("/events/999999", json=body).status_code == 404
    assert client.delete("/events/999999").status_code == 404

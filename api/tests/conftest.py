"""
==========================================================================
tests/conftest.py — ce que tous les tests partagent

pytest lit ce fichier tout seul. Chaque « fixture » est un ingrédient
qu'un test reçoit simplement en le nommant dans ses paramètres.

UNE BASE PROPRE À CHAQUE TEST, SANS RIEN EFFACER

Les tests tournent sur la vraie base PostgreSQL, mais chacun s'exécute dans
une transaction annulée à la fin (rollback). Les commit des routes y
deviennent de simples « points de sauvegarde » (create_savepoint) : ils
fonctionnent normalement pendant le test, puis tout disparaît. Tes données
d'exemple ne sont jamais touchées.

Lancer :   docker compose exec api pytest
==========================================================================
"""

from collections.abc import Iterator
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.clock import get_now
from app.core.database import engine, get_session
from app.main import app
from app.models import Profile


class FakeClock:
    """Une horloge que les tests font avancer à la main."""

    def __init__(self) -> None:
        # Un mercredi, 9 h du matin à Paris.
        self.now = datetime(2026, 10, 28, 9, 0, tzinfo=ZoneInfo("Europe/Paris"))

    def next_day(self) -> None:
        self.now += timedelta(days=1)


@pytest.fixture
def session() -> Iterator[Session]:
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(
        bind=connection,
        join_transaction_mode="create_savepoint",
        expire_on_commit=False,
    )
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def clock() -> FakeClock:
    return FakeClock()


@pytest.fixture
def client(session: Session, clock: FakeClock) -> Iterator[TestClient]:
    # Les routes reçoivent notre session et notre horloge à la place des
    # vraies : c'est tout l'intérêt de l'injection de dépendances.
    app.dependency_overrides[get_session] = lambda: session
    app.dependency_overrides[get_now] = lambda: clock.now
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _make_profile(session: Session, name: str) -> Profile:
    profile = Profile(name=name, tone="cyan")
    session.add(profile)
    session.flush()
    return profile


@pytest.fixture
def profile(session: Session) -> Profile:
    return _make_profile(session, "Test")


@pytest.fixture
def other_profile(session: Session) -> Profile:
    return _make_profile(session, "Autre")

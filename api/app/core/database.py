"""
==========================================================================
app/core/database.py — la connexion à PostgreSQL

Trois objets, utilisés partout ailleurs :

  engine        la connexion à la base, créée une seule fois ;
  SessionLocal  la fabrique de sessions — une session par requête HTTP ;
  Base          la classe mère de tous les modèles (app/models/).

Et get_session, la dépendance FastAPI qui donne sa session à chaque route.
==========================================================================
"""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings

engine = create_engine(settings.database_url)

# expire_on_commit=False : après un commit, les objets gardent leurs valeurs
# en mémoire. Sans cela, renvoyer un objet juste enregistré relancerait une
# requête SQL pour relire chacun de ses champs.
SessionLocal = sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_session() -> Iterator[Session]:
    """Une session neuve par requête, fermée à la fin quoi qu'il arrive.

    « yield » au lieu de « return » : FastAPI donne la session à la route,
    attend qu'elle ait répondu, puis reprend ici pour sortir du « with »,
    ce qui ferme la session. Les tests la remplacent par la leur.
    """
    with SessionLocal() as session:
        yield session

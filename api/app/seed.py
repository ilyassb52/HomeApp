"""
==========================================================================
app/seed.py — remplir une base vide avec des données d'exemple

Lancer :   docker compose exec api python -m app.seed

Reprend les profils et les priorités de web/lib/mock.ts, pour que le
miroir affiche la même chose avant et après le branchement sur l'API.

Le script ne fait rien si la base contient déjà des profils : on peut le
relancer sans risquer de doublons.
==========================================================================
"""

from sqlalchemy import select

from app.core.clock import get_now
from app.core.database import SessionLocal
from app.models import Goal, Profile


def seed() -> None:
    with SessionLocal() as session:
        if session.scalar(select(Profile).limit(1)) is not None:
            print("La base contient déjà des profils : rien à faire.")
            return

        ilyass = Profile(name="Ilyass", tone="cyan")
        session.add_all(
            [
                ilyass,
                Profile(name="Profil 2", tone="magenta"),
                Profile(name="Profil 3", tone="neon-green"),
            ]
        )
        # flush envoie les profils à la base sans valider la transaction :
        # PostgreSQL leur attribue un id, dont les priorités ont besoin.
        session.flush()

        now = get_now()
        today = now.date()
        session.add_all(
            [
                Goal(
                    profile_id=ilyass.id,
                    title="Finir la présentation client",
                    category="work",
                    day=today,
                    position=0,
                ),
                Goal(
                    profile_id=ilyass.id,
                    title="Réviser le chapitre sur les réseaux",
                    category="learning",
                    day=today,
                    position=1,
                ),
                Goal(
                    profile_id=ilyass.id,
                    title="Séance de course, 5 km",
                    category="sport",
                    day=today,
                    position=2,
                    done_at=now,
                ),
            ]
        )
        session.commit()
        print("Base remplie : 3 profils, 3 priorités.")


if __name__ == "__main__":
    seed()

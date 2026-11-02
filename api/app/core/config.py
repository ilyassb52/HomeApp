"""
==========================================================================
app/core/config.py — les réglages de l'API

Tous les réglages viennent des variables d'environnement, jamais du code :
c'est ce qui permet de garder le mot de passe de la base hors de Git.
pydantic-settings lit la variable DATABASE_URL (la casse ne compte pas) et
refuse de démarrer si elle manque, plutôt que de planter plus tard.
==========================================================================
"""

from zoneinfo import ZoneInfo

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str

    # Le fuseau du foyer. Il décide de « quel jour on est » : à 0 h 30 à
    # Paris, il est encore 23 h 30 la veille en UTC.
    timezone: str = "Europe/Paris"

    @property
    def tz(self) -> ZoneInfo:
        return ZoneInfo(self.timezone)


settings = Settings()

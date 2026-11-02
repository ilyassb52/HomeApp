"""
==========================================================================
app/core/clock.py — l'heure qu'il est, à Paris

Toute l'API demande l'heure à get_now, jamais directement à datetime.now.

POURQUOI ? Pour les tests. Le report des priorités dépend du jour : pour
vérifier qu'une priorité d'hier remonte aujourd'hui, un test doit pouvoir
« avancer l'horloge » d'un jour. Il remplace alors get_now par sa propre
horloge (voir tests/conftest.py), et aucune route n'a à le savoir.
==========================================================================
"""

from datetime import datetime

from app.core.config import settings


def get_now() -> datetime:
    """L'instant présent, avec le fuseau du foyer.

    now.date() donne donc le jour à Paris, et pas le jour en UTC.
    """
    return datetime.now(settings.tz)

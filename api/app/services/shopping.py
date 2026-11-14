"""
==========================================================================
app/services/shopping.py — les règles de la liste de courses

Comme app/services/goals.py : des règles métier, sans rien de HTTP.
==========================================================================
"""

from datetime import datetime

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.clock import start_of_day
from app.models import ShoppingItem


def list_visible_items(session: Session, now: datetime) -> list[ShoppingItem]:
    """Les articles à afficher aujourd'hui.

    Visibles :
      - ceux qui restent à acheter → bought_at vide
      - ceux achetés aujourd'hui   → bought_at depuis minuit, heure de Paris

    Ordre : d'abord ce qui reste à acheter, puis ce qui est déjà barré ;
    dans chaque groupe, l'ordre d'ajout.
    """
    statement = (
        select(ShoppingItem)
        .where(
            or_(
                ShoppingItem.bought_at.is_(None),
                ShoppingItem.bought_at >= start_of_day(now),
            )
        )
        # « bought_at IS NOT NULL » vaut faux (0) pour un article à acheter,
        # vrai (1) pour un article acheté : trier dessus met les premiers en
        # tête. L'id départage deux articles ajoutés au même instant.
        .order_by(
            ShoppingItem.bought_at.is_not(None),
            ShoppingItem.created_at,
            ShoppingItem.id,
        )
    )
    return list(session.scalars(statement))

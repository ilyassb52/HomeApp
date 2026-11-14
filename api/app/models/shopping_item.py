"""
==========================================================================
app/models/shopping_item.py — un article de la liste de courses

UNE LISTE POUR TOUT LE FOYER

Contrairement aux priorités, les courses n'appartiennent à personne : il
n'y a pas de profile_id. Tout le monde voit, ajoute et coche les mêmes
articles.

UN ARTICLE ACHETÉ RESTE BARRÉ JUSQU'AU SOIR

Même logique que les priorités (voir app/models/goal.py) : on garde
l'instant de l'achat (« bought_at ») plutôt qu'un simple booléen. Le jour
même, l'article reste affiché, barré ; le lendemain, il disparaît. C'est
CALCULÉ à la lecture (app/services/shopping.py) : rien ne tourne la nuit.

Pas de colonne « position » : les articles restent dans l'ordre d'ajout.
==========================================================================
"""

from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ShoppingItem(Base):
    __tablename__ = "shopping_item"

    id: Mapped[int] = mapped_column(primary_key=True)

    # « Lait », « Pommes x6 »… 80 caractères suffisent largement.
    name: Mapped[str] = mapped_column(String(80))

    # Le moment où il a été acheté, ou None s'il reste à acheter.
    bought_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

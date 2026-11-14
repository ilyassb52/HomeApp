"""
==========================================================================
app/schemas/shopping.py — la forme des articles qui entrent et qui sortent

Comme pour les priorités (app/schemas/goal.py), le front ne voit pas
l'heure d'achat « bought_at » : il reçoit un simple booléen « bought ».
==========================================================================
"""

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.models import ShoppingItem

# 80 caractères, comme la colonne. Partagé par l'ajout et la modification.
ItemName = Annotated[str, Field(min_length=1, max_length=80)]


class ShoppingItemCreate(BaseModel):
    """Ce que le téléphone envoie pour ajouter un article."""

    # Retire les espaces autour AVANT de vérifier la longueur : « "   " »
    # devient « "" » et est donc refusé.
    model_config = ConfigDict(str_strip_whitespace=True)

    name: ItemName


class ShoppingItemUpdate(BaseModel):
    """Ce qu'on envoie pour modifier un article : seulement ce qui change.

    { "bought": true } coche, { "name": "…" } renomme.
    """

    model_config = ConfigDict(str_strip_whitespace=True)

    name: ItemName | None = None
    bought: bool | None = None


class ShoppingItemRead(BaseModel):
    """Un article tel que le front le reçoit."""

    id: int
    name: str
    bought: bool

    @classmethod
    def from_model(cls, item: ShoppingItem) -> "ShoppingItemRead":
        return cls(id=item.id, name=item.name, bought=item.bought_at is not None)

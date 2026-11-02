"""
==========================================================================
app/schemas/goal.py — la forme des priorités qui entrent et qui sortent

Les modèles (app/models/) décrivent les tables ; les schémas décrivent le
JSON échangé avec le front. Les deux diffèrent exprès :

  - le front parle de « text », la table de « title » ;
  - le front veut un booléen « done », la table garde l'heure « done_at » ;
  - le front n'a pas à voir « day », « position » ni « profile_id ».

GoalRead reprend donc exactement le type Priority de web/lib/types.ts :
le widget du miroir n'aura rien à changer en passant à l'API.
==========================================================================
"""

from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field

from app.models import Goal, GoalCategory

# Une priorité tient sur une carte : 120 caractères, comme la colonne.
# Annotated colle la règle au type lui-même : GoalCreate et GoalUpdate la
# partagent, et GoalUpdate peut quand même rendre le champ facultatif.
GoalText = Annotated[str, Field(min_length=1, max_length=120)]


class GoalCreate(BaseModel):
    """Ce que le téléphone envoie pour ajouter une priorité."""

    # Retire les espaces autour du texte AVANT de vérifier sa longueur :
    # « "   " » devient « "" » et est donc refusé.
    model_config = ConfigDict(str_strip_whitespace=True)

    text: GoalText
    category: GoalCategory


class GoalUpdate(BaseModel):
    """Ce que le téléphone envoie pour modifier une priorité.

    Tous les champs sont facultatifs : on n'envoie que ce qui change.
    { "done": true } coche, { "text": "…" } renomme.
    """

    model_config = ConfigDict(str_strip_whitespace=True)

    text: GoalText | None = None
    category: GoalCategory | None = None
    done: bool | None = None


class GoalOrder(BaseModel):
    """Le nouvel ordre : les identifiants, du premier au dernier."""

    ids: list[int]


class GoalRead(BaseModel):
    """Une priorité telle que le front la reçoit."""

    id: int
    text: str
    category: GoalCategory
    done: bool

    @classmethod
    def from_model(cls, goal: Goal) -> "GoalRead":
        return cls(
            id=goal.id,
            text=goal.title,
            category=goal.category,
            done=goal.done_at is not None,
        )

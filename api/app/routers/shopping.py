"""
==========================================================================
app/routers/shopping.py — les routes de la liste de courses

  GET     /shopping          la liste du jour
  POST    /shopping          ajouter un article
  PATCH   /shopping/{id}     renommer, cocher, décocher
  DELETE  /shopping/{id}     supprimer un article

La liste appartient au foyer : contrairement aux priorités, ces routes ne
demandent pas de profil. Elles reçoivent seulement la session et l'heure,
toujours par injection de dépendances (voir app/routers/goals.py).
==========================================================================
"""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.clock import get_now
from app.core.database import get_session
from app.models import ShoppingItem
from app.schemas.shopping import (
    ShoppingItemCreate,
    ShoppingItemRead,
    ShoppingItemUpdate,
)
from app.services.shopping import list_visible_items

router = APIRouter(prefix="/shopping", tags=["Courses"])

SessionDep = Annotated[Session, Depends(get_session)]
NowDep = Annotated[datetime, Depends(get_now)]


def _get_item_or_404(session: Session, item_id: int) -> ShoppingItem:
    item = session.get(ShoppingItem, item_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Article introuvable.")
    return item


# --------------------------------------------------------------------------
# 1. Lire
# --------------------------------------------------------------------------
@router.get("")
def list_items(session: SessionDep, now: NowDep) -> list[ShoppingItemRead]:
    items = list_visible_items(session, now)
    return [ShoppingItemRead.from_model(item) for item in items]


# --------------------------------------------------------------------------
# 2. Ajouter
# --------------------------------------------------------------------------
@router.post("", status_code=status.HTTP_201_CREATED)
def create_item(body: ShoppingItemCreate, session: SessionDep) -> ShoppingItemRead:
    item = ShoppingItem(name=body.name)
    session.add(item)
    session.commit()
    return ShoppingItemRead.from_model(item)


# --------------------------------------------------------------------------
# 3. Renommer, cocher
# --------------------------------------------------------------------------
@router.patch("/{item_id}")
def update_item(
    item_id: int, body: ShoppingItemUpdate, session: SessionDep, now: NowDep
) -> ShoppingItemRead:
    item = _get_item_or_404(session, item_id)

    if body.name is not None:
        item.name = body.name

    if body.bought is True and item.bought_at is None:
        item.bought_at = now
    elif body.bought is False:
        item.bought_at = None
    # Recocher un article déjà acheté ne change pas son heure (même règle
    # que les priorités).

    session.commit()
    return ShoppingItemRead.from_model(item)


# --------------------------------------------------------------------------
# 4. Supprimer
# --------------------------------------------------------------------------
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, session: SessionDep) -> None:
    item = _get_item_or_404(session, item_id)
    session.delete(item)
    session.commit()

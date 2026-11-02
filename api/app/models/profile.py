"""
==========================================================================
app/models/profile.py — un membre du foyer

Version minimale : un prénom et une couleur. L'email, le mot de passe, le
rôle et le mode privé arriveront avec l'authentification (étape 3).

« tone » reprend exactement les noms de couleurs du front
(web/lib/types.ts, type Tone) : le miroir les utilise tels quels.
==========================================================================
"""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Profile(Base):
    __tablename__ = "profile"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    tone: Mapped[str] = mapped_column(String(20))

"""
==========================================================================
app/schemas/profile.py — un membre du foyer, tel que le front le voit

Seulement le prénom et la couleur : c'est ce qu'il faut pour choisir un
membre dans un formulaire et dessiner sa pastille sur le miroir.
==========================================================================
"""

from typing import Literal

from pydantic import BaseModel

from app.models import Profile

# RECOPIE du type Tone de web/lib/types.ts : les cinq couleurs néon du brief.
# Le front reçoit ainsi une couleur qu'il sait dessiner, pas un texte libre.
ProfileTone = Literal["amber", "cyan", "magenta", "neon-green", "coral"]


class MemberRead(BaseModel):
    id: int
    name: str
    tone: ProfileTone

    @classmethod
    def from_model(cls, profile: Profile) -> "MemberRead":
        return cls(id=profile.id, name=profile.name, tone=profile.tone)
